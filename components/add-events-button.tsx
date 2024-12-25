'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { CreateEventForm } from '@/components/form/createEventFrom';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/lib/useMediaQuery'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function AddEventButton({ userId }: { userId: string }) {

    const isDesktop = useMediaQuery("(min-width: 768px)")



    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    const router = useRouter()

    const handleCreateEvent = async (newEvent: any) => {
        if (!newEvent) return;

        setLoading(true);

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newEvent.name, userId }),
            });


            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error from API:', errorData);
                throw new Error(errorData.error || 'Failed to create event');
            }
            let data = await response.json()

            router.refresh()


        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setLoading(false);
            setOpen(false)

        }
    };


    return (
        <>
            {isDesktop ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="mb-8 bg-blue-600 hover:bg-blue-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>
                                Fill out the form below to create a new event.
                            </DialogDescription>
                        </DialogHeader>
                        <CreateEventForm onSubmit={handleCreateEvent} />
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                        <Button className="mb-4 bg-blue-600 hover:bg-blue-700">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Event
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="text-left">
                            <DrawerTitle>Create New Event</DrawerTitle>
                            <DrawerDescription>
                                Fill out the form below to create a new event.
                            </DrawerDescription>
                        </DrawerHeader>

                        <CreateEventForm onSubmit={handleCreateEvent} className="p-4" />
                    </DrawerContent>
                </Drawer>
            )}
        </>

    )
}
