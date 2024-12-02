import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Param = Promise<{ id: string }>
export async function GET(req: NextRequest, { params }: { params: Param }) {
    const { id } = await params;

    try {
        const event = await prisma.event.findUnique({
            where: { id: id }, // Replace id with your dynamic value
            include: {
                expenses: {
                    include: {
                        user: {
                            // Include the user who added the expense
                            select: {
                                id: true,
                                name: true,
                                email: true, // Include other fields as needed
                            },
                        },
                        tags: true
                    },
                    orderBy: {
                        createdAt: 'asc', // Sort by createdAt in ascending order
                    },
                },
                tags: true

            },
        });

        // Fetch calculation history
        const calculationHistory = await prisma.eventCalculationHistory.findMany({
            where: { eventId: id },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event, calculationHistory });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
