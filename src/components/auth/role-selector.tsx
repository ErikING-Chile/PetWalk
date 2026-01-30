"use client"

import { User, Dog } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface RoleSelectorProps {
    selectedRole: "client" | "walker"
    onSelect: (role: "client" | "walker") => void
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-200",
                    selectedRole === "client"
                        ? "border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-[1.02]"
                        : "border-white/10 bg-white/5 opacity-70 hover:opacity-100 hover:bg-white/10"
                )}
                onClick={() => onSelect("client")}
            >
                <div className="bg-purple-500/20 p-4 rounded-full mb-3">
                    <Dog className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-bold text-white text-center text-lg">Dueño</h3>
                <p className="text-xs text-center text-gray-400 mt-1">Quiero pasear a mi mascota</p>
            </button>

            <button
                type="button"
                className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-200",
                    selectedRole === "walker"
                        ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)] scale-[1.02]"
                        : "border-white/10 bg-white/5 opacity-70 hover:opacity-100 hover:bg-white/10"
                )}
                onClick={() => onSelect("walker")}
            >
                <div className="bg-pink-500/20 p-4 rounded-full mb-3">
                    <User className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="font-bold text-white text-center text-lg">Walker</h3>
                <p className="text-xs text-center text-gray-400 mt-1">Quiero ganar dinero paseando</p>
            </button>
        </div>
    )
}
