'use client'
import React, { useEffect, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EventCalculationHistory, Expense, Prisma } from '@prisma/client';
import { CalendarDays, DollarSign, ImageIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image'
import { Separator } from './ui/separator';
import { format } from 'date-fns';
import { Button } from './ui/button';
import Date from './date';

// export const formatDate = (date: Date | string) => {
//     const parsedDate = new Date(date);

//     return new Intl.DateTimeFormat('en-GB', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: false
//     }).format(parsedDate);
// };

interface EventDisplayProps {
    event: Prisma.EventGetPayload<{
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
            },
            tags: true
        }
    }> | null,
    calculationHistory: CalculationHistory[],
    userId: string
}

interface CalculationHistory {
    id: string;
    eventId: string;
    date: Date;
    expenseId: string;
    history: History; // Replace `any[]` with the correct type if known
}

interface History {
    balances: Balances[];
}

interface Balances {
    balance: number;
    user: BasicUserInfo;
}


export default function ExpensesScroll({ event, calculationHistory, userId }: EventDisplayProps) {



    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when expenses change or are first loaded
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [event?.expenses]);


    const ExpenseBubble = ({
        expense,
        isCurrentUser,
    }: {
        expense: Expense;
        isCurrentUser: boolean;
    }) => (
        <div
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
        >
            <div
                className={`flex items-start ${isCurrentUser ? "flex-row-reverse" : ""}`}
            >
                {/* <Avatar className="h-8 w-8 mx-2"></Avatar> */}
                <div
                    className={`max-w-[70%] min-w-44 p-4 rounded-lg space-y-2  ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"
                        }`}
                >



                    <div>
                        <div className="flex items-center gap-5">
                            <p className="font-semibold capitalize">{expense.name}</p>
                            <span className={expense.imageUrl ? 'block' : 'hidden'}><ImageIcon size={20} /></span>
                        </div>

                        <p className="text-sm text-muted-foreground">{expense.description}</p>

                    </div>

                    <p className="text-md font-bold ">${expense.amount.toFixed(2)}</p>
                    <p className="text-xs opacity-70">

                        <Date date={expense.createdAt} />
                    </p>

                </div>
            </div>
        </div>
    );

    return (
        <div className="max-h-[70vh] overflow-scroll py-4">

            {event?.expenses.map((expense, index) => {
                const matchingCalculation = calculationHistory.find(
                    (calculation) => calculation.expenseId === expense.id
                );

                return (
                    <div key={expense.id}>



                        <Dialog>
                            <DialogTrigger asChild>
                                <div>
                                    <ExpenseBubble
                                        expense={expense}
                                        isCurrentUser={expense.user.id === userId}
                                    />
                                </div>

                            </DialogTrigger>
                            <DialogContent className="">
                                <DialogHeader>
                                    <DialogTitle>Expense Details</DialogTitle>
                                    <DialogDescription>View the details of this expense.</DialogDescription>
                                </DialogHeader>
                                <Card className="border-0 shadow-none">
                                    <CardHeader className="  flex justify-between flex-row items-center">
                                        <div className="space-y-2">
                                            <div>
                                                <CardTitle className="capitalize">{expense.name}</CardTitle>
                                                <CardDescription>
                                                    {expense.description}
                                                </CardDescription>
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {
                                                    expense.tags.map(tag => (
                                                        <Badge className="capitalize" key={tag.id}>{tag.name}</Badge>
                                                    ))
                                                }

                                            </div>
                                        </div>

                                        <Badge variant="secondary" className="w-fit border border-black items-center justify-center">
                                            <DollarSign className="mr-1 h-3 w-3" />
                                            {expense.amount.toFixed(2)}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="">
                                        {
                                            expense.imageUrl ? (
                                                <div className="relative w-full h-64 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={expense.imageUrl}
                                                        alt={`Receipt for ${expense.name}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : ''
                                        }

                                    </CardContent>
                                    <Separator className="my-2" />
                                    <CardFooter>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <CalendarDays className="mr-1 h-4 w-4" />
                                            {/* {formatDate(expense.createdAt)} */}
                                            <Date date={expense.createdAt} />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </DialogContent>
                        </Dialog>
                        {matchingCalculation && (
                            <div className="border-t border-gray-300 my-4">
                                <div className="text-sm font-semibold text-muted-foreground">
                                    Calculation (Date:{" "}
                                    <Date date={matchingCalculation.date} />

                                </div>
                                <ul>
                                    {matchingCalculation.history && matchingCalculation.history.balances.map(
                                        ({ user, balance }) => (
                                            <li className="text-xs text-black" key={user.id}>
                                                User {user.name}:{" "}
                                                {balance > 0
                                                    ? `gets $${balance.toFixed(2)}`
                                                    : `owes $${Math.abs(balance).toFixed(2)}`}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}

            {event?.expenses.length === 0 && (
                <div>
                    <h3 className="text-lg font-semibold">No Expenses Found</h3>
                </div>
            )}

            <div ref={bottomRef}></div>
        </div>
    )
}

