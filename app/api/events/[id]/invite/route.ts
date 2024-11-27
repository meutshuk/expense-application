import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type Param = Promise<{ id: string }>
export async function POST(req: NextRequest, { params }: { params: Param }) {
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
        const inviteLink = `${process.env.VERCEL_URL}/invite/${invite.id}`;

        // Log the invitation details
        console.log(`Invite sent to ${email} for event ${eventId}`);
        console.log(`Invitation link: ${inviteLink}`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_PASS, // Your Gmail app password
            },
        });

        // Send the email
        await transporter.sendMail({
            from: `"Expense Tracker" <${process.env.EMAIL_USER}>`, // Sender's email
            to: email, // Recipient's email
            subject: 'You have been invited to join an event on Expense Hub!',
            html: `
                <h1>You've been invited!</h1>
                <p>Click the link below to accept the invitation:</p>
                <a href="${inviteLink}" target="_blank">${inviteLink}</a>
                <p>This link will expire in 24 hours.</p>
            `,
        });


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
