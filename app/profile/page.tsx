'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationBell from '@/components/notification';

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (!session) return


    return (
        <div className='container flex mx-auto gap-6 my-6'>
            <Card className='flex-1 h-fit'>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>{session?.user?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="">
                        <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Old Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Change Password
                        </button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                        {success && <p className="text-green-500 mt-2">{success}</p>}
                    </form>
                </CardContent>
            </Card>

            <div className='flex-1'>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>Manage your subscription</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <NotificationBell userId={session?.user.id} />
                    </CardContent>
                </Card>
            </div>
        </div>

    );
}
