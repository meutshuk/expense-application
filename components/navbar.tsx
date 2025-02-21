'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, LogOut, CircleUser, User2, } from 'lucide-react'
import { cn } from "@/lib/utils"
import { signOut } from 'next-auth/react';
import NotificationBell from './notification'
import { User } from 'next-auth'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { useMediaQuery } from '@/lib/useMediaQuery'

interface Navigation {
    name: string,
    href: string
}

const navigation: Navigation[] = []

interface Props {
    userId: string
    user: User
}

export function Navbar({ userId, user }: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const pathname = usePathname()

    const isDesktop = useMediaQuery("(min-width: 768px)")
    const handleLogout = async () => {
        await signOut({
            callbackUrl: '/login', // Redirect to the login page after logout
        });
    }

    const UserMenu = () => (
        <div className="flex flex-col h-full">
            <SheetHeader>
                <SheetTitle>User Profile</SheetTitle>
                <SheetDescription>{user.email}</SheetDescription>
            </SheetHeader>
            <div className="flex-grow mt-4">
                <Link href={'profile'}>
                    <span>Profile</span>
                </Link>


            </div>
            <Button onClick={handleLogout} variant="destructive" className="mt-auto">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
    )

    return (
        <nav className="bg-bg border-b-black border-b-2">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <div className="flex">
                        <Link href="/" className="flex flex-shrink-0 items-center">
                            <svg className="h-8 w-auto text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="ml-2 text-xl font-bold text-gray-900">Expense Tracker</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                                        pathname === item.href
                                            ? "border-indigo-500 text-gray-900"
                                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    {!isDesktop ? (
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className='h-10 w-10'>
                                    <User2 className="h-10 w-10" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <UserMenu />
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <User2 className="h-6 w-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <Link href={'/profile'}>
                                    <DropdownMenuItem>
                                        <span>Profile</span>

                                    </DropdownMenuItem>

                                </Link>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

        </nav>
    )
}

