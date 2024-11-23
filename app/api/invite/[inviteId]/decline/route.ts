import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust the path if needed
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: inviteId } = params;

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

        if (invite.email !== userEmail) {
            return NextResponse.json({ error: 'This invite is not for the logged-in user' }, { status: 403 });
        }

        // Optionally, you can delete the invite or mark it as expired
        await prisma.invitedUser.delete({
            where: { id: inviteId },
        });

        return NextResponse.json({ message: 'Invite declined successfully' });
    } catch (error) {
        console.error('Error declining invite:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
