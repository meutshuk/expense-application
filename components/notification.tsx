'use client';

import { checkSubscriptionAction, removeSubscription, saveSubscription, sendNotification } from '@/app/actions';
import { Bell, BellMinus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export default function NotificationBell({ userId }: { userId: string }) {


    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // Use `null` for initial loading state


    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator)) {
            console.error('Service workers are not supported in this browser.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            const subscription = await registration?.pushManager.getSubscription();

            if (subscription) {
                const response = await checkSubscriptionAction(subscription.endpoint, userId)

                setIsSubscribed(response.isSubscribed);
            } else {
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    useEffect(() => {
        checkSubscription()
    }, [])


    const toggleSubscription = async () => {
        if (!('serviceWorker' in navigator)) {
            alert('Service Worker not supported in this browser.');
            return;
        }

        try {

            if (!isSubscribed) {


                const registration = await navigator.serviceWorker.register('/sw.js');// Register service worker
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

                // Subscribe to push notifications
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: publicKey,
                });

                const serializedSubscription = {
                    endpoint: subscription.endpoint,
                    expirationTime: subscription.expirationTime || null,
                    keys: {
                        p256dh: subscription.getKey('p256dh')
                            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
                            : null, // Ensure a fallback value
                        auth: subscription.getKey('auth')
                            ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
                            : null, // Ensure a fallback value
                    },
                };

                // Save the subscription via server action
                await saveSubscription(serializedSubscription, userId);
                setIsSubscribed(true);

            } else {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    // Unsubscribe from push notifications
                    const unsubscribed = await subscription.unsubscribe();

                    if (unsubscribed) {

                        let apple = await removeSubscription(subscription.endpoint, userId)
                        if (apple.success) {
                            setIsSubscribed(false);
                        }
                    } else {
                        console.log("Failed to unsubscribe.");
                    }
                }
            }


        } catch (error) {
            console.error('Subscription error:', error);
        }
    };



    return (
        <div className='flex flex-col justify-center gap-4 items-center'>

            {isSubscribed !== null && (
                <>
                    <p>This browser is {isSubscribed ? '' : 'not'} subscribed for notification.</p>
                    <Button onClick={toggleSubscription} className="">
                        {isSubscribed ? (
                            <>
                                <BellMinus size={20} className="" />
                                <span>Unsubscribe</span>
                            </>



                        ) : (
                            <>
                                <Bell size={20} className="" />
                                <span>Subscribe</span>
                            </>

                        )}
                    </Button>
                </>

            )}

        </div>

    );
}
