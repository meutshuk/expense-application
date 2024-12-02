import React from "react";
import prisma from "@/lib/prisma";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Expense } from "@prisma/client";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { CalendarDays, DollarSign, ImageIcon, User } from "lucide-react";
import Image from 'next/image'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

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
                        tags: true

                    },
                    orderBy: {
                        createdAt: "asc", // Sort by createdAt in ascending order
                    },

                },

                tags: true

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
        <div className="container mx-auto m-10 px-10">
            <div className="flex justify-between items-center">
                <div className="text-xl md:text-3xl uppercase font-bold" >{event.name}</div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button> <User /> <span className="hidden md:block">Manage Users</span></Button>
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
                <ScrollArea className=" py-4">
                    {event?.expenses.map((expense, index) => {
                        const matchingCalculation = calculationHistory.find(
                            (calculation) => calculation.expenseId === expense.id
                        );

                        return (
                            <div key={expense.id}>



                                <Dialog>
                                    <DialogTrigger asChild>
                                        <ExpenseBubble
                                            expense={expense}
                                            isCurrentUser={expense.user.id === session?.user.id}
                                        />

                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
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

                                                    <div className="flex flex-wrap gap-3">
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
                                                    expense.imageUrl ?
                                                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                                                            <Image
                                                                src={expense.imageUrl}
                                                                alt={`Receipt for ${expense.name}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div> : ''
                                                }
                                            </CardContent>
                                            <Separator className="my-2" />
                                            <CardFooter>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <CalendarDays className="mr-1 h-4 w-4" />
                                                    {new Date(expense.createdAt).toLocaleString()}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </DialogContent>
                                </Dialog>
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

                <Drawer>
                    <DrawerTrigger asChild><Button className="w-full">Add Expense</Button></DrawerTrigger>

                    <DrawerContent className="mx-auto w-full">
                        <DrawerHeader>
                            <DrawerTitle>Add Expenses</DrawerTitle>
                            <DrawerDescription>Add expenses and upload image if you have any.</DrawerDescription>

                        </DrawerHeader>

                        <div className=" p-4">
                            <AddExpenseForm eventId={id} tags={event.tags} />

                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>

                    </DrawerContent>

                </Drawer>

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
                    {new Date(expense.createdAt).toLocaleString()}
                </p>

            </div>
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
