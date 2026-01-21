import { BottomNav } from "@/components/ui/bottom-nav"

export default function WalkerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen pb-20 bg-background text-foreground">
            {/* Darker, distinct gradient for Walker */}
            <div className="fixed inset-0 bg-gradient-to-br from-pink-900/20 via-black to-black -z-10" />

            <main className="container mx-auto px-4 py-6">
                {children}
            </main>

            <BottomNav role="walker" />
        </div>
    )
}
