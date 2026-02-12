import { WalkerInvitationCard } from "@/components/walker/invitation-card"
import { getWalkerRequests, getWalkerActiveWalk } from "./actions"
import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { WalkerWalkManager } from "@/components/walker/walker-walk-manager"

import { WalkerRealtimeManager } from "@/components/walker/walker-realtime-manager"

export const dynamic = 'force-dynamic'

export default async function WalkerDashboard() {
    const requests = await getWalkerRequests()
    const activeWalk = await getWalkerActiveWalk()

    return (
        <div className="space-y-6">
            <WalkerRealtimeManager />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Panel de Walker
            </h1>

            {/* Active Walk Manager (Notifications) */}
            {activeWalk && <WalkerWalkManager booking={activeWalk} />}

            {/* Active Walk Banner (Optional visualization) */}
            {activeWalk && (
                <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-xl mb-4 animate-pulse">
                    <h2 className="text-green-400 font-bold">¡Tienes un paseo en curso!</h2>
                    <p className="text-sm text-green-200">Revisa el tiempo restante.</p>
                </div>
            )}

            <div className="space-y-4">
                {requests.map((booking: any) => (
                    <WalkerInvitationCard key={booking.id} booking={booking} />
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p>No hay solicitudes pendientes.</p>
                        <p className="text-sm">¡Disfruta tu tiempo libre!</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/walker/training" className="block">
                    <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-purple-900/60 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GraduationCap className="text-purple-400" />
                        </div>
                        <span className="font-bold text-sm text-purple-200">Capacitación</span>
                    </div>
                </Link>
                {/* Placeholder for future Stat/Profile link */}
                <div className="bg-gray-900/40 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 opacity-50">
                    <span className="text-xs text-gray-500">Próximamente</span>
                </div>
            </div>
        </div>
    )
}

