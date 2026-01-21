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

    useEffect(() => {
        getMyPets().then(setPets)
        getWalkers().then(setWalkers)
    }, [])

    const handleNext = () => setStep(s => s + 1)
    const handleBack = () => setStep(s => s - 1)

    const price = duration === 30 ? 5000 : duration === 60 ? 9000 : 15000

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
                            <input type="date" className="glass-input w-full" onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Hora</label>
                            <input type="time" className="glass-input w-full" onChange={(e) => setTime(e.target.value)} />
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
                        <button
                            type="button"
                            disabled={!date || !time}
                            onClick={handleNext}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {/* STEP 3: WALKER SELECTION */}
                {step === 3 && (
                    <div className="space-y-4">
                        {walkers.map(w => (
                            <Card
                                key={w.user_id}
                                variant="interactive"
                                className={cn("flex items-center gap-4 border-2", selectedWalker === w.user_id ? "border-purple-500 bg-purple-500/10" : "border-transparent")}
                                onClick={() => setSelectedWalker(w.user_id)}
                            >
                                <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                                    <User />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">{w.profiles?.full_name || 'Paseador'}</h3>
                                    <p className="text-xs text-yellow-500">★ {w.rating_avg || 'New'}</p>
                                </div>
                                {selectedWalker === w.user_id && <Check className="ml-auto text-purple-500" />}
                            </Card>
                        ))}
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

                        <button
                            type="submit"
                            className="btn-primary w-full text-lg shadow-xl shadow-purple-500/30"
                        >
                            Confirmar y Pagar
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
