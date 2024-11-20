'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'

export default function InvitationPage({ params }: { params: { inviteId: string } }) {
    const { inviteId } = useParams<{ inviteId: string; }>()
    const [email, setEmail] = useState('');
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        // Fetch the invitation details
        const fetchInvite = async () => {
            const response = await fetch(`/api/invites/${inviteId}`);
            const data = await response.json();
            setEmail(data.email);
        };

        fetchInvite();
    }, [inviteId]);

    const handleRegister = () => {
        setShowRegister(true);
    };

    const handleGuestAccess = async () => {
        console.log(`Accessing event as guest for ${email}`);
        // Handle guest access logic here
    };

    return (
        <div>
            <h1>Invitation</h1>
            <p>You are invited to an event with email: {email}</p>
            {!showRegister ? (
                <>
                    <button onClick={handleRegister}>Create Account</button>
                    <button onClick={handleGuestAccess}>Continue as Guest</button>
                </>
            ) : (
                <form>
                    <h2>Register</h2>
                    {/* TODO: move register to a seperate component and use that here */}
                    <input type="email" value={email} readOnly />
                    <input type="password" placeholder="Password" />
                    <button type="submit">Register</button>
                </form>
            )}
        </div>
    );
}
