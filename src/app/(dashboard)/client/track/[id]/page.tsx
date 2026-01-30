import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import LiveMap from "@/components/client/live-map"
import { MapPin, Clock, Phone } from "lucide-react"
import { ChatComponent } from "@/components/common/chat"
import { CancellationControls } from "@/components/client/cancellation-controls"
import { RatingForm } from "@/components/client/rating-form"

export const dynamic = 'force-dynamic'

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: booking, error } = await supabase
        .from('walk_bookings')
        .select(`*, walker:profiles!walker_id(*)`)
        .eq('id', id)
        .single()

    const { data: { user } } = await supabase.auth.getUser()

    // Debug error if present
    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>
    }

    if (!booking) notFound()

    return (
        <div className="flex flex-col min-h-screen bg-black pb-20">
            <div className="p-4 bg-gradient-to-b from-gray-900 to-black z-10 sticky top-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    {booking.status === 'assigned' ? 'Walker en Camino' : 'Seguimiento en Vivo'}
                </h1>
                <p className="text-gray-400 text-sm flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    {booking.status === 'assigned' ? 'Tu walker viene hacia ti' : 'Paseando a tu mascota'}
                </p>

                {/* Verification Code Display */}
                {booking.status === 'assigned' && booking.start_verification_code && (
                    <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center animate-pulse">
                        <p className="text-xs text-uppercase text-purple-300 font-bold mb-1 tracking-wider">CÓDIGO DE INICIO</p>
                        <p className="text-4xl font-mono font-bold text-white tracking-[0.5em]">{booking.start_verification_code}</p>
                        <p className="text-[10px] text-gray-400 mt-2">Dicta este código al walker cuando llegue.</p>
                    </div>
                )}
            </div>

            {/* MAP SECTION - Fixed Height */}
            <div className="h-[40vh] bg-gray-900 w-full relative overflow-hidden border-y border-white/10 shrink-0">
                <LiveMap bookingId={id} />

                {/* Info Card */}
                <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-xl z-[1000]">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full animate-pulse ${booking.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <span className="text-xs font-bold text-white uppercase">
                            {booking.status === 'in_progress' ? 'EN CURSO' : 'ASIGNADO'}
                        </span>
                    </div>
                    <p className="text-xs text-white opacity-90 font-medium">{booking.walker?.full_name || 'Walker'}</p>
                </div>
            </div>

            {/* ACTIONS & CHAT - Scrollable Area */}
            <div className="p-4 space-y-4 bg-black flex-1">

                {/* Cancellation / Termination Options */}
                <CancellationControls bookingId={id} status={booking.status} walkerId={booking.walker_id} />

                {/* Rating if Cancelled by Walker */}
                {booking.status === 'cancelled' && booking.cancelled_by === 'walker' && (
                    <RatingForm bookingId={id} />
                )}
                {/* Call Button */}
                {booking.walker?.phone ? (
                    <a href={`tel:${booking.walker.phone}`} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                        <Phone size={20} />
                        Llamar al Walker ({booking.walker.phone})
                    </a>
                ) : (
                    <button disabled className="w-full bg-gray-700 text-gray-400 py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        <Phone size={20} />
                        Sin teléfono registrado
                    </button>
                )}

                {/* Chat Section */}
                {user ? (
                    <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-lg h-[400px]">
                        <ChatComponent bookingId={id} currentUserId={user.id} />
                    </div>
                ) : (
                    <div className="p-4 text-center bg-red-500/10 rounded-xl border border-red-500/20">
                        <p className="text-red-400 text-xs">Debes iniciar sesión para ver el chat</p>
                    </div>
                )}
            </div>
        </div>
    )
}
