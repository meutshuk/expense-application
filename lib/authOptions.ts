import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from '@/lib/prisma'


export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },


            async authorize(credentials) {

                if (!credentials?.email || !credentials.password) {
                    throw new Error('Email and password are required');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }
                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error('Invalid password');
                }


                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            },
        }),
    ],

    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {

            session.user = {
                id: token.id as string,
                email: token.email,
            };
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id; // Add id to JWT token
                token.email = user.email;
            }
            return token;
        },
    },
};