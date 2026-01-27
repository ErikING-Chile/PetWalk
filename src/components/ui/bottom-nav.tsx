"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dog, MapPin, User, Calendar, ListChecks, Bell } from "lucide-react" // Importing icon library
import { cn } from "@/lib/utils"

interface BottomNavProps {
    role: "client" | "walker"
}

export function BottomNav({ role }: BottomNavProps) {
    const pathname = usePathname()

    const clientLinks = [
        { href: "/client", label: "Inicio", icon: Home },
        { href: "/client/book", label: "Pasear", icon: Dog },
        { href: "/client/pets", label: "Mascotas", icon: ListChecks },
        { href: "/client/profile", label: "Perfil", icon: User },
    ]

    const walkerLinks = [
        { href: "/walker/schedule", label: "Agenda", icon: Calendar },
        { href: "/walker", label: "Solicitudes", icon: Bell },
        { href: "/walker/history", label: "Historial", icon: ListChecks },
        { href: "/walker/profile", label: "Perfil", icon: User },
    ]

    const links = role === "client" ? clientLinks : walkerLinks

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-safe">
            <div className="flex justify-around items-center h-16">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-purple-400" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
