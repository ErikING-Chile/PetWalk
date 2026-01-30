import { getPaymentMethods } from "./actions"
import { PaymentMethodsClient } from "./payment-methods-client"

export const dynamic = 'force-dynamic'

export default async function PaymentMethodsPage() {
    const methods = await getPaymentMethods()

    return <PaymentMethodsClient initialMethods={methods} />
}
