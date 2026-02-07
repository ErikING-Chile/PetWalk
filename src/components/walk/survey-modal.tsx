'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitSurvey } from '@/app/(dashboard)/client/book/actions'

interface SurveyModalProps {
    bookingId: string
    isOpen: boolean
    onClose: () => void
}

export function SurveyModal({ bookingId, isOpen, onClose }: SurveyModalProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [checks, setChecks] = useState({
        punctuality: false,
        care: false,
        communication: false
    })
    const [comment, setComment] = useState('')
    const [reportedIssue, setReportedIssue] = useState(false)
    const [issueDescription, setIssueDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return

        setIsSubmitting(true)
        try {
            await submitSurvey({
                bookingId,
                rating,
                checkPunctuality: checks.punctuality,
                checkCare: checks.care,
                checkCommunication: checks.communication,
                comment,
                reportedIssue,
                issueDescription: reportedIssue ? issueDescription : undefined
            })
            setSubmitted(true)
            setTimeout(onClose, 2000)
        } catch (error) {
            console.error(error)
            alert('Error al enviar la encuesta')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-gray-900 border border-white/10 rounded-2xl p-6 z-50 shadow-2xl overflow-y-auto max-h-[85vh]"
                    >
                        {!submitted ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-white mb-2">¡Paseo Finalizado!</h2>
                                    <p className="text-gray-400">¿Qué tal estuvo el servicio?</p>
                                </div>

                                {/* Star Rating */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={40}
                                                className={cn(
                                                    "transition-colors",
                                                    (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Quick Checks */}
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-gray-300">¿Qué destacas?</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { key: 'punctuality', label: '⏱️ Puntualidad' },
                                            { key: 'care', label: '🐶 Cuidado y Cariño' },
                                            { key: 'communication', label: '💬 Buena Comunicación' }
                                        ].map((item) => (
                                            <label
                                                key={item.key}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                    checks[item.key as keyof typeof checks]
                                                        ? "bg-purple-500/20 border-purple-500 text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={checks[item.key as keyof typeof checks]}
                                                    onChange={(e) => setChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                                />
                                                <span className="font-medium">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300">Comentario (Opcional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm min-h-[80px] focus:border-purple-500 outline-none"
                                        placeholder="¿Algún detalle extra?"
                                    />
                                </div>

                                {/* Report Issue Toggle */}
                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setReportedIssue(!reportedIssue)}
                                        className="text-xs text-red-400 flex items-center gap-1 hover:underline"
                                    >
                                        <AlertTriangle size={12} />
                                        {reportedIssue ? 'Cancelar reporte' : 'Reportar un problema'}
                                    </button>

                                    {reportedIssue && (
                                        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-sm font-bold text-red-200">Describe el problema</label>
                                            <textarea
                                                value={issueDescription}
                                                onChange={(e) => setIssueDescription(e.target.value)}
                                                className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-white text-sm min-h-[80px] focus:border-red-500 outline-none"
                                                placeholder="Cuéntanos qué pasó..."
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={rating === 0 || isSubmitting || (reportedIssue && !issueDescription)}
                                    className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                    <Star className="text-white fill-white" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">¡Gracias!</h2>
                                <p className="text-gray-400">Tu opinión nos ayuda a mejorar.</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
