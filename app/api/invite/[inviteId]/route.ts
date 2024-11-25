import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


type Param = Promise<{ inviteId: string }>
export async function GET(req: NextRequest, { params }: { params: Param }) {
    const { inviteId } = await params;

    try {
        const invite = await prisma.invitedUser.findUnique({
            where: { id: inviteId },
            include: {
                event: true
            }
        });


        if (!invite) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        return NextResponse.json(invite);
    } catch (error) {
        console.error('Error fetching invitation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
