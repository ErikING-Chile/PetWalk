import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ReviewForm } from "@/components/client/review-form"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, Route, Calendar } from "lucide-react"

export default async function WalkSummaryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: booking } = await supabase
        .from('walk_bookings')
        .select(`*, pets(*), walker:profiles!walker_id(*)`)
        .eq('id', id)
        .single()

    // Check if review exists
    const { data: review } = await supabase
        .from('walk_reviews')
        .select('*')
        .eq('booking_id', id)
        .single()

    if (!booking) notFound()

    return (
        <div className="flex flex-col min-h-[85vh] p-4 max-w-2xl mx-auto w-full space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 text-center">
                Resumen del Paseo
            </h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <Route className="text-pink-400 mb-1" />
                    <span className="text-3xl font-bold text-white">{booking.actual_distance_km || 0} <span className="text-sm font-normal text-gray-400">km</span></span>
                    <span className="text-xs text-gray-400 text-center">Distancia Real</span>
                </Card>
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <Clock className="text-purple-400 mb-1" />
                    <span className="text-3xl font-bold text-white">{booking.actual_duration_min || 0} <span className="text-sm font-normal text-gray-400">min</span></span>
                    <span className="text-xs text-gray-400 text-center">Duración</span>
                </Card>
            </div>

            {/* Walker Info */}
            <Card variant="glass" className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold border border-purple-500/30">
                    {booking.walker?.full_name?.[0] || 'W'}
                </div>
                <div>
                    <h3 className="font-bold text-white">{booking.walker?.full_name || 'Walker'}</h3>
                    <p className="text-xs text-gray-400">Paseo completado con éxito</p>
                </div>
            </Card>

            {/* Review Section */}
            {review ? (
                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 text-center">
                    <p className="text-green-300 font-bold text-sm mb-1">¡Ya calificaste este paseo!</p>
                    <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                    {review.comment && <p className="text-xs text-gray-400 italic">"{review.comment}"</p>}
                </div>
            ) : (
                <ReviewForm bookingId={id} />
            )}
        </div>
    )
}
