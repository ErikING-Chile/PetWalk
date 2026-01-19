import { createClient } from '@/utils/supabase/server'

export default async function ClientDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                <h1 className="text-3xl font-bold text-white">
                    Good to see you, {user?.email?.split('@')[0]}! 🐕
                </h1>
                <p className="mt-2 text-gray-400">
                    Your pets are safe with us. Ready for their next adventure?
                </p>
            </div>

            {/* Quick Stats / Actions */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Active Walk Card */}
                <div className="rounded-xl border border-white/10 bg-purple-900/10 p-6 transition-all hover:bg-purple-900/20">
                    <h3 className="text-lg font-semibold text-purple-300">Active Walk</h3>
                    <div className="mt-4 flex items-center justify-center p-4">
                        <p className="text-sm text-gray-400">No active walks right now.</p>
                    </div>
                    <button className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500">
                        Track Location
                    </button>
                </div>

                {/* My Pets Quick View */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10">
                    <h3 className="text-lg font-semibold text-white">My Pets</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-black/30 p-3">
                            <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                            <div>
                                <p className="text-sm font-medium text-white">Add your first pet</p>
                                <p className="text-xs text-gray-500">To start booking walks</p>
                            </div>
                        </div>
                    </div>
                    <button className="mt-6 w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
                        Manage Pets
                    </button>
                </div>

                {/* Booking CTA */}
                <div className="rounded-xl border border-dashed border-white/20 bg-transparent p-6 flex flex-col items-center justify-center text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-2xl">
                        📍
                    </div>
                    <h3 className="text-lg font-semibold text-white">Book a Walk</h3>
                    <p className="mt-2 text-sm text-gray-500">Schedule a verified walker for today or later.</p>
                </div>
            </div>
        </div>
    )
}
