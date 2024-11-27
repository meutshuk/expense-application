'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function CalculationButton({ eventId }: { eventId: string }) {
    const { toast } = useToast()
    const [calculating, setCalculating] = useState(false)
    const router = useRouter()

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            const response = await fetch(`/api/events/${eventId}/calculate`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to calculate expenses");
            }

            // Refresh expenses and calculation history after successful calculation
            if (data.success == true) {
                router.refresh()
            } else {
                toast({ description: 'All expenses calculated' })
            }

            setCalculating(false)
        } catch (err) {
            console.log(err)

        } finally {
            setCalculating(false);
        }
    };

    return (
        <Button className='w-full' disabled={calculating} variant={'outline'} onClick={handleCalculate}>{calculating ? 'Calculating' : 'Calculate'}</Button>
    )
}
