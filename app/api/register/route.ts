import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    // Read the request body once
    const body = await req.json();
    console.log(body); // Debug log to inspect the body

    const { name, email, password, inviteId } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    try {
        // Check if the email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Add the user to the event if an inviteId is provided
        if (inviteId) {
            const invite = await prisma.invitedUser.findUnique({
                where: { id: inviteId },
            });

            if (invite) {
                await prisma.userEvent.create({
                    data: {
                        userId: user.id,
                        eventId: invite.eventId,
                        role: 'member',
                    },
                });

                // Delete the invite after use
                await prisma.invitedUser.delete({
                    where: { id: inviteId },
                });
            }
        }

        return NextResponse.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
