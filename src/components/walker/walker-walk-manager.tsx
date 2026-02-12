'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface WalkBooking {
    id: string
    scheduled_at: string
    duration_minutes: number
    status: string
}

export function WalkerWalkManager({ booking }: { booking: WalkBooking }) {
    const [notified, setNotified] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (booking.status !== 'in_progress') return

        const checkTime = async () => {
            const start = new Date(booking.scheduled_at).getTime()
            const end = start + (booking.duration_minutes * 60 * 1000)
            const now = Date.now()
            const timeLeft = end - now
            const fiveMin = 5 * 60 * 1000

            // Check specifically for 5 min warning
            if (timeLeft <= fiveMin && timeLeft > 0) {
                const notifiedKey = `notified_5min_${booking.id}`
                if (!localStorage.getItem(notifiedKey)) {
                    localStorage.setItem(notifiedKey, 'true')
                    setNotified(true)

                    // Create notification in DB
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        await supabase.from('notifications').insert({
                            user_id: user.id,
                            title: 'Tiempo por terminar',
                            message: 'Quedan 5 minutos de paseo. Ve preparando el regreso.',
                            type: 'warning'
                        })
                        // Dispatch event or use toast if available
                        alert("⚠️ Quedan 5 minutos para terminar el paseo!")
                    }
                }
            }
        }

        const interval = setInterval(checkTime, 30000) // Check every 30s
        checkTime()

        return () => clearInterval(interval)
    }, [booking, supabase])

    return null
}
