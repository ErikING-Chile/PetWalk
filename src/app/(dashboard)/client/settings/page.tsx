import { Card } from "@/components/ui/card"
import { Bell, Shield, Moon, ChevronRight, HelpCircle } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Configuración
            </h1>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase ml-1">General</h3>
                <Card variant="glass" className="divide-y divide-white/5">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-purple-400" />
                            <span className="text-sm text-white">Notificaciones</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Moon size={20} className="text-blue-400" />
                            <span className="text-sm text-white">Apariencia</span>
                        </div>
                        <span className="text-xs text-gray-500">Oscuro</span>
                    </div>
                </Card>

                <h3 className="text-sm font-medium text-gray-500 uppercase ml-1 mt-6">Seguridad</h3>
                <Card variant="glass" className="divide-y divide-white/5">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-green-400" />
                            <span className="text-sm text-white">Privacidad y Datos</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <HelpCircle size={20} className="text-orange-400" />
                            <span className="text-sm text-white">Ayuda y Soporte</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                    </div>
                </Card>
            </div>

            <div className="pt-4 text-center">
                <p className="text-xs text-gray-600">PetWalk MVP v1.0.0</p>
            </div>
        </div>
    )
}
