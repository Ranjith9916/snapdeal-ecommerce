import { useState } from 'react'
import { CARD_OFFERS, CardOffer, calculateCardDiscount, getBestCardOffer } from '../data/cardOffers'
import { useToast } from './Toast'

interface ProductCardOffersProps {
  productPrice: number
}

export default function ProductCardOffers({ productPrice }: ProductCardOffersProps) {
  const { addToast } = useToast()
  const [selectedOfferId, setSelectedOfferId] = useState<string>('hdfc-10')
  const [showAllModal, setShowAllModal] = useState(false)
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)

  const selectedOffer = CARD_OFFERS.find(o => o.id === selectedOfferId) || CARD_OFFERS[0]
  const currentSavings = calculateCardDiscount(productPrice, selectedOffer)
  const effectivePrice = Math.max(0, productPrice - currentSavings)
  const bestOfferData = getBestCardOffer(productPrice)

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard?.writeText(code)
    addToast(`Offer code "${code}" copied! It will be applied at checkout.`, 'success')
  }

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-rose-50/70 to-amber-50/50 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Bank & Card Offers</h3>
            <p className="text-[11px] text-gray-500 font-medium">Save extra up to ₹1,500 with credit & debit cards</p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-[#E40046] tracking-wide uppercase">
          6 OFFERS AVAILABLE
        </span>
      </div>

      {/* Interactive Bank Offer Selector Pills */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CARD_OFFERS.map((offer) => {
            const isSelected = selectedOfferId === offer.id
            const savings = calculateCardDiscount(productPrice, offer)
            return (
              <button
                key={offer.id}
                onClick={() => setSelectedOfferId(offer.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{offer.icon}</span>
                <span>{offer.bank}</span>
                {savings > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    -₹{savings}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Live Effective Price with Selected Card */}
        <div
          className="mt-3 p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-3"
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #fffbeb 100%)',
            borderColor: '#fecdd3',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#E40046] uppercase tracking-wider">
                PRICE WITH {selectedOffer.bank.toUpperCase()}:
              </span>
              {currentSavings > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.2 bg-green-600 text-white rounded-full">
                  SAVE ₹{currentSavings.toLocaleString()}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-gray-500">
                  (Min spend: ₹{selectedOffer.minSpend.toLocaleString()})
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-gray-900">
                ₹{(currentSavings > 0 ? effectivePrice : productPrice).toLocaleString()}
              </span>
              {currentSavings > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{productPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">{selectedOffer.discountText}</p>
          </div>

          <button
            onClick={() => handleCopyCode(selectedOffer.couponCode)}
            className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 hover:border-rose-400 text-[#E40046] font-extrabold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>USE {selectedOffer.couponCode}</span>
            <span>📋</span>
          </button>
        </div>

        {/* Card Offers List (Top 2 Preview) */}
        <div className="mt-3.5 space-y-2.5">
          {CARD_OFFERS.slice(0, 3).map((offer) => {
            const isExpanded = expandedOfferId === offer.id
            return (
              <div
                key={offer.id}
                className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/60 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">{offer.icon}</span>
                    <div>
                      <p className="font-extrabold text-gray-800">{offer.discountText}</p>
                      <p className="text-gray-500 mt-0.5 text-[11px] leading-relaxed">{offer.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyCode(offer.couponCode)}
                    className="text-[10px] font-bold text-[#E40046] hover:underline shrink-0"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Min spend: ₹{offer.minSpend.toLocaleString()}</span>
                  <button
                    onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
                    className="text-gray-500 hover:text-gray-800 font-semibold"
                  >
                    {isExpanded ? 'Hide T&C ▲' : 'View T&C ▼'}
                  </button>
                </div>

                {isExpanded && (
                  <ul className="mt-2 pt-2 border-t border-gray-200/60 space-y-1 text-[11px] text-gray-500 pl-4 list-disc">
                    {offer.terms.map((term, tIdx) => (
                      <li key={tIdx}>{term}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* View All Modal Trigger */}
        <button
          onClick={() => setShowAllModal(true)}
          className="w-full mt-3 py-2 text-center text-xs font-bold text-[#E40046] hover:underline flex items-center justify-center gap-1"
        >
          <span>View All 6 Bank & Card Offers</span>
          <span>→</span>
        </button>
      </div>

      {/* Full Offers Modal */}
      {showAllModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-amber-50">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="text-base font-extrabold text-gray-900">All Available Bank & Card Offers</h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Offers Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {CARD_OFFERS.map((offer) => (
                <div key={offer.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{offer.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-gray-500">{offer.bank}</span>
                        <h4 className="text-sm font-extrabold text-gray-900">{offer.discountText}</h4>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.couponCode)}
                      className="px-3 py-1.5 rounded-lg bg-[#E40046] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      {offer.couponCode}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{offer.description}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[11px] font-bold text-gray-700 mb-1">Terms & Conditions:</p>
                    <ul className="text-[11px] text-gray-500 space-y-0.5 list-disc pl-4">
                      {offer.terms.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => setShowAllModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
