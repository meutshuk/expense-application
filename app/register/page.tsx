'use client';

import { useState } from 'react';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        setLoading(false);

        if (response.ok) {

        } else {
            setMessage(result.error || 'Something went wrong!');
        }
    };

    return (
        <div className="register-container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
