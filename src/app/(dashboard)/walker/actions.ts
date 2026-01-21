'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function completeWalk(bookingId: string) {
    const supabase = await createClient()
    await supabase.from('walk_bookings').update({ status: 'completed' }).eq('id', bookingId)
    revalidatePath('/walker')
}
