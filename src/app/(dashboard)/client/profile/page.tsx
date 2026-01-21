import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { User, Phone, MapPin, Mail, Camera } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch full profile (assumes profile exists from signup)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

    return (
        <div className="space-y-6">
            <div className="relative mb-12">
                {/* Cover Image */}
                <div className="h-32 w-full bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl opacity-50" />

                {/* Avatar */}
                <div className="absolute -bottom-10 left-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 border-4 border-[#121212]">
                            <div className="h-full w-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <User size={40} className="text-white/80" />
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border-2 border-[#121212]">
                            <Camera size={14} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-2 px-2">
                <h1 className="text-2xl font-bold text-white">{profile?.full_name || "Usuario PetWalk"}</h1>
                <p className="text-gray-400 text-sm">Dueño de Mascotas</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white px-2">Información Personal</h2>

                <Card variant="glass" className="space-y-4">
                    <div className="flex items-center gap-4 p-2 border-b border-white/5 pb-4">
                        <div className="bg-white/10 p-2 rounded-lg text-purple-400">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm text-white">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-2 border-b border-white/5 pb-4">
                        <div className="bg-white/10 p-2 rounded-lg text-pink-400">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="text-sm text-white">{profile?.phone || "No registrado"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-2">
                        <div className="bg-white/10 p-2 rounded-lg text-blue-400">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Dirección Principal</p>
                            <p className="text-sm text-white">{"Santiago, Chile"}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <button className="w-full py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">
                Editar Perfil
            </button>
        </div>
    )
}
