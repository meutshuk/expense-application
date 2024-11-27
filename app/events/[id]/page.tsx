import React from "react";
import prisma from "@/lib/prisma";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Expense } from "@prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "postcss";
import { Badge } from "@/components/ui/badge";
import InviteUserForm from "@/components/invite-user-form";
import useSWR from "swr";
import CalculationButton from "@/components/calculation-button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AddExpenseForm from "@/components/add-expense-form";

interface InvitedUsers {
    id: string;
    name: string;
    email: string;
    role: string;
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

interface Test {
    balances: {
        user: {
            id: string;
            name: string;
        };
        balance: number;
    }[];
}

interface Props {
    params: Promise<{ id: string }>;
}
export default async function Page({ params }: Props) {
    const session = await getServerSession(authOptions);
    if (!session) return;

    let { id } = await params;

    async function getExpensesAndCalcualtion() {
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
                    },
                    orderBy: {
                        createdAt: "asc", // Sort by createdAt in ascending order
                    },
                },
            },
        });

        // Fetch calculation history
        const calculationHistory = await prisma.eventCalculationHistory.findMany({
            where: { eventId: id },
        });

        return { event, calculationHistory };
    }

    async function getInvitedUsers() {
        const users = await prisma.userEvent.findMany({
            where: {
                eventId: id,
            },
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

        // Extract the user details from the response
        const userDetails = users.map((userEvent) => ({
            id: userEvent.user.id,
            name: userEvent.user.name,
            email: userEvent.user.email,
            role: userEvent.role,
        }));

        return userDetails;
    }

    let res = await getExpensesAndCalcualtion();
    let event = res.event;
    console.log(res.calculationHistory);
    const calculationHistory: CalculationHistory[] = res.calculationHistory.map(
        (calculation) => {
            return {
                id: calculation.id,
                eventId: calculation.eventId,
                expenseId: calculation.expenseId,
                date: new Date(calculation.date),
                history: calculation.history as unknown as History, // Assert that this is a valid History
            };
        }
    );

    let users = await getInvitedUsers();

    if (!event) return;

    return (
        <div className="container mx-auto px-4">
            <div>
                <div>{event.name}</div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>Manage Users</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Manage Users</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invite Users</CardTitle>
                                    <CardDescription>
                                        Invite User to Add expenses.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <InviteUserForm eventId={id} />
                                </CardContent>
                            </Card>

                            <Card className="mt-4">
                                {/* <UserList users={users} /> */}
                                <CardHeader>
                                    <CardTitle>Users</CardTitle>
                                    <CardDescription>
                                        List of Users who has access.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UserList users={users} />
                                </CardContent>
                            </Card>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div>
                <ScrollArea className=" p-4">
                    {event?.expenses.map((expense, index) => {
                        const matchingCalculation = calculationHistory.find(
                            (calculation) => calculation.expenseId === expense.id
                        );

                        return (
                            <div key={expense.id}>
                                <ExpenseBubble
                                    expense={expense}
                                    isCurrentUser={expense.user.id === session?.user.id}
                                />

                                {matchingCalculation && (
                                    <div className="border-t border-gray-300 my-4">
                                        <div className="text-sm font-semibold text-muted-foreground">
                                            Calculation (Date:{" "}
                                            {new Date(matchingCalculation.date).toLocaleDateString()})
                                        </div>
                                        <ul>
                                            {matchingCalculation.history.balances.map(
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

                    {/* <div ref={bottomRef}></div> */}
                </ScrollArea>
                <CalculationButton eventId={id} />

                <Separator className="my-6" />

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full">Add Expense</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Expense</DialogTitle>
                            <DialogDescription>
                                Add expenses and upload image if you have any.
                            </DialogDescription>
                        </DialogHeader>
                        <AddExpenseForm eventId={id} />
                    </DialogContent>
                    <DialogFooter></DialogFooter>
                </Dialog>
            </div>

            <div></div>
        </div>
    );
}

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
            <Card
                className={`max-w-[70%] px-2 py-2  ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
            >
                <CardContent className="p-3">
                    <p className="font-semibold">{expense.name}</p>
                    <p className="">{expense.description}</p>
                    <p className="text-sm">${expense.amount.toFixed(2)}</p>
                    <p className="text-xs opacity-70">
                        {new Date(expense.createdAt).toLocaleString()}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
);

const UserList = ({ users }: { users: InvitedUsers[] }) => (
    <ul>
        {users.map((user) => (
            <li
                key={user.id}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent"
            >
                <div className="flex-grow">
                    <span className="font-medium">{user.email}</span>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground space-x-2">
                            <span>{user.name}</span>

                            {user.role === "creator" && (
                                <Badge variant="secondary" className="rounded-full text-xs">
                                    Creator
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </li>
        ))}
    </ul>
);
