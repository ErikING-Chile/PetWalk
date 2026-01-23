'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin } from 'lucide-react'

export function LocationSender({ bookingId }: { bookingId: string }) {
    const [status, setStatus] = useState<string>('Initializing GPS...')
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('GPS not supported')
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setCoords({ lat: latitude, lng: longitude })
                setStatus('Tracking active')

                // Insert to DB
                // Using simple fire-and-forget to avoid blocking UI
                supabase.from('walk_routes').insert({
                    booking_id: bookingId,
                    lat: latitude,
                    lng: longitude
                }).then(({ error }) => {
                    if (error) console.error("Tracking upload error:", error)
                })
            },
            (error) => {
                console.error(error)
                setStatus(`GPS Error: ${error.message}`)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [bookingId, supabase])

    return (
        <div className="absolute top-20 left-4 z-20 bg-black/50 backdrop-blur-md p-2 rounded-lg text-xs text-white flex items-center gap-2 border border-white/10">
            <div className={`h-2 w-2 rounded-full ${coords ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{status}</span>
            {coords && <span className="opacity-50">({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</span>}
        </div>
    )
}
