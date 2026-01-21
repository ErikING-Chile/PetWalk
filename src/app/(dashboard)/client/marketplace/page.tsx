import { Card } from "@/components/ui/card"
import { ShoppingBag, Star, Tag } from "lucide-react"

export default function MarketplacePage() {
    const products = [
        { id: 1, name: "Correa Premium Retro", price: 25990, image: "bg-orange-500", rating: 4.8 },
        { id: 2, name: "Arnés Ergonómico", price: 34990, image: "bg-blue-500", rating: 4.9 },
        { id: 3, name: "Pack Premios Naturales", price: 12990, image: "bg-green-500", rating: 4.7 },
        { id: 4, name: "GPS Tracker Pro", price: 45990, image: "bg-purple-500", rating: 5.0 },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Marketplace
            </h1>

            <Card variant="glass" className="mb-6 p-6 from-purple-900/40 to-pink-900/40 border-purple-500/30">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Tag className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Ofertas Especiales</h2>
                        <p className="text-gray-400 text-sm">Descuentos exclusivos para dueños PetWalk</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <Card key={product.id} variant="interactive" className="overflow-hidden group">
                        <div className={`h-32 w-full ${product.image} opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-white text-sm line-clamp-2">{product.name}</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-purple-300">${product.price.toLocaleString()}</span>
                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                    <Star size={10} fill="currentColor" />
                                    <span>{product.rating}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
