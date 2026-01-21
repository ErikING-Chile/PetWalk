'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for simplicity, but you should validate inputs
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'client' | 'walker'

    console.log("Attempting signup:", { email, role })

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role,
            },
        },
    })

    if (authError) {
        console.error("Auth Error:", authError)
        // If it's "User already registered", Redirect to login? Or showing error.
        // For 'One-Shot', let's show the error.
        redirect(`/register?error=${encodeURIComponent(authError.message)}`)
    }

    if (authData.user) {
        console.log("User created:", authData.user.id)

        // 2. Create Profile entry
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                role: role,
                email: email,
                created_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error("Profile creation error:", profileError)
            // If profile fails, we might want to try to clean up auth user, 
            // but for now just logging.
            // This is likely RLS if user can't insert their own profile.
        } else {
            console.log("Profile created successfully")
        }

        // 3. If Walker, create walker_profile skeleton
        if (role === 'walker') {
            const { error: walkerError } = await supabase.from('walker_profiles').insert({
                user_id: authData.user.id,
                status: 'pending'
            })
            if (walkerError) console.error("Walker profile error:", walkerError)
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
