'use client'

import { useEffect, useState } from 'react'
import { WalkEndedModal } from '@/components/walk/walk-ended-modal'
import { useRouter, useSearchParams } from 'next/navigation'

export function DashboardRatingWrapper({ unratedBookingId }: { unratedBookingId?: string }) {
    const searchParams = useSearchParams()
    const rateWalkId = searchParams.get('rate_walk')
    const [isOpen, setIsOpen] = useState(false)
    const [bookingId, setBookingId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (rateWalkId) {
            setBookingId(rateWalkId)
            setIsOpen(true)
        } else if (unratedBookingId) {
            setBookingId(unratedBookingId)
            setIsOpen(true)
        }
    }, [rateWalkId, unratedBookingId])

    const handleClose = () => {
        setIsOpen(false)
        if (rateWalkId) {
            router.replace('/client')
        }
    }

    if (!bookingId) return null

    return (
        <WalkEndedModal
            isOpen={isOpen}
            onClose={handleClose}
            bookingId={bookingId}
        />
    )
}
