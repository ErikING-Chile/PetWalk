'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapRecenter({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export default function TrackingMapCore({ bookingId }: { bookingId: string }) {
    const [route, setRoute] = useState<[number, number][]>([])
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // Fetch initial route
        const fetchRoute = async () => {
            const { data } = await supabase
                .from('walk_routes')
                .select('lat, lng')
                .eq('booking_id', bookingId)
                .order('created_at', { ascending: true })

            if (data && data.length > 0) {
                const points = data.map((p: any) => [p.lat, p.lng] as [number, number])
                setRoute(points)
                setCurrentPos(points[points.length - 1])
            }
        }
        fetchRoute()

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`tracking-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'walk_routes',
                    filter: `booking_id=eq.${bookingId}`
                },
                (payload) => {
                    const newPoint: [number, number] = [payload.new.lat, payload.new.lng]
                    setRoute(prev => [...prev, newPoint])
                    setCurrentPos(newPoint)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, supabase])

    if (!currentPos) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white bg-gray-900 rounded-xl">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent mb-4"></div>
                <p className="opacity-70">Esperando señal GPS del paseador...</p>
                <p className="text-xs opacity-50 mt-2">Asegúrate que el paseo haya iniciado.</p>
            </div>
        )
    }

    return (
        <MapContainer center={currentPos} zoom={15} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={currentPos}>
                <Popup>
                    <div className="text-center">
                        <strong>Paseador</strong><br />
                        Ubicación actual
                    </div>
                </Popup>
            </Marker>
            <Polyline positions={route} color="#a855f7" weight={5} opacity={0.7} />
            <MapRecenter lat={currentPos[0]} lng={currentPos[1]} />
        </MapContainer>
    )
}
