"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Camera, User, MapPin, Phone, Mail, Save } from "lucide-react"
import { formatRut, validateRut } from "@/lib/formatters"
import { validatePhone } from "@/utils/validation"

export function ClientOnboardingForm({ initialData, redirectTo = '/client' }: { initialData?: any, redirectTo?: string | null }) {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form State
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || "",
        phone: initialData?.phone ? initialData.phone.replace('+56', '') : "", // Strip +56 for display if existing
        address: initialData?.address || "",
        commune: initialData?.commune || "",
        rut: initialData?.rut || "",
        avatar_url: initialData?.avatar_url || "",
    })

    // Update state when initialData changes (e.g. after fetch)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                full_name: initialData.full_name || prev.full_name,
                phone: initialData.phone ? initialData.phone.replace('+56', '') : prev.phone,
                address: initialData.address || prev.address,
                commune: initialData.commune || prev.commune,
                rut: initialData.rut || prev.rut,
                avatar_url: initialData.avatar_url || prev.avatar_url,
            }))
        }
    }, [initialData])



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === "rut") {
            const formatted = formatRut(value)
            setFormData(prev => ({ ...prev, [name]: formatted }))
            return
        }

        if (name === "phone") {
            // Allow only numbers
            const numericValue = value.replace(/\D/g, "")
            // Limit to 9 digits
            if (numericValue.length <= 9) {
                setFormData(prev => ({ ...prev, [name]: numericValue }))
            }
            return
        }

        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            // Force cache bust to show new image immediately if URL is same (unlikely with random name but good practice)
            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }))
        } catch (error) {
            console.error("Error uploading image:", error)
            alert("Error al subir la imagen")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateRut(formData.rut)) {
            alert("El RUT ingresado no es válido.")
            return
        }


        // Prepend +56 for validation and storage (validation expects +569...)
        const formattedPhone = `+56${formData.phone}`

        if (!validatePhone(formattedPhone)) {
            alert("Por favor ingresa un teléfono válido (ej: 9 1234 5678).")
            return
        }

        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            // Prepend +56 for storage
            const formattedPhone = `+56${formData.phone}`

            // Update Profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formattedPhone,
                    address: formData.address,
                    commune: formData.commune,
                    rut: formData.rut,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            // Redirect or Notify
            if (redirectTo) {
                router.push(redirectTo)
                router.refresh()
            } else {
                alert("Perfil actualizado correctamente")
                router.refresh()
            }
        } catch (error: any) {
            console.error("Error updating profile:", error)
            alert(`Error al actualizar el perfil: ${error.message || error}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-purple-500/30 bg-black/40 relative">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={48} className="text-white/50" />
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border-2 border-black shadow-lg">
                        {uploading ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <Camera size={16} className="text-white" />
                        )}
                    </div>
                </div>
                <p className="mt-3 text-sm text-gray-400">Toca para cambiar la foto</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>

            <Card variant="glass" className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className="glass-input !pl-10 w-full"
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">RUT</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="rut"
                                value={formData.rut}
                                onChange={handleInputChange}
                                className="glass-input !pl-10 w-full"
                                placeholder="12.345.678-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Teléfono</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-500 pointer-events-none">
                                <Phone size={18} />
                            </div>
                            <div className="absolute left-10 top-0 bottom-0 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm font-medium">+56</span>
                            </div>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="glass-input !pl-20 w-full"
                                placeholder="9 1234 5678"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Comuna</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="commune"
                                value={formData.commune}
                                onChange={handleInputChange}
                                className="glass-input !pl-10 w-full"
                                placeholder="Las Condes"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">Dirección</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="glass-input !pl-10 w-full"
                                placeholder="Av. Apoquindo 4500"
                                required
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                    <>
                        <Save size={18} />
                        Guardar Perfil
                    </>
                )}
            </button>
        </form>
    )
}
