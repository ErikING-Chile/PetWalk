import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}

export async function GET() {
    // Prevent GET requests from signing out users (e.g. prefetch)
    return new Response("Method not allowed", { status: 405 })
}
