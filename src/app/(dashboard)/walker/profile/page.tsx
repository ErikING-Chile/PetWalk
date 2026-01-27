import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { User, Star, MapPin, Award } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function WalkerProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch generic profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
    // Fetch walker specific profile
    const { data: walkerProfile } = await supabase.from('walker_profiles').select('*').eq('user_id', user?.id).single()

    const isPending = walkerProfile?.documents_status === 'pending'
    const isApproved = walkerProfile?.documents_status === 'approved'
    const isRejected = walkerProfile?.documents_status === 'rejected'
    const hasProfileData = profile?.rut && profile?.phone

    return (
        <div className="space-y-6 pb-20">
            {/* Verification Status Banners */}
            {!hasProfileData && !isPending && (
                <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl text-blue-200 mb-4">
                    <h3 className="font-bold mb-1">Perfil Incompleto</h3>
                    <p className="text-sm opacity-80">Debes completar tu información y subir tus documentos para comenzar a pasear.</p>
                </div>
            )}
            {isPending && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-xl text-yellow-200 mb-4">
                    <h3 className="font-bold mb-1">Verificación en Proceso</h3>
                    <p className="text-sm opacity-80">
                        Tus documentos están siendo revisados por nuestro equipo. En un plazo máximo de 24 horas aprobaremos tu perfil o te contactaremos si existe algún problema con la documentación enviada.
                    </p>
                </div>
            )}

            <div className="relative mb-16">
                <div className="h-32 w-full bg-gradient-to-r from-pink-900 to-purple-900 rounded-xl opacity-60 overflow-hidden">
                    {/* Cover Placeholder */}
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
                    <div className="relative inline-block">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1 border-4 border-[#121212]">
                            <div className="h-full w-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                {walkerProfile?.profile_photo_url ? (
                                    <img src={walkerProfile.profile_photo_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={40} className="text-white/80" />
                                )}
                            </div>
                        </div>
                        {isApproved && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full border-2 border-[#121212]" title="Verificado">
                                <Award size={12} className="text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{profile?.full_name || "Usuario PetWalk"}</h1>
                {walkerProfile?.address && (
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <MapPin size={12} /> {walkerProfile.address}
                    </p>
                )}

                <div className="flex justify-center mt-3">
                    {!isPending && (
                        <a href="/walker/profile/edit" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors border border-white/10">
                            {hasProfileData ? "Editar Perfil" : "Completar Perfil"}
                        </a>
                    )}
                    {isPending && (
                        <div className="px-4 py-2 bg-white/5 rounded-lg text-sm transition-colors border border-white/10 text-gray-400 cursor-not-allowed">
                            Perfil en Revisión
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="p-4 text-center">
                    <p className="text-xs text-gray-400">Calificación</p>
                    <p className="text-xl font-bold text-yellow-400">{walkerProfile?.rating_avg || '—'} ★</p>
                </Card>
                <Card variant="glass" className="p-4 text-center">
                    <p className="text-xs text-gray-400">Total Paseos</p>
                    <p className="text-xl font-bold text-pink-400">{walkerProfile?.total_walks || 0}</p>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-white">Sobre mí</h3>
                <Card variant="glass" className="p-4">
                    <p className="text-sm text-gray-300 italic">
                        {walkerProfile?.description || "Sin descripción aún. ¡Cuéntanos sobre ti!"}
                    </p>
                </Card>

                <h3 className="font-semibold text-white">Estado de Cuenta</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                        <span className="text-sm text-gray-300">Identidad</span>
                        <span className={isApproved ? "text-green-400 text-xs" : isPending ? "text-yellow-400 text-xs" : "text-gray-500 text-xs"}>
                            {isApproved ? "Verificado" : isPending ? "Revisión" : "Pendiente"}
                        </span>
                    </div>
                </div>
            </div>

            <SignOutButton />
        </div>
    )
}
