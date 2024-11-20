import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function AcceptInvitePage({ params }: { params: { id: string } }) {
    const { id: inviteId } = params;

    // Fetch the invitation details
    const invite = await prisma.invitedUser.findUnique({
        where: { id: inviteId },
    });

    if (!invite) {
        return <div>Invalid or expired invitation link.</div>;
    }

    // Get the current session (logged-in user)
    const session = await getServerSession(authOptions);

    if (!session) {
        // If not logged in, redirect to login with callback
        redirect(`/login?callbackUrl=/accept-invite/${inviteId}`);
    }

    // Add the user to the event if they are logged in
    const userId = session.user.id;
    const event = await prisma.event.findUnique({
        where: { id: invite.eventId },
    });

    if (!event) {
        return <div>Event not found.</div>;
    }

    // Check if the user is already part of the event
    const existingUserEvent = await prisma.userEvent.findUnique({
        where: { userId_eventId: { userId, eventId: event.id } },
    });

    if (!existingUserEvent) {
        // Add the user to the event
        await prisma.userEvent.create({
            data: {
                userId,
                eventId: event.id,
                role: 'member', // Assign a role, e.g., 'member' or 'guest'
            },
        });
    }

    // Redirect to the event page
    redirect(`/events/${event.id}`);
}
