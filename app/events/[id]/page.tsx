import React from "react";
import prisma from "@/lib/prisma";
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
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InviteUserForm from "@/components/invite-user-form";
import CalculationButton from "@/components/calculation-button";
import { Separator } from "@/components/ui/separator";
import AddExpenseForm from "@/components/add-expense-form";
import { User } from "lucide-react";
import ExpensesScroll from "@/components/expenses-scroll";

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
            <div className="mt-6">

                <ExpensesScroll calculationHistory={calculationHistory} event={event} userId={session.user.id} />


                <CalculationButton eventId={id} />

                <Separator className="my-6" />

                <Sheet>
                    <SheetTrigger asChild><Button className="w-full">Add Expense</Button></SheetTrigger>

                    <SheetContent className="mx-auto w-full">
                        <SheetHeader>
                            <SheetTitle>Add Expenses</SheetTitle>
                            <SheetDescription>Add expenses and upload image if you have any.</SheetDescription>

                        </SheetHeader>

                        <div className=" p-4">
                            <AddExpenseForm eventId={id} tags={event.tags} />

                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button className="w-full m-4" variant="outline">Cancel</Button>
                            </SheetClose>
                        </SheetFooter>

                    </SheetContent>

                </Sheet>

            </div>

            <div></div>
        </div>
    );
}



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
