'use client'

import { useState } from "react"
import { Star } from "lucide-react"
import { submitReview } from "@/app/(dashboard)/client/book/actions"

export function RatingForm({ bookingId }: { bookingId: string }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) return
        setIsSubmitting(true)
        await submitReview(bookingId, rating, comment)
        setIsSubmitting(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="bg-gray-900 border border-green-500/20 rounded-xl p-6 text-center animate-in fade-in">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Star className="text-green-500 fill-green-500" />
                </div>
                <h3 className="text-white font-bold mb-1">¡Gracias por tu calificación!</h3>
                <p className="text-sm text-gray-400">Tu opinión nos ayuda a mejorar.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-6 shadow-xl">
            <h3 className="text-white font-bold text-lg mb-2 text-center">Calificar Paseador</h3>
            <p className="text-center text-sm text-gray-400 mb-6">
                Este paseo fue cancelado por el paseador. ¿Cómo calificarías su servicio previo o comunicación?
            </p>

            <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            size={32}
                            className={`${star <= rating
                                    ? "text-yellow-400 fill-yellow-400 border-yellow-400"
                                    : "text-gray-600 hover:text-gray-500"
                                } transition-colors`}
                        />
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deja un comentario opcional..."
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 min-h-[80px] mb-4 text-sm"
            />

            <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20"
            >
                {isSubmitting ? "Enviando..." : "Enviar Calificación"}
            </button>
        </div>
    )
}
