"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface WalkTimerProps {
    startedAt: string | null
    durationMinutes: number
    className?: string
}

export function WalkTimer({ startedAt, durationMinutes, className }: WalkTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [progress, setProgress] = useState(100)
    const [status, setStatus] = useState<'waiting' | 'active' | 'completed'>('waiting')

    useEffect(() => {
        if (!startedAt) {
            setStatus('waiting')
            return
        }

        const start = new Date(startedAt).getTime()
        const durationMs = durationMinutes * 60 * 1000
        const end = start + durationMs

        const tick = () => {
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft("00:00")
                setProgress(0)
                setStatus('completed')
                return
            }

            setStatus('active')

            // Calculate progress percentage
            const elapsed = now - start
            const pct = Math.max(0, 100 - (elapsed / durationMs) * 100)
            setProgress(pct)

            // Format time
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }

        tick()
        const interval = setInterval(tick, 1000)

        return () => clearInterval(interval)
    }, [startedAt, durationMinutes])

    if (status === 'waiting') return null

    return (
        <div className={cn("relative overflow-hidden rounded-xl bg-gray-900 border border-white/10 p-4", className)}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className={cn("w-4 h-4 animate-pulse", status === 'completed' ? "text-green-400" : "text-purple-400")} />
                    <span className="text-sm font-bold text-white">
                        {status === 'completed' ? 'Paseo Finalizado' : 'Tiempo Restante'}
                    </span>
                </div>
                <span className="text-xl font-mono font-bold text-white tabular-nums tracking-wider">
                    {timeLeft}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-1000 ease-linear",
                        status === 'completed' ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}
