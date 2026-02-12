'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function subscribeToPlan(planId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Check active subscription
    const { data: currentSub } = await supabase
        .from('subscriptions')
        .select('id, plan_id, status')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

    if (currentSub) {
        if (currentSub.plan_id === planId) {
            return { error: "Ya tienes este plan activo." }
        }

        // Update existing subscription (Migration)
        // In a real app complexity involves billing cycles, prorating, stripe/payment gateway calls.
        // MVP: Immediate switch.
        const { error } = await supabase
            .from('subscriptions')
            .update({
                plan_id: planId,
                // We might want to reset start_date or keep it. 
                // For now, simple update. 'updated_at' usually handled by trigger or manually.
            })
            .eq('id', currentSub.id)

        if (error) {
            console.error("Plan Update Error:", error)
            return { error: "Error al cambiar de plan." }
        }
    } else {
        // Create new subscription
        const { error } = await supabase
            .from('subscriptions')
            .insert({
                client_id: user.id,
                plan_id: planId,
                status: 'active'
            })

        if (error) {
            console.error("Plan Creation Error:", error)
            return { error: "Error al suscribirse." }
        }
    }

    revalidatePath('/client')
    return { success: true }
}
