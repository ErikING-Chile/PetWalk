import { WalkerInvitationCard } from "@/components/walker/invitation-card"
import { getWalkerRequests } from "./actions"

export const dynamic = 'force-dynamic'

export default async function WalkerDashboard() {
    const requests = await getWalkerRequests()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Panel de Paseador
            </h1>

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
        </div>
    )
}
