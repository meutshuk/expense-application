'use client';

import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card';
// import { Avatar } from '@radix-ui/react-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Expense = {
    id: string;
    name: string;
    amount: number;
};

export default function EventDetails() {
    const { id } = useParams<{ id: string; }>()

    const { data: session } = useSession();


    const [event, setEvent] = useState(null);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
    const [inviteEmail, setInviteEmail] = useState('')
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/events/${id}`);
                // console.log()
                const data = await response.json();

                setEvent(data.name);
                setExpenses(data.expenses);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    const handleInvite = async () => {
        if (!inviteEmail) return;

        try {
            const response = await fetch(`/api/events/${id}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail }),
            });

            const data = await response.json();
            console.log('Invitation Sent:', data);
        } catch (error) {
            console.error('Error inviting user:', error);
        }
    };

    const handleAddExpense = async () => {
        if (!expenseName || !expenseAmount) return;

        try {
            const response = await fetch(`/api/events/${id}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: expenseName, amount: parseFloat(expenseAmount) }),
            });

            const newExpense: Expense = await response.json();
            setExpenses((prev) => [...prev, newExpense]);
            setExpenseName('');
            setExpenseAmount('');
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const ExpenseBubble = ({ expense, isCurrentUser }: { expense: Expense, isCurrentUser: boolean }) => (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {/* <Avatar className="h-8 w-8 mx-2">
                    <AvatarImage src={`https://avatar.vercel.sh/${expense.user.email}`} /> */}
                {/* <AvatarFallback>{expenses.user.name[0]}</AvatarFallback> */}
                {/* </Avatar> */}
                <Card className={`max-w-[70%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <CardContent className="p-3">
                        <p className="font-semibold">{expense.name}</p>
                        <p className="text-sm">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs opacity-70">{new Date(expense.createdAt).toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    return (
        <div className="container mx-auto p-4 h-screen flex flex-col">

            <h2>{event?.name}</h2>

            <h3>Add Expense</h3>
            {/* <div>
                <input
                    type="text"
                    placeholder="Expense Name"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                />
                <button onClick={handleAddExpense}>Add Expense</button>
            </div> */}
            <form onSubmit={handleAddExpense} className="mt-4 flex gap-2">
                <Input
                    type="text"
                    placeholder="Expense Name"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="flex-grow"
                />
                <Input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-24"
                />
                <Button type="submit">Add Expense</Button>
            </form>

            <Card className="flex-grow overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    {expenses.map((expense) => (
                        <ExpenseBubble
                            key={expense.id}
                            expense={expense}
                            isCurrentUser={expense.user.id === session?.user.id}
                        />
                    ))}
                </ScrollArea>
            </Card>
            <div>


                <h2>Invite Users</h2>
                <input
                    type="email"
                    placeholder="User Email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button onClick={handleInvite}>Send Invite</button>
            </div>
        </div>
    );
}
