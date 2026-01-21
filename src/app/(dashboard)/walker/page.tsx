import { Card } from "@/components/ui/card"
import { getWalkerRequests, acceptBooking, startWalk } from "./actions"
import { Calendar, MapPin, DollarSign, Play } from "lucide-react"
import Link from "next/link"

export default async function WalkerDashboard() {
    const requests = await getWalkerRequests()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Panel de Paseador
            </h1>

            <div className="space-y-4">
                {requests.map((booking: any) => (
                    <Card key={booking.id} variant="glass" className="border-l-4 border-l-pink-500 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="font-bold text-white text-lg">{booking.pets?.name}</h3>
                                <p className="text-sm text-gray-400">{booking.pets?.breed}</p>
                            </div>
                            <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-pink-300">
                                ${booking.price?.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-300 mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-pink-400" />
                                {new Date(booking.scheduled_at).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-pink-400" />
                                {booking.pickup_address}
                            </div>
                        </div>

                        <div className="relative z-10">
                            {booking.status === 'requested' && (
                                <form action={async () => {
                                    'use server'
                                    await acceptBooking(booking.id)
                                }}>
                                    <button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition-colors shadow-lg shadow-pink-900/20">
                                        Aceptar Solicitud
                                    </button>
                                </form>
                            )}

                            {booking.status === 'assigned' && (
                                <Link href={`/walker/walk/${booking.id}`}>
                                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Play size={16} fill="white" /> Iniciar Paseo
                                    </button>
                                </Link>
                            )}

                            {booking.status === 'in_progress' && (
                                <Link href={`/walker/walk/${booking.id}`}>
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors animate-pulse">
                                        Ver Paseo en Curso
                                    </button>
                                </Link>
                            )}
                        </div>
                    </Card>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p>No hay solicitudes pendientes.</p>
                        <p className="text-sm">¡Disfruta tu tiempo libre!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
