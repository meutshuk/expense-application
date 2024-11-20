import { withAuth } from 'next-auth/middleware';
import {getToken} from "next-auth/jwt";
import {NextRequest,NextResponse} from "next/server";

console.log('Middleware is running');
export default withAuth({
    pages: {
        signIn: '/login', // Redirect to the login page if not authenticated
    },
});


// Configure middleware to match all routes except for the excluded ones
export const config = {
    matcher: [
        '/((?!api|_next|static|favicon.ico|register).*)', // Exclude these paths
    ],
};
