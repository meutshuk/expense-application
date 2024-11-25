import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

type Param = Promise<{ id: string }>
export async function POST(req: NextRequest, { params }: { params: Param }) {
    const { id } = await params;

    const { name, amount } = await req.json();
    console.log(name, amount)


    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;



    try {
        const expense = await prisma.expense.create({
            data: {
                name,
                amount,
                eventId: id,
                addedBy: userId,
            },
        });



        // Fetch the created expense with user details
        const detailedExpense = await prisma.expense.findUnique({
            where: { id: expense.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(detailedExpense);
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
