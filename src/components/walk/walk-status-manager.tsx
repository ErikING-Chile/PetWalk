'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { WalkEndedModal } from './walk-ended-modal'

interface WalkStatusManagerProps {
    bookingId: string
    initialStatus: string
    isRateable?: boolean // If true, show modal immediately if completed
    scheduledAt?: string
    durationMinutes?: number
}

export function WalkStatusManager({ bookingId, initialStatus, isRateable = false, scheduledAt, durationMinutes }: WalkStatusManagerProps) {
    const [status, setStatus] = useState(initialStatus)
    const [showModal, setShowModal] = useState(false)
    const [returningNotified, setReturningNotified] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Notification Logic for Owner ("Pet Returning")
        if (status === 'in_progress' && scheduledAt && durationMinutes) {
            const checkReturning = () => {
                const start = new Date(scheduledAt).getTime()
                const end = start + durationMinutes * 60 * 1000
                const now = Date.now()

                // If time is up (or nearly up, e.g. < 2 min left?) 
                // Requirement: "justo al terminar". Let's say when time <= 0.
                // Or maybe 1 minute before?
                // Let's stick to: if time is up, pet should be returning. 
                const isTimeUp = now >= end

                if (isTimeUp && !returningNotified) {
                    const key = `notified_returning_${bookingId}`
                    if (!localStorage.getItem(key)) {
                        alert("🐾 Tu mascota debería estar de regreso pronto (Tiempo finalizado).")
                        localStorage.setItem(key, 'true')
                        setReturningNotified(true)

                        // Optional: Insert into notifications table
                    }
                }
            }

            const interval = setInterval(checkReturning, 30000)
            checkReturning()
            return () => clearInterval(interval)
        }
    }, [status, scheduledAt, durationMinutes, returningNotified, bookingId])

    useEffect(() => {
        // ... (existing logic)

        if (initialStatus === 'completed' && isRateable) {
            setShowModal(true)
        }

        const channel = supabase
            .channel(`walk_status_${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'walk_bookings',
                    filter: `id=eq.${bookingId}`
                },
                (payload) => {
                    const newStatus = payload.new.status
                    if (newStatus !== status) {
                        setStatus(newStatus)
                        router.refresh()

                        if (newStatus === 'completed') {
                            // Redirect to dashboard with rating query param
                            router.push(`/client?rate_walk=${bookingId}`)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, initialStatus, isRateable, router, status, supabase])

    return (
        <WalkEndedModal
            bookingId={bookingId}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
        />
    )
}
