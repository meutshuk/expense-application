'use client';

import { checkSubscriptionAction, saveSubscription, sendNotification } from '@/app/actions';
import { Bell, BellMinus } from 'lucide-react';
import { useEffect, useState } from 'react';

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


    const subscribeToNotifications = async () => {
        if (!('serviceWorker' in navigator)) {
            alert('Service Worker not supported in this browser.');
            return;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
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

            console.log(serializedSubscription)
            // Save the subscription via server action
            await saveSubscription(serializedSubscription, userId);
            setIsSubscribed(true);
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };



    return (
        <div>

            {isSubscribed !== null && (
                <button onClick={subscribeToNotifications} className="p-2 bg-gray-200 rounded-full">
                    {isSubscribed ? (
                        <Bell size={24} className="text-green-500" />
                    ) : (
                        <BellMinus size={24} className="text-red-500" />
                    )}
                </button>
            )}

        </div>

    );
}
