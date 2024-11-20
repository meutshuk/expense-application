import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }) {
    const { id } = await params;

    try {
        const event = await prisma.event.findUnique({
            where: { id: id }, // Replace eventId with your dynamic value
            include: {
                expenses: {
                    include: {
                        user: { // Include the user who added the expense
                            select: {
                                id: true,
                                name: true,
                                email: true, // Include other fields as needed
                            },
                        },
                    },
                },
            },
        });

        console.log(event)

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
