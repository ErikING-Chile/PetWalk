'use client'


import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Dog,
    MapPin,
    Calendar,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Bell,
    LogOut,
    User
} from 'lucide-react'

// Define navigation items for each role
const navItems = {
    client: [
        { name: 'Inicio', href: '/client', icon: LayoutDashboard },
        { name: 'Mis Mascotas', href: '/client/pets', icon: Dog },
        { name: 'Pasear', href: '/client/book', icon: MapPin },
        { name: 'Marketplace', href: '/client/marketplace', icon: ShoppingBag },
        { name: 'Configuración', href: '/client/settings', icon: Settings },
    ],
    walker: [
        { name: 'Inicio', href: '/walker', icon: LayoutDashboard },
        { name: 'Mi Agenda', href: '/walker/schedule', icon: Calendar },
        { name: 'Historial', href: '/walker/history', icon: MapPin },
        { name: 'Ganancias', href: '/walker/earnings', icon: ShoppingBag },
        { name: 'Perfil', href: '/walker/profile', icon: User },
    ],
    admin: [
        { name: 'Resumen', href: '/admin', icon: LayoutDashboard },
        { name: 'Validaciones', href: '/admin/validations', icon: ShieldCheck },
        { name: 'Paseos', href: '/admin/walks', icon: Dog },
        { name: 'Usuarios', href: '/admin/users', icon: User },
        { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
    ],
}

interface SidebarProps {
    role?: 'client' | 'walker' | 'admin'
}

export function Sidebar({ role = 'client' }: SidebarProps) {
    const pathname = usePathname()
    const items = navItems[role] || navItems.client

    return (
        <div className="flex h-full w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <span className="text-xl font-bold text-white">PetWalk</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4">
                <nav className="space-y-1">
                    {items.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-purple-600/20 text-purple-300 shadow-[0_0_20px_-5px_rgba(147,51,234,0.3)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t border-white/10 p-4">
                <form action="/auth/signout" method="POST">
                    <button
                        type="submit"
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
