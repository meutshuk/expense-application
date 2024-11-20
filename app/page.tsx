'use client';

import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Event = {
  id: string;
  name: string;
};


export default function HomePage() {

  const [events, setEvents] = useState<any[]>([])
  const { data: session } = useSession();

  // console.log(session)

  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch events when session.user.id is available
    if (!session?.user?.id) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?userId=${session.user.id}`);
        const data = await response.json();

        console.log('Fetched events:', data); // Debug log
        setEvents(data); // Ensure `data` is an array
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [session?.user?.id]); // Add `session.user.id` as a dependency



  const handleCreateEvent = async () => {
    if (!eventName) return;

    setLoading(true);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: eventName, userId: session?.user?.id }), // Replace with actual user ID
      });

      console.log('Response status:', response.status); // Debugging status

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from API:', errorData);
        throw new Error(errorData.error || 'Failed to create event');
      }




      setEventName('');
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <SessionProvider>

      <div>
        <h1 className="text-3xl font-bold mb-8">Your Events</h1>

        <div className="mb-8">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleCreateEvent} disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(({ event, role }) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-50" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2">
                  <Link href={`/events/${event.id}`} className="text-blue-600 hover:underline">
                    {event.name}
                  </Link>
                </CardTitle>
                <p className="text-sm text-gray-600">Created: {new Date(event.createdAt).toLocaleDateString()}</p>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4">
                <Button asChild>
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </SessionProvider>

  );
}
