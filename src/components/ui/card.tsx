import React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    variant?: "default" | "glass" | "interactive"
}

export function Card({
    className,
    variant = "default",
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl p-6 transition-all duration-300",
                {
                    "bg-card text-card-foreground shadow-sm": variant === "default",
                    "glass-card": variant === "glass",
                    "glass-card hover:scale-[1.02] cursor-pointer": variant === "interactive"
                },
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
