"use client"

import { useState } from "react"
import { GradientMesh } from "@/components/ui/gradient-mesh"
import { RoleSelector } from "@/components/auth/role-selector"
import { signup } from "@/app/login/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const [role, setRole] = useState<"client" | "walker">("client")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        // Ensure role is accurate from state
        formData.set("role", role)

        try {
            await signup(formData)
            // Redirect is handled by server action usually, but if it returns:
        } catch (e) {
            console.error(e)
            setError("Algo salió mal. Por favor intenta de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans text-white">
            <GradientMesh className="z-0" />

            <div className="z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Únete a PetWalk</h1>
                    <p className="text-sm text-gray-400">Selecciona cómo quieres usar la app</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <RoleSelector selectedRole={role} onSelect={setRole} />

                    {/* Hidden input to pass role to server action */}
                    <input type="hidden" name="role" value={role} />

                    <div className="space-y-4 text-left">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="glass-input w-full mt-1"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="glass-input w-full mt-1"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex justify-center py-3"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            "Crear Cuenta"
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">¿Ya tienes cuenta? </span>
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                            Inicia sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
