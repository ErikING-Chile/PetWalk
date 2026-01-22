"use client"

import { Card } from "@/components/ui/card"
import { updateWalkerProfile } from "@/app/(dashboard)/walker/actions"
import { Upload, Check, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditWalkerProfilePage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        const result = await updateWalkerProfile(formData)
        setIsLoading(false)

        if (result?.success) {
            router.push('/walker/profile')
        } else {
            alert('Error al actualizar perfil')
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-white">Completar Perfil Paseador</h1>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-yellow-200 text-sm">
                <AlertCircle className="shrink-0" />
                <p>Para ser verificado, debes completar todos los campos y subir la documentación solicitada. Un administrador revisará tu perfil en un máximo de 24 horas.</p>
            </div>

            <form action={handleSubmit} className="space-y-8">

                {/* 1. Información Personal */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-purple-300">1. Información Personal</h2>
                    <Card variant="glass" className="space-y-4 p-6">
                        {/* Foto de Perfil */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Foto de Perfil</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                    <Upload className="text-gray-400" />
                                </div>
                                <input type="file" name="profile_photo" accept="image/*" className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Nombre Completo</label>
                            <input name="full_name" className="glass-input w-full" placeholder="Juan Pérez" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">RUN (RUT)</label>
                                <input
                                    name="run"
                                    className="glass-input w-full"
                                    placeholder="12.345.678-K"
                                    required
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/[^0-9kK]/g, '')
                                        if (val.length > 1) {
                                            val = val.slice(0, -1) + '-' + val.slice(-1)
                                        }
                                        if (val.length > 5) {
                                            const parts = val.split('-')
                                            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                            val = parts.join('-')
                                        }
                                        e.target.value = val
                                    }}
                                />
                                <p className="text-[10px] text-gray-500">Formato: 12.345.678-K</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Teléfono</label>
                                <input
                                    name="phone"
                                    className="glass-input w-full"
                                    placeholder="+56 9 1234 5678"
                                    required
                                    defaultValue="+56 9 "
                                    onChange={(e) => {
                                        // Simple prefix enforcement
                                        if (!e.target.value.startsWith('+56 9 ')) {
                                            e.target.value = '+56 9 '
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Dirección</label>
                            <input name="address" className="glass-input w-full" placeholder="Calle, Número, Comuna" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Sobre mí (Descripción)</label>
                            <textarea name="description" className="glass-input w-full min-h-[100px]" placeholder="Cuéntanos sobre tu experiencia con mascotas..." required />
                        </div>
                    </Card>
                </section>

                {/* 2. Documentación */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-purple-300">2. Documentación Requerida</h2>
                    <div className="text-xs text-gray-400 mb-4 bg-white/5 p-3 rounded-lg border border-white/10">
                        <p>Formatos aceptados: <strong>PDF, JPG, PNG</strong>.</p>
                        <p>Tamaño máximo por archivo: <strong>10 MB</strong>.</p>
                    </div>
                    <Card variant="glass" className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Cédula de Identidad (Frente)</label>
                                <input type="file" name="document_id_front" accept=".pdf,image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Cédula de Identidad (Dorso)</label>
                                <input type="file" name="document_id_back" accept=".pdf,image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Certificado Antecedentes</label>
                                <input type="file" name="certificate_background" accept=".pdf,image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Certificado Residencia</label>
                                <input type="file" name="certificate_residence" accept=".pdf,image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" required />
                            </div>
                        </div>
                    </Card>
                </section>

                <button
                    disabled={isLoading}
                    className="btn-primary w-full shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 text-lg py-4"
                >
                    {isLoading ? "Enviando..." : "Enviar para Verificación"}
                </button>
            </form>
        </div>
    )
}
