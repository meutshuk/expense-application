'use client'

import React, { FormEvent, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'

export default function CreateExpenseForm({ onSubmit, className = '' }) {

    const [expenseName, setExpenseName] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    // TODO: Make so i can add image 

    const handleSubmit = (e: FormEvent) => {

        e.preventDefault()

        const newExpense = {
            expenseName,
            expenseAmount
        }


        onSubmit(newExpense)
        setExpenseAmount('')
        setExpenseName('')

    }

    return (
        <form onSubmit={handleSubmit} className={cn("mt-4 flex gap-2", className)}>
            <Input
                type="text"
                placeholder="Expense Name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                className="flex-grow"
            />
            <Input
                type="number"
                placeholder="Amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount((e.target.value).toString())}
                className="w-24"
            />
            <Button type="submit">Add Expense</Button>
        </form>
    )
}
