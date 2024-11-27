import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Param = Promise<{ id: string }>
export async function POST(req: NextRequest, { params }: { params: Param }) {
    const { id: eventId } = await params;

    try {
        // Fetch users with access to the event
        const userEvents = await prisma.userEvent.findMany({
            where: { eventId },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        const users = userEvents.map((userEvent) => userEvent.user);

        // Fetch uncalculated expenses for the event
        const expenses = await prisma.expense.findMany({
            where: { eventId, calculated: false },
        });

        if (expenses.length === 0) {
            return NextResponse.json({ success: false, message: 'No uncalculated expenses found' });
        }

        // Calculate balances
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const perUserShare = totalAmount / users.length;

        // Initialize balances with user details
        const userDetailsBalances = users.map((user) => ({
            user,
            balance: 0,
        }));

        expenses.forEach((expense) => {
            const userBalance = userDetailsBalances.find((ub) => ub.user.id === expense.addedBy);
            if (userBalance) {
                userBalance.balance += expense.amount;
            }
        });



        userDetailsBalances.forEach((userBalance) => {
            userBalance.balance -= perUserShare;
        });

        // Mark expenses as calculated
        await prisma.expense.updateMany({
            where: { eventId, calculated: false },
            data: { calculated: true },
        });

        // Save calculation history (optional)
        const lastExpense = expenses[expenses.length - 1];
        await prisma.eventCalculationHistory.create({
            data: {
                eventId,
                expenseId: lastExpense.id,
                history: { balances: userDetailsBalances },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Calculation completed',
            balances: userDetailsBalances,
        });
    } catch (error) {
        console.error('Error calculating expenses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
