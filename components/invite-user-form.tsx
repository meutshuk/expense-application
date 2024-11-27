'use client'

import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'



export default function InviteUserForm({ eventId }: { eventId: string }) {

    const { toast } = useToast()

    const handleInvite = async () => {
        if (!inviteEmail) return;

        try {
            const response = await fetch(`/api/events/${eventId}/invite`, {
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

    const [inviteEmail, setInviteEmail] = useState('')

    return (
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
    )
}
