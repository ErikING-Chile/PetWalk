"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export const GradientMesh = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute inset-0 z-0 overflow-hidden bg-background pointer-events-none", className)}>
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [-50, 50, -50],
                    y: [-20, 20, -20],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-purple-900/40 blur-[128px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [30, -30, 30],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-indigo-900/30 blur-[128px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4,
                }}
                className="absolute -bottom-[20%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-slate-900/50 blur-[128px]"
            />
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
        </div>
    )
}
