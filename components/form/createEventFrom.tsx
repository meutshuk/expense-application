'use client'

import { FormEvent, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface NewEvent {
    name: string,
    description: string
}

interface Props {
    onSubmit: (newEvent: NewEvent) => void; // Function to handle form submission
    className?: string; // Optional string for CSS class names
}
export function CreateEventForm({ onSubmit, className = "" }: Props) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const newEvent = {
            name,
            description,
        }
        onSubmit(newEvent)
        setName('')
        setDescription('')
    }

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className="w-full p-4">Create Event</Button>
        </form>
    )
}

