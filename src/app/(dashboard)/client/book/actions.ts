'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { calculateDistance } from '@/utils/distance'
import { getMultipleWalkersActiveWalks } from '@/utils/walker-availability'

export async function getWalkers() {
    const supabase = await createClient()

    // In a real app, we'd filter by location/availability
    // For MVP, just return all approved walkers with their profiles
    const { data: walkers } = await supabase
        .from('walker_profiles')
        .select(`
            user_id,
            rating_avg,
            description,
            birth_date,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'approved')
        .eq('status', 'approved')
        .limit(50)

    // SIMULATED LOCATION FOR MVP
    // Client at Plaza Baquedano, Santiago
    const clientLat = -33.4372
    const clientLon = -70.6342

    // Get active walks count for all walkers
    const walkerIds = walkers?.map(w => w.user_id) || []
    const activeWalksCounts = await getMultipleWalkersActiveWalks(walkerIds)

    const walkersWithLoc = walkers?.map(w => {
        // Random location within ~3km to ensure visibility in immediate filter
        // 0.025 degrees is roughly 2.5-3km
        const lat = clientLat + (Math.random() - 0.5) * 0.025
        const lon = clientLon + (Math.random() - 0.5) * 0.025

        const distance = calculateDistance(clientLat, clientLon, lat, lon)

        return {
            ...w,
            lat,
            lon,
            distance,
            active_walks_count: activeWalksCounts[w.user_id] || 0
        }
    })

    // Sort by distance (closest first)
    walkersWithLoc?.sort((a, b) => a.distance - b.distance)

    console.log("Walkers found (with simulated location):", walkersWithLoc?.length)
    return walkersWithLoc || []
}

export async function createBooking(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const petId = formData.get('petId') as string
    const walkerId = formData.get('walkerId') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const duration = parseInt(formData.get('duration') as string)
    const price = parseInt(formData.get('price') as string)
    const address = "Plaza Baquedano, Santiago| -33.4372, -70.6342" // Address | Lat, Lng

    // Combine date/time
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    // Generate Secure Start Code (4 digits)
    const start_code = Math.floor(1000 + Math.random() * 9000).toString()

    const { error } = await supabase.from('walk_bookings').insert({
        client_id: user.id,
        walker_id: walkerId,
        pet_id: petId,
        status: 'requested',
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        pickup_address: address,
        price: price,
        start_code: start_code
    })

    if (error) {
        console.error("Booking Error:", error)
        throw new Error("Failed to create booking")
    }

    redirect('/client')
}

import { revalidatePath } from 'next/cache'

// Interface for Survey Data
interface SurveyData {
    bookingId: string
    rating: number
    checkPunctuality: boolean
    checkCare: boolean
    checkCommunication: boolean
    comment: string
    reportedIssue: boolean
    issueDescription?: string
}

export async function submitSurvey(data: SurveyData) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('walk_surveys')
        .insert({
            booking_id: data.bookingId,
            rating: data.rating,
            check_punctuality: data.checkPunctuality,
            check_care: data.checkCare,
            check_communication: data.checkCommunication,
            comment: data.comment,
            reported_issue: data.reportedIssue,
            issue_description: data.issueDescription
        })

    if (error) {
        console.error("Survey Error:", error)
        return { error: "Error enviando encuesta. ¿Ya calificaste?" }
    }

    // Also update booking status to fully closed if needed, but 'completed' is usually final.
    // Maybe we want a 'reviewed' flag or similar? For now, just revalidate.

    revalidatePath('/client')
    revalidatePath(`/client/track/${data.bookingId}`)
    return { success: true }
}

// Adapters for older components (RatingForm, ReviewForm)
export async function submitReview(bookingId: string, rating: number, comment: string) {
    return submitSurvey({
        bookingId,
        rating,
        comment,
        checkPunctuality: false,
        checkCare: false,
        checkCommunication: false,
        reportedIssue: false
    })
}

export async function sendChatMessage(bookingId: string, content: string, mediaUrl?: string, type: 'text' | 'image' = 'text') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase
        .from('chat_messages')
        .insert({
            booking_id: bookingId,
            sender_id: user.id,
            content,
            media_url: mediaUrl,
            type
        })

    if (error) {
        console.error("Chat Error:", error)
        return { error: "Error sending message" }
    }

    return { success: true }
}

export async function cancelBooking(bookingId: string, reason: string) {
    const supabase = await createClient()

    // Only 'requested' or 'assigned' can be cancelled by user logic (before start)
    // We should verify status first ideally, but RLS/security logic often handles owner check.

    const { error } = await supabase
        .from('walk_bookings')
        .update({
            status: 'cancelled',
            notes: `Cancelado por dueño: ${reason}`,
            cancelled_by: 'client'
        })
        .eq('id', bookingId)
        .in('status', ['requested', 'assigned'])

    if (error) {
        console.error("Error cancelling booking:", error)
        return { error: "Error cancelling booking or too late to cancel." }
    }

    console.log(`Booking ${bookingId} cancelled by client`)

    revalidatePath('/client')
    revalidatePath(`/client/track/${bookingId}`)
    return { success: true }
}

export async function terminateWalkEarly(bookingId: string, reason: string) {
    const supabase = await createClient()

    // Fetch current price to add penalty
    const { data: booking } = await supabase.from('walk_bookings').select('price').eq('id', bookingId).single()

    if (!booking) return { error: "Booking not found" }

    const newPrice = (booking.price || 0) + 3000

    const { error } = await supabase
        .from('walk_bookings')
        .update({
            status: 'completed', // Terminated early count as completed but with penalty? Or 'cancelled'? User said "termino del paseo". Usually means completed but stopped early.
            price: newPrice,
            notes: `Terminado anticipadamente por el dueño (+3000 por multa). Motivo: ${reason}`
        })
        .eq('id', bookingId)
        .eq('status', 'in_progress')

    if (error) return { error: "Error terminating walk." }

    revalidatePath('/client')
    revalidatePath(`/client/track/${bookingId}`)
    return { success: true }
}
