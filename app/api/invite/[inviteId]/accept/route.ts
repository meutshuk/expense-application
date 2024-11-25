import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path if needed
import { NextRequest, NextResponse } from 'next/server';

type Param = Promise<{ inviteId: string }>
export async function POST(req: NextRequest, { params }: { params: Param }) {
    const { inviteId: inviteId } = await params;


    try {
        // Get session details to ensure the user is authenticated
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = session.user.email;

        // Find the invite in the database
        const invite = await prisma.invitedUser.findUnique({
            where: { id: inviteId },
        });

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
        }

        if (invite.email !== userEmail) {
            return NextResponse.json({ error: 'This invite is not for the logged-in user' }, { status: 403 });
        }

        // Add the user to the UserEvent table
        await prisma.userEvent.create({
            data: {
                userId: session.user.id,
                eventId: invite.eventId,
                role: 'member', // Assign a default role (adjust as needed)
            },
        });

        // Optionally, you can delete the invite or mark it as used
        await prisma.invitedUser.delete({
            where: { id: inviteId },
        });

        return NextResponse.json({ message: 'Invite accepted successfully' });
    } catch (error) {
        console.error('Error accepting invite:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
