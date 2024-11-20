'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
    const handleSubmit = async (e:any) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        const result = await signIn('credentials', {
            redirect: true,
            email,
            password,
            callbackUrl: '/',
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" required />
                <input name="password" type="password" placeholder="Password" required />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}
