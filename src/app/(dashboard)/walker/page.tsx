import { createClient } from '@/utils/supabase/server'

export default async function WalkerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                <h1 className="text-3xl font-bold text-white">
                    Walker Portal
                </h1>
                <p className="mt-2 text-gray-400">
                    Status: <span className="text-yellow-400 font-semibold">Pending Approval</span>
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
                    <p className="mt-4 text-sm text-gray-500">You need to be approved to receive assignments.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold text-white">Complete your Profile</h3>
                    <p className="mt-2 text-sm text-gray-400">Review your availability and upload required documents.</p>
                    <button className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                        Go to Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
