"use client"

import { Card } from "@/components/ui/card"
import { addPet } from "../actions"
import { Cat, Dog } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function CreatePetPage() {
    const [species, setSpecies] = useState<'dog' | 'cat'>('dog')
    const [size, setSize] = useState<'s' | 'm' | 'l'>('m')

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Nueva Mascota</h1>

            <form action={addPet} className="space-y-6">
                {/* Hidden inputs for visual selectors */}
                <input type="hidden" name="species" value={species} />
                <input type="hidden" name="size" value={size} />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Especie</label>
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            variant="interactive"
                            className={cn("flex flex-col items-center justify-center py-4 border-2", species === 'dog' ? "border-purple-500 bg-purple-500/10" : "border-transparent")}
                            onClick={() => setSpecies('dog')}
                        >
                            <Dog className={cn("mb-2", species === 'dog' ? "text-purple-400" : "text-gray-400")} />
                            <span className="text-sm font-medium">Perro</span>
                        </Card>
                        <Card
                            variant="interactive"
                            className={cn("flex flex-col items-center justify-center py-4 border-2", species === 'cat' ? "border-pink-500 bg-pink-500/10" : "border-transparent")}
                            onClick={() => setSpecies('cat')}
                        >
                            <Cat className={cn("mb-2", species === 'cat' ? "text-pink-400" : "text-gray-400")} />
                            <span className="text-sm font-medium">Gato</span>
                        </Card>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300">Nombre</label>
                    <input name="name" id="name" required className="glass-input w-full" placeholder="Ej. Firulais" />
                </div>

                <div className="space-y-2">
                    <label htmlFor="breed" className="text-sm font-medium text-gray-300">Raza (Opcional)</label>
                    <input name="breed" id="breed" className="glass-input w-full" placeholder="Ej. Golden Retriever" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Tamaño</label>
                    <div className="flex gap-2">
                        {[
                            { id: 's', label: 'Pequeño' },
                            { id: 'm', label: 'Mediano' },
                            { id: 'l', label: 'Grande' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSize(s.id as any)}
                                className={cn(
                                    "flex-1 py-3 rounded-xl border transition-all text-sm font-medium",
                                    size === s.id
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium text-gray-300">Notas Adicionales</label>
                    <textarea name="notes" id="notes" className="glass-input w-full min-h-[100px]" placeholder="Alergias, comportamientos, etc." />
                </div>

                <button className="btn-primary w-full shadow-xl shadow-purple-900/20">
                    Guardar Mascota
                </button>
            </form>
        </div>
    )
}
