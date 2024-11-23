'use client';

import { signIn } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { useSearchParams } from "next/navigation"

export default function Login() {

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const inviteId = searchParams.get('inviteId') || '';


    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')


    const handleLogin = async (e: any) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        const result = await signIn('credentials', {
            redirect: true,
            email,
            password
        });

        if (result?.error) {

        } else {
            window.location.href = callbackUrl; // Redirect after successful login
        }
    };

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, inviteId }),
        });

        const result = await response.json()
        setIsLoading(false)

        if (response.ok) {
            setMessage('Registration successful! Please log in.')
        } else {
            setMessage(result.error || 'Something went wrong!')
        }
    }

    return (
        <Tabs defaultValue="login" className="w-[400px] h-[700px]">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card className="h-[500px]">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-2 h-[300px] overflow-y-auto">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled={isLoading} className="w-full">
                                {isLoading && (
                                    <div className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card className="h-[500px]">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>Create a new account to get started.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="space-y-2 ">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled={isLoading} className="w-full">
                                {isLoading && (
                                    <div className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Register
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            {message && (
                <p className="mt-4 text-center text-sm text-red-600">{message}</p>
            )}
        </Tabs>
    );
}



