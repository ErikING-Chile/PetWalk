'use client'

import { useState } from 'react'
import { verifyAndStartWalk } from '@/app/(dashboard)/walker/actions'
import { Lock } from 'lucide-react'

export function StartWalkVerification({ bookingId }: { bookingId: string }) {
    const [code, setCode] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleVerify = async () => {
        setLoading(true)
        setError('')
        const res = await verifyAndStartWalk(bookingId, code)
        if (res?.error) {
            setError(res.error)
            setLoading(false)
        } else {
            // Success! The server action revalidates path.
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 text-lg transition-all active:scale-95"
            >
                COMENZAR PASEO
            </button>
        )
    }

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Lock size={16} className="text-pink-400" />
                Ingresa Código de Inicio
            </h3>
            <p className="text-sm text-gray-300 mb-4">
                Pídele al dueño el código de 4 dígitos que aparece en su pantalla.
            </p>

            <div className="flex gap-2">
                <input
                    type="text"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
                <button
                    onClick={handleVerify}
                    disabled={code.length !== 4 || loading}
                    className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-bold transition-all"
                >
                    {loading ? '...' : 'Iniciar'}
                </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 font-bold animate-pulse">{error}</p>}
        </div>
    )
}
