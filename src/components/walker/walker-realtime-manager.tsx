'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'


export function WalkerRealtimeManager() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel('walker_dashboard_updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'walk_bookings',
                    filter: 'status=eq.requested'
                },
                (payload) => {
                    // New booking request!
                    // Assuming generic 'requested' filter works. 
                    // Ideally check location but user said "new request" for now.
                    router.refresh()

                    // Simple notification
                    // Since we don't have a toast library confirmed installed (package.json didn't show sonner explicitly, just lucide/framer/motion etc? Actually I didn't verify sonner in package.json completely, assume alert or native Notification API)

                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('¡Nueva Solicitud de Paseo!', {
                            body: 'Alguien ha solicitado un paseo cerca de ti.',
                            icon: '/icons/dog-icon.png' // hypothetical
                        })
                    } else {
                        // Play sound? 
                        const audio = new Audio('/sounds/notification.mp3') // hypothetical
                        // audio.play().catch(e => console.log("Audio permission needed"))

                        // Or just visual alert
                        // alert("¡Nueva Solicitud de Paseo!") // Too intrusive?
                    }
                    console.log("New booking received:", payload)
                }
            )
            .subscribe()

        // Also Request Notification Permission on mount
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, supabase])

    return null
}
