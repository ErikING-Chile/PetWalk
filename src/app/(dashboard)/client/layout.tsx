import { BottomNav } from "@/components/ui/bottom-nav"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen pb-20 bg-background text-foreground">
            {/* Background gradient if desired globally */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black -z-10" />

            <main className="container mx-auto px-4 py-6">
                {children}
            </main>

            <SupportWidget />
            <BottomNav role="client" />
        </div>
    )
}

import { SupportWidget } from "@/components/support/support-widget"
