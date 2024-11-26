

import LoginRegister from "@/components/login-register";



export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {


    const tab = (await searchParams).tab as string
    const email = (await searchParams).email as string
    const callbackUrl = (await searchParams).callbackUrl as string
    const inviteId = (await searchParams).inviteId as string


    return (
        <LoginRegister defaultEmail={email} defaultTab={tab} callbackUrl={callbackUrl} inviteId={inviteId} />
    );
}
