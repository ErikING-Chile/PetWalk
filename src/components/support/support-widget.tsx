'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, Mic, Square, Send, Loader2 } from 'lucide-react'
import { createTicket } from '@/app/(dashboard)/client/support/actions'

export function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [category, setCategory] = useState("Problemas con pago")
    const [description, setDescription] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const categories = [
        "Problemas con pago",
        "Paseo",
        "Chat",
        "Cuenta",
        "Otro"
    ]

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            const chunks: BlobPart[] = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                setAudioBlob(blob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("No se pudo acceder al micrófono.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!description && !audioBlob) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('category', category)
        formData.append('description', description)
        if (audioBlob) {
            formData.append('audio', audioBlob, 'voice-note.webm')
        }

        const result = await createTicket(formData)
        setIsSubmitting(false)

        if (result.success) {
            alert("Ticket enviado con éxito.")
            setIsOpen(false)
            setDescription("")
            setAudioBlob(null)
            setCategory("Problemas con pago")
        } else {
            alert(result.error || "Error al enviar ticket.")
        }
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-40 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg border border-white/20 transition-transform active:scale-90"
            >
                <HelpCircle size={24} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <HelpCircle size={18} /> Soporte
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Descripción</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe tu problema..."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
                                    />
                                </div>

                                {/* Audio Recorder */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Audio (Opcional)</label>
                                    <div className="flex items-center gap-3">
                                        {!isRecording && !audioBlob && (
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 border border-white/10 transition-colors"
                                            >
                                                <Mic size={18} className="text-purple-400" />
                                                Grabar Audio
                                            </button>
                                        )}

                                        {isRecording && (
                                            <button
                                                type="button"
                                                onClick={stopRecording}
                                                className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-red-200 py-3 px-4 rounded-lg flex items-center justify-center gap-2 border border-red-500/30 animate-pulse"
                                            >
                                                <Square size={18} className="fill-current" />
                                                Detener ({recordingTime}s)
                                            </button>
                                        )}

                                        {audioBlob && (
                                            <div className="flex-1 bg-green-900/20 border border-green-500/30 rounded-lg p-2 flex items-center justify-between px-3">
                                                <div className="text-xs text-green-400 flex items-center gap-2">
                                                    <Mic size={14} />
                                                    Audio grabado
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAudioBlob(null)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || (!description && !audioBlob)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Enviar Ticket
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
