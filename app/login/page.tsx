import LoginRegister from "@/components/login-register";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);

    // Await searchParams ONCE
    const params = await searchParams;

    // Destructure parameters
    const tab = params.tab as string;
    const email = params.email as string;
    const callbackUrl = (params.callbackUrl as string) || '/'; // Fallback to '/'
    const inviteId = params.inviteId as string;

    console.log("Callback URL:", callbackUrl);

    // Redirect if user is logged in
    if (session?.user) {
        redirect(callbackUrl);
    }

    // Pass extracted values to the component
    return (
        <LoginRegister
            defaultEmail={email}
            defaultTab={tab}
            callbackUrl={callbackUrl}
            inviteId={inviteId}
        />
    );
}
