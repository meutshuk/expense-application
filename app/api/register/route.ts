import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json();

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
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
