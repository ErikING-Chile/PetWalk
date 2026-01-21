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
    const notes = formData.get('notes') as string

    const { error } = await supabase.from('pets').insert({
        owner_id: user.id,
        name,
        species,
        breed,
        size,
        notes,
    })

    if (error) {
        console.error("Error creating pet:", error)
        // In a real app we'd return the error to the form
        redirect('/client/pets/create?error=Error creating pet')
    }

    revalidatePath('/client/pets')
    redirect('/client/pets')
}
