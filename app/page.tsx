'use client';

import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaQuery } from '@/lib/useMediaQuery'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { CreateEventForm } from '@/components/form/createEventFrom';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

type Event = {
  id: string;
  name: string;
};


export default function HomePage() {

  const [events, setEvents] = useState<any[]>([])
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    // Only fetch events when session.user.id is available
    if (!session?.user?.id) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?userId=${session.user.id}`);
        const data = await response.json();

        setEvents(data); // Ensure `data` is an array
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [session?.user?.id]); // Add `session.user.id` as a dependency



  const handleCreateEvent = async (newEvent: any) => {
    if (!newEvent) return;

    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEvent.name, userId: session?.user?.id }), // Replace with actual user ID
      });


      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from API:', errorData);
        throw new Error(errorData.error || 'Failed to create event');
      }

    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
      setOpen(false)
    }
  };

  return (

    <SessionProvider>

      <div className='container mx-auto px-10 py-8 max-w-6xl '>
        <h1 className="text-3xl font-bold mb-8">Your Events</h1>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(({ event, role }) => (
            <div className="w-full" key={event.id}> {/* Set width to full */}
              <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="p-0">
                  {/* Add content here */}
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2 text-xl font-semibold">
                    <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                      {event.name}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-gray-600">Created: {new Date(event.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 capitalize mt-1">Role: {role}</p>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4 flex justify-end">
                  <Button asChild variant="outline">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </SessionProvider>

  );
}
