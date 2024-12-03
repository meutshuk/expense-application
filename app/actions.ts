'use server';

import prisma from '@/lib/prisma';
import webpush from 'web-push';

export async function removeSubscription(subscriptionEndpoint: string, userId?: string) {
    try {
        await prisma.pushSubscription.delete({
            where: {
                endpoint: subscriptionEndpoint
            }
        })

        return { success: true };
    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false, error: 'Failed to save subscription' };
    }
}

export async function saveSubscription(subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: {
        p256dh: string | null;
        auth: string | null;
    };
}, userId?: string) {

    console.log(subscription)
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        console.log("first")
        throw new Error('Invalid subscription payload');
    }
    console.log("first")
    try {
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                expirationTime: subscription.expirationTime,
                p256dh: subscription.keys.p256dh || '', // Fallback to empty string
                auth: subscription.keys.auth || '', // Fallback to empty string
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh || '', // Fallback to empty string
                auth: subscription.keys.auth || '', // Fallback to empty string
                expirationTime: subscription.expirationTime,

            },
        });

        return { success: true };
    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false, error: 'Failed to save subscription' };
    }
}

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(userId: string, message: string) {
    console.log("send notification")
    try {
        // Fetch all subscriptions for the user
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        for (const subscription of subscriptions) {
            const pushSubscription = {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            };

            // Send notification
            await webpush.sendNotification(
                pushSubscription,
                JSON.stringify({
                    title: 'Notification',
                    body: message,
                    icon: '/icon.png',
                })
            );
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: 'Failed to send notifications' };
    }
}


export async function checkSubscriptionAction(endpoint: string, userId: string) {
    try {
        const subscription = await prisma.pushSubscription.findUnique({
            where: { endpoint },
        });

        return { isSubscribed: !!subscription && subscription.userId === userId };
    } catch (error) {
        console.error('Error checking subscription:', error);
        return { isSubscribed: false };
    }
}