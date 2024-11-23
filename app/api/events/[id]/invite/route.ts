import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: eventId } = await params; // Extract event ID from route params
        const { email } = await req.json(); // Extract email from request body


        // Validate input
        if (!email || !eventId) {
            return NextResponse.json({ error: 'Missing email or event ID' }, { status: 400 });
        }

        // Calculate expiry date (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Add email to the invitedUsers table
        const invite = await prisma.invitedUser.create({
            data: {
                email,
                eventId,
                expiresAt,
            },
        });

        // Generate the invitation link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`;

        // Log the invitation details
        console.log(`Invite sent to ${email} for event ${eventId}`);
        console.log(`Invitation link: ${inviteLink}`);

        // Return the invite link in the response
        return NextResponse.json({
            message: `Invite sent to ${email}`,
            inviteLink,
        });
    } catch (error) {
        console.error('Error inviting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
