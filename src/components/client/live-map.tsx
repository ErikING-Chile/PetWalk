'use client'
import dynamic from 'next/dynamic'

const TrackingMapCore = dynamic(
    () => import('./tracking-map-core'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-800 animate-pulse rounded-xl" />
    }
)

export default function LiveMap({ bookingId }: { bookingId: string }) {
    return <TrackingMapCore bookingId={bookingId} />
}
