import { Card } from "@/components/ui/card"
import { CheckCircle, MapPin, Calendar } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch completed walks
    const { data: walks } = await supabase
        .from('walk_bookings')
        .select(`
            *,
            pets (name, breed)
        `)
        .eq('walker_id', user?.id)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Historial de Paseos
            </h1>

            <div className="space-y-4">
                {walks && walks.length > 0 ? (
                    walks.map((walk) => (
                        <Card key={walk.id} variant="glass" className="opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white">{walk.pets?.name}</h3>
                                <div className="flex items-center gap-1 text-green-400 text-xs">
                                    <CheckCircle size={12} />
                                    Completado
                                </div>
                            </div>
                            <div className="space-y-1 text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} />
                                    {new Date(walk.scheduled_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} />
                                    {walk.pickup_address}
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Ganancia</span>
                                <span className="font-mono text-pink-300">${walk.price?.toLocaleString()}</span>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>Aún no has completado ningún paseo.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
