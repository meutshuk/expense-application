import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server'; // Update the path if your authOptions file is elsewhere

export async function GET(req: NextRequest) {
    try {
        // Retrieve the session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Return the user details from the session
        return NextResponse.json({
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
            },
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
