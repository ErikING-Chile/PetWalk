export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'walker' | 'client'
                    full_name: string | null
                    email: string | null
                    phone: string | null
                    rut: string | null
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'walker' | 'client'
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    rut?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'walker' | 'client'
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    rut?: string | null
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            walker_profiles: {
                Row: {
                    user_id: string
                    status: 'pending' | 'approved' | 'rejected'
                    communes: string[] | null
                    available_days: string[] | null
                    available_hours: Json | null
                    pet_types: string[] | null
                    rating_avg: number | null
                    total_walks: number | null
                }
                Insert: {
                    user_id: string
                    status?: 'pending' | 'approved' | 'rejected'
                    communes?: string[] | null
                    available_days?: string[] | null
                    available_hours?: Json | null
                    pet_types?: string[] | null
                    rating_avg?: number | null
                    total_walks?: number | null
                }
                Update: {
                    user_id?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    communes?: string[] | null
                    available_days?: string[] | null
                    available_hours?: Json | null
                    pet_types?: string[] | null
                    rating_avg?: number | null
                    total_walks?: number | null
                }
            }
            pets: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    species: 'dog' | 'cat' | 'other'
                    breed: string | null
                    size: 's' | 'm' | 'l'
                    notes: string | null
                    photo_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    species: 'dog' | 'cat' | 'other'
                    breed?: string | null
                    size: 's' | 'm' | 'l'
                    notes?: string | null
                    photo_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    species?: 'dog' | 'cat' | 'other'
                    breed?: string | null
                    size?: 's' | 'm' | 'l'
                    notes?: string | null
                    photo_url?: string | null
                    created_at?: string
                }
            }
            walk_bookings: {
                Row: {
                    id: string
                    client_id: string
                    walker_id: string | null
                    pet_id: string
                    status: 'requested' | 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                    scheduled_at: string
                    duration_minutes: number
                    pickup_address: string
                    pickup_lat: number | null
                    pickup_lng: number | null
                    price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    walker_id?: string | null
                    pet_id: string
                    status?: 'requested' | 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                    scheduled_at: string
                    duration_minutes: number
                    pickup_address: string
                    pickup_lat?: number | null
                    pickup_lng?: number | null
                    price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    walker_id?: string | null
                    pet_id?: string
                    status?: 'requested' | 'assigned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
                    scheduled_at?: string
                    duration_minutes?: number
                    pickup_address?: string
                    pickup_lat?: number | null
                    pickup_lng?: number | null
                    price?: number
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
