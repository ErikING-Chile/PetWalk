"use server"

import { createClient } from "@/utils/supabase/server"

/**
 * Get the count of active walks for a specific walker
 * Active walks are those with status 'in_progress'
 */
export async function getWalkerActiveWalksCount(walkerId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('walk_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('walker_id', walkerId)
        .eq('status', 'in_progress')

    if (error) {
        console.error('Error fetching walker active walks:', error)
        return 0
    }

    return count || 0
}

/**
 * Check if a walker has any active walks
 */
export async function walkerHasActiveWalks(walkerId: string): Promise<boolean> {
    const count = await getWalkerActiveWalksCount(walkerId)
    return count > 0
}

/**
 * Get active walks count for multiple walkers
 * Returns a map of walker_id -> active_walks_count
 */
export async function getMultipleWalkersActiveWalks(walkerIds: string[]): Promise<Record<string, number>> {
    if (walkerIds.length === 0) return {}

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('walk_bookings')
        .select('walker_id')
        .in('walker_id', walkerIds)
        .eq('status', 'in_progress')

    if (error) {
        console.error('Error fetching multiple walkers active walks:', error)
        return {}
    }

    // Count occurrences of each walker_id
    const counts: Record<string, number> = {}
    walkerIds.forEach(id => counts[id] = 0)

    data?.forEach(booking => {
        if (booking.walker_id) {
            counts[booking.walker_id] = (counts[booking.walker_id] || 0) + 1
        }
    })

    return counts
}
