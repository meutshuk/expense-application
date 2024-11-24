'use client';

import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Avatar } from '@radix-ui/react-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CreateExpenseForm from '@/components/form/createExpenseForm';
import { Expense } from '@prisma/client';

interface Expenses extends Expense {
    user: BasicUserInfo
}

export default function EventDetails() {
    const { id } = useParams<{ id: string; }>()

    const { data: session } = useSession();

    const [balances, setBalances] = useState(null);
    const [error, setError] = useState('');
    const [calculating, setCalculating] = useState(false);


    const [event, setEvent] = useState(null);
    const [calculationHistory, setCaluclationHistory] = useState([])
    const [expenses, setExpenses] = useState<Expenses[]>([]);
    const [users, setUsers] = useState<EventUsers[]>([])

    const [inviteEmail, setInviteEmail] = useState('')
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const bottomRef = useRef(null)






    const fetchExpenseAndCalculation = async () => {
        try {
            const response = await fetch(`/api/events/${id}`);

            const data = await response.json();
            // console.log(data)

            setEvent(data.event.name);
            setExpenses(data.event.expenses);
            setCaluclationHistory(data.calculationHistory)
        } catch (error) {
            console.error('Error fetching event:', error);
        }
    }

    const fetchInvitedUsers = async () => {
        try {
            const response = await fetch(`/api/events/${id}/users`)

            const data = await response.json();

            setUsers(data)

        } catch (error) {

            console.error('error fetching users', error)
        }
    }


    // Scroll to the bottom when expenses change
    useEffect(() => {


        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });


    }, [expenses]);

    useEffect(() => {
        if (id) {
            fetchExpenseAndCalculation();
            fetchInvitedUsers()
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

        } catch (error) {
            console.error('Error inviting user:', error);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const response = await fetch(`/api/events/${id}/calculate`, {
                method: 'POST',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate expenses');
            }
            setBalances(data.balances)
            // Refresh expenses and calculation history after successful calculation
            await fetchExpenseAndCalculation();
        } catch (err) {
            setError(err.message);
        } finally {
            setCalculating(false);
        }
    };

    // TODO: when i add it refreshes all UI. fix it
    const handleAddExpense = async (expense: { expenseName: string, expenseAmount: string }) => {

        if (!expense.expenseName || !expense.expenseAmount) return;
        console.log(expense)
        try {
            const response = await fetch(`/api/events/${id}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: expense.expenseName, amount: parseFloat(expense.expenseAmount) }),
            });

            if (!response.ok) {
                throw new Error('Failed to add expense');
            }

            const newExpense = await response.json();

            // Append the new expense to the current state
            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);

        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };


    const ExpenseBubble = ({ expense, isCurrentUser }: { expense: Expense, isCurrentUser: boolean }) => (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex items-start ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 mx-2">
                </Avatar>
                <Card className={`max-w-[70%]  ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
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
        <div className="container mx-auto p-4  ">




            <div className='h-[80vh] flex gap-4'>
                <div className='h-full flex-1'>
                    <Card className="h-full ">
                        <CardHeader>
                            <CardTitle>
                                <div>{event}</div>
                            </CardTitle>

                        </CardHeader>
                        <CardContent className='h-[80%] space-y-4'>

                            <CreateExpenseForm onSubmit={handleAddExpense} />

                            <ScrollArea className="h-full p-4">
                                {expenses.map((expense, index) => {
                                    // Find any calculation history that matches this expense
                                    const matchingCalculation = calculationHistory.find(
                                        (calculation) => calculation.expenseId === expense.id
                                    );

                                    return (
                                        <div key={expense.id}>
                                            <ExpenseBubble
                                                expense={expense}
                                                isCurrentUser={expense.user.id === session?.user.id}
                                            />
                                            {/* If there is a matching calculation, render the history */}
                                            {matchingCalculation && (
                                                <div className="border-t border-gray-300 my-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Calculation (Date: {new Date(matchingCalculation.date).toLocaleDateString()})
                                                    </h3>
                                                    <ul>
                                                        {matchingCalculation.history.balances.map(({ user, balance }) => (
                                                            <li key={user.id}>
                                                                User {user.name}:{' '}
                                                                {balance > 0 ? `gets $${balance.toFixed(2)}` : `owes $${Math.abs(balance).toFixed(2)}`}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Render any uncalculated expenses (after all the calculated ones) */}
                                {expenses.length === 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold">No Expenses Found</h3>
                                    </div>
                                )}

                                {/* Dummy element for scrolling */}
                                <div ref={bottomRef}></div>
                            </ScrollArea>


                        </CardContent>

                    </Card>

                    <div className='flex gap-10 mt-6 items-center'>
                        <Button onClick={handleCalculate} disabled={calculating} className=''>
                            {calculating ? 'Calculating...' : 'Calculate Balances'}
                        </Button>

                        <Card className='bg-gray-100 h-36 w-full'>
                            <CardTitle />
                            <CardContent>
                                {
                                    balances && (
                                        <ul className="list-none p-0">
                                            {balances.map(({ user, balance }) => (
                                                <li
                                                    className={`p-2 rounded ${balance > 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}
                                                    key={user.id}
                                                >
                                                    User {user.name}:{' '}
                                                    {balance > 0 ? `gets $${balance.toFixed(2)}` : `owes $${Math.abs(balance).toFixed(2)}`}
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <fieldset className=" flex flex-col w-1/3 h-fit gap-6 rounded-lg border p-4">
                    <legend>Users</legend>


                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Invite Users
                            </CardTitle>
                            <CardDescription>Invite User to Add expenses.</CardDescription>
                        </CardHeader>
                        <CardContent>

                        </CardContent>

                        <CardFooter className='flex flex-col space-y-4'>
                            <Input
                                type="email"
                                placeholder="User Email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <Button className='w-full' onClick={handleInvite}>Send Invite</Button>
                        </CardFooter>

                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Users
                            </CardTitle>
                            <CardDescription>
                                List of Users who has access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>

                        </CardContent>
                    </Card>







                </fieldset>

            </div>





        </div >
    );
}
