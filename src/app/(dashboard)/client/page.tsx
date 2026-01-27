import { Card } from "@/components/ui/card"
import { Dog, MapPin, Clock, Calendar, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { format, subDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { WalkChart } from "@/components/dashboard/walk-chart"

export default async function ClientDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Find user's name
    const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user?.id).single()
    const name = profile?.full_name?.split(' ')[0] || "Dueño"

    // Fetch Next Walk (Active: Requested, Assigned, In Progress)
    const { data: nextWalk, error: nextWalkError } = await supabase
        .from('walk_bookings')
        .select(`
            *,
            walker:profiles!walker_id(
                full_name
            ),
            pet:pets(name, photo_url),
            start_code
        `)
        .eq('client_id', user?.id)
        .in('status', ['requested', 'assigned', 'in_progress'])
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (nextWalkError) console.error("NextWalk Error:", nextWalkError)

    // Fetch History (Completed, Cancelled)
    const { data: history, error: historyError } = await supabase
        .from('walk_bookings')
        .select(`
            *,
            walker:profiles!walker_id(
                full_name
            ),
            pet:pets(name)
        `)
        .eq('client_id', user?.id)
        .in('status', ['completed', 'cancelled'])
        .order('scheduled_at', { ascending: false })
        .limit(5)

    if (historyError) console.error("History Error:", historyError)


    // Calculate Stats
    const { count: totalWalks } = await supabase
        .from('walk_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user?.id)
        .eq('status', 'completed')

    const totalKm = (totalWalks || 0) * 2.5 // Mock: 2.5km per walk average

    // Prepare Chart Data
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    const { data: recentWalks } = await supabase
        .from('walk_bookings')
        .select('scheduled_at')
        .eq('client_id', user?.id)
        .eq('status', 'completed')
        .gte('scheduled_at', subDays(today, 7).toISOString())

    const chartData = last7Days.map(date => {
        const dayStr = format(date, 'EEE', { locale: es })
        const count = recentWalks?.filter(w => isSameDay(new Date(w.scheduled_at), date)).length || 0
        return { day: dayStr.charAt(0).toUpperCase() + dayStr.slice(1), count }
    })

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Hola, {name} 👋
                    </h1>
                    <p className="text-sm text-gray-400">¿Listo para el paseo de hoy?</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {name[0]}
                        </div>
                    )}
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

            {/* Marketplace Button - Added per request */}
            <Link href="/client/marketplace">
                <Card variant="interactive" className="bg-gradient-to-r from-blue-600 to-cyan-600 border-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full -mr-10 -mt-10" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">Tienda PetWalk</h2>
                            <p className="text-blue-100 text-xs mt-1">Accesorios, comida y más para tu mascota</p>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <ShoppingBag className="text-white" size={20} />
                        </div>
                    </div>
                </Card>
            </Link>

            {/* DEBUG SECTION REMOVED */}

            {/* Active/Next Walk Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Próximo Paseo</h3>
                {nextWalk ? (
                    <Card variant="glass" className="space-y-4 border-l-4 border-l-purple-500">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center overflow-hidden">
                                    {/* @ts-ignore */}
                                    {nextWalk.pet?.image_url ? (
                                        // @ts-ignore
                                        <img src={nextWalk.pet.image_url} alt="Pet" className="w-full h-full object-cover" />
                                    ) : (
                                        // @ts-ignore
                                        nextWalk.pet?.photo_url ? (
                                            // @ts-ignore
                                            <img src={nextWalk.pet.photo_url} alt="Pet" className="w-full h-full object-cover" />
                                        ) : (
                                            <Dog size={24} className="text-purple-400" />
                                        )
                                    )}
                                </div>
                                <div>
                                    {/* @ts-ignore */}
                                    <h4 className="font-bold text-white">{nextWalk.pet?.name || 'Mascota'}</h4>
                                    <div className="flex items-center text-xs text-purple-300 gap-1">
                                        {/* @ts-ignore */}
                                        <span>Con {nextWalk.walker?.profiles?.full_name || 'Un Paseador'}</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${nextWalk.status === 'assigned' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                                nextWalk.status === 'in_progress' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                                }`}>
                                {nextWalk.status === 'requested' ? 'Buscando...' :
                                    nextWalk.status === 'assigned' ? 'Paseador Asignado' :
                                        nextWalk.status === 'in_progress' ? 'En Curso' : nextWalk.status}
                            </span>
                        </div>

                        {/* Secure Start Code Display */}
                        {/* @ts-ignore */}
                        {nextWalk.start_code && nextWalk.status !== 'in_progress' && (
                            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col items-center justify-center text-center animate-pulse">
                                <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-2">
                                    {nextWalk.status === 'assigned' ? '¡Tu paseador viene en camino!' : 'Código de Inicio'}
                                </p>
                                <p className="text-[10px] text-gray-400 mb-1">Entrégale este código para comenzar:</p>
                                {/* @ts-ignore */}
                                <p className="text-4xl font-mono font-bold text-white tracking-[0.2em] drop-shadow-lg">{nextWalk.start_code}</p>
                            </div>
                        )}

                        {/* Live Tracking / Chat Button */}
                        {(nextWalk.status === 'in_progress' || nextWalk.status === 'assigned') && (
                            <Link href={`/client/track/${nextWalk.id}`} className="mt-4 block">
                                <div className={`w-full border rounded-lg py-3 flex items-center justify-center gap-2 font-bold transition-all shadow-lg animate-pulse ${nextWalk.status === 'in_progress'
                                    ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    }`}>
                                    <MapPin size={18} />
                                    {nextWalk.status === 'in_progress' ? "VER MAPA EN VIVO" : "VER PASEADOR Y CHAT"}
                                </div>
                            </Link>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <Calendar size={14} className="text-purple-400" />
                                <span>{format(new Date(nextWalk.scheduled_at), "d 'de' MMMM", { locale: es })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <Clock size={14} className="text-purple-400" />
                                <span>{format(new Date(nextWalk.scheduled_at), "HH:mm")} ({nextWalk.duration_minutes} min)</span>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card variant="glass" className="py-8 flex flex-col items-center justify-center text-center space-y-2 opacity-70">
                        <div className="bg-white/5 p-3 rounded-full">
                            <Clock size={20} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-300">Sin paseos agendados</p>
                            <p className="text-xs text-gray-500">¡Tu mascota te lo agradecerá!</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
                    <span className="text-xs text-purple-400">Ver todo</span>
                </div>

                <div className="space-y-3">
                    {history && history.length > 0 ? (
                        history.map((walk: any) => (
                            <div key={walk.id} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${walk.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                                            }`}>
                                            <Dog size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white capitalize">
                                                Paseo de {walk.pet?.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(walk.scheduled_at), "d MMM, HH:mm", { locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">${walk.price}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">{walk.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-xs text-gray-500">
                            No hay historial aún.
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <span className="text-3xl font-bold text-purple-400">{totalWalks || 0}</span>
                    <span className="text-xs text-gray-400">Paseos Totales</span>
                </Card>
                <Card variant="glass" className="p-4 flex flex-col items-center justify-center space-y-2">
                    <span className="text-3xl font-bold text-pink-400">{totalKm}</span>
                    <span className="text-xs text-gray-400">Km Recorridos</span>
                </Card>
            </div>

            {/* Walk History Chart */}
            <WalkChart data={chartData} />
        </div>
    )
}
