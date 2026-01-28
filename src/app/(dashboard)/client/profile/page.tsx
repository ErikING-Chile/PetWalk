import { createClient } from "@/utils/supabase/server"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { ClientOnboardingForm } from "@/components/client/onboarding-form"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch full profile (assumes profile exists from signup)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

    return (
        <div className="space-y-6">
            <div className="pt-2 px-2">
                <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                <p className="text-gray-400 text-sm">Gestiona tus datos personales</p>
            </div>

            {/* Reusing the Onboarding Form for consistency and editing capabilities */}
            <ClientOnboardingForm initialData={profile} redirectTo={null} />

            <div className="border-t border-white/10 pt-6">
                <SignOutButton />
            </div>
        </div>
    )
}
