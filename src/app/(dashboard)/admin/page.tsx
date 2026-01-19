import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-900/10 p-8 backdrop-blur-md">
                <h1 className="text-3xl font-bold text-white">
                    Admin Command Center 🛡️
                </h1>
                <p className="mt-2 text-red-200">
                    Restricted Access. Monitor system activity.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {[
                    { label: 'Active Walks', val: '0', color: 'text-blue-400' },
                    { label: 'Pending Walkers', val: '0', color: 'text-yellow-400' },
                    { label: 'Total Users', val: '-', color: 'text-purple-400' },
                    { label: 'Revenue (Month)', val: '$0', color: 'text-green-400' }
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pending Approvals</h3>
                <div className="text-sm text-gray-500">No pending walker applications.</div>
            </div>
        </div>
    )
}
