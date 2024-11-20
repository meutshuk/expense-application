'use client';

import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link'

type Event = {
  id: string;
  name: string;
};


export default function HomePage() {

  const [events, setEvents] = useState<Event[]>([])
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

      const newEvent = await response.json(); // Parse the response JSON
      console.log('New event:', newEvent); // Debugging the response
      setEvents((prev) => [...prev, newEvent]);
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
        <h1>Home</h1>

        {/* Form to create an event */}
        <div>
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <button onClick={handleCreateEvent} disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>

        {/* List of events */}
        <div>
          <h2>Your Events</h2>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <Link href={`/events/${event.id}`}>
                  {event.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SessionProvider>

  );
}
