import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    return (
        <div className="p-8 text-white space-y-4">
            <h1 className="text-2xl font-bold text-red-400">Session Debugger</h1>

            <div className="bg-black/50 p-4 rounded border border-white/20">
                <h2 className="font-bold mb-2">Supabase Auth State</h2>
                <pre>{JSON.stringify({
                    hasUser: !!user,
                    userId: user?.id,
                    userEmail: user?.email,
                    error: error?.message
                }, null, 2)}</pre>
            </div>

            <div className="bg-black/50 p-4 rounded border border-white/20">
                <h2 className="font-bold mb-2">Cookies Present ({allCookies.length})</h2>
                <ul className="text-xs font-mono space-y-1">
                    {allCookies.map(c => (
                        <li key={c.name} className="break-all">
                            <span className="text-blue-400">{c.name}</span>: {c.value.substring(0, 20)}...
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-sm text-gray-400">
                Timestamp: {new Date().toISOString()}
            </div>
        </div>
    )
}
