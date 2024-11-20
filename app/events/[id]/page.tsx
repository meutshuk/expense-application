'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'

type Expense = {
    id: string;
    name: string;
    amount: number;
};

export default function EventDetails() {
    const { id } = useParams<{ id: string; }>()


    const [event, setEvent] = useState(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState<number | ''>('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/events/${id}`);
                const data = await response.json();
                setEvent(data.event);
                setExpenses(data.expenses);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id]);

    const handleAddExpense = async () => {
        if (!expenseName || !expenseAmount) return;

        try {
            const response = await fetch(`/api/events/${id}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: expenseName, amount: parseFloat(expenseAmount) }),
            });

            const newExpense: Expense = await response.json();
            setExpenses((prev) => [...prev, newExpense]);
            setExpenseName('');
            setExpenseAmount('');
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    return (
        <div>
            <h1>Event Details</h1>
            <h2>{event?.name}</h2>

            <h3>Add Expense</h3>
            <div>
                <input
                    type="text"
                    placeholder="Expense Name"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                />
                <button onClick={handleAddExpense}>Add Expense</button>
            </div>

            <h3>Expenses</h3>
            <ul>
                {expenses.map((expense) => (
                    <li key={expense.id}>
                        {expense.name} - ${expense.amount}
                    </li>
                ))}
            </ul>
        </div>
    );
}
