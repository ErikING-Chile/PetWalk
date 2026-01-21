import { Card } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { User, Star, MapPin, Award } from "lucide-react"

export default async function WalkerProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch generic profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()
    // Fetch walker specific profile
    const { data: walkerProfile } = await supabase.from('walker_profiles').select('*').eq('user_id', user?.id).single()

    return (
        <div className="space-y-6">
            <div className="relative mb-16">
                <div className="h-32 w-full bg-gradient-to-r from-pink-900 to-purple-900 rounded-xl opacity-60" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
                    <div className="relative inline-block">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1 border-4 border-[#121212]">
                            <div className="h-full w-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <User size={40} className="text-white/80" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-yellow-500 p-1 rounded-full border-2 border-[#121212]">
                            <Star size={12} className="text-black fill-black" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{profile?.full_name || "Paseador PetWalk"}</h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Disponible en Santiago
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card variant="glass" className="p-4 text-center">
                    <p className="text-xs text-gray-400">Calificación</p>
                    <p className="text-xl font-bold text-yellow-400">4.9 ★</p>
                </Card>
                <Card variant="glass" className="p-4 text-center">
                    <p className="text-xs text-gray-400">Paseos</p>
                    <p className="text-xl font-bold text-pink-400">12</p>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-white">Sobre mí</h3>
                <Card variant="glass" className="p-4">
                    <p className="text-sm text-gray-300 italic">
                        "¡Hola! Soy amante de los animales y me encanta salir a caminar. Tengo experiencia con perros grandes y pequeños. ¡Tu mascota estará en buenas manos!"
                    </p>
                </Card>

                <h3 className="font-semibold text-white">Verificación</h3>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                        <Award size={12} /> Identidad Verificada
                    </span>
                </div>
            </div>
        </div>
    )
}
