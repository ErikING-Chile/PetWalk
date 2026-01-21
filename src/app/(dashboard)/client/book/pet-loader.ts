'use server'
import { createClient } from '@/utils/supabase/server'

export async function getMyPets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase.from('pets').select('*').eq('owner_id', user.id)
    return data || []
}
