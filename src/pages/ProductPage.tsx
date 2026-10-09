import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRightIcon, StarIcon, HeartIcon, CartIcon, ShieldIcon, TruckIcon, RotateCcwIcon } from '../components/Icons'
import Footer from '../components/Footer'
import { getProductById, getProducts, getReviews, getCategories, addReview, ProductModel, ReviewModel } from '../services/products'
import { checkProductPurchaseStatus } from '../services/orders'
import { trackProductView } from '../components/RecentlyViewed'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'

const tabs = ['description', 'specifications', 'reviews', 'faqs', 'warranty'] as const

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  
  const [product, setProduct] = useState<ProductModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErrorType, setLoadErrorType] = useState<'not_found' | 'network_error' | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewModel[]>([])
  const [relatedProductsData, setRelatedProductsData] = useState<ProductModel[]>([])

  const [categoryName, setCategoryName] = useState('Category')
  const [categorySlug, setCategorySlug] = useState('')

  // Review state
  const [purchaseStatus, setPurchaseStatus] = useState<{ purchased: boolean; delivered: boolean }>({ purchased: false, delivered: false })
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const loadProductData = async () => {
    if (!id) return
    setLoading(true)
    setLoadErrorType(null)

    if (!navigator.onLine) {
      setLoadErrorType('network_error')
      setLoading(false)
      return
    }

    try {
      const p = await getProductById(id)
      if (!p) {
        setLoadErrorType('not_found')
        setProduct(null)
      } else {
        setProduct(p)
        const revs = await getReviews(id)
        setReviewsData(revs)

        if (p.category_id) {
          const categories = await getCategories()
          const cat = categories.find(c => c.id === p.category_id)
          if (cat) {
            setCategoryName(cat.name)
            setCategorySlug(cat.slug)
          }

          const related = await getProducts({ categoryId: p.category_id, limit: 6 })
          setRelatedProductsData(related.filter(r => r.id !== id).slice(0, 4))
        }
      }
    } catch (err) {
      console.error('Error loading product details:', err)
      setLoadErrorType('network_error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductData()
  }, [id])

  // Check purchase status for review eligibility
  useEffect(() => {
    if (user && id) {
      checkProductPurchaseStatus(user.id, id).then(setPurchaseStatus)
    } else {
      setPurchaseStatus({ purchased: false, delivered: false })
    }
  }, [user, id])

  // Track this product view in localStorage for RecentlyViewed
  useEffect(() => { if (product?.id) trackProductView(product.id) }, [product?.id])

  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [qty, setQty] = useState(1)
  const [selectedColor, setSelectedColor] = useState(0)
  const [added, setAdded] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const getPerspectiveLabel = (index: number) => {
    if (product?.image_labels && product.image_labels[index]) {
      return product.image_labels[index]
    }
    switch (index) {
      case 0: return 'Front View'
      case 1: return 'Model / Lifestyle'
      case 2: return 'Close-Up Detail'
      case 3: return 'Side / Back Angle'
      default: return `Perspective ${index + 1}`
    }
  }

  const handleMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100))
    setZoomPos({ x, y })
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product) return

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Rating must be between 1 and 5 stars.')
      return
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError('Please provide a constructive review comment (at least 5 characters).')
      return
    }

    setSubmittingReview(true)
    setReviewError('')
    setReviewSuccess('')

    const result = await addReview(user.id, product.id, reviewRating, reviewComment)
    setSubmittingReview(false)

    if (result.success) {
      setReviewSuccess('Thank you! Your verified review has been published.')
      setReviewComment('')
      // Refresh reviews list
      const updatedRevs = await getReviews(product.id)
      setReviewsData(updatedRevs)
    } else {
      setReviewError(result.error || 'Failed to submit review.')
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#E40046] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) {
    if (loadErrorType === 'network_error') {
      return (
        <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-amber-200">
            📡
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Network Connection Issue</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            Unable to fetch product details due to a network interruption or server timeout. Please verify your internet connection and try again.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={loadProductData} className="px-6 py-2.5 bg-[#E40046] text-white rounded-xl font-bold hover:bg-[#d0003f] transition-all">
              ↻ Retry Connection
            </button>
            <Link to="/" className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-8">The product with ID "{id}" could not be found in our catalog. It may have been removed or the link is invalid.</p>
        <Link to="/" className="inline-block px-8 py-3 bg-[#E40046] text-white rounded-xl font-bold hover:bg-[#d0003f] transition-colors">
          Return Home
        </Link>
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  
  const handleWishlistToggle = () => {
    if (wishlisted) removeFromWishlist(product.id)
    else addToWishlist(product.id)
  }

  const handleAddToCart = async () => {
    const colName = ['Midnight Black', 'Platinum Silver', 'Midnight Blue'][selectedColor] || 'Default'
    const { success } = await addToCart(product.id, qty, colName)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleBuyNow = async () => {
    const colName = ['Midnight Black', 'Platinum Silver', 'Midnight Blue'][selectedColor] || 'Default'
    await addToCart(product.id, qty, colName)
    navigate('/checkout')
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format']
  const rating = 4.5
  const reviewsCount = 1420
  const offersList = product.offers || []
  const specsObj = product.specs || {}
  const specsList = Object.entries(specsObj).map(([k, v]) => ({ label: k, value: String(v) }))

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#E40046]">Home</Link>
          <ChevronRightIcon size={13} />
          {categorySlug ? (
            <>
              <Link to={`/search?cat=${categorySlug}`} className="hover:text-[#E40046]">{categoryName}</Link>
              <ChevronRightIcon size={13} />
            </>
          ) : null}
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

          {/* Gallery — 5 cols */}
          <div className="lg:col-span-5">
            <div className="sticky top-[120px]">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Images sidebar with real-world perspective labels */}
                <div className="hidden sm:flex flex-col gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActiveImg(i)}
                      onClick={() => setActiveImg(i)}
                      className={`group/thumb w-[88px] rounded-xl overflow-hidden bg-gray-50 flex flex-col items-center justify-center p-1.5 transition-all duration-200 hover:scale-105 relative text-left ${
                        activeImg === i ? 'ring-2 ring-[#E40046] ring-offset-2 shadow-xs' : 'ring-1 ring-gray-200 hover:ring-gray-300'
                      }`}
                      title={getPerspectiveLabel(i)}
                    >
                      <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
                        <img
                          src={img}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format';
                          }}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 group-hover/thumb:text-gray-800 line-clamp-1 mt-0.5 tracking-tight">
                        {getPerspectiveLabel(i)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Main image with Zoom Loupe & Perspective Navigation */}
                <div
                  className="flex-1 bg-gray-50 rounded-3xl p-6 relative flex items-center justify-center group overflow-hidden cursor-crosshair select-none min-h-[420px]"
                  onMouseMove={handleMouseMoveZoom}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                >
                  {/* Perspective & Counter Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 text-[11px] font-bold text-gray-800 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E40046] animate-pulse"></span>
                      {activeImg + 1} / {images.length} · {getPerspectiveLabel(activeImg)}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-1 text-[10px] font-semibold text-gray-500 bg-white/80 rounded-md">
                      Hover to zoom
                    </span>
                  </div>

                  {/* Action buttons: Lightbox & Wishlist */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsLightboxOpen(true)
                      }}
                      className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:scale-105 hover:text-[#E40046] transition-all text-gray-600 border border-gray-100"
                      title="Fullscreen Zoom View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-all border border-gray-100"
                      title="Save to Wishlist"
                    >
                      <HeartIcon size={18} fill={wishlisted ? '#E40046' : 'none'} stroke={wishlisted ? '#E40046' : '#666'} />
                    </button>
                  </div>

                  {/* Previous Perspective Button */}
                  {images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all text-gray-700 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Previous image style"
                    >
                      ❮
                    </button>
                  )}

                  {/* Next Perspective Button */}
                  {images.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all text-gray-700 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Next image style"
                    >
                      ❯
                    </button>
                  )}

                  {/* Main Product Image with Interactive Zoom */}
                  <img
                    src={images[activeImg] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format'}
                    alt={`${product.name} - ${getPerspectiveLabel(activeImg)}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format';
                    }}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200"
                    style={{
                      maxHeight: 450,
                      transform: isZooming ? 'scale(2.1)' : 'scale(1)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mobile horizontal thumbnail strip */}
              <div className="flex sm:hidden gap-2 overflow-x-auto py-3 px-1 scrollbar-none">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1.5 transition-all ${
                      activeImg === i ? 'ring-2 ring-[#E40046]' : 'ring-1 ring-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen High-Res Lightbox Modal */}
            {isLightboxOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setIsLightboxOpen(false)}
              >
                <div
                  className="relative max-w-4xl w-full bg-white rounded-3xl p-6 overflow-hidden flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-full flex items-center justify-between mb-4 border-b pb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">{getPerspectiveLabel(activeImg)} ({activeImg + 1} of {images.length})</p>
                    </div>
                    <button
                      onClick={() => setIsLightboxOpen(false)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="w-full h-[60vh] flex items-center justify-center bg-gray-50 rounded-2xl p-4 overflow-hidden relative">
                    <img
                      src={images[activeImg]}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
                    />
                  </div>

                  {/* Lightbox thumbnail row */}
                  <div className="flex gap-2.5 mt-4 overflow-x-auto max-w-full py-1">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden p-1 bg-gray-50 border transition-all ${
                          activeImg === i ? 'border-[#E40046] ring-2 ring-[#E40046]/30' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info — 4 cols */}
          <div className="lg:col-span-4">
            <p className="text-[12px] font-bold text-[#E40046] uppercase tracking-wider mb-1">{product.brand}</p>
            <h1 className="text-[22px] font-bold text-gray-900 leading-snug mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold" style={{ backgroundColor: '#22c55e' }}>
                <StarIcon size={14} fill="white" stroke="none" />
                <span className="text-[14px]">{rating}</span>
              </div>
              <a href="#reviews" className="text-[13px] text-gray-500 font-medium hover:text-[#E40046] hover:transition-colors">
                {reviewsCount.toLocaleString()} Ratings & Reviews
              </a>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[32px] font-extrabold text-gray-900 leading-none">₹{product.price.toLocaleString()}</span>
              <span className="text-[18px] text-gray-400 line-through font-medium">₹{(product.original_price || product.price).toLocaleString()}</span>
              <span className="text-[16px] font-bold px-2.5 py-0.5 rounded-full text-green-700 bg-green-100 ml-2">
                {product.discount}% OFF
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mb-4">EMI from <span className="font-bold text-gray-700">{product.emi || `₹${Math.round(product.price / 12).toLocaleString()}/mo`}</span> · No Cost EMI available</p>

            {/* Color selector */}
            <div className="mb-4">
              <p className="text-[13px] font-bold text-gray-700 mb-2">Color: <span className="font-medium text-gray-500">{['Midnight Black', 'Platinum Silver', 'Midnight Blue'][selectedColor]}</span></p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)}
                    className="w-9 h-9 rounded-xl transition-all hover:scale-110"
                    style={{ backgroundColor: c, border: selectedColor === i ? '3px solid #E40046' : '3px solid #f0f0f0', boxShadow: selectedColor === i ? '0 0 0 2px #fff, 0 0 0 4px #E40046' : 'none' }} />
                ))}
              </div>
            </div>

            {/* Offers */}
            <div className="mb-5 rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
              <p className="px-4 py-2.5 font-bold text-[14px] text-gray-800" style={{ borderBottom: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>Available Offers</p>
              {offersList.map((o: any, i: number) => (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3" style={{ borderBottom: i < offersList.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                  <span className="text-base shrink-0">{o.icon || '🏷️'}</span>
                  <p className="text-[12px] font-medium text-gray-700">{o.text || o.description || JSON.stringify(o)}</p>
                </div>
              ))}
            </div>

            {/* Pincode checker */}
            <PincodeChecker />

            {/* Delivery & trust */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3">
                <TruckIcon size={16} style={{ color: '#E40046' }} />
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Free Delivery</p>
                  <p className="text-[12px] text-gray-500">Tomorrow by 6 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcwIcon size={16} style={{ color: '#22c55e' }} />
                <p className="text-[13px] font-medium text-gray-700">7-Day Easy Return Policy</p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldIcon size={16} style={{ color: '#3b82f6' }} />
                <p className="text-[13px] font-medium text-gray-700">{product.specs?.['Warranty'] || '1 Year Brand Warranty'}</p>
              </div>
            </div>
          </div>

          {/* Purchase box — 3 cols */}
          <div className="lg:col-span-3">
            <div className="sticky top-[120px] rounded-3xl p-5 space-y-4" style={{ border: '1px solid #f0f0f0', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
              <div>
                <span className="text-[28px] font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
                <span className="ml-2 text-[14px] font-bold text-green-600">{product.discount}% off</span>
              </div>
              <p className="text-[13px] text-gray-500">
                {(product.stock_quantity ?? 10) <= 5 && (product.stock_quantity ?? 10) > 0 ? (
                  <>Only <span className="font-bold text-orange-600">{product.stock_quantity} left</span> in stock</>
                ) : (product.stock_quantity ?? 10) === 0 ? (
                  <span className="font-bold text-red-500">Out of Stock</span>
                ) : (
                  <span className="font-semibold text-green-600">In Stock</span>
                )}
              </p>

              {/* Qty */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-gray-700">Qty:</span>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1.5px solid #eee' }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-gray-700 hover:bg-gray-50 font-bold transition-all">−</button>
                  <span className="px-4 text-[14px] font-bold text-gray-900 border-x border-gray-100">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(Math.max(1, product.stock_quantity || 10), q + 1))} className="px-3 py-2 text-gray-700 hover:bg-gray-50 font-bold transition-all">+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: added ? '#22c55e' : '#E40046' }}>
                <CartIcon size={18} />
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10">
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="shrink-0 px-5 py-2.5 rounded-xl text-[14px] font-semibold capitalize transition-all"
                style={{
                  backgroundColor: activeTab === tab ? '#E40046' : '#f5f5f5',
                  color: activeTab === tab ? '#fff' : '#666',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none p-6 rounded-2xl" style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}>
              <p className="text-[15px] text-gray-700 leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Technical Specifications
              </h3>
              <div className="max-w-2xl">
                {specsList.length > 0 ? specsList.map((spec, i) => (
                  <div key={i} className="flex py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                    <div className="w-1/3 text-[14px] font-semibold text-gray-500">{spec.label}</div>
                    <div className="w-2/3 text-[14px] font-bold text-gray-900">{spec.value}</div>
                  </div>
                )) : <div className="text-gray-500">No specifications provided.</div>}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-8 p-6 rounded-2xl mb-6" style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}>
                <div className="text-center shrink-0">
                  <p className="text-[56px] font-extrabold text-gray-900 leading-none">{rating}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} size={16} fill={i < Math.floor(rating) ? '#FBBF24' : '#eee'} stroke="none" />
                    ))}
                  </div>
                  <p className="text-[13px] text-gray-500">{reviewsCount.toLocaleString()} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-gray-600 w-3">{star}</span>
                      <StarIcon size={11} fill="#FBBF24" stroke="none" />
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${[72, 18, 6, 3, 1][5 - star]}%`, backgroundColor: '#FBBF24' }} />
                      </div>
                      <span className="text-[11px] text-gray-400 w-8">{[72, 18, 6, 3, 1][5 - star]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WRITE A REVIEW SECTION */}
              <div className="p-6 rounded-2xl mb-6 bg-white border border-gray-100 shadow-sm">
                <h4 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                  <span>✍️</span> Rate & Review this Product
                </h4>

                {!user ? (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[13px] font-bold text-gray-800">Have you purchased this item?</p>
                      <p className="text-[12px] text-gray-500">Sign in to share your verified review and help other shoppers.</p>
                    </div>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-login-modal'))}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#E40046' }}
                    >
                      Sign In to Review
                    </button>
                  </div>
                ) : reviewsData.some(r => r.user_id === user.id) ? (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                    <span>✓</span> You have already reviewed this product. Thank you for your feedback!
                  </div>
                ) : !purchaseStatus.delivered ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                    <span>🛡️</span>
                    <span>
                      <strong>Verified Buyer Policy:</strong> Only customers with a delivered order for this product can submit a review. If you recently ordered it, you can review once delivered.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewSuccess && (
                      <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                        {reviewSuccess}
                      </div>
                    )}
                    {reviewError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                        {reviewError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Rating</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <StarIcon
                              size={22}
                              fill={star <= reviewRating ? '#FBBF24' : '#e5e7eb'}
                              stroke="none"
                            />
                          </button>
                        ))}
                        <span className="text-xs font-extrabold text-gray-700 ml-2">
                          {reviewRating} out of 5 stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Feedback</label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you like or dislike about this product? (Minimum 5 characters)"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-[#E40046] transition-colors"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-95"
                        style={{ backgroundColor: '#E40046', opacity: submittingReview ? 0.7 : 1 }}
                      >
                        {submittingReview ? 'Submitting…' : 'Submit Verified Review'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {reviewsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this product!</div>
              ) : (
                reviewsData.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl" style={{ border: '1px solid #f0f0f0' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[14px]"
                        style={{ background: 'linear-gradient(135deg, #E40046 0%, #b0003a 100%)' }}>
                        {(r.profiles?.first_name?.[0] || 'A').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[14px] text-gray-800">
                          {r.profiles?.first_name} {r.profiles?.last_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon key={i} size={11} fill={i < r.rating ? '#FBBF24' : '#eee'} stroke="none" />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[14px] text-gray-700 leading-relaxed">{r.comment}</p>
                    <p className="text-[12px] text-gray-400 mt-2">👍 {r.helpful_count} people found this helpful</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {[
                { q: 'Does it work with iPhone and Android?', a: 'Yes, the Sony WH-1000XM5 works with both iOS and Android via the Sony Headphones Connect app.' },
                { q: 'Is the ANC better than Bose QuietComfort 45?', a: 'Most professional reviews rate XM5 ANC slightly higher, especially for low-frequency noise like airplane engines.' },
                { q: 'Can I use them for gaming?', a: 'Yes, but there is a slight Bluetooth latency. For gaming without latency, use the included 3.5mm cable.' },
              ].map((faq) => (
                <details key={faq.q} className="rounded-2xl overflow-hidden" style={{ border: '1px solid #f0f0f0' }}>
                  <summary className="px-5 py-4 cursor-pointer font-semibold text-[14px] text-gray-800 bg-white hover:bg-gray-50 transition-all">{faq.q}</summary>
                  <p className="px-5 py-4 text-[14px] text-gray-600 leading-relaxed" style={{ backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>{faq.a}</p>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-[16px] font-bold text-gray-800 mb-2">🛡️ {product.warranty || '1 Year Brand Warranty'}</p>
              <p className="text-[14px] text-gray-600 leading-relaxed">This product is covered by official manufacturer warranty. For warranty claims, visit any authorized service centre with your purchase invoice. Online warranty registration recommended within 30 days of purchase.</p>
            </div>
          )}
        </div>

        {/* Related products */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-gray-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProductsData.map((p) => (
              <Link to={`/product/${p.id}`} key={p.id}
                className="bg-white rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all"
                style={{ border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'} alt={p.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-3">
                  <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#E40046] transition-colors">{p.name}</p>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md" style={{ backgroundColor: '#22c55e' }}>★ 4.5</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-extrabold text-gray-900">₹{p.price.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400 line-through">₹{(p as any).original_price?.toLocaleString()}</span>
                    <span className="text-[11px] font-bold text-green-600">{p.discount}% off</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function PincodeChecker() {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [deliveryMsg, setDeliveryMsg] = useState('')

  const check = () => {
    if (!/^\d{6}$/.test(pin)) { setStatus('error'); setDeliveryMsg('Enter a valid 6-digit PIN code.'); return }
    setStatus('checking')
    setTimeout(() => {
      // Simulate delivery lookup based on PIN
      const firstDigit = pin[0]
      if (['1', '2', '3', '4', '5', '6'].includes(firstDigit)) {
        setStatus('ok')
        setDeliveryMsg('Free delivery by Tomorrow, 8:00 PM')
      } else if (firstDigit === '7') {
        setStatus('ok')
        setDeliveryMsg('Delivery in 2–3 days. Delivery charge: ₹49')
      } else {
        setStatus('error')
        setDeliveryMsg('Delivery not available to this PIN code currently.')
      }
    }, 800)
  }

  return (
    <div className="mb-5 p-4 rounded-2xl" style={{ border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
      <p className="text-[13px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">
        <span>📍</span> Check Delivery
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={pin}
          maxLength={6}
          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setStatus('idle') }}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="Enter 6-digit PIN code"
          className="flex-1 px-3 py-2 text-[13px] rounded-xl outline-none transition-all"
          style={{ border: status === 'error' ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb', backgroundColor: '#fff' }}
        />
        <button onClick={check} disabled={status === 'checking'}
          className="px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#E40046', opacity: status === 'checking' ? 0.7 : 1 }}>
          {status === 'checking' ? '…' : 'Check'}
        </button>
      </div>
      {status === 'ok' && <p className="mt-2 text-[12px] font-semibold text-green-600">✓ {deliveryMsg}</p>}
      {status === 'error' && <p className="mt-2 text-[12px] font-semibold text-red-500">✕ {deliveryMsg}</p>}
    </div>
  )
}
