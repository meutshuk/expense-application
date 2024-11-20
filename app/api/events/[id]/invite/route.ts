import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: eventId } = await params;
    const { email } = await req.json();
    console.log(email)

    try {
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Add email to the invitedUsers table
        const invite = await prisma.invitedUser.create({
            data: {
                email,
                eventId,
            },
        });
        // Generate the invitation link
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.id}`;

        // Log the link (replace this with email sending logic later)
        console.log(`Invite sent to ${email} for event ${eventId}`);
        console.log(`Invitation link: ${inviteLink}`);


        return NextResponse.json({ message: `Invite sent to ${email}` });
    } catch (error) {
        console.error('Error inviting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
