import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    try {
        const { name, userId } = await req.json();

        if (!name || !userId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Create the event
        const event = await prisma.event.create({
            data: {
                name,
                creatorId: userId, // Link the event to the creator
            },
        });

        // Link the creator to the event with the role "creator"
        await prisma.userEvent.create({
            data: {
                userId,
                eventId: event.id,
                role: 'creator', // Assign the role of "creator"
            },
        });

        return NextResponse.json(event); // Return the created event
    } catch (error) {
        console.error('Error in POST /api/events:', error);

        // Ensure a valid JSON response is always returned
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    // console.log(userId)
    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        // Fetch events linked to the user via the UserEvent table
        const userEvents = await prisma.userEvent.findMany({
            where: { userId },
            include: {
                event: true, // Include event details
            },
        });

        // Format the response to include event and role information
        const eventsWithRoles = userEvents.map((userEvent) => ({
            event: userEvent.event,
            role: userEvent.role,
        }));

        console.log(eventsWithRoles)

        return NextResponse.json(eventsWithRoles);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
