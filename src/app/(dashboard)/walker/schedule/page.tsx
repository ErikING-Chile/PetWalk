import { Card } from "@/components/ui/card"
import { Calendar, MapPin, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function SchedulePage() {
    // In a real app, filtering by status='assigned'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch assigned walks
    const { data: walks } = await supabase
        .from('walk_bookings')
        .select(`
            *,
            pets (name, breed)
        `)
        .eq('walker_id', user?.id)
        .eq('status', 'assigned')
        .order('scheduled_at', { ascending: true })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Mi Calendario
            </h1>

            <div className="space-y-4">
                {walks && walks.length > 0 ? (
                    walks.map((walk) => (
                        <Card key={walk.id} variant="glass" className="border-l-4 border-l-green-500">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white">{walk.pets?.name}</h3>
                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                    Confirmado
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-pink-400" />
                                    {new Date(walk.scheduled_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-pink-400" />
                                    {walk.pickup_address}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card variant="glass" className="p-8 text-center text-gray-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No tienes paseos programados.</p>
                        <p className="text-xs mt-2">Revisa tus solicitudes pendientes.</p>
                    </Card>
                )}
            </div>
        </div>
    )
}
