'use client'

import { useEffect, useState } from 'react'
import { SurveyModal } from '@/components/walk/survey-modal'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function SurveyWrapper({ bookingId, initialStatus, hasSurvey }: { bookingId: string, initialStatus: string, hasSurvey: boolean }) {
    const [showSurvey, setShowSurvey] = useState(false)
    const [status, setStatus] = useState(initialStatus)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // If loaded initially as completed and no survey, show it
        if (initialStatus === 'completed' && !hasSurvey) {
            setShowSurvey(true)
        }

        // Listen for status changes
        const channel = supabase.channel(`booking-${bookingId}`)
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
                    setStatus(newStatus)
                    if (newStatus === 'completed' && !hasSurvey) {
                        setShowSurvey(true)
                    }
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, initialStatus, hasSurvey, router, supabase])

    return (
        <SurveyModal
            bookingId={bookingId}
            isOpen={showSurvey}
            onClose={() => setShowSurvey(false)}
        />
    )
}
