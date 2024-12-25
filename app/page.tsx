
import { SessionProvider } from 'next-auth/react';

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { NextAuthProvider } from '@/components/AuthProvider';
import AddEventButton from '@/components/add-events-button';

type Event = {
  id: string;
  name: string;
};


export default async function HomePage() {

  const session = await getServerSession(authOptions);
  if (!session) return

  async function getEvents() {

    // Fetch events linked to the user via the UserEvent table
    const userEvents = await prisma.userEvent.findMany({
      where: { userId: session?.user.id },
      include: {
        event: true, // Include event details
      },
    });

    // Format the response to include event and role information
    const eventsWithRoles = userEvents.map((userEvent) => ({
      event: userEvent.event,
      role: userEvent.role,
    }));

    return eventsWithRoles

  }

  let events = await getEvents();





  return (

    <NextAuthProvider>

      <div className='container mx-auto px-10 py-8 max-w-6xl '>
        <h1 className="text-3xl font-bold mb-8">Your Events</h1>

        <AddEventButton userId={session.user.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(({ event, role }) => (
            <div className="w-full" key={event.id}> {/* Set width to full */}
              <Link href={`/events/${event.id}`} >
                <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                  <CardHeader className="p-0">
                    {/* Add content here */}
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-2 text-xl font-semibold">

                      {event.name}

                    </CardTitle>
                    <p className="text-sm text-gray-600">Created: {new Date(event.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 capitalize mt-1">Role: {role}</p>
                  </CardContent>
                  <CardFooter className="bg-gray-50 p-4 flex justify-end">

                  </CardFooter>
                </Card>
              </Link>

            </div>
          ))}
        </div>

      </div>
    </NextAuthProvider>

  );
}
