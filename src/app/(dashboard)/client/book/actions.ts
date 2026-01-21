'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getWalkers() {
    const supabase = await createClient()

    // In a real app, we'd filter by location/availability
    // For MVP, just return all approved walkers with their profiles
    const { data: walkers } = await supabase
        .from('walker_profiles')
        .select(`
            user_id,
            rating_avg,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'approved')
        .limit(10)

    console.log("Walkers found:", walkers)
    return walkers || []
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
    const address = "Mi ubicación actual (Simulada)" // Hardcoded for MVP One-Shot

    // Combine date/time
    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    const { error } = await supabase.from('walk_bookings').insert({
        client_id: user.id,
        walker_id: walkerId,
        pet_id: petId,
        status: 'requested',
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        pickup_address: address,
        price: price,
    })

    if (error) {
        console.error("Booking Error:", error)
        throw new Error("Failed to create booking")
    }

    redirect('/client')
}
