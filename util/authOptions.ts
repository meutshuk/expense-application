import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '@/lib/prisma'

import { PrismaClient } from "@prisma/client";


export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },


            async authorize(credentials) {

                if (!credentials) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (user && user.password === credentials.password) {
                    return user;
                }
                return null;
            },
        }),
    ],
    session:{
        strategy:'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
};