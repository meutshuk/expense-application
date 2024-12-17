import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Expense Tracket',
        short_name: 'ExpenseHub',
        description: 'Create events and track expenses.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [

            {
                "src": "icons/android/android-launchericon-512-512.png",
                "sizes": "512x512"
            },
            {
                "src": "icons/android/android-launchericon-192-192.png",
                "sizes": "192x192"
            },
            {
                "src": "icons/android/android-launchericon-144-144.png",
                "sizes": "144x144"
            },
            {
                "src": "icons/android/android-launchericon-96-96.png",
                "sizes": "96x96"
            },
            {
                "src": "icons/android/android-launchericon-72-72.png",
                "sizes": "72x72"
            },
            {
                "src": "icons/android/android-launchericon-48-48.png",
                "sizes": "48x48"
            },
            {
                "src": "icons/ios/180.png",
                "sizes": "180x180"
            },
            {
                "src": "icons/ios/192.png",
                "sizes": "192x192"
            },
            {
                "src": "icons/ios/256.png",
                "sizes": "256x256"
            },
            {
                "src": "icons/ios/512.png",
                "sizes": "512x512"
            },
            {
                "src": "icons/ios/1024.png",
                "sizes": "1024x1024"
            }
        ],
        screenshots: [
            {
                src: '/screenshots/screenshot.png',
                sizes: '3422x2044', // Adjust dimensions based on the screenshot
                type: 'image/png',
                form_factor: 'wide',
            },
            {
                src: '/screenshots/screenshot.png',
                sizes: '3422x2044', // Adjust dimensions based on the screenshot
                type: 'image/png',

            },
        ],
    };
}
