import { Card } from "@/components/ui/card"
import { startWalk, completeWalk } from "../actions"
import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { MapPin, Camera, Navigation, Clock } from "lucide-react"

export default async function WalkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: booking } = await supabase
        .from('walk_bookings')
        .select(`*, pets(*), profiles(*)`)
        .eq('id', id)
        .single()

    if (!booking) notFound()

    return (
        <div className="flex flex-col h-[85vh] relative">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex justify-between items-center text-white">
                    <div>
                        <h1 className="font-bold text-lg">{booking.pets.name}</h1>
                        <p className="text-sm opacity-80 flex items-center gap-1">
                            <MapPin size={12} /> {booking.pickup_address}
                        </p>
                    </div>
                    <div className="bg-red-500/90 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        LIVE
                    </div>
                </div>
            </div>

            {/* MOCK MAP BACKGROUND */}
            <div className="flex-1 bg-gray-800 rounded-2xl relative overflow-hidden border border-white/10">
                {/* Simulated Map UI */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-70.6483, -33.4409, 14, 0, 0/600x600?access_token=pk.mock')] bg-cover bg-center opacity-50 grayscale transition-all duration-1000" style={{ backgroundImage: 'radial-gradient(circle at center, #2d1b4e 0%, #000 100%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-ping absolute" />
                        <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white relative z-10" />
                    </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">
                    <Card variant="glass" className="p-3 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-xl font-bold font-mono">00:12:43</span>
                    </Card>
                    <Card variant="glass" className="p-3 text-center">
                        <Navigation className="w-4 h-4 mx-auto mb-1 text-pink-400" />
                        <span className="text-xl font-bold font-mono">1.2 km</span>
                    </Card>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="mt-4 space-y-4">
                {booking.status === 'assigned' ? (
                    <form action={async () => {
                        'use server'
                        await startWalk(id)
                    }}>
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 text-lg transition-all active:scale-95">
                            COMENZAR PASEO
                        </button>
                    </form>
                ) : (
                    <>
                        <button className="w-full glass-card py-3 flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95">
                            <Camera className="text-purple-400" />
                            <span>Subir Foto (Evidencia)</span>
                        </button>

                        <form action={async () => {
                            'use server'
                            await completeWalk(id)
                            redirect('/walker')
                        }}>
                            <button className="w-full bg-red-500/80 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/40 text-lg transition-all active:scale-95">
                                TERMINAR PASEO
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
