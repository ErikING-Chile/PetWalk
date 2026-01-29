"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, ChevronRight, ChevronLeft, Loader2, MapPin, File, ShieldCheck, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { updateWalkerProfile } from "@/app/(dashboard)/walker/actions"
import { formatRut, validateRut } from "@/lib/formatters"



// Helper: Phone Validation
function validatePhone(phone: string): boolean {
    // Accepts 912345678 (must be 8-9 digits)
    // Simple regex: 8 or 9 digits
    const clean = phone.replace(/\D/g, '')
    return /^[0-9]{8,9}$/.test(clean)
}

export default function WalkerOnboardingPage() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form Strings
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        rut: "",
        phone: "",
        address: "",
        description: "",
    })

    const [errors, setErrors] = useState({
        rut: "",
        phone: ""
    })

    // File Objects (for upload)
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        id_front: null,
        id_back: null,
        residence_cert: null,
        criminal_record: null,
        profile_photo: null
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        if (name === 'rut') {
            const formatted = formatRut(value)
            setFormData(prev => ({ ...prev, [name]: formatted }))
            // Clear errors on change
            setErrors(prev => ({ ...prev, rut: "" }))
            return
        }

        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear errors on change
        if (name === 'phone') {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const validateStep1 = () => {
        let valid = true
        const newErrors = { rut: "", phone: "" }

        if (!validateRut(formData.rut)) {
            newErrors.rut = "RUT inválido (ej: 12345678-9)"
            valid = false
        }

        if (!validatePhone(formData.phone)) {
            newErrors.phone = "Teléfono inválido (ej: +56912345678)"
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleNextStep = () => {
        if (validateStep1()) {
            setStep(2)
        }
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > MAX_FILE_SIZE) {
                alert("El archivo es muy pesado (máximo 5MB). Por favor sube una imagen más liviana.")
                e.target.value = "" // Reset input
                return
            }
            setFiles({ ...files, [key]: file })
        }
    }



    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const data = new FormData()
            data.append('full_name', `${formData.first_name} ${formData.last_name}`.trim())
            data.append('run', formData.rut) // Action uses 'run'
            // Add +56 prefix
            data.append('phone', `+56${formData.phone}`)
            data.append('address', formData.address)
            data.append('description', formData.description)

            if (files.profile_photo) data.append('profile_photo', files.profile_photo)
            if (files.id_front) data.append('document_id_front', files.id_front)
            if (files.id_back) data.append('document_id_back', files.id_back)
            if (files.criminal_record) data.append('certificate_background', files.criminal_record)
            if (files.residence_cert) data.append('certificate_residence', files.residence_cert)

            const result = await updateWalkerProfile(data)

            if (result?.error) {
                console.error(result.error)
                alert("Error: " + result.error)
            } else {
                router.push('/walker/profile')
            }

        } catch (error) {
            console.error(error)
            alert("Error inesperado al enviar la solicitud.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Registro de Paseador
                </h1>
                <div className="text-sm text-gray-400">Paso {step} de 2</div>
            </div>

            <div className="flex-1 p-6 max-w-lg mx-auto w-full">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                <User className="text-purple-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold">Información Personal</h2>
                            <p className="text-gray-400">Cuéntanos sobre ti para crear tu perfil.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombres</label>
                                    <input name="first_name" value={formData.first_name} onChange={handleChange} className="glass-input w-full" placeholder="Juan Pablo" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Apellidos</label>
                                    <input name="last_name" value={formData.last_name} onChange={handleChange} className="glass-input w-full" placeholder="Pérez" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">RUT</label>
                                <input
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleChange}
                                    className={`glass-input w-full ${errors.rut ? 'border-red-500' : ''}`}
                                    placeholder="12345678-9"
                                />
                                {errors.rut && <p className="text-red-400 text-xs mt-1">{errors.rut}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm font-medium">+56</span>
                                    </div>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            // Ensure only numbers
                                            const val = e.target.value.replace(/\D/g, '')
                                            handleChange({ target: { name: 'phone', value: val } } as any)
                                        }}
                                        className={`glass-input w-full !pl-12 ${errors.phone ? 'border-red-500' : ''}`}
                                        placeholder="912345678"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección y Comuna</label>
                                <input name="address" value={formData.address} onChange={handleChange} className="glass-input w-full" placeholder="Av. Providencia 123, Providencia" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Sobre ti (Bio)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="glass-input w-full h-24 pt-2" placeholder="Me encantan los perros..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Foto de Perfil</label>
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                                    <input type="file" onChange={(e) => handleFileChange(e, 'profile_photo')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {files.profile_photo ? (
                                        <div className="text-green-400 flex items-center justify-center gap-2"><CheckCircle size={16} /> {files.profile_photo.name}</div>
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <Upload className="mb-2" />
                                            <span className="text-xs">Subir foto de rostro</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNextStep}
                            disabled={!formData.first_name || !formData.last_name || !formData.rut || !formData.phone || !formData.address}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
                        >
                            Siguiente <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                                <ShieldCheck className="text-blue-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold">Documentación</h2>
                            <p className="text-gray-400">Verificamos tu identidad por seguridad.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'id_front', label: 'Cédula de Identidad (Frente)' },
                                { key: 'id_back', label: 'Cédula de Identidad (Dorso)' },
                                { key: 'criminal_record', label: 'Certificado de Antecedentes' },
                                { key: 'residence_cert', label: 'Certificado de Residencia' },
                            ].map((doc) => (
                                <div key={doc.key}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{doc.label}</label>
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors relative">
                                        <input type="file" onChange={(e) => handleFileChange(e, doc.key)} accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="flex items-center gap-3">
                                            <File className="text-gray-500" />
                                            <span className="text-sm text-gray-400">
                                                {files[doc.key] ? files[doc.key]?.name : "Seleccionar archivo..."}
                                            </span>
                                        </div>
                                        {files[doc.key] && <CheckCircle className="text-green-400" size={20} />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                                <ChevronLeft />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !files.id_front || !files.id_back || !files.criminal_record}
                                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Enviar Solicitud"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
