'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendChatMessage } from '@/app/(dashboard)/client/book/actions'
import { Send, User, Paperclip, Loader2, Image as ImageIcon } from 'lucide-react'

export function ChatComponent({ bookingId, currentUserId }: { bookingId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const supabase = createClient()
    const bottomRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Load initial messages
        supabase
            .from('chat_messages')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
                if (data) setMessages(data)
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            })

        // Subscribe to new messages & Presence
        const channel = supabase
            .channel(`chat-${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `booking_id=eq.${bookingId}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new])
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
                }
            )
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                const usersTyping: string[] = []

                for (const key in state) {
                    const userState = state[key] as any
                    // Check if *any* of the presences for this key are typing
                    // userState is an array of presence objects for that key
                    if (Array.isArray(userState)) {
                        userState.forEach((presence: any) => {
                            if (presence.typing && presence.user_id !== currentUserId) {
                                usersTyping.push(presence.user_id)
                            }
                        })
                    }
                }
                setTypingUsers([...new Set(usersTyping)])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [bookingId, supabase, currentUserId])

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)

        const channel = supabase.channel(`chat-${bookingId}`)

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        // Track typing immediately if not already (optimization: check if we just sent it?)
        // Simply tracking updates the state.
        await channel.track({ user_id: currentUserId, typing: true })

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(async () => {
            await channel.track({ user_id: currentUserId, typing: false })
        }, 2000)
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const content = input
        setInput('') // Optimistic clear

        // Stop typing immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        const channel = supabase.channel(`chat-${bookingId}`)
        await channel.track({ user_id: currentUserId, typing: false })

        await sendChatMessage(bookingId, content)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileName = `${bookingId}/${Date.now()}-${file.name}`
            const bucket = 'chat-uploads'

            // 1. Upload file
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            // 3. Send Message with Image
            await sendChatMessage(bookingId, "Sent an image", publicUrl, 'image')

        } catch (error) {
            console.error("Upload error:", error)
            alert("Error subiendo la imagen")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="flex flex-col h-[400px] bg-gray-900 rounded-xl border border-white/10 overflow-hidden relative">
            <div className="bg-white/5 p-3 border-b border-white/10 flex justify-between items-center z-10">
                <h3 className="font-bold text-white text-sm">Chat del Paseo</h3>
                {isUploading && <span className="text-xs text-purple-400 flex items-center gap-1"><Loader2 className="animate-spin w-3 h-3" /> Subiendo...</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-xs mt-10">
                        Inicia la conversación...
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId
                    const isImage = msg.type === 'image'

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-2 text-sm ${isMe
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                }`}>

                                {isImage ? (
                                    <div className="space-y-1">
                                        <a href={msg.media_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={msg.media_url}
                                                alt="Chat attachment"
                                                className="rounded-lg max-h-[200px] object-cover border border-black/20"
                                            />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="px-2 py-1">
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {/* Typing Indicator inside list or fixed? Fixed above input is better */}
                <div ref={bottomRef} />
            </div>

            {/* Typing Indicator Overlay */}
            {typingUsers.length > 0 && (
                <div className="absolute bottom-[65px] left-4 z-20">
                    <div className="flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                        <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></span>
                        </span>
                        <span className="text-[10px] text-gray-300 ml-1">Escribiendo...</span>
                    </div>
                </div>
            )}

            <div className="p-3 bg-white/5 border-t border-white/10 flex gap-2 items-center z-10">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    suppressHydrationWarning
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="shrink-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 disabled:opacity-50"
                    suppressHydrationWarning
                >
                    <Paperclip size={20} />
                </button>

                <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe..."
                    className="flex-1 h-10 bg-black/40 text-white text-sm rounded-full px-4 border border-white/10 focus:border-purple-500 outline-none min-w-0"
                    suppressHydrationWarning
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="shrink-0 h-10 w-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:opacity-50 transition-colors"
                    suppressHydrationWarning
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
