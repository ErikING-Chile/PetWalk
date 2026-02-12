'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function ClientRealtimeManager({ userId }: { userId: string }) {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`client_dashboard_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'walk_bookings',
                    filter: `client_id=eq.${userId}`
                },
                (payload) => {
                    const newStatus = payload.new.status
                    const oldStatus = payload.old.status

                    if (newStatus !== oldStatus) {
                        router.refresh()

                        if (newStatus === 'assigned' && oldStatus === 'requested') {
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('¡Paseo Aceptado!', {
                                    body: 'Un walker ha aceptado tu solicitud. ¡Prepárate!',
                                })
                            } else {
                                // Fallback alert or banner logic handled by page refresh showing state
                                // But explicit alert requested:
                                alert("¡Tu solicitud ha sido aceptada por un Walker!")
                            }
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, supabase, userId])

    return null
}
