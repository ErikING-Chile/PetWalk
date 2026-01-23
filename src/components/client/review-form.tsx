'use client'
import { useState } from 'react'
import { submitReview } from '@/app/(dashboard)/client/book/actions'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ReviewForm({ bookingId }: { bookingId: string }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (rating === 0) return
        setLoading(true)
        const res = await submitReview(bookingId, rating, comment)
        setLoading(false)
        if (res.success) {
            setSubmitted(true)
            router.refresh()
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-500/20 p-4 rounded-xl text-center text-green-200 border border-green-500/30">
                <p className="font-bold">¡Gracias por tu calificación!</p>
            </div>
        )
    }

    return (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
            <h3 className="font-bold text-lg text-white">Califica tu experiencia</h3>

            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    >
                        <Star size={32} />
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deja un comentario (opcional)..."
                className="w-full bg-black/40 text-white p-3 rounded-lg border border-white/10 focus:border-purple-500 outline-none text-sm resize-none h-24"
            />

            <button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
                {loading ? 'Enviando...' : 'Enviar Calificación'}
            </button>
        </div>
    )
}
