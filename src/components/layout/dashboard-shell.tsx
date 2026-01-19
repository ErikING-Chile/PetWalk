import { Sidebar } from './sidebar'
import { GradientMesh } from '@/components/ui/gradient-mesh'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardShell({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    // Verify auth and get role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch full profile to get the role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const userRole = profile?.role || 'client'

    return (
        <div className="relative flex h-screen overflow-hidden bg-black font-sans text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <GradientMesh />
            </div>

            {/* Sidebar */}
            <div className="relative z-20 hidden md:block">
                <Sidebar role={userRole} />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto bg-transparent">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
