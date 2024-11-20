import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { name, userId } = await req.json();

        if (!name || !userId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                name,
                userId,
            },
        });

        return NextResponse.json(event); // Return the created event as JSON
    } catch (error) {
        console.error('Error in POST /api/events:', error);

        // Ensure a valid JSON response is always returned
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Replace this with actual user ID logic if needed

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const events = await prisma.event.findMany({
            where: { userId },
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}