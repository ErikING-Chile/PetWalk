"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { getWalkers, createBooking } from "./actions"
import { getMyPets } from "./pet-loader"
import { Calendar, Clock, MapPin, Check, User, Dog } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BookingPage() {
    const [step, setStep] = useState(1)
    const [pets, setPets] = useState<any[]>([])
    const [walkers, setWalkers] = useState<any[]>([])

    // Form State
    const [selectedPet, setSelectedPet] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [duration, setDuration] = useState(30)
    const [selectedWalker, setSelectedWalker] = useState("")
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'transfer' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        getMyPets().then(setPets)
        getWalkers().then(setWalkers)
    }, [])

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const price = duration === 30 ? 5000 : duration === 60 ? 9000 : 15000

    const handlePayment = async () => {
        setIsProcessing(true)
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Use the native form submission via requestSubmit or calling action directly
        // We'll call the server action via a hidden form submission or ref logic
        // For simplicity in this structure: element.submit() on the form
        const form = document.getElementById('booking-form') as HTMLFormElement
        if (form) {
            // Append payment info to FormData not easily possible without hidden inputs
            // Let's just rely on the hidden inputs we have and assume 'credit' for simplicity or add a hidden input
            // But we can trigger the action directly if we weren't using the form action attribute
            form.requestSubmit()
        }
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Progress Bar */}
            <div className="flex justify-between mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={cn("h-1 w-full mx-1 rounded-full transition-all", s <= step ? "bg-purple-500" : "bg-white/10")} />
                ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-6">
                {step === 1 && "Selecciona tu Mascota"}
                {step === 2 && "¿Cuándo paseamos?"}
                {step === 3 && "Elige un Paseador"}
                {step === 4 && "Confirma tu Reserva"}
            </h1>

            <form action={createBooking} id="booking-form">
                <input type="hidden" name="petId" value={selectedPet} />
                <input type="hidden" name="walkerId" value={selectedWalker} />
                <input type="hidden" name="date" value={date} />
                <input type="hidden" name="time" value={time} />
                <input type="hidden" name="duration" value={duration} />
                <input type="hidden" name="price" value={price} />

                {/* STEP 1: PET SELECTION */}
                {step === 1 && (
                    <div className="space-y-4">
                        {pets.map(pet => (
                            <Card
                                key={pet.id}
                                variant="interactive"
                                className={cn("flex items-center gap-4 border-2", selectedPet === pet.id ? "border-purple-500 bg-purple-500/10" : "border-transparent")}
                                onClick={() => setSelectedPet(pet.id)}
                            >
                                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <Dog className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{pet.name}</h3>
                                    <p className="text-sm text-gray-400">{pet.breed}</p>
                                </div>
                                {selectedPet === pet.id && <Check className="ml-auto text-purple-500" />}
                            </Card>
                        ))}
                        {pets.length === 0 && (
                            <p className="text-gray-400">No tienes mascotas. Añade una primero.</p>
                        )}
                        <button
                            type="button"
                            disabled={!selectedPet}
                            onClick={handleNext}
                            className="btn-primary w-full mt-4 disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* STEP 2: DATE & TIME */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Fecha</label>
                            <input
                                type="date"
                                className="glass-input w-full cursor-pointer"
                                min={(() => {
                                    const d = new Date();
                                    const year = d.getFullYear();
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const day = String(d.getDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                })()}
                                value={date || ''}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Hora</label>
                            <input
                                type="time"
                                className="glass-input w-full cursor-pointer"
                                value={time || ''}
                                min={(() => {
                                    if (!date) return undefined;
                                    const now = new Date();
                                    const year = now.getFullYear();
                                    const month = String(now.getMonth() + 1).padStart(2, '0');
                                    const day = String(now.getDate()).padStart(2, '0');
                                    const today = `${year}-${month}-${day}`;
                                    if (date === today) {
                                        // If today, set min time to current time + 1 hour padding visually if supported, 
                                        // though standard time input min is HH:MM.
                                        // We'll use current HH:MM for 'min' to at least block past hours loosely.
                                        return now.toTimeString().slice(0, 5);
                                    }
                                    return undefined;
                                })()}
                                onClick={(e) => e.currentTarget.showPicker()}
                                onChange={(e) => setTime(e.target.value)}
                            />
                            <p className="text-xs text-purple-300/80 mt-1">
                                * Programar con al menos 1 hora de anticipación.
                            </p>
                            <p className="text-xs text-gray-400">
                                * Disponibilidad de paseadores: Todo el día (08:00 - 20:00).
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Duración</label>
                            <div className="flex gap-2">
                                {[30, 60, 90].map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDuration(d)}
                                        className={cn("flex-1 py-3 rounded-xl border font-medium text-sm", duration === d ? "bg-white text-black border-white" : "glass-card text-gray-400 border-white/10")}
                                    >
                                        {d} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error Message for Time Validation */}
                        {(() => {
                            const now = new Date();
                            if (date && time) {
                                const selectedDateTime = new Date(`${date}T${time}`);
                                const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

                                if (selectedDateTime < now) {
                                    return (
                                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs">
                                            ⚠️ La fecha seleccionada ya pasó.
                                        </div>
                                    )
                                }

                                if (selectedDateTime < oneHourFromNow) {
                                    return (
                                        <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 text-xs">
                                            ⚠️ <strong>Reserva Inmediata:</strong> Solo se mostrarán paseadores cercanos (3 km).
                                        </div>
                                    )
                                }
                            }
                            return null;
                        })()}

                        <button
                            type="button"
                            disabled={(() => {
                                if (!date || !time) return true;
                                const now = new Date();
                                const selectedDateTime = new Date(`${date}T${time}`);
                                if (selectedDateTime < now) return true;
                                return false;
                            })()}
                            onClick={handleNext}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* STEP 3: WALKER SELECTION */}
                {step === 3 && (
                    <div className="space-y-4">
                        {(() => {
                            const now = new Date();
                            const selectedDateTime = new Date(`${date}T${time}`);
                            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
                            const isImmediate = selectedDateTime < oneHourFromNow;

                            const filteredWalkers = isImmediate
                                ? walkers.filter(w => w.distance !== undefined && w.distance <= 3.0)
                                : walkers;

                            if (filteredWalkers.length === 0) {
                                return (
                                    <div className="p-4 rounded-xl bg-red-500/10 text-red-200 text-sm border border-red-500/20">
                                        No hay paseadores disponibles {isImmediate ? 'cerca de ti (< 3km) para servicio inmediato.' : 'para esta fecha.'}
                                        {isImmediate && <p className="mt-2 text-xs opacity-70">Intenta programar con más de 1 hora de anticipación para ver más opciones.</p>}
                                    </div>
                                )
                            }

                            return filteredWalkers.map(w => (
                                <Card
                                    key={w.user_id}
                                    variant="interactive"
                                    className={cn("flex items-center gap-4 border-2", selectedWalker === w.user_id ? "border-purple-500 bg-purple-500/10" : "border-transparent")}
                                    onClick={() => setSelectedWalker(w.user_id)}
                                >
                                    <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                                        <User />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-white truncate">
                                                {(Array.isArray(w.profiles) ? w.profiles[0]?.full_name : w.profiles?.full_name) || 'Paseador'}
                                            </h3>
                                            {typeof w.distance === 'number' && (
                                                <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", w.distance <= 3 ? "bg-green-500/20 text-green-300" : "bg-white/10 text-gray-400")}>
                                                    <MapPin className="w-3 h-3" />
                                                    {w.distance.toFixed(1)} km
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-yellow-500">★ {w.rating_avg || 'New'}</p>
                                            {w.birth_date && (
                                                <span className="text-xs text-gray-500">
                                                    • {new Date().getFullYear() - new Date(w.birth_date).getFullYear()} años
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedWalker === w.user_id && <Check className="ml-auto text-purple-500" />}
                                </Card>
                            ))
                        })()}
                        {walkers.length === 0 && (
                            <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-200 text-sm">
                                No hay paseadores disponibles. (Crea una cuenta paseador y apruébala en DB para probar)
                                <br />
                                <span className="opacity-50 text-xs text-white block mt-2">
                                    *Para MVP One-Shot, puedes registrarte como otro usuario Paseador.
                                </span>
                            </div>
                        )}
                        <button
                            type="button"
                            disabled={!selectedWalker}
                            onClick={handleNext}
                            className="btn-primary w-full mt-4 disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* STEP 4: CONFIRMATION */}
                {step === 4 && (
                    <div className="space-y-6">
                        <Card variant="glass" className="space-y-4">
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span className="text-gray-400">Servicio</span>
                                <span className="font-bold text-white">Paseo {duration} min</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                                <span className="text-gray-400">Fecha</span>
                                <span className="font-bold text-white">{date} a las {time}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold pt-2">
                                <span className="text-white">Total</span>
                                <span className="text-purple-400">${price.toLocaleString()}</span>
                            </div>
                        </Card>

                        {/* MOCK PAYMENT SELECTOR */}
                        <div className="space-y-3">
                            <label className="text-sm text-gray-300">Método de Pago (Simulación)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('credit')}
                                    className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'credit' ? "bg-purple-500/20 border-purple-500 text-purple-200" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                                >
                                    <div className="w-8 h-5 rounded bg-gradient-to-tr from-gray-400 to-gray-600 shadow-sm" />
                                    <span className="text-xs font-bold">Crédito / Débito</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", paymentMethod === 'transfer' ? "bg-purple-500/20 border-purple-500 text-purple-200" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10")}
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
                                        $
                                    </div>
                                    <span className="text-xs font-bold">Transferencia</span>
                                </button>
                            </div>
                        </div>

                        {/* PROCESSING OVERLAY */}
                        {isProcessing && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-white font-bold animate-pulse">Procesando Pago Seguro...</p>
                                <p className="text-sm text-gray-400 mt-2">Conectando con banco simulado...</p>
                            </div>
                        )}

                        <button
                            type="button" // Changed to button to handle click manually
                            onClick={handlePayment}
                            disabled={!paymentMethod || isProcessing}
                            className="btn-primary w-full text-lg shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Procesando...' : `Pagar $${price.toLocaleString()}`}
                        </button>
                    </div>
                )}
            </form>

            {/* Back Button */}
            {step > 1 && (
                <button onClick={handleBack} className="w-full text-gray-500 text-sm mt-4 hover:text-white">
                    Volver
                </button>
            )}
        </div>
    )
}
