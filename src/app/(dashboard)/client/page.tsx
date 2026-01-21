import { Card } from "@/components/ui/card"
import { Dog, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

export default async function ClientDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Find user's name
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single()
    const name = profile?.full_name?.split(' ')[0] || "Dueño"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Hola, {name} 👋
                    </h1>
                    <p className="text-sm text-gray-400">¿Listo para el paseo de hoy?</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                    {/* Avatar placeholder */}
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                </div>
            </div>

            {/* CTA Card */}
            <Link href="/client/book">
                <Card variant="interactive" className="bg-gradient-to-r from-purple-600 to-pink-600 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-10 -mt-10" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">Agendar Nuevo Paseo</h2>
                            <p className="text-purple-100 text-xs mt-1">Encuentra paseadores cerca de ti</p>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Dog className="text-white" size={20} />
                        </div>
                    </div>
                </Card>
            </Link>

            {/* Active/Next Walk Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Próximo Paseo</h3>
                <Card variant="glass" className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Sin paseos agendados</p>
                            <p className="text-xs text-gray-500">Agenda uno arriba 👆</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity / Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <span className="text-3xl font-bold text-purple-400">0</span>
                    <span className="text-xs text-gray-400">Paseos Totales</span>
                </Card>
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <span className="text-3xl font-bold text-pink-400">0.0</span>
                    <span className="text-xs text-gray-400">Km Recorridos</span>
                </Card>
            </div>
        </div>
    )
}
