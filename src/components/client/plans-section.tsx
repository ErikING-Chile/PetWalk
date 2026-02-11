'use client'

import { useState } from 'react'
import { Check, Star, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Plan {
    id: string
    name: string
    description: string
    price: number
    walks_per_week: number
    duration_minutes: number
}

export function PlansSection({ plans, currentPlanId }: { plans: Plan[], currentPlanId?: string }) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleSubscribeClick = (plan: Plan) => {
        setPendingPlan(plan)
        setShowConfirmModal(true)
    }

    const confirmSubscription = async () => {
        if (!pendingPlan) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { error } = await supabase
                .from('subscriptions')
                .insert({
                    client_id: user.id,
                    plan_id: pendingPlan.id,
                    status: 'active'
                })

            if (error) throw error

            alert(`¡Suscrito al plan ${pendingPlan.name}!`)
            setShowConfirmModal(false)
            setPendingPlan(null)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error al suscribirse. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="py-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Planes Mensuales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isPopular = plan.name.includes('Estándar')
                    const isCurrent = currentPlanId === plan.id

                    return (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "relative p-6 rounded-2xl border flex flex-col h-full",
                                isCurrent
                                    ? "bg-purple-900/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                    : "bg-gray-900/50 border-white/10 hover:border-purple-500/50 transition-colors"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    MÁS POPULAR
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                            <div className="mb-6">
                                <span className="text-3xl font-bold text-white">${plan.price.toLocaleString()}</span>
                                <span className="text-gray-500 text-sm">/mes</span>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                        <Check size={12} className="text-green-400" />
                                    </div>
                                    <span>{plan.walks_per_week} paseos por semana</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                        <Check size={12} className="text-green-400" />
                                    </div>
                                    <span>{plan.duration_minutes} min de duración</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="bg-green-500/20 p-1 rounded-full">
                                        <Check size={12} className="text-green-400" />
                                    </div>
                                    <span>Reportes detallados y GPS</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handleSubscribeClick(plan)}
                                disabled={loading || isCurrent}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold transition-all border",
                                    isCurrent
                                        ? "bg-gray-700 text-gray-400 cursor-default border-transparent"
                                        : "bg-white/5 hover:bg-white/10 text-white hover:text-purple-300 border-white/10 hover:border-purple-500/50"
                                )}
                            >
                                {isCurrent ? 'Plan Actual' : 'Elegir Plan'}
                            </button>
                        </motion.div>
                    )
                })}
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && pendingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Confirmar Suscripción</h3>

                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                            <h4 className="font-bold text-purple-300 mb-1">{pendingPlan.name}</h4>
                            <div className="text-2xl font-bold text-white mb-2">
                                ${pendingPlan.price.toLocaleString()} <span className="text-sm font-normal text-gray-400">/mes</span>
                            </div>
                            <p className="text-sm text-gray-300">
                                Este es un plan de pago mensual recurrente. Se te cobrará automáticamente cada mes.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmSubscription}
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg transition-all"
                            >
                                {loading ? 'Procesando...' : 'Confirmar y Suscribirse'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </section>
    )
}
