'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addPet(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const name = formData.get('name') as string
    const species = formData.get('species') as 'dog' | 'cat'
    const breed = formData.get('breed') as string
    const size = formData.get('size') as 's' | 'm' | 'l'
    const gender = formData.get('gender') as 'male' | 'female'
    const notes = formData.get('notes') as string
    const photo = formData.get('photo') as File

    let photo_url = null

    // Handle Image Upload
    if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(fileName, photo)

        if (uploadError) {
            console.error("Error uploading photo:", uploadError)
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('pet-photos')
                .getPublicUrl(fileName)
            photo_url = publicUrl
        }
    }

    const { error } = await supabase.from('pets').insert({
        owner_id: user.id,
        name,
        species,
        breed,
        size,
        gender,
        notes,
        photo_url
    })

    if (error) {
        console.error("Error creating pet:", error)
        redirect('/client/pets/create?error=Error creating pet')
    }

    revalidatePath('/client/pets')
    redirect('/client/pets')
}
