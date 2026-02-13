'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { validateRun, validatePhone, formatRun } from '@/utils/validation'

export async function getWalkerRequests() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch bookings assigned to this walker OR unassigned (requested) in their zone (simplified for MVP: all requested)
    const { data } = await supabase
        .from('walk_bookings')
        .select(`
            id,
            status,
            scheduled_at,
            price,
            duration_minutes,
            pickup_address,
            pets (name, breed, photo_url),
            profiles:client_id (full_name, avatar_url)
        `)
        // Show requests for me, open requests, or assigned to me.
        .or(`walker_id.eq.${user?.id},walker_id.is.null`)
        .in('status', ['requested', 'assigned'])
        .order('scheduled_at', { ascending: true })

    return data || []
}

export async function getWalkerActiveWalk() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
        .from('walk_bookings')
        .select('*')
        .eq('walker_id', user.id)
        .eq('status', 'in_progress')
        .single()

    return data
}

export async function acceptBooking(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
        .from('walk_bookings')
        .update({ status: 'assigned', walker_id: user?.id })
        .eq('id', bookingId)

    revalidatePath('/walker')
}

// ... (existing code)

export async function rejectBooking(bookingId: string) {
    const supabase = await createClient()

    // Use Admin Client to bypass RLS (since walker doesn't "own" the row yet)
    // This allows us to reject a 'requested' booking.
    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.from('walk_bookings')
        .update({
            status: 'cancelled',
            notes: 'Rechazado por walker',
            cancelled_by: 'walker'
        })
        .eq('id', bookingId)

    if (error) {
        console.error("Error rejecting booking:", error)
        return { error: error.message }
    }

    revalidatePath('/walker')
    return { success: true }
}

export async function startWalk(bookingId: string) {
    // ... (existing code)
    const supabase = await createClient()
    await supabase.from('walk_bookings').update({ status: 'in_progress' }).eq('id', bookingId)
    revalidatePath('/walker')
}

export async function cancelWalkByWalker(bookingId: string, reason: string) {
    const supabase = await createClient()

    // Assuming assigned status. 
    // Usually walker can cancel 'assigned'. If 'in_progress', it's complicated but let's allow it for MVP with a note.

    // Check if it's assigned to this user? RLS handles it if we use standard client, 
    // but if we used admin for reject, maybe we need it here?
    // If status is 'assigned', walker_id is set to this user. So standard client works.

    const { error } = await supabase.from('walk_bookings')
        .update({
            status: 'cancelled',
            notes: `Cancelado por walker: ${reason}`,
            cancelled_by: 'walker'
        })
        .eq('id', bookingId)
        .eq('status', 'assigned') // Only allow cancelling assigned walks for now via this specific flow?

    if (error) return { error: error.message }

    revalidatePath('/walker')
    return { success: true }
}

export async function verifyAndStartWalk(bookingId: string, code: string) {
    const supabase = await createClient()

    // 1. Check code
    const { data: booking, error } = await supabase
        .from('walk_bookings')
        .select('start_code')
        .eq('id', bookingId)
        .single()

    if (error || !booking) {
        return { error: "Booking not found" }
    }

    if (booking.start_code !== code) {
        return { error: "Código incorrecto. Verifica con el dueño." }
    }

    // 2. Start Walk
    await supabase
        .from('walk_bookings')
        .update({ status: 'in_progress' })
        .eq('id', bookingId)

    revalidatePath('/walker')
    return { success: true }
}

// Helper for Haversine Distance (km)
function calculateDistance(points: { lat: number; lng: number }[]) {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        const R = 6371; // km
        const dLat = (points[i].lat - points[i - 1].lat) * Math.PI / 180;
        const dLon = (points[i].lng - points[i - 1].lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(points[i - 1].lat * Math.PI / 180) * Math.cos(points[i].lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        total += R * c;
    }
    return total;
}

export async function completeWalk(bookingId: string) {
    const supabase = await createClient()

    // 1. Fetch GPS Route to calculate stats
    const { data: routes } = await supabase
        .from('walk_routes')
        .select('lat, lng, created_at')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })

    let distance = 0
    let duration = 0

    if (routes && routes.length > 1) {
        // Calculate Distance
        distance = calculateDistance(routes)

        // Calculate Duration (End - Start)
        const start = new Date(routes[0].created_at).getTime()
        const end = new Date(routes[routes.length - 1].created_at).getTime()
        duration = Math.round((end - start) / 1000 / 60) // minutes
    }

    // 2. Update Booking
    await supabase.from('walk_bookings')
        .update({
            status: 'completed',
            actual_distance_km: parseFloat(distance.toFixed(2)),
            actual_duration_min: duration,
            ended_at: new Date().toISOString()
        })
        .eq('id', bookingId)

    revalidatePath('/walker')
}

export async function updateWalkerProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Text Fields
    const full_name = formData.get('full_name') as string
    const run = formData.get('run') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const description = formData.get('description') as string

    // URL/Path Fields (from Client Upload)
    const profile_photo_path = formData.get('profile_photo_path') as string
    const id_front_path = formData.get('id_front_path') as string
    const id_back_path = formData.get('id_back_path') as string
    const criminal_record_path = formData.get('criminal_record_path') as string
    const residence_cert_path = formData.get('residence_cert_path') as string

    // Validate fields
    if (run && !validateRun(run)) {
        return { error: "RUN inválido. Revisa el dígito verificador." }
    }
    if (phone && !validatePhone(phone)) {
        return { error: "Teléfono inválido. Formato: +56 9 1234 5678" }
    }

    const updates: any = {
        address,
        description,
        documents_status: 'pending' // Reset to pending on update
    }

    // Update generic profile (Identity fields)
    const profileUpdates: any = {}
    if (full_name) profileUpdates.full_name = full_name
    if (run) profileUpdates.rut = formatRun(run) // Map run -> rut
    if (phone) profileUpdates.phone = phone

    // Update Avatar if path provided
    if (profile_photo_path) {
        profileUpdates.avatar_url = profile_photo_path
        updates.profile_photo_url = profile_photo_path
    }

    if (Object.keys(profileUpdates).length > 0) {
        await adminSupabase.from('profiles').update(profileUpdates).eq('id', user.id)
    }

    // Assign Document Paths directly
    if (id_front_path) {
        updates.id_front_url = id_front_path
        updates.document_id_front_url = id_front_path
    }
    if (id_back_path) {
        updates.id_back_url = id_back_path
        updates.document_id_back_url = id_back_path
    }
    if (criminal_record_path) {
        updates.criminal_record_url = criminal_record_path
        updates.certificate_background_url = criminal_record_path
    }
    if (residence_cert_path) {
        updates.residence_cert_url = residence_cert_path
        updates.certificate_residence_url = residence_cert_path
    }

    // Update DB (Use Admin Client to bypass RLS if needed)
    // Use upsert to ensure row exists
    const { error } = await adminSupabase
        .from('walker_profiles')
        .upsert({
            user_id: user.id,
            ...updates,
            // Ensure status is pending if creating new
            status: 'pending'
        }, { onConflict: 'user_id' })

    if (error) {
        console.error("Profile update error:", error)
        return { error: "Failed to update profile: " + error.message }
    }

    revalidatePath('/walker/profile')
    return { success: true }
}
