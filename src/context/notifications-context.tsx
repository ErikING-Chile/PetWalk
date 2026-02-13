'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { RealtimeChannel } from '@supabase/supabase-js'
import { ProminentNotificationModal } from '@/components/ui/prominent-notification-modal'

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

    const [prominentNotification, setProminentNotification] = useState<{
        isOpen: boolean
        title: string
        message: string
        type: 'success' | 'warning' | 'info' | 'error'
        actionLabel?: string
        onAction?: () => void
        link?: string
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    })

    const closeProminent = useCallback(() => {
        setProminentNotification(prev => ({ ...prev, isOpen: false }))
    }, [])

    const showProminent = useCallback((data: Omit<typeof prominentNotification, 'isOpen'>) => {
        setProminentNotification({ ...data, isOpen: true })
        // If there is a link but no action, we can make the action "Ver"
        if (data.link && !data.onAction) {
            // We'll handle navigation in the component or simple redirect here if needed, 
            // but the modal props expect onAction.
            // Let's just pass a wrapper if needed or let the modal handle it
        }
    }, [])

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

            // 2. Channel for Walk Status Changes
            const bookingChannel = supabase.channel('public:walk_bookings')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'walk_bookings',
                    },
                    (payload) => {
                        console.log('🔔 UPDATE Payload:', payload) // Debug
                        const newBooking = payload.new as any
                        const oldBooking = payload.old as any

                        router.refresh() // REFRESH DATA ON UPDATE

                        if (newBooking.client_id === user.id || newBooking.walker_id === user.id) {
                            if (newBooking.status !== oldBooking.status) {
                                // Default subtle notification
                                let title = 'Actualización de Paseo'
                                let message = `El estado del paseo ha cambiado a: ${newBooking.status}`
                                let type: NotificationType = 'info'

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
                                    type,
                                    link
                                })

                                // PROMINENT NOTIFICATION LOGIC
                                // 1. Owner: When Walker Accepts (status assigned)
                                if (newBooking.client_id === user.id && newBooking.status === 'assigned') {
                                    console.log('🔔 Triggering Owner Prominent Notification')
                                    setProminentNotification({
                                        isOpen: true,
                                        title: '¡Paseo Asignado!',
                                        message: 'Un Walker ha aceptado tu solicitud y viene en camino. ¡Prepárate!',
                                        type: 'success',
                                        actionLabel: 'Ver Detalles',
                                        onAction: () => router.push(link)
                                    })
                                }
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
                        console.log('🔔 INSERT Payload:', payload) // Debug
                        const newBooking = payload.new as any

                        router.refresh() // REFRESH DATA ON INSERT

                        // 2. Walker: New Request (status requested) - EXAGGERATED
                        // Note: In a real app we'd filter by location/availability here or server-side.
                        // For now we rely on the client-side check if this walker sees it? 
                        // Actually, 'INSERT' broadcasts to everyone. 
                        // Wait, if I am a walker, I should see this? 
                        // The user request is "notificacion exagerada de que llego una solicitud de paseo".
                        // Usually walkers poll or get specific notifications.
                        // If we are listening to ALL inserts, every walker gets it.
                        // Let's assume for MVP/Demo we want logged-in walkers to see it.
                        // We check if current user is a walker? 
                        // Just checking if they are NOT the client might be enough for this demo context,
                        // or better, if they are in the 'walker' dashboard path or have walker role.
                        // Let's keep it simple: if you are NOT the creator, it's a request for you (conceptually).

                        if (newBooking.walker_id === user.id && newBooking.status === 'requested') {
                            console.log('🔔 Triggering Walker Prominent Notification')
                            // Direct request to specific walker
                            setProminentNotification({
                                isOpen: true,
                                title: '¡NUEVA SOLICITUD!',
                                message: '¡Tienes un nuevo paseo solicitado! Responde rápido antes de que expire.',
                                type: 'warning', // Warning color is nice and urgent
                                actionLabel: 'Ver Solicitud',
                                onAction: () => router.push(`/walker/walk/${newBooking.id}`)
                            })
                        } else if (!newBooking.walker_id && newBooking.status === 'requested') {
                            // Public request (Marketplace style) - if we supported that.
                            // Current app seems to select walker directly or show list.
                            // If `walker_id` is null, it's open. 
                            // If I'm a walker (how do we know?), show it.
                            // For safety, let's stick to the existing logic:
                            // "Has recibido una nueva solicitud" -> implied direct assignment or relevant to user.
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
    }, [addNotification, supabase, pathname, router])

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            <ProminentNotificationModal
                {...prominentNotification}
                onClose={closeProminent}
            />
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
