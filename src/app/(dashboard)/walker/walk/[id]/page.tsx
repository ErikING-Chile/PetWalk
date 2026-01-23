import { Card } from "@/components/ui/card"
import { startWalk, completeWalk } from "@/app/(dashboard)/walker/actions"
import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { MapPin, Camera, Navigation, Clock, Phone } from "lucide-react"

import { StartWalkVerification } from "@/components/walker/start-walk-verification"
import WalkerLiveMap from "@/components/walker/walker-live-map"
import { ChatComponent } from "@/components/common/chat"

export default async function WalkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: booking, error } = await supabase
        .from('walk_bookings')
        .select(`*, pets(*), client:profiles!client_id(*)`)
        .eq('id', id)
        .single()

    // Get current user (walker) id for chat
    const { data: { user } } = await supabase.auth.getUser()

    if (error) {
        console.error("WalkPage Error:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-white p-4">
                <h2 className="text-xl font-bold text-red-400 mb-2">Error cargando el paseo</h2>
                <div className="bg-black/40 p-4 rounded-lg border border-red-500/20 max-w-md w-full overflow-auto">
                    <pre className="text-xs font-mono text-red-200">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </div>
                <p className="mt-4 text-sm text-gray-400">ID: {id}</p>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-white">
                <h2 className="text-xl font-bold text-yellow-400">Paseo no encontrado</h2>
                <p className="text-sm text-gray-400">ID: {id}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-black pb-20 space-y-4">
            {/* Header Overlay - Simplified */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex justify-between items-center text-white">
                    <div>
                        <h1 className="font-bold text-lg drop-shadow-md">{booking.pets.name}</h1>
                        <p className="text-sm opacity-90 flex items-center gap-1 drop-shadow-md">
                            <MapPin size={12} /> {booking.pickup_address}
                        </p>
                    </div>
                    <div className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        LIVE
                    </div>
                </div>
            </div>

            {/* MAP CONTAINER - Fixed Height for map visibility */}
            <div className="h-[45vh] bg-gray-800 relative overflow-hidden border-b border-white/10 shrink-0">
                <WalkerLiveMap bookingId={id} />

                {/* Stats Overlay inside Map */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 z-[400] pointer-events-none">
                    <Card variant="glass" className="p-2 text-center bg-black/50 backdrop-blur-sm border-white/10">
                        <Clock className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-sm font-bold font-mono text-white">00:12:43</span>
                    </Card>
                    <Card variant="glass" className="p-2 text-center bg-black/50 backdrop-blur-sm border-white/10">
                        <Navigation className="w-4 h-4 mx-auto mb-1 text-pink-400" />
                        <span className="text-sm font-bold font-mono text-white">1.2 km</span>
                    </Card>
                </div>
            </div>

            {/* SCROLLABLE CONTROLS SECTION */}
            <div className="space-y-4 px-4 pb-10">
                {/* Call Button - Prominent */}
                {booking.client?.phone ? (
                    <a href={`tel:${booking.client.phone}`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                        <Phone size={20} />
                        Llamar al Dueño ({booking.client.phone})
                    </a>
                ) : (
                    <button disabled className="w-full bg-gray-700 text-gray-400 py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        <Phone size={20} />
                        Sin teléfono registrado
                    </button>
                )}

                {/* Chat Section - Full visibility */}
                {user ? (
                    <div className="border border-white/10 rounded-xl overflow-hidden shadow-lg h-[400px]">
                        <ChatComponent bookingId={id} currentUserId={user.id} />
                    </div>
                ) : (
                    <p className="text-center text-red-400 text-xs">Error de sesión de chat</p>
                )}

                {/* Actions */}
                {booking.status === 'assigned' ? (
                    <StartWalkVerification bookingId={id} />
                ) : (
                    <>


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
