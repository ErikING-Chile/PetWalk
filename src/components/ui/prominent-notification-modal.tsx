'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProminentNotificationProps {
    isOpen: boolean
    onClose: () => void
    title: string
    message: string
    type: 'success' | 'warning' | 'info' | 'error'
    actionLabel?: string
    onAction?: () => void
}

export function ProminentNotificationModal({
    isOpen,
    onClose,
    title,
    message,
    type,
    actionLabel,
    onAction
}: ProminentNotificationProps) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        setAudio(new Audio('/notification.mp3'))
    }, [])

    useEffect(() => {
        if (isOpen && audio) {
            audio.play().catch(e => console.log('Audio play failed', e))
            // Vibrate if supported
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200])
            }
        }
    }, [isOpen, audio])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with blur and pulse */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 backdrop-blur-md ${type === 'success' ? 'bg-green-900/40' :
                                type === 'warning' ? 'bg-yellow-900/40' :
                                    type === 'error' ? 'bg-red-900/40' :
                                        'bg-blue-900/40'
                            }`}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 15 }}
                        className={`relative w-full max-w-lg p-8 rounded-3xl border-2 shadow-2xl flex flex-col items-center text-center space-y-6 ${type === 'success' ? 'bg-gray-900/90 border-green-500 shadow-green-500/20' :
                                type === 'warning' ? 'bg-gray-900/90 border-yellow-500 shadow-yellow-500/20' :
                                    type === 'error' ? 'bg-gray-900/90 border-red-500 shadow-red-500/20' :
                                        'bg-gray-900/90 border-purple-500 shadow-purple-500/20'
                            }`}
                    >
                        {/* pulsing ring */}
                        <div className={`absolute -inset-1 rounded-3xl opacity-50 blur-lg animate-pulse ${type === 'success' ? 'bg-green-500' :
                                type === 'warning' ? 'bg-yellow-500' :
                                    type === 'error' ? 'bg-red-500' :
                                        'bg-purple-500'
                            }`} />

                        <div className="relative z-10 w-full flex flex-col items-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 text-5xl shadow-lg isolate ${type === 'success' ? 'bg-green-500 text-white shadow-green-500/50' :
                                    type === 'warning' ? 'bg-yellow-500 text-black shadow-yellow-500/50' :
                                        type === 'error' ? 'bg-red-500 text-white shadow-red-500/50' :
                                            'bg-purple-500 text-white shadow-purple-500/50'
                                }`}>
                                {type === 'success' ? '🎉' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🔔'}
                            </div>

                            <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                                {title}
                            </h2>

                            <p className="text-lg text-gray-300 font-medium max-w-sm mt-4">
                                {message}
                            </p>

                            <div className="flex gap-4 w-full mt-8">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cerrar
                                </button>
                                {actionLabel && onAction && (
                                    <button
                                        onClick={() => {
                                            onAction()
                                            onClose()
                                        }}
                                        className={`flex-1 py-4 px-6 rounded-xl font-bold text-white shadow-lg transform transition-all hover:scale-105 ${type === 'success' ? 'bg-green-600 hover:bg-green-500 shadow-green-600/30' :
                                                type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-600/30' :
                                                    type === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' :
                                                        'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                                            }`}
                                    >
                                        {actionLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
