"use client"

import { useEffect, useState } from "react"
import { Bell, X, Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Notification = {
    id: string
    title: string
    message: string
    read: boolean
    created_at: string
    link?: string
    type?: 'info' | 'success' | 'warning' | 'error'
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        }
    }

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
    }

    useEffect(() => {
        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    const newNotif = payload.new as Notification
                    // Check if it belongs to current user
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user && user.id === newNotif.user_id) {
                            setNotifications(prev => [newNotif, ...prev])
                            setUnreadCount(prev => prev + 1)
                        }
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <Bell className={cn("w-6 h-6", unreadCount > 0 ? "text-purple-400" : "text-gray-400")} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2">
                        <Card variant="glass" className="overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-semibold text-white text-sm">Notificaciones</h3>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-xs">
                                        No tienes notificaciones
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map(n => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "p-3 hover:bg-white/5 transition-colors relative group",
                                                    !n.read && "bg-purple-500/5"
                                                )}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <h4 className={cn("text-xs font-bold", !n.read ? "text-white" : "text-gray-400")}>
                                                            {n.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-300 leading-snug">
                                                            {n.message}
                                                        </p>
                                                        <span className="text-[10px] text-gray-500">
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    {!n.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                markAsRead(n.id)
                                                            }}
                                                            className="text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Marcar como leída"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
