'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
        redirect(`/register?error=${encodeURIComponent(authError.message)}`)
    }

    if (authData.user) {
        console.log("User created:", authData.user.id)

        // Initialize Admin Client for DB operations to bypass RLS
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 2. Create Profile entry
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                role: role,
                email: email,
                created_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error("Profile creation error:", profileError)
        } else {
            console.log("Profile created successfully")
        }

        // 3. If Walker, create walker_profile skeleton
        if (role === 'walker') {
            const { error: walkerError } = await adminSupabase.from('walker_profiles').upsert({
                user_id: authData.user.id,
                status: 'pending'
            })
            if (walkerError) console.error("Walker profile error:", walkerError)
        }
    }

    revalidatePath('/', 'layout')
    if (role === 'walker') {
        redirect('/walker/onboarding')
    } else {
        redirect('/')
    }
}
