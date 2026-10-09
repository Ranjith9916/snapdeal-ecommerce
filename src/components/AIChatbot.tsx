import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageIcon, CloseIcon, SendIcon, SparklesIcon, BotIcon } from './Icons'

interface Message {
  id: number
  text: string
  isBot: boolean
  products?: { name: string; price: string; discount: string }[]
  suggestions?: string[]
}

// Intent engine — keyword → response
function getBotReply(input: string): Omit<Message, 'id' | 'isBot'> {
  const q = input.toLowerCase()

  if (/hi|hello|hey|namaste|hii/.test(q)) {
    return {
      text: "Hello! 👋 Welcome to Snapdeal. I'm Snap, your personal shopping assistant. I can help you find products, compare prices, track orders, check deals, or give you personalised recommendations. What can I help you with today?",
      suggestions: ["Show me today's deals", 'I want to buy a phone', 'Track my order', "What's trending?"],
    }
  }

  if (/phone|mobile|smartphone|iphone|samsung|oneplus|redmi|vivo|oppo|realme/.test(q)) {
    return {
      text: "📱 Great choice! Here are some top smartphones available right now on Snapdeal:",
      products: [
        { name: 'vivo X100 Pro 5G', price: '₹89,999', discount: '10% off' },
        { name: 'Apple iPhone 15 Pro 128GB', price: '₹1,27,990', discount: '5% off' },
        { name: 'Samsung Galaxy S24 Ultra 5G', price: '₹1,29,999', discount: '10% off' },
      ],
      suggestions: ['Under ₹15,000 phones', 'Best camera phones', 'Compare Samsung vs Redmi'],
    }
  }

  if (/laptop|computer|macbook|dell|hp|lenovo|asus/.test(q)) {
    return {
      text: "💻 Here are the best laptops trending on Snapdeal right now:",
      products: [
        { name: 'Apple MacBook Air M2 13.6-inch', price: '₹99,990', discount: '13% off' },
        { name: 'ASUS ROG Zephyrus G14 Gaming Laptop', price: '₹1,49,990', discount: '17% off' },
        { name: 'Dell XPS 13 Plus Laptop', price: '₹1,59,990', discount: '16% off' },
      ],
      suggestions: ['Gaming laptops', 'Laptops under ₹40,000', 'Best battery life laptops'],
    }
  }

  if (/earphone|earbuds|headphone|headset|boat|sony|jbl|airpod/.test(q)) {
    return {
      text: "🎧 Top-rated audio products for you:",
      products: [
        { name: 'Sony WH-1000XM5 ANC Headphones', price: '₹26,990', discount: '23% off' },
        { name: 'Apple AirPods Pro (2nd Gen)', price: '₹20,990', discount: '16% off' },
        { name: 'boAt Airdopes 141 Bluetooth TWS', price: '₹1,299', discount: '71% off' },
      ],
      suggestions: ['Under ₹1000 earbuds', 'Best for gym', 'Noise cancelling headphones'],
    }
  }

  if (/fashion|dress|kurta|saree|shirt|jeans|clothes|wear|outfit/.test(q)) {
    return {
      text: "👗 Here's what's hot in fashion right now on Snapdeal:",
      products: [
        { name: "Levi's 511 Slim Fit Jeans", price: '₹2,199', discount: '45% off' },
        { name: 'Peter England Men Slim Fit Casual Shirt', price: '₹999', discount: '44% off' },
        { name: 'BIBA Women Printed Cotton Kurta', price: '₹1,499', discount: '50% off' },
      ],
      suggestions: ["Women's ethnic wear", "Men's casual shirts", 'New arrivals in fashion'],
    }
  }

  if (/beauty|skincare|makeup|face|serum|moisturizer|cream|lipstick/.test(q)) {
    return {
      text: "💄 Your beauty picks based on your browsing history:",
      products: [
        { name: 'Minimalist 10% Niacinamide Face Serum', price: '₹599', discount: '14% off' },
        { name: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel', price: '₹449', discount: '10% off' },
        { name: "L'Oreal Paris Revitalift Hyaluronic Acid Serum", price: '₹799', discount: '20% off' },
      ],
      suggestions: ['Best face serums', 'Anti-ageing skincare', 'Sunscreen under ₹300'],
    }
  }

  if (/deal|offer|discount|sale|cheap|budget|under/.test(q)) {
    return {
      text: "🔥 Today's hottest deals handpicked for you:",
      products: [
        { name: 'boAt Airdopes 141 Bluetooth TWS', price: '₹1,299', discount: '71% off' },
        { name: 'Prestige Iris Plus 750W Mixer Grinder', price: '₹2,999', discount: '52% off' },
        { name: 'Noise ColorFit Pulse 3 Smartwatch', price: '₹1,499', discount: '69% off' },
      ],
      suggestions: ['Flash Sale products', 'Under ₹500 deals', "Today's top 10"],
    }
  }

  if (/track|order|delivery|shipping|where|status|dispatch/.test(q)) {
    return {
      text: "📦 To track your order, go to My Orders in your profile or check your confirmation email. Click 'Go to My Orders' below to view full tracking status.",
      suggestions: ['Go to My Orders', 'Contact support', 'Return policy'],
    }
  }

  if (/return|refund|cancel|replace|exchange/.test(q)) {
    return {
      text: "↩️ Snapdeal offers a 7-day easy return policy on most products. Here's how it works:\n\n• Initiate return from My Orders within 7 days\n• Schedule a free pickup\n• Refund in 5–7 business days to original payment method",
      suggestions: ['Go to My Orders', 'Check refund status', 'Talk to support'],
    }
  }

  if (/trending|popular|viral|best seller|top/.test(q)) {
    return {
      text: "📈 Here's what's trending right now on Snapdeal:",
      products: [
        { name: 'vivo X100 Pro 5G', price: '₹89,999', discount: '10% off' },
        { name: 'Sony WH-1000XM5 ANC Headphones', price: '₹26,990', discount: '23% off' },
        { name: 'Apple MacBook Air M2 13.6-inch', price: '₹99,990', discount: '13% off' },
      ],
      suggestions: ['Trending in Electronics', 'Trending in Fashion', 'Most wished for'],
    }
  }

  if (/recommend|suggest|what should|help me find|looking for/.test(q)) {
    return {
      text: "✨ Based on verified popular picks, here are recommendations for you:",
      products: [
        { name: 'Samsung Galaxy S24 Ultra 5G', price: '₹1,29,999', discount: '10% off' },
        { name: 'Milton Thermosteel Flip Lid Flask 1000ml', price: '₹949', discount: '20% off' },
        { name: 'Atomic Habits by James Clear', price: '₹499', discount: '38% off' },
      ],
      suggestions: ['More Electronics picks', 'More Fashion picks', 'Surprise me!'],
    }
  }

  if (/compare|vs|difference|which is better|which one/.test(q)) {
    return {
      text: '⚖️ I can help you compare products! Try searching for products directly to view specs and ratings side-by-side.',
      suggestions: ['vivo vs Samsung', 'boAt vs Sony', 'Nike vs Puma'],
    }
  }

  if (/price|cost|how much|rate|expensive|affordable/.test(q)) {
    return {
      text: "💰 I can find products in any budget! What's your target price range?",
      suggestions: ['Under ₹1,000', 'Under ₹5,000', 'Under ₹20,000'],
    }
  }

  if (/surprise|random|anything|bored/.test(q)) {
    return {
      text: "🎲 Here's a surprise pick for you:",
      products: [
        { name: 'Sony WH-1000XM5 ANC Headphones', price: '₹26,990', discount: '23% off' },
      ],
      suggestions: ['Show more surprises', 'Gifts under ₹1,000', "Today's deals"],
    }
  }

  // Default fallback
  return {
    text: `I searched for "${input}"! Would you like to explore deals, browse by category, or check order status?`,
    suggestions: ["Show me today's deals", 'Track my order', "What's trending?"],
  }
}

const initialMessages: Message[] = [
  {
    id: 1,
    isBot: true,
    text: "Hi there! 👋 I'm Snap, your AI shopping assistant.\n\nLooking for top electronics, trending fashion, or tracking an existing order? How can I help you today?",
    suggestions: ["Show me today's deals", 'Phones & Laptops', 'Track my order', 'Fashion picks'],
  },
]

const quickReplies = ["Today's deals", 'Phones', 'Laptops', 'Track order']

interface AIChatbotProps {
  open: boolean
  onToggle: () => void
}

export default function AIChatbot({ open, onToggle }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleSuggestionClick = (s: string) => {
    if (s.toLowerCase().includes('my order') || s.toLowerCase().includes('track')) {
      navigate('/dashboard')
      onToggle()
      return
    }
    if (s.toLowerCase().includes('deal') || s.toLowerCase().includes('flash')) {
      navigate('/search?q=deal')
      onToggle()
      return
    }
    sendMessage(s)
  }

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now(), text, isBot: false }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const delay = 400 + Math.random() * 300
    setTimeout(() => {
      const reply = getBotReply(text)
      setMessages((prev) => [...prev, { id: Date.now() + 1, isBot: true, ...reply }])
      setTyping(false)
    }, delay)
  }

  return (
    <>
      {/* Chat Window */}
      <div
        className="fixed bottom-24 right-6 z-50 bg-white rounded-3xl flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width: 380,
          height: open ? 560 : 0,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ background: 'linear-gradient(135deg, #E40046 0%, #b0003a 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <SparklesIcon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Snap AI Assistant</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-red-200 text-xs">Online · Instant Assistance</p>
              </div>
            </div>
          </div>
          <button onClick={onToggle} className="text-white/70 hover:text-white transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.isBot ? 'items-start' : 'items-end flex-row-reverse'}`}>
              {msg.isBot && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: '#E40046' }}
                >
                  <BotIcon size={14} className="text-white" />
                </div>
              )}
              <div className="flex flex-col gap-2 max-w-[82%]">
                {/* Text bubble */}
                <div
                  className="px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-line"
                  style={{
                    backgroundColor: msg.isBot ? '#f8f8f8' : '#E40046',
                    color: msg.isBot ? '#333' : '#fff',
                    borderBottomLeftRadius: msg.isBot ? 4 : 16,
                    borderBottomRightRadius: msg.isBot ? 16 : 4,
                  }}
                >
                  {msg.text}
                </div>

                {/* Product chips */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {msg.products.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(p.name)}`)
                          onToggle()
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all hover:shadow-md hover:border-[#E40046]"
                        style={{ backgroundColor: '#fff', border: '1px solid #f0e0e8' }}
                      >
                        <span className="text-xs font-semibold text-gray-700 flex-1 pr-2">{p.name}</span>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs font-bold" style={{ color: '#E40046' }}>{p.price}</span>
                          <span className="text-[10px] text-green-600 font-semibold">{p.discount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestion chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-1 rounded-full text-[11px] font-semibold border transition-all hover:bg-red-50 hover:border-[#E40046] hover:text-[#E40046]"
                        style={{ borderColor: '#e5e5e5', color: '#555' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#E40046' }}>
                <BotIcon size={14} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: '#f8f8f8', borderBottomLeftRadius: 4 }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#E40046',
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {quickReplies.map((r) => (
            <button
              key={r}
              onClick={() => handleSuggestionClick(r)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:bg-red-50 hover:border-[#E40046] hover:text-[#E40046]"
              style={{ borderColor: '#e0e0e0', color: '#666' }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ backgroundColor: '#f5f5f5' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask anything — products, deals, orders..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
            />
            <button
              onClick={() => sendMessage(input)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: input.trim() ? '#E40046' : '#ddd' }}
            >
              <SendIcon size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #E40046 0%, #b0003a 100%)',
          boxShadow: '0 8px 32px rgba(228,0,70,0.4)',
        }}
      >
        {open ? <CloseIcon size={22} /> : <MessageIcon size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
            AI
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}
