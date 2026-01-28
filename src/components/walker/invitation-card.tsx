'use client'

import { Card } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Calendar, MapPin, Play, Navigation, Map as MapIcon, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { calculateDistance } from "@/utils/distance"
import { formatPrice } from "@/lib/formatters"
import { acceptBooking, rejectBooking, cancelWalkByWalker } from "@/app/(dashboard)/walker/actions"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dynamic from "next/dynamic"

// Leaflet fix for Next.js - handled dynamically usually but we need types here
// Use a wrapper or dynamic import for the map part
const MapView = dynamic<{ lat: number; lng: number }>(
    () => import('./invitation-map'),
    {
        ssr: false,
        loading: () => <div className="h-48 bg-gray-800 animate-pulse rounded-lg" />
    }
)

interface Booking {
    id: string
    status: string
    scheduled_at: string
    price: number
    pickup_address: string
    pets: {
        name: string
        breed: string
        photo_url?: string
    }
    profiles?: {
        full_name: string
        avatar_url?: string
    }
}

export function WalkerInvitationCard({ booking }: { booking: Booking }) {
    const [distanceInfo, setDistanceInfo] = useState<{ text: string, km: number } | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [addressText, setAddressText] = useState(booking.pickup_address)

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState("")

    useEffect(() => {
        // ... existing useEffects
    }, [booking.pickup_address])

    useEffect(() => {
        // ... existing useEffects
    }, [coords])

    const handleWalkerCancel = async () => {
        if (!cancelReason.trim()) return
        await cancelWalkByWalker(booking.id, cancelReason)
        setIsCancelModalOpen(false)
    }

    return (
        <Card variant="glass" className="border-l-4 border-l-pink-500 relative overflow-hidden transition-all duration-300">
            {/* ... Header & Info Sections (unchanged) ... */}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden border border-white/10 shrink-0">
                            {booking.pets?.photo_url ? (
                                <img src={booking.pets.photo_url} alt={booking.pets.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-white/5">
                                    <span className="text-xs text-gray-400">Sin foto</span>
                                </div>
                            )}
                        </div>
                        {booking.profiles?.avatar_url && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-700 z-20">
                                <img src={booking.profiles.avatar_url} alt="Owner" className="h-full w-full object-cover" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{booking.pets?.name}</h3>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400">{booking.pets?.breed}</span>
                            {booking.profiles?.full_name && (
                                <span className="text-xs text-pink-300 font-medium">Dueño: {booking.profiles.full_name}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-pink-300" suppressHydrationWarning>
                    ${formatPrice(booking.price || 0)}
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-300 mb-4 relative z-10">
                <div className="flex items-center gap-2" suppressHydrationWarning>
                    <Calendar size={14} className="text-pink-400" />
                    {new Date(booking.scheduled_at).toLocaleString()}
                </div>

                <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-pink-400 mt-1 shrink-0" />
                    <div>
                        <p>{addressText}</p>
                        {distanceInfo && (
                            <p className="text-xs text-pink-300 font-bold flex items-center gap-1 mt-1">
                                <Navigation size={10} />
                                A {distanceInfo.text} de tu ubicación
                            </p>
                        )}
                    </div>
                </div>

                {/* Map Button */}
                {coords && !showMap && (
                    <button
                        onClick={() => setShowMap(true)}
                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                    >
                        <MapIcon size={12} />
                        Ver ubicación en mapa
                    </button>
                )}
            </div>

            {/* Map Expansion */}
            {showMap && coords && (
                <div className="mb-4 relative rounded-lg overflow-hidden border border-white/10 h-48 animate-in fade-in zoom-in-95 duration-300">
                    <button
                        onClick={() => setShowMap(false)}
                        className="absolute top-2 right-2 z-[500] bg-gray-900/90 hover:bg-black text-white rounded-full p-2 border border-white/20 shadow-lg transition-transform active:scale-95"
                    >
                        <X size={16} />
                    </button>
                    <MapView lat={coords.lat} lng={coords.lng} />
                </div>
            )}

            <div className="relative z-10">
                {booking.status === 'requested' && (
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={async () => await rejectBooking(booking.id)}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg transition-colors border border-red-500/20"
                        >
                            Rechazar
                        </button>
                        <button
                            onClick={async () => await acceptBooking(booking.id)}
                            className="flex-[2] bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-lg transition-colors shadow-lg shadow-pink-900/20"
                        >
                            Aceptar Solicitud
                        </button>
                    </div>
                )}

                {booking.status === 'assigned' && (
                    <div className="flex flex-col gap-2">
                        <Link href={`/walker/walk/${booking.id}`}>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 animate-pulse">
                                <Navigation size={16} fill="white" />
                                Ir a recoger (Navegar)
                            </button>
                        </Link>
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center gap-2"
                        >
                            <X size={16} />
                            Cancelar Paseo (Paseador)
                        </button>
                    </div>
                )}

                {booking.status === 'in_progress' && (
                    <Link href={`/walker/walk/${booking.id}`}>
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors animate-pulse">
                            Ver Paseo en Curso
                        </button>
                    </Link>
                )}
            </div>

            {/* Cancellation Modal */}
            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancelar Paseo"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-300">Indica el motivo de la cancelación:</p>
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 min-h-[100px]"
                        placeholder="Escribe el motivo..."
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-lg">Volver</button>
                        <button
                            onClick={handleWalkerCancel}
                            disabled={!cancelReason.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg disabled:opacity-50"
                        >
                            Confirmar Cancelación
                        </button>
                    </div>
                </div>
            </Modal>
        </Card>
    )
}
