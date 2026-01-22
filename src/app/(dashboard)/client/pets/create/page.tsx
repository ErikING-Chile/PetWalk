"use client"

import { Card } from "@/components/ui/card"
import { addPet } from "../actions"
import { Cat, Dog, Upload, X, Check } from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

// Common breeds data
const BREEDS = {
    dog: [
        "Mestizo / Quiltro", "Golden Retriever", "Labrador", "Poodle", "Bulldog Francés",
        "Pastor Alemán", "Beagle", "Yorkshire Terrier", "Boxer", "Border Collie",
        "Pug", "Shih Tzu", "Chihuahua", "Dachshund (Salchicha)", "Otro"
    ],
    cat: [
        "Mestizo / Común Europeo", "Persa", "Siamés", "Maine Coon", "Ragdoll",
        "Bengala", "Sphynx", "British Shorthair", "Abisinio", "Otro"
    ]
}

export default function CreatePetPage() {
    const [species, setSpecies] = useState<'dog' | 'cat'>('dog')
    const [size, setSize] = useState<'s' | 'm' | 'l'>('m')
    const [gender, setGender] = useState<'male' | 'female'>('male')
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = () => {
        setIsSubmitting(true)
    }

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-white">Nueva Mascota</h1>

            <form action={addPet} onSubmit={handleSubmit} className="space-y-8">
                {/* Hidden inputs for state values */}
                <input type="hidden" name="species" value={species} />
                <input type="hidden" name="size" value={size} />
                <input type="hidden" name="gender" value={gender} />

                {/* 1. Pet Type Selector */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">¿Qué es tu mascota?</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setSpecies('dog')}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200",
                                species === 'dog'
                                    ? "border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                    : "border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:bg-white/10"
                            )}
                        >
                            <Dog size={32} className={cn("mb-2", species === 'dog' ? "text-purple-400" : "text-gray-400")} />
                            <span className="font-bold text-white">Perro</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSpecies('cat')}
                            className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200",
                                species === 'cat'
                                    ? "border-pink-500 bg-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                    : "border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:bg-white/10"
                            )}
                        >
                            <Cat size={32} className={cn("mb-2", species === 'cat' ? "text-pink-400" : "text-gray-400")} />
                            <span className="font-bold text-white">Gato</span>
                        </button>
                    </div>
                </div>

                {/* 2. Photo Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Foto de Perfil</label>
                    <div className="flex items-center gap-4">
                        <div
                            className="h-24 w-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500/50 transition-colors relative group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <Upload className="text-gray-400 group-hover:text-purple-400" size={24} />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-white">Cambiar</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400 mb-2">Sube una foto linda para que el paseador la reconozca.</p>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors"
                            >
                                Seleccionar Imagen
                            </button>
                            <input
                                type="file"
                                name="photo"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-300">Nombre</label>
                        <input name="name" id="name" required className="glass-input w-full" placeholder={`Ej. ${species === 'dog' ? 'Firulais' : 'Michi'}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Género</label>
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                        gender === 'male' ? "bg-blue-500/20 text-blue-300 shadow-sm" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Macho
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                        gender === 'female' ? "bg-pink-500/20 text-pink-300 shadow-sm" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Hembra
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="breed" className="text-sm font-medium text-gray-300">Raza</label>
                            <div className="relative">
                                <select
                                    name="breed"
                                    id="breed"
                                    className="glass-input w-full appearance-none cursor-pointer"
                                    defaultValue=""
                                >
                                    <option value="" disabled className="bg-gray-900 text-gray-400">Seleccionar...</option>
                                    {BREEDS[species].map(breed => (
                                        <option key={breed} value={breed} className="bg-gray-900 text-white">{breed}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Size Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Tamaño</label>
                    <div className="flex gap-2">
                        {[
                            { id: 's', label: 'Pequeño', desc: '< 10kg' },
                            { id: 'm', label: 'Mediano', desc: '10-25kg' },
                            { id: 'l', label: 'Grande', desc: '> 25kg' }
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setSize(s.id as any)}
                                className={cn(
                                    "flex-1 py-3 px-2 rounded-xl border transition-all text-sm font-medium flex flex-col items-center gap-1",
                                    size === s.id
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                )}
                            >
                                <span>{s.label}</span>
                                <span className={cn("text-[10px]", size === s.id ? "text-gray-500" : "text-gray-500")}>{s.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 5. Notes */}
                <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium text-gray-300">Notas Adicionales</label>
                    <textarea
                        name="notes"
                        id="notes"
                        className="glass-input w-full min-h-[80px]"
                        placeholder="Alergias, comportamientos, instrucciones..."
                    />
                </div>

                <button
                    disabled={isSubmitting}
                    className="btn-primary w-full shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>Guardando...</>
                    ) : (
                        <>
                            <Check size={20} /> Guardar Mascota
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
