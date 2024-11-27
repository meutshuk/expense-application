import { sendNotification } from '@/app/actions';
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

        // Fetch users related to the event
        const eventUsers = await prisma.userEvent.findMany({
            where: { id },
            include: { user: true }, // Include user details
        });


        // Notify all users except the one who created the expense
        const usersToNotify = eventUsers.filter((userEvent) => userEvent.userId !== userId);


        for (const { user } of usersToNotify) {
            await sendNotification(user.id, `New expense added: ${name} ($${amount})`);
        }

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
