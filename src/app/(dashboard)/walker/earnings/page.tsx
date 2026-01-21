import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"

export default function EarningsPage() {
    // Mock data for now, could be aggregated SQL query
    const earnings = {
        total: 125000,
        thisWeek: 45000,
        pending: 15000
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Mis Ganancias
            </h1>

            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="col-span-2 p-6 flex items-center justify-between bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30">
                    <div>
                        <p className="text-gray-400 text-sm mb-1">Total Ganado</p>
                        <h2 className="text-4xl font-bold text-white">${earnings.total.toLocaleString()}</h2>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="text-green-400" size={24} />
                    </div>
                </Card>

                <Card variant="glass" className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-pink-400">
                        <TrendingUp size={16} />
                        <span className="text-xs">Esta Semana</span>
                    </div>
                    <p className="text-xl font-bold text-white">${earnings.thisWeek.toLocaleString()}</p>
                </Card>

                <Card variant="glass" className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Calendar size={16} />
                        <span className="text-xs">Pendiente</span>
                    </div>
                    <p className="text-xl font-bold text-white">${earnings.pending.toLocaleString()}</p>
                </Card>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6">Últimos Pagos</h3>
            <div className="space-y-3">
                <Card variant="glass" className="p-3 flex justify-between items-center opacity-60">
                    <span className="text-sm text-gray-300">Semana 12 Ene - 19 Ene</span>
                    <span className="text-sm font-bold text-white">$45.000</span>
                </Card>
                <Card variant="glass" className="p-3 flex justify-between items-center opacity-60">
                    <span className="text-sm text-gray-300">Semana 05 Ene - 11 Ene</span>
                    <span className="text-sm font-bold text-white">$80.000</span>
                </Card>
            </div>
        </div>
    )
}
