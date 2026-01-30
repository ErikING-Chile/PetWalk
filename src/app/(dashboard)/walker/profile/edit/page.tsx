"use client"

import { Card } from "@/components/ui/card"
import { updateWalkerProfile } from "@/app/(dashboard)/walker/actions"
import { Upload, Check, AlertCircle } from "lucide-react"
import { validateRun, formatRun, validatePhone } from "@/utils/validation"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EditWalkerProfilePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ run?: string, phone?: string }>({})
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)

        // Transform Data
        const firstName = formData.get('first_name')?.toString() || ''
        const lastName = formData.get('last_name')?.toString() || ''
        formData.set('full_name', `${firstName} ${lastName}`.trim())

        // Handle Phone
        const phone = formData.get('phone')?.toString() || ''
        const cleanPhone = phone.replace(/\D/g, '')
        formData.set('phone', `+56${cleanPhone}`)

        const result = await updateWalkerProfile(formData)
        setIsLoading(false)

        if (result?.success) {
            router.push('/walker/profile')
        } else {
            alert(result?.error || 'Error al actualizar perfil')
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-white">Completar Perfil Walker</h1>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Nombres</label>
                                <input name="first_name" className="glass-input w-full" placeholder="Juan Pablo" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Apellidos</label>
                                <input name="last_name" className="glass-input w-full" placeholder="Pérez González" required />
                            </div>
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
                                        const val = formatRun(e.target.value)
                                        e.target.value = val
                                        if (val && !validateRun(val)) {
                                            setErrors(prev => ({ ...prev, run: "RUN inválido (Revisa el dígito verificador)" }))
                                        } else {
                                            setErrors(prev => {
                                                const { run, ...rest } = prev
                                                return rest
                                            })
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-500">Formato: 12.345.678-K</p>
                                {errors.run && <p className="text-red-400 text-xs">{errors.run}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Teléfono</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm font-medium">+56</span>
                                    </div>
                                    <input
                                        name="phone"
                                        type="tel"
                                        className="glass-input !pl-12 w-full"
                                        placeholder="9 1234 5678"
                                        required
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '')

                                            // Limit length to 9
                                            if (val.length <= 9) {
                                                e.target.value = val

                                                // Only validate if we have enough digits e.g. 9
                                                if (val.length === 9) {
                                                    const fullPhone = `+56${val}`
                                                    if (!validatePhone(fullPhone)) {
                                                        setErrors(prev => ({ ...prev, phone: "Formato inválido (Ej: 9 1234 5678)" }))
                                                    } else {
                                                        setErrors(prev => {
                                                            const { phone, ...rest } = prev
                                                            return rest
                                                        })
                                                    }
                                                }
                                            } else {
                                                // Prevent input > 9
                                                e.target.value = val.slice(0, 9)
                                            }
                                        }}
                                    />
                                </div>
                                {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
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
                    disabled={isLoading || Object.keys(errors).length > 0}
                    className="btn-primary w-full shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50"
                >
                    {isLoading ? "Enviando..." : "Enviar para Verificación"}
                </button>
            </form>
        </div>
    )
}
