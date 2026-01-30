'use client'

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { cancelBooking, terminateWalkEarly } from "@/app/(dashboard)/client/book/actions"
import { getWalkerActiveWalksCount } from "@/utils/walker-availability"
import { AlertCircle } from "lucide-react"

interface CancellationControlsProps {
    bookingId: string
    status: string
    walkerId?: string | null
}

export function CancellationControls({ bookingId, status, walkerId }: CancellationControlsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [actionType, setActionType] = useState<'cancel' | 'terminate' | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [walkerActiveWalks, setWalkerActiveWalks] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch walker's active walks count
    useEffect(() => {
        async function fetchActiveWalks() {
            if (walkerId) {
                const count = await getWalkerActiveWalksCount(walkerId)
                setWalkerActiveWalks(count)
            }
            setIsLoading(false)
        }
        fetchActiveWalks()
    }, [walkerId])

    // Determine available action based on status
    const canCancel = (status === 'requested' || status === 'assigned') && walkerActiveWalks === 0
    const canTerminate = status === 'in_progress'
    const cancelDisabledByActiveWalks = (status === 'requested' || status === 'assigned') && walkerActiveWalks > 0

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

    if (!canCancel && !canTerminate && !cancelDisabledByActiveWalks) return null

    return (
        <>
            {/* Warning Message when cancellation is disabled */}
            {cancelDisabledByActiveWalks && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-orange-300 font-bold text-sm">No se puede cancelar</p>
                        <p className="text-orange-200/70 text-xs mt-1">
                            El walker tiene {walkerActiveWalks} paseo{walkerActiveWalks > 1 ? 's' : ''} activo{walkerActiveWalks > 1 ? 's' : ''} en este momento.
                            Por favor espera a que termine su{walkerActiveWalks > 1 ? 's' : ''} paseo{walkerActiveWalks > 1 ? 's' : ''} actual{walkerActiveWalks > 1 ? 'es' : ''} para poder cancelar.
                        </p>
                    </div>
                </div>
            )}

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
