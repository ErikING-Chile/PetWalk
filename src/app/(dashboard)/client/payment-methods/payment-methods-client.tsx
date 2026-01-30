"use client"

import { Card } from "@/components/ui/card"
import { CreditCard, Plus, Trash2, Check } from "lucide-react"
import { useState } from "react"
import { addPaymentMethod, setDefaultPaymentMethod, deletePaymentMethod, type PaymentMethod } from "./actions"
import { cn } from "@/lib/utils"

const CARD_BRANDS = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'amex', label: 'American Express' },
    { value: 'other', label: 'Otra' }
]

export function PaymentMethodsClient({ initialMethods }: { initialMethods: PaymentMethod[] }) {
    const [methods, setMethods] = useState(initialMethods)
    const [showAddForm, setShowAddForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddPaymentMethod = async (formData: FormData) => {
        setIsSubmitting(true)
        const result = await addPaymentMethod(formData)
        setIsSubmitting(false)

        if (result.success) {
            setShowAddForm(false)
            window.location.reload() // Refresh to get updated list
        } else {
            alert(result.error || 'Error al agregar método de pago')
        }
    }

    const handleSetDefault = async (id: string) => {
        const result = await setDefaultPaymentMethod(id)
        if (result.success) {
            window.location.reload()
        } else {
            alert(result.error || 'Error al establecer método por defecto')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este método de pago?')) return

        const result = await deletePaymentMethod(id)
        if (result.success) {
            window.location.reload()
        } else {
            alert(result.error || 'Error al eliminar método de pago')
        }
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Métodos de Pago</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Agregar Tarjeta
                </button>
            </div>

            {/* Add Payment Method Form */}
            {showAddForm && (
                <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Nueva Tarjeta</h2>
                    <form action={handleAddPaymentMethod} className="space-y-4">
                        {/* Card Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tipo de Tarjeta</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    name="card_type_btn"
                                    onClick={(e) => {
                                        const input = document.querySelector('input[name="card_type"]') as HTMLInputElement
                                        input.value = 'credit'
                                        e.currentTarget.parentElement?.querySelectorAll('button').forEach(b => b.classList.remove('bg-purple-500/20', 'text-purple-300'))
                                        e.currentTarget.classList.add('bg-purple-500/20', 'text-purple-300')
                                    }}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                >
                                    Crédito
                                </button>
                                <button
                                    type="button"
                                    name="card_type_btn"
                                    onClick={(e) => {
                                        const input = document.querySelector('input[name="card_type"]') as HTMLInputElement
                                        input.value = 'debit'
                                        e.currentTarget.parentElement?.querySelectorAll('button').forEach(b => b.classList.remove('bg-purple-500/20', 'text-purple-300'))
                                        e.currentTarget.classList.add('bg-purple-500/20', 'text-purple-300')
                                    }}
                                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                >
                                    Débito
                                </button>
                            </div>
                            <input type="hidden" name="card_type" defaultValue="credit" required />
                        </div>

                        {/* Card Brand */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Marca</label>
                            <select name="card_brand" className="glass-input w-full" required>
                                {CARD_BRANDS.map(brand => (
                                    <option key={brand.value} value={brand.value} className="bg-gray-900 text-white">
                                        {brand.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cardholder Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nombre en la Tarjeta</label>
                            <input
                                name="cardholder_name"
                                className="glass-input w-full"
                                placeholder="JUAN PÉREZ"
                                required
                            />
                        </div>

                        {/* Last Four Digits */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Últimos 4 Dígitos</label>
                            <input
                                name="last_four"
                                className="glass-input w-full"
                                placeholder="1234"
                                maxLength={4}
                                pattern="\d{4}"
                                required
                            />
                        </div>

                        {/* Expiry */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Mes Exp.</label>
                                <input
                                    name="expiry_month"
                                    type="number"
                                    className="glass-input w-full"
                                    placeholder="12"
                                    min="1"
                                    max="12"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Año Exp.</label>
                                <input
                                    name="expiry_year"
                                    type="number"
                                    className="glass-input w-full"
                                    placeholder="2026"
                                    min={new Date().getFullYear()}
                                    required
                                />
                            </div>
                        </div>

                        {/* Set as Default */}
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                            <input type="checkbox" name="is_default" value="true" className="rounded" />
                            Establecer como método de pago por defecto
                        </label>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary flex-1 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Tarjeta'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Payment Methods List */}
            <div className="space-y-4">
                {methods.length === 0 ? (
                    <Card variant="glass" className="p-8 text-center">
                        <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No tienes métodos de pago guardados</p>
                        <p className="text-sm text-gray-500 mt-1">Agrega una tarjeta para reservar más rápido</p>
                    </Card>
                ) : (
                    methods.map((method) => (
                        <Card key={method.id} variant="glass" className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <CreditCard className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white capitalize">
                                                {method.card_brand} •••• {method.last_four}
                                            </h3>
                                            {method.is_default && (
                                                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Check size={12} />
                                                    Por defecto
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {method.card_type === 'credit' ? 'Crédito' : 'Débito'} •
                                            Exp. {String(method.expiry_month).padStart(2, '0')}/{method.expiry_year}
                                        </p>
                                        <p className="text-xs text-gray-500">{method.cardholder_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!method.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Establecer por defecto
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(method.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
