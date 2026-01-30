"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type PaymentMethod = {
    id: string
    user_id: string
    card_type: 'credit' | 'debit'
    card_brand: string
    last_four: string
    expiry_month: number
    expiry_year: number
    cardholder_name: string
    is_default: boolean
    created_at: string
    updated_at: string
}

/**
 * Get all payment methods for the current user
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching payment methods:', error)
        return []
    }

    return data || []
}

/**
 * Get the default payment method for the current user
 */
export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

    if (error) {
        // No default payment method found is not an error
        return null
    }

    return data
}

/**
 * Add a new payment method
 */
export async function addPaymentMethod(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    const cardType = formData.get('card_type') as 'credit' | 'debit'
    const cardBrand = formData.get('card_brand') as string
    const lastFour = formData.get('last_four') as string
    const expiryMonth = parseInt(formData.get('expiry_month') as string)
    const expiryYear = parseInt(formData.get('expiry_year') as string)
    const cardholderName = formData.get('cardholder_name') as string
    const isDefault = formData.get('is_default') === 'true'

    // Validate required fields
    if (!cardType || !cardBrand || !lastFour || !expiryMonth || !expiryYear || !cardholderName) {
        return { success: false, error: 'Todos los campos son requeridos' }
    }

    // Validate last four digits
    if (lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) {
        return { success: false, error: 'Los últimos 4 dígitos deben ser números' }
    }

    // Validate expiry
    if (expiryMonth < 1 || expiryMonth > 12) {
        return { success: false, error: 'Mes de expiración inválido' }
    }

    const currentYear = new Date().getFullYear()
    if (expiryYear < currentYear) {
        return { success: false, error: 'Año de expiración inválido' }
    }

    const { error } = await supabase
        .from('payment_methods')
        .insert({
            user_id: user.id,
            card_type: cardType,
            card_brand: cardBrand,
            last_four: lastFour,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            cardholder_name: cardholderName,
            is_default: isDefault
        })

    if (error) {
        console.error('Error adding payment method:', error)
        return { success: false, error: 'Error al agregar método de pago' }
    }

    revalidatePath('/client/payment-methods')
    return { success: true }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(paymentMethodId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    // The trigger will handle unsetting other defaults
    const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error setting default payment method:', error)
        return { success: false, error: 'Error al establecer método por defecto' }
    }

    revalidatePath('/client/payment-methods')
    return { success: true }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'No autenticado' }
    }

    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting payment method:', error)
        return { success: false, error: 'Error al eliminar método de pago' }
    }

    revalidatePath('/client/payment-methods')
    return { success: true }
}
