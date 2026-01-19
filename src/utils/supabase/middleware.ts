import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Get User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. Protected Routes Logic
    // If no user, redirect to login for protected paths
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/' // Home might be public or protected, let's keep it accessible for now or redirect
    ) {
        // If trying to access dashboard/admin/walker/client without auth -> login
        if (
            request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/client') ||
            request.nextUrl.pathname.startsWith('/walker') ||
            request.nextUrl.pathname.startsWith('/admin')
        ) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // 3. Role-Based Redirection
    if (user) {
        // Check if we are on the root path or generic dashboard, we might want to redirect to the specific role dashboard
        if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/dashboard') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role) {
                const role = profile.role
                const targetPath = role === 'admin' ? '/admin' : role === 'walker' ? '/walker' : '/client'

                // Only redirect if we are NOT already there
                if (!request.nextUrl.pathname.startsWith(targetPath)) {
                    const url = request.nextUrl.clone()
                    url.pathname = targetPath
                    return NextResponse.redirect(url)
                }
            }
        }
    }

    return response
}
