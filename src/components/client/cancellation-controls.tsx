'use client'

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { cancelBooking, terminateWalkEarly } from "@/app/(dashboard)/client/book/actions"

interface CancellationControlsProps {
    bookingId: string
    status: string
}

export function CancellationControls({ bookingId, status }: CancellationControlsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [actionType, setActionType] = useState<'cancel' | 'terminate' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Determine available action based on status
    const canCancel = status === 'requested' || status === 'assigned'
    const canTerminate = status === 'in_progress'

    const handleOpen = (type: 'cancel' | 'terminate') => {
        setActionType(type)
        setReason("")
        setIsOpen(true)
    }

    const handleSubmit = async () => {
        if (!reason.trim()) return
        setIsSubmitting(true)

        let result
        if (actionType === 'cancel') {
            result = await cancelBooking(bookingId, reason)
        } else if (actionType === 'terminate') {
            result = await terminateWalkEarly(bookingId, reason)
        }

        setIsSubmitting(false)
        setIsOpen(false)

        if (result?.error) {
            alert(result.error) // Simple alert for now
        }
    }

    if (!canCancel && !canTerminate) return null

    return (
        <>
            {/* Buttons */}
            {canCancel && (
                <button
                    onClick={() => handleOpen('cancel')}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl border border-red-500/20 transition-colors"
                >
                    Cancelar Paseo
                </button>
            )}

            {canTerminate && (
                <button
                    onClick={() => handleOpen('terminate')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg border border-red-500 flex flex-col items-center justify-center gap-1"
                >
                    <span>Solicitar Término de Paseo</span>
                    <span className="text-[10px] opacity-80 font-normal">Se aplicará un cargo extra de $3.000</span>
                </button>
            )}

            {/* Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={actionType === 'terminate' ? "Terminar Paseo Anticipadamente" : "Cancelar Paseo"}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-300">
                        {actionType === 'terminate'
                            ? "Por favor indica el motivo para terminar el paseo antes de tiempo. Se aplicará un cargo adicional."
                            : "Por favor indica el motivo de la cancelación."
                        }
                    </p>

                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Escribe el motivo aquí..."
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 min-h-[100px]"
                    />

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!reason.trim() || isSubmitting}
                            className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${!reason.trim() || isSubmitting
                                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {isSubmitting ? 'Procesando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
