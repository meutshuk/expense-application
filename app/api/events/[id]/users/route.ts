import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

    const { id } = await params

    try {
        const users = await prisma.userEvent.findMany({
            where: {
                eventId: id
            }, include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Extract the user details from the response
        const userDetails = users.map((userEvent) => ({
            id: userEvent.user.id,
            name: userEvent.user.name,
            email: userEvent.user.email,
            role: userEvent.role,
        }));

        return NextResponse.json(userDetails);



    } catch (err) {

        console.error("Error while fetching users", err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });


    }





}