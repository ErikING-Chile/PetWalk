'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTicket(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const audioFile = formData.get('audio') as File

    let audioUrl = null

    if (audioFile && audioFile.size > 0) {
        // Upload audio
        const fileExt = 'webm' // Assuming webm from MediaRecorder usually
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        // Note: Using 'support-attachments' bucket. Must exist and have policies.
        const { data, error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(fileName, audioFile, {
                contentType: 'audio/webm',
                upsert: false
            })

        if (uploadError) {
            console.error("Upload Error:", uploadError)
            // Continue without audio or return error? 
            // Return error to let user know audio failed.
            // But maybe bucket doesn't exist.
            // We'll return error for now.
            return { error: "Error subiendo audio. Intenta solo texto." }
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('support-attachments')
            .getPublicUrl(fileName)

        audioUrl = publicUrl
    }

    const { error } = await supabase
        .from('support_tickets')
        .insert({
            user_id: user.id,
            category,
            description,
            audio_url: audioUrl,
            status: 'open'
        })

    if (error) {
        console.error("Ticket Creation Error:", error)
        return { error: "Error creando ticket." }
    }

    revalidatePath('/client')
    return { success: true }
}
