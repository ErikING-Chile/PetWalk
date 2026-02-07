'use client'

import { LogOut } from "lucide-react"



export function SignOutButton() {
    return (
        <form action="/auth/signout" method="POST">
            <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors mt-6"
            >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
            </button>
        </form>
    )
}
