'use client'

import { useNotifications, Notification } from '@/context/notifications-context'
import { X, CheckCircle, Info, AlertTriangle, MessageCircle, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertOctagon,
    message: MessageCircle
}

const colors = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-200',
    success: 'bg-green-500/10 border-green-500/20 text-green-200',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
    error: 'bg-red-500/10 border-red-500/20 text-red-200',
    message: 'bg-purple-500/10 border-purple-500/20 text-purple-200'
}

export function NotificationToasts() {
    const { notifications, removeNotification } = useNotifications()
    const router = useRouter()

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <ToastItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => removeNotification(notification.id)}
                        onClick={() => {
                            if (notification.link) {
                                router.push(notification.link)
                                removeNotification(notification.id)
                            }
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

function ToastItem({ notification, onDismiss, onClick }: { notification: Notification, onDismiss: () => void, onClick: () => void }) {
    const Icon = icons[notification.type] || Info

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={cn(
                "pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl cursor-pointer hover:bg-white/5 transition-colors",
                colors[notification.type]
            )}
            onClick={onClick}
        >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm">{notification.title}</h4>
                <p className="text-xs opacity-90 mt-1 line-clamp-2">{notification.message}</p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onDismiss()
                }}
                className="text-white/40 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}
