import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

console.log('Middleware is loaded');

export default withAuth({
    pages: {
        signIn: '/login', // Redirect to the login page if not authenticated
    },
});

export const config = {
    matcher: [
        '/((?!api/auth|api|_next|static|favicon.ico|register|login|invite).*)',
    ],
};
