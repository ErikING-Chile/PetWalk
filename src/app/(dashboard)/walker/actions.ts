'use server'

import { createClient } from '@/utils/supabase/server'
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
        .or(`walker_id.eq.${user?.id},status.eq.requested`)
        .order('scheduled_at', { ascending: true })

    return data || []
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

export async function startWalk(bookingId: string) {
    const supabase = await createClient()
    await supabase.from('walk_bookings').update({ status: 'in_progress' }).eq('id', bookingId)
    revalidatePath('/walker')
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
            actual_duration_min: duration
        })
        .eq('id', bookingId)

    revalidatePath('/walker')
}

export async function updateWalkerProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Text Fields
    const full_name = formData.get('full_name') as string
    const run = formData.get('run') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const description = formData.get('description') as string

    // File Fields
    const photo = formData.get('profile_photo') as File
    const idFront = formData.get('document_id_front') as File
    const idBack = formData.get('document_id_back') as File
    const certBackground = formData.get('certificate_background') as File
    const certResidence = formData.get('certificate_residence') as File

    // Validate fields
    if (run && !validateRun(run)) {
        return { error: "RUN inválido. Revisa el dígito verificador." }
    }
    if (phone && !validatePhone(phone)) {
        return { error: "Teléfono inválido. Formato: +56 9 1234 5678" }
    }

    const updates: any = {
        run: formatRun(run),
        phone,
        address,
        description,
        documents_status: 'pending' // Reset to pending on update
    }

    // Update generic profile name
    if (full_name) {
        await supabase.from('profiles').update({ full_name }).eq('id', user.id)
    }

    // Helper to upload file
    const uploadFile = async (file: File, bucket: string, pathPrefix: string) => {
        if (!file || file.size === 0) return null
        const fileExt = file.name.split('.').pop()
        const fileName = `${pathPrefix}/${user.id}_${Date.now()}.${fileExt}`

        const { error, data } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { upsert: true })

        if (error) {
            console.error(`Upload error ${bucket}:`, error)
            return null
        }

        // Return appropriate URL
        if (bucket === 'walker-photos') {
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
            return publicUrl
        } else {
            return fileName
        }
    }

    // 1. Upload Profile Photo (Public)
    const photoUrl = await uploadFile(photo, 'walker-photos', 'profiles')
    if (photoUrl) updates.profile_photo_url = photoUrl

    // 2. Upload Documents (Private)
    const idFrontPath = await uploadFile(idFront, 'walker-documents', 'id_cards')
    if (idFrontPath) updates.document_id_front_url = idFrontPath

    const idBackPath = await uploadFile(idBack, 'walker-documents', 'id_cards')
    if (idBackPath) updates.document_id_back_url = idBackPath

    const backgroundPath = await uploadFile(certBackground, 'walker-documents', 'certificates')
    if (backgroundPath) updates.certificate_background_url = backgroundPath

    const residencePath = await uploadFile(certResidence, 'walker-documents', 'certificates')
    if (residencePath) updates.certificate_residence_url = residencePath

    // Update DB
    const { error } = await supabase
        .from('walker_profiles')
        .update(updates)
        .eq('user_id', user.id)

    if (error) {
        console.error("Profile update error:", error)
        return { error: "Failed to update profile" }
    }

    revalidatePath('/walker/profile')
    return { success: true }
}
