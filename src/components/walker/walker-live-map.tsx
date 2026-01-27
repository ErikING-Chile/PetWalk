'use client'

import dynamic from 'next/dynamic'

const WalkerLiveMap = dynamic(() => import('./walker-map-core'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-800 animate-pulse" />
})

export default WalkerLiveMap
