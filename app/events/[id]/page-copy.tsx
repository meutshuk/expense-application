"use client";

import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
// import { Avatar } from '@radix-ui/react-avatar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CreateExpenseForm from "@/components/form/createExpenseForm";
import { Expense } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface Expenses extends Expense {
    user: BasicUserInfo;
}

interface CalculationHistory {
    id: string;
    eventId: string;
    date: Date;
    expenseId: string;
    history: History; // Replace `any[]` with the correct type if known
}

interface History {
    balances: Balances[]
}

interface Balances {
    balance: number;
    user: BasicUserInfo
}

export default function EventDetails() {
    const { id } = useParams<{ id: string }>();

    const isDesktop = useMediaQuery("(min-width: 768px)")

    const { data: session } = useSession();
    const { toast } = useToast()


    const [balances, setBalances] = useState<Balances[]>([]);
    const [error, setError] = useState("");
    const [calculating, setCalculating] = useState(false);

    const [event, setEvent] = useState(null);
    const [calculationHistory, setCaluclationHistory] = useState<CalculationHistory[]>([]);
    const [expenses, setExpenses] = useState<Expenses[]>([]);
    const [users, setUsers] = useState<EventUsers[]>([]);

    const [inviteEmail, setInviteEmail] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const bottomRef = useRef<HTMLDivElement>(null);


    const fetchExpenseAndCalculation = async () => {
        try {
            const response = await fetch(`/api/events/${id}`);

            const data = await response.json();
            // console.log(data)

            setEvent(data.event.name);
            setExpenses(data.event.expenses);
            setCaluclationHistory(data.calculationHistory);
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    const fetchInvitedUsers = async () => {
        try {
            const response = await fetch(`/api/events/${id}/users`);

            const data = await response.json();

            setUsers(data);
        } catch (error) {
            console.error("error fetching users", error);
        }
    };

    // Scroll to the bottom when expenses change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [expenses]);

    useEffect(() => {
        if (id) {
            fetchExpenseAndCalculation();
            fetchInvitedUsers();
        }
    }, [id]);

    const handleInvite = async () => {
        if (!inviteEmail) return;

        try {
            const response = await fetch(`/api/events/${id}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });

            if (response.ok) {
                toast({
                    title: 'Invitation Link Sent'

                })

                setInviteEmail('')
            }

        } catch (error) {
            console.error("Error inviting user:", error);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const response = await fetch(`/api/events/${id}/calculate`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to calculate expenses");
            }
            setBalances(data.balances);
            // Refresh expenses and calculation history after successful calculation
            await fetchExpenseAndCalculation();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setCalculating(false);
        }
    };

    // TODO: when i add it refreshes all UI. fix it
    const handleAddExpense = async (expense: {
        expenseName: string;
        expenseAmount: string;
    }) => {
        if (!expense.expenseName || !expense.expenseAmount) return;

        try {
            const response = await fetch(`/api/events/${id}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: expense.expenseName,
                    amount: parseFloat(expense.expenseAmount),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            const newExpense = await response.json();

            // Append the new expense to the current state
            setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const UserList = () => (
        <>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>List of Users who has access.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                        <span>
                                            {user.name}
                                        </span>

                                        {user.role === "creator" && (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-full text-xs"
                                            >
                                                Creator
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </>
    )

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
                className={`flex items-start ${isCurrentUser ? "flex-row-reverse" : ""
                    }`}
            >
                {/* <Avatar className="h-8 w-8 mx-2"></Avatar> */}
                <Card
                    className={`max-w-[70%]  ${isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                        }`}
                >
                    <CardContent className="p-3">
                        <p className="font-semibold">{expense.name}</p>
                        <p className="text-sm">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs opacity-70">
                            {new Date(expense.createdAt).toLocaleString()}
                        </p>
                    </CardContent>

                </Card>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                    <Card className="h-[80vh]">
                        <CardHeader>
                            <CardTitle>
                                <div className="flex justify-between">
                                    <div>{event}</div>
                                    {
                                        isDesktop ?
                                            (null) : (<Sheet>
                                                <SheetTrigger asChild>
                                                    <Button className="w-fit md:w-auto" variant={"secondary"}>Manage Users</Button>
                                                </SheetTrigger>
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>Manage Users</SheetTitle>
                                                    </SheetHeader>
                                                    <div className="mt-4">
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Invite Users</CardTitle>
                                                                <CardDescription>Invite User to Add expenses.</CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="flex flex-col space-y-4">
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="User Email"
                                                                        value={inviteEmail}
                                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                                    />
                                                                    <Button className="w-full" onClick={handleInvite}>
                                                                        Send Invite
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="mt-4">
                                                            <UserList />
                                                        </Card>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>)
                                    }
                                </div>

                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-8rem)] space-y-4">
                            <CreateExpenseForm onSubmit={handleAddExpense} />

                            <ScrollArea className="h-full p-4">
                                {expenses.map((expense, index) => {
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
                                                    <div>App</div>
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

                                {expenses.length === 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold">No Expenses Found</h3>
                                    </div>
                                )}

                                <div ref={bottomRef}></div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col md:flex-row gap-4 mt-6 items-center">
                        <Button
                            onClick={handleCalculate}
                            disabled={calculating}
                            className="w-full md:w-auto"
                        >
                            {calculating ? "Calculating..." : "Calculate Balances"}
                        </Button>

                        <Card className="bg-gray-100 w-full md:flex-1">
                            <CardContent className="p-4">
                                {balances && (
                                    <ul className="list-none p-0">
                                        {balances.map(({ user, balance }) => (
                                            <li
                                                className={`p-2 rounded ${balance > 0 ? "text-green-600" : "text-red-600"
                                                    }`}
                                                key={user.id}
                                            >
                                                User {user.name}:{" "}
                                                {balance > 0
                                                    ? `gets $${balance.toFixed(2)}`
                                                    : `owes $${Math.abs(balance).toFixed(2)}`}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {isDesktop ? (
                    <div className="w-full md:w-1/3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invite Users</CardTitle>
                                <CardDescription>Invite User to Add expenses.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="User Email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                    <Button className="w-full" onClick={handleInvite}>
                                        Send Invite
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-4">
                            <UserList />
                        </Card>
                    </div>
                ) : (
                    null
                )}
            </div>
        </div>
    )
}