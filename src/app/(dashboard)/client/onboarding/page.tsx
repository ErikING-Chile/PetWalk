import { createClient } from "@/utils/supabase/server"
import { ClientOnboardingForm } from "@/components/client/onboarding-form"

export default async function ClientOnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Completa tu Perfil
                </h1>
                <p className="text-gray-400 mt-2">
                    Necesitamos algunos datos para brindarte el mejor servicio.
                </p>
            </div>

            <ClientOnboardingForm initialData={profile} />
        </div>
    )
}
