import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }) {
    const { id } = await params;
    const { name, amount } = await req.json();

    try {
        const expense = await prisma.expense.create({
            data: {
                name,
                amount,
                eventId: id,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
