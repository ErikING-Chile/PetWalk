'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, Frown, Bandage, Check, AlertCircle } from 'lucide-react' // Using Bandage for Injured/Herida if available or similar
import { submitWalkRating } from '@/app/(dashboard)/client/book/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface WalkEndedModalProps {
    bookingId: string
    isOpen: boolean
    onClose?: () => void
}

export function WalkEndedModal({ bookingId, isOpen, onClose }: WalkEndedModalProps) {
    const [rating, setRating] = useState(0)
    const [petCondition, setPetCondition] = useState<'happy' | 'sad' | 'injured' | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (rating === 0 || !petCondition) return

        setIsSubmitting(true)
        const result = await submitWalkRating(bookingId, rating, comment, petCondition)
        setIsSubmitting(false)

        if (result.success) {
            setSubmitted(true)
            setTimeout(() => {
                if (onClose) onClose()
                router.refresh()
            }, 2000)
        } else {
            alert(result.error || "Error al enviar calificación")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <AnimatePresence>
                {submitted ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gray-900 border border-green-500/30 rounded-3xl p-8 max-w-sm w-full text-center"
                    >
                        <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">¡Gracias!</h2>
                        <p className="text-gray-400">Tu paseo ha finalizado y tu calificación ha sido guardada.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <h2 className="text-2xl font-bold text-white text-center mb-1">¡Paseo Finalizado!</h2>
                        <p className="text-gray-400 text-center text-sm mb-6">Tu mascota está de regreso. ¿Cómo estuvo?</p>

                        {/* Pet Condition */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                                ¿Cómo llegó tu mascota?
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setPetCondition('happy')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                        petCondition === 'happy'
                                            ? "bg-green-500/20 border-green-500 text-green-400"
                                            : "bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-800/80"
                                    )}
                                >
                                    <Heart size={24} className={petCondition === 'happy' ? "fill-green-400" : ""} />
                                    <span className="text-xs font-bold">Feliz</span>
                                </button>
                                <button
                                    onClick={() => setPetCondition('sad')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                        petCondition === 'sad'
                                            ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                            : "bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-800/80"
                                    )}
                                >
                                    <Frown size={24} />
                                    <span className="text-xs font-bold">Triste</span>
                                </button>
                                <button
                                    onClick={() => setPetCondition('injured')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                                        petCondition === 'injured'
                                            ? "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-gray-800 border-white/5 text-gray-400 hover:bg-gray-800/80"
                                    )}
                                >
                                    <AlertCircle size={24} />
                                    <span className="text-xs font-bold">Herida</span>
                                </button>
                            </div>
                            {petCondition === 'injured' && (
                                <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex gap-3 items-start">
                                    <AlertCircle className="shrink-0 w-5 h-5 text-red-400" />
                                    <div className="text-xs text-red-200">
                                        <p className="font-bold mb-1">Lo sentimos mucho</p>
                                        <p>Por favor abre un ticket de soporte inmediatamente para ayudarte.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Star Rating */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                                Califica al Walker
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform active:scale-90"
                                    >
                                        <Star
                                            size={32}
                                            className={cn(
                                                "transition-colors",
                                                star <= rating
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-700 hover:text-gray-600"
                                            )}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-6">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe una reseña (opcional)..."
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 text-sm min-h-[80px]"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || !petCondition || isSubmitting}
                            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
