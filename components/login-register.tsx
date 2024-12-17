'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const registerSchema = loginSchema.extend({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

interface LoginRegisterProps {
    defaultTab?: string;
    defaultEmail?: string;
    callbackUrl?: string;
    inviteId?: string
}

export default function LoginRegister({ defaultTab = 'login', defaultEmail = '', callbackUrl, inviteId = '' }: LoginRegisterProps) {


    const router = useRouter();
    const searchParams = useSearchParams()

    callbackUrl = callbackUrl || searchParams.get('callbackUrl') || '/'

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [activeTab, setActiveTab] = useState(defaultTab)



    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: defaultEmail,
            password: "",
        },
    })

    const registerForm = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: defaultEmail,
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        if (defaultTab === 'register' || defaultTab === 'login') {
            setActiveTab(defaultTab)
        }
    }, [defaultTab])

    useEffect(() => {
        if (defaultEmail) {
            loginForm.setValue('email', defaultEmail)
            registerForm.setValue('email', defaultEmail)
        }
    }, [defaultEmail, loginForm, registerForm])


    const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
        const result = await signIn("credentials", {
            redirect: true,
            email: values.email,
            password: values.password,
        });



        if (result?.error) {
        } else {
            window.location.href = callbackUrl // Redirect after successful login

        }
    };

    const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {

        setIsLoading(true)
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: values.name, email: values.email, password: values.password, inviteId }),
        });

        const result = await response.json();
        setIsLoading(false);





    }

    return (
        <div className="min-h-screen w-full flex mt-20 justify-center  p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <div className="space-y-4 p-6 bg-white rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold">Login</h2>
                            <p className="text-gray-500">
                                Enter your credentials to access your account.
                            </p>
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full transition-all duration-200 hover:bg-primary/90"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                className="h-5 w-5 rounded-full border-t-2 border-r-2 border-white"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                        ) : (
                                            "Login"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </TabsContent>
                    <TabsContent value="register">
                        <div className="space-y-4 p-6 bg-white rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold">Register</h2>
                            <p className="text-gray-500">
                                Create a new account to get started.
                            </p>
                            <Form {...registerForm}>
                                <form
                                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={registerForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Create a password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm your password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full transition-all duration-200 hover:bg-primary/90"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                className="h-5 w-5 rounded-full border-t-2 border-r-2 border-white"
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                        ) : (
                                            "Register"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </TabsContent>
                </Tabs>
                {message && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-center text-sm text-white bg-red-500 p-2 rounded"
                    >
                        {message}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );


}