'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Invite {
    id: string;
    eventId: string;
    email: string;
    expiresAt: Date;
    event: InvitedEvent
}

interface InvitedEvent {
    id: string;
    name: string;
    createdAt: Date;
    creatorId: string;
    updatedAt: Date;
}

const InvitePage = () => {
    const { inviteId } = useParams<{ inviteId: string }>()
    const router = useRouter();
    const [invite, setInvite] = useState<Invite>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(false);
    const { data: session, status } = useSession(); // Use NextAuth session

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const inviteResponse = await fetch(`/api/invite/${inviteId}`);
                if (!inviteResponse.ok) {
                    throw new Error('Invalid or expired invite');
                }
                const inviteData = await inviteResponse.json();
                setInvite(inviteData);

                if (status === 'authenticated' && session?.user) {
                    if (session.user.email !== inviteData.email) {
                        throw new Error('This invite is not for the currently logged-in user.');
                    }
                } else if (status === 'unauthenticated') {
                    // Wait to fetch invite data before redirect
                    console.log('Redirecting to login...');
                    router.push(`/login?callbackUrl=/invite/${inviteId}&email=${inviteData.email}`);
                }

                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'An error occurred while processing the invite.');
                setLoading(false);
            }
        };

        if (status !== 'loading') {
            fetchInvite();
        }
    }, [inviteId, router, session, status]);

    if (loading || status === 'loading') return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleAccept = async () => {
        setAccepting(true);
        try {
            const response = await fetch(`/api/invite/${inviteId}/accept`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to accept invite');
            }
            router.push('/'); // Redirect after accepting
        } catch (err) {
            setError('Could not accept invite.');
        } finally {
            setAccepting(false);
        }
    };

    const handleDecline = async () => {
        setAccepting(true);
        try {
            const response = await fetch(`/api/invite/${inviteId}/decline`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to decline invite');
            }
            router.push('/dashboard'); // Redirect after declining
        } catch (err) {
            console.error((err as Error).message);
            setError('Could not decline invite.');
        } finally {
            setAccepting(false);
        }
    };

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>{error}</p>;

    return (

        <div className="min-h-screen w-full flex items-center justify-center   p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">You've been invited!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">{invite?.event?.name}</h2>
                        {/* TODO: Add inviter name. Need to update database model */}
                        {/* <p className="text-sm text-gray-500">You're invited by {invite?.inviter?.name || 'Someone special'}</p> */}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button onClick={handleAccept} disabled={accepting} className="w-[45%]">
                        {accepting ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button onClick={handleDecline} disabled={accepting} variant="outline" className="w-[45%]">
                        {accepting ? 'Processing...' : 'Decline'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default InvitePage;
