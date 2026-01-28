import { Card } from "@/components/ui/card"
import { Plus, Cat, Dog } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

export default async function PetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: pets } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id || '')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Mis Mascotas</h1>
                {pets && pets.length > 0 && (
                    <Link href="/client/pets/create">
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold shadow-lg shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm">
                            <Plus size={18} />
                            Agregar
                        </button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4">
                {pets && pets.length > 0 ? (
                    pets.map((pet) => (
                        <Card key={pet.id} variant="glass" className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors">
                            <div className="h-16 w-16 rounded-full bg-white/5 flex-shrink-0 border border-white/10 overflow-hidden relative">
                                {pet.photo_url ? (
                                    <img src={pet.photo_url} alt={pet.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-purple-500/20 to-pink-500/20">
                                        {pet.species === 'cat' ? <Cat className="text-pink-400" /> : <Dog className="text-purple-400" />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-white text-lg truncate flex items-center gap-2">
                                        {pet.name}
                                        {pet.gender === 'female' && <span className="text-pink-400 text-xs">♀</span>}
                                        {pet.gender === 'male' && <span className="text-blue-400 text-xs">♂</span>}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                    {pet.species === 'dog' ? 'Perro' : 'Gato'} • {pet.breed || 'Sin raza'}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {pet.size === 's' ? 'Pequeño' : pet.size === 'm' ? 'Mediano' : 'Grande'}
                                </p>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-20 rounded-full" />
                            <div className="relative bg-white/5 border border-white/10 p-6 rounded-full">
                                <div className="flex -space-x-4">
                                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-[#0a0a0a]">
                                        <Dog size={24} className="text-purple-400" />
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center border-2 border-[#0a0a0a]">
                                        <Cat size={24} className="text-pink-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-2 max-w-xs">
                            <h3 className="text-xl font-bold text-white">¡Aún no tienes mascotas!</h3>
                            <p className="text-sm text-gray-400">
                                Agrega a tus peludos amigos para poder agendarles paseos increíbles.
                            </p>
                        </div>

                        <Link href="/client/pets/create">
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold shadow-lg shadow-purple-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Plus size={20} />
                                Agregar mi primera mascota
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
