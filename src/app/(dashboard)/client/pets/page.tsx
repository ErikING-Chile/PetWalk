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
                <Link href="/client/pets/create">
                    <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/20">
                        <Plus size={24} />
                    </button>
                </Link>
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
                    <div className="text-center py-10 opacity-50">
                        <p>No tienes mascotas registradas.</p>
                        <p className="text-sm">¡Agrega una para empezar!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
