'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'

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
        map.setView([lat, lng], 16);
    }, [lat, lng, map]);
    return null;
}

function WalkerMapCore({ bookingId }: { bookingId: string }) {
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [status, setStatus] = useState<string>('Esperando GPS...')
    const supabase = createClient()

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('GPS no soportado')
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setCoords({ lat: latitude, lng: longitude })
                setStatus('GPS Activo')

                // Upload to DB
                supabase.from('walk_routes').insert({
                    booking_id: bookingId,
                    lat: latitude,
                    lng: longitude
                }).then(({ error }) => {
                    if (error) console.warn("Supabase insert error:", error)
                })
            },
            (error) => {
                console.warn("GPS Error:", error) // Warn instead of Error to avoid Overlay spam
                setStatus('Buscando señal...')
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [bookingId, supabase])

    if (!coords) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
                <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent mb-4"></div>
                <p>{status}</p>
                <p className="text-xs text-gray-500 mt-2">Asegúrate de permitir la ubicación.</p>
            </div>
        )
    }

    return (
        <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />
            <Marker position={[coords.lat, coords.lng]}>
                <Popup>¡Estás aquí!</Popup>
            </Marker>
            <MapRecenter lat={coords.lat} lng={coords.lng} />

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-green-500/50 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {status}
            </div>
        </MapContainer>
    )
}

const WalkerLiveMap = dynamic(() => Promise.resolve(WalkerMapCore), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-800 animate-pulse" />
})

export default WalkerLiveMap
