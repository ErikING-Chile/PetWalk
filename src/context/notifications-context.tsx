'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { RealtimeChannel } from '@supabase/supabase-js'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    duration?: number
    link?: string
}

interface NotificationsContextType {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newNotification = { ...notification, id }
        setNotifications((prev) => [...prev, newNotification])

        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(id)
            }, notification.duration || 5000)
        }
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    useEffect(() => {
        let channels: RealtimeChannel[] = []

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Channel for Chat Messages
            const chatChannel = supabase.channel('public:chat_messages')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'chat_messages',
                    },
                    (payload) => {
                        const newMessage = payload.new as any
                        // Check if we are on the chat page for this booking
                        const isOnChatPage = pathname?.includes(newMessage.booking_id)

                        if (newMessage.sender_id !== user.id && !isOnChatPage) {
                            addNotification({
                                title: 'Nuevo Mensaje',
                                message: 'Has recibido un nuevo mensaje',
                                type: 'message',
                                link: pathname?.includes('/walker/') ? `/walker/walk/${newMessage.booking_id}` : `/client/track/${newMessage.booking_id}`
                            })
                        }
                    }
                )
                .subscribe()
            channels.push(chatChannel)

            // 2. Channel for Walk Status Changes (Bookings)
            const bookingChannel = supabase.channel('public:walk_bookings')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'walk_bookings',
                    },
                    (payload) => {
                        const newBooking = payload.new as any
                        const oldBooking = payload.old as any

                        if (newBooking.client_id === user.id || newBooking.walker_id === user.id) {
                            if (newBooking.status !== oldBooking.status) {
                                let title = 'Actualización de Paseo'
                                let message = `El estado del paseo ha cambiado a: ${newBooking.status}`

                                switch (newBooking.status) {
                                    case 'assigned': message = '¡Tu paseo ha sido asignado!'; break;
                                    case 'in_progress': message = '¡El paseo ha comenzado!'; break;
                                    case 'completed': message = 'El paseo ha finalizado.'; break;
                                    case 'cancelled': message = 'El paseo ha sido cancelado.'; break;
                                }

                                const link = newBooking.walker_id === user.id ? `/walker/walk/${newBooking.id}` : `/client/track/${newBooking.id}`

                                addNotification({
                                    title,
                                    message,
                                    type: 'info',
                                    link
                                })
                            }
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'walk_bookings',
                    },
                    (payload) => {
                        const newBooking = payload.new as any
                        if (newBooking.walker_id === user.id && newBooking.status === 'requested') {
                            addNotification({
                                title: 'Nueva Solicitud de Paseo',
                                message: 'Has recibido una nueva solicitud.',
                                type: 'success',
                                link: `/walker/walk/${newBooking.id}`
                            })
                        }
                    }
                )
                .subscribe()
            channels.push(bookingChannel)
        }

        setupRealtime()

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel))
        }
    }, [addNotification, supabase, pathname])

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationsContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider')
    }
    return context
}
