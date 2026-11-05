import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Eye, ShoppingCart, X, Check, ArrowRight } from 'lucide-react';
import { addToCart, openCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import { getProductCardPricing } from '../utils/pricingUtils';
import { resolveColorValue } from '../utils/colorResolver';
import CleanProductImage from './CleanProductImage';

/**
 * Intelligent helper to extract key technical specifications (CPU, GPU, RAM, Storage, etc.)
 * from title, description, variants, or features to match Apple's modern spec-bar layout:
 * Example: "10-core CPU | 10-core GPU | 16GB | 512GB"
 */
export const extractProductKeySpecs = (prod) => {
  if (!prod) return ['Apple Silicon', 'Retina Display', 'Official Warranty'];

  const rawTitle = (prod.name || prod.title || '').trim();
  const rawDesc = (prod.description || '').trim();
  const lowerTitle = rawTitle.toLowerCase();
  const lowerCat = (prod.category?.name || prod.category || '').toLowerCase();

  const specs = [];

  // 1. Check for explicit specs or features in product data
  if (Array.isArray(prod.specs) && prod.specs.length > 0) {
    return prod.specs.slice(0, 4);
  }
  if (Array.isArray(prod.features) && prod.features.length > 0) {
    const cleanFeats = prod.features
      .map(f => typeof f === 'string' ? f.split(':')[1]?.trim() || f.trim() : '')
      .filter(f => f && f.length < 30);
    if (cleanFeats.length >= 3) return cleanFeats.slice(0, 4);
  }

  // 2. Extract CPU cores / chip
  const cpuMatch = rawTitle.match(/(\d+[-‑]core\s+CPU)/i) || rawDesc.match(/(\d+[-‑]core\s+CPU)/i);
  if (cpuMatch) {
    specs.push(cpuMatch[1].replace('‑', '-'));
  } else {
    const chipMatch = rawTitle.match(/\b(M[1-5](?:\s*(?:Pro|Max|Ultra))?|A1[5-9](?:\s*Pro)?|S\d+)\s+chip\b/i);
    if (chipMatch) {
      specs.push(chipMatch[0]);
    }
  }

  // 3. Extract GPU cores
  const gpuMatch = rawTitle.match(/(\d+[-‑]core\s+GPU)/i) || rawDesc.match(/(\d+[-‑]core\s+GPU)/i);
  if (gpuMatch) {
    specs.push(gpuMatch[1].replace('‑', '-'));
  }

  // 4. Extract Unified Memory / RAM
  const ramMatch = rawTitle.match(/\b(8GB|16GB|18GB|24GB|32GB|36GB|48GB|64GB|128GB)\b/i) ||
                   rawDesc.match(/\b(8GB|16GB|18GB|24GB|32GB|36GB|48GB|64GB|128GB)\s*(?:Unified\s*Memory|RAM)\b/i);
  if (ramMatch) {
    specs.push(ramMatch[1].toUpperCase());
  }

  // 5. Extract Storage (SSD / Flash)
  const storageMatch = rawTitle.match(/\b(128GB|256GB|512GB|1TB|2TB|4TB|8TB)\b/i) ||
                       rawDesc.match(/\b(128GB|256GB|512GB|1TB|2TB|4TB|8TB)\s*(?:SSD|Storage)\b/i);
  if (storageMatch) {
    specs.push(storageMatch[1].toUpperCase());
  }

  // If we found at least 2 distinct specs from title/desc, return them
  if (specs.length >= 2) {
    return specs.slice(0, 4);
  }

  // 6. Category-intelligent Apple fallbacks if specs were not explicitly found in title
  if (lowerCat.includes('mac') || lowerTitle.includes('macbook') || lowerTitle.includes('imac') || lowerTitle.includes('mac mini') || lowerTitle.includes('mac studio')) {
    if (lowerTitle.includes('air')) return ['10-core CPU', '10-core GPU', '16GB', '512GB'];
    if (lowerTitle.includes('pro')) return ['12-core CPU', '18-core GPU', '18GB', '512GB'];
    if (lowerTitle.includes('mini')) return ['10-core CPU', '10-core GPU', '16GB', '256GB'];
    if (lowerTitle.includes('imac')) return ['8-core CPU', '8-core GPU', '16GB', '256GB'];
    if (lowerTitle.includes('studio')) return ['14-core CPU', '30-core GPU', '36GB', '512GB'];
    return ['Apple Silicon', '16GB Unified Memory', '512GB SSD', 'Liquid Retina'];
  }

  if (lowerCat.includes('iphone') || lowerTitle.includes('iphone')) {
    if (lowerTitle.includes('pro')) return ['A18 Pro chip', '48MP Fusion Camera', 'Super Retina XDR', '128GB'];
    return ['A18 chip', 'Camera Control', '48MP 2x Telephoto', '128GB'];
  }

  if (lowerCat.includes('ipad') || lowerTitle.includes('ipad')) {
    if (lowerTitle.includes('pro')) return ['Ultra Retina XDR', 'M4 chip', 'Face ID', '256GB'];
    if (lowerTitle.includes('air')) return ['Liquid Retina', 'M2 chip', 'Touch ID', '128GB'];
    return ['10.9" Liquid Retina', 'A14 Bionic', 'USB-C', '64GB'];
  }

  if (lowerCat.includes('watch') || lowerTitle.includes('watch')) {
    return ['Always-On Retina', 'S10 SiP', '50m Water Resistant', 'Blood Oxygen'];
  }

  if (lowerCat.includes('airpod') || lowerTitle.includes('airpod')) {
    return ['Active Noise Cancellation', 'Spatial Audio', 'Transparency Mode', 'USB-C'];
  }

  if (lowerCat.includes('tv') || lowerTitle.includes('apple tv') || lowerTitle.includes('homepod')) {
    return ['4K High Frame Rate', 'Dolby Vision', 'A15 Bionic', 'Siri Remote'];
  }

  return ['Official Apple Warranty', 'Fast Shipping', '100% Genuine'];
};

/**
 * Clean up title (remove trailing internal Apple part numbers like MC245B/A, etc.)
 */
export const cleanAppleTitle = (rawTitle) => {
  if (!rawTitle) return 'Apple Product';
  return rawTitle.replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();
};

/**
 * Standard Fallback Colors for Apple devices if product has no colors defined
 */
const DEFAULT_APPLE_COLORS = [
  { name: 'Midnight', value: '#1e2530', colorHex: '#1e2530' },
  { name: 'Sky Blue', value: '#7dc9f7', colorHex: '#7dc9f7' },
  { name: 'Silver', value: '#d8d9dc', colorHex: '#d8d9dc' },
  { name: 'Starlight', value: '#f4ede4', colorHex: '#f4ede4' }
];

export default function AppleProductCard({
  product,
  selectedColor: controlledColor,
  onColorChange,
  isWishlisted: controlledWishlist,
  onToggleWishlist,
  onAddToCart: controlledAddToCart,
  className = ''
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const prodId = product?._id || product?.id;
  const rawTitle = product?.name || product?.title || 'Apple Product';
  const cleanTitle = cleanAppleTitle(rawTitle);

  // Pricing calculations
  const pricing = getProductCardPricing(product);
  const sellingPrice = pricing.sellingPrice || product?.price || 0;
  const originalMrp = pricing.originalMrp || sellingPrice;
  const hasDiscount = pricing.hasDiscount && originalMrp > sellingPrice;
  const discountPercent = pricing.discountPercent || (hasDiscount ? Math.round(((originalMrp - sellingPrice) / originalMrp) * 100) : 0);
  const savingsAmount = hasDiscount ? (originalMrp - sellingPrice) : 0;

  // Colors resolution
  const rawColors = Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : DEFAULT_APPLE_COLORS;
  const normalizedColors = rawColors.map(c => {
    const name = typeof c === 'string' ? c : (c.name || 'Standard');
    const val = typeof c === 'string' ? c : (c.value || c.colorHex || c.name || '');
    const colorHex = resolveColorValue(c?.colorHex || c?.value || val);
    const img = typeof c === 'object' && c.image ? c.image : null;
    return { name, colorHex, image: img };
  });

  // Color selection state (internal fallback if uncontrolled)
  const [internalColor, setInternalColor] = useState(normalizedColors[0]?.name || 'Standard');
  const activeColor = controlledColor !== undefined ? controlledColor : internalColor;

  // Active product image based on selected color
  const resolveActiveImage = () => {
    // Check if current color has a matched image in colorImages or variant
    if (product?.colorImages && product.colorImages[activeColor]) {
      return product.colorImages[activeColor];
    }
    const matchedColorObj = normalizedColors.find(c => c.name.toLowerCase() === activeColor.toLowerCase());
    if (matchedColorObj?.image) {
      return matchedColorObj.image;
    }
    if (product?.displayImage) return product.displayImage;
    if (product?.image) return product.image;
    if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
    return '/mac_nav/macbook_air.png';
  };

  const currentDisplayImage = resolveActiveImage();

  // Wishlist state
  const { wishlistItems } = useSelector((state) => state.wishlist || { wishlistItems: [] });
  const isItemInReduxWishlist = wishlistItems?.some(w => (w._id || w.id) === prodId);
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const isWishlistActive = controlledWishlist !== undefined ? controlledWishlist : (localWishlisted || isItemInReduxWishlist);

  // Quick View Modal State
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Specs extraction
  const keySpecs = extractProductKeySpecs(product);

  // Stock status
  const isSoldOut = product?.isSoldOut || (product?.stock !== undefined && product?.stock <= 0);

  // Handlers
  const handleColorClick = (colorName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onColorChange) {
      onColorChange(colorName);
    } else {
      setInternalColor(colorName);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      setLocalWishlisted(prev => !prev);
      dispatch(addToWishlist({
        id: prodId,
        _id: prodId,
        name: cleanTitle,
        price: sellingPrice,
        image: currentDisplayImage,
        rating: product?.rating || 5.0
      }));
    }
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    if (controlledAddToCart) {
      controlledAddToCart(product, activeColor);
    } else {
      dispatch(addToCart({
        id: prodId,
        _id: prodId,
        name: `${cleanTitle} (${activeColor})`,
        price: sellingPrice,
        image: currentDisplayImage,
        quantity: 1,
        color: activeColor
      }));
      dispatch(openCart());
    }

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const handleQuickViewOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      {/* Main Apple Product Card */}
      <div
        className={`group bg-white rounded-[26px] sm:rounded-[30px] border border-zinc-200/80 p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.11)] transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden ${className}`}
      >
        {/* Top Badges & Wishlist Header */}
        <div className="flex items-center justify-between w-full z-10 gap-2 mb-2">
          {/* Left: Badges (New & Discount) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* New Badge */}
            <span className="bg-[#008a00] text-white font-extrabold text-[10.5px] sm:text-xs tracking-wide px-2.5 sm:px-3 py-1 rounded-lg shadow-2xs select-none">
              New
            </span>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="bg-[#e11d48] text-white font-black text-[10.5px] sm:text-xs tracking-wide px-2.5 sm:px-3 py-1 rounded-lg shadow-2xs select-none">
                {discountPercent}% OFF
              </span>
            )}

            {/* Sold Out Badge */}
            {isSoldOut && (
              <span className="bg-zinc-800 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-lg select-none">
                Sold Out
              </span>
            )}
          </div>

          {/* Right: Wishlist Heart Icon */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="p-1 rounded-full text-zinc-900 hover:text-red-500 transition-transform active:scale-90 cursor-pointer focus:outline-none"
            aria-label="Save to Wishlist"
          >
            <Heart
              className={`h-6 w-6 stroke-[1.8] transition-all duration-200 ${
                isWishlistActive ? 'fill-[#e11d48] text-[#e11d48] scale-110' : 'text-zinc-900 hover:text-[#e11d48]'
              }`}
            />
          </button>
        </div>

        {/* Clickable Card Body: Centered Image & Title */}
        <Link to={`/product/${prodId}`} className="block cursor-pointer flex-1 group/link">
          {/* Product Image Area */}
          <div className="w-full h-52 sm:h-60 md:h-64 flex items-center justify-center p-3 relative overflow-hidden my-2">
            <CleanProductImage
              src={currentDisplayImage}
              alt={cleanTitle}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 select-none transform scale-100"
              containerClassName="w-full h-full bg-white flex items-center justify-center relative overflow-hidden"
            />
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-lg sm:text-[21px] xl:text-[22px] leading-snug tracking-tight text-zinc-950 group-hover/link:text-black transition-colors min-h-[46px] line-clamp-2">
            {cleanTitle}
          </h3>

          {/* Key Specifications Row (Divided by |) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-semibold text-zinc-500 mt-2">
            {keySpecs.map((spec, sIdx) => (
              <React.Fragment key={sIdx}>
                <span>{spec}</span>
                {sIdx < keySpecs.length - 1 && (
                  <span className="text-zinc-300 font-normal select-none">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </Link>

        {/* Divider Line */}
        <div className="border-t border-zinc-200/60 my-3.5 sm:my-4" />

        {/* Colours & In-Stock Status Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Colours Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">Colours:</span>
            <div className="flex items-center gap-2 py-0.5">
              {normalizedColors.slice(0, 5).map((color, cIdx) => {
                const isSelected = activeColor.toLowerCase() === color.name.toLowerCase();
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={(e) => handleColorClick(color.name, e)}
                    style={{ backgroundColor: color.colorHex }}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-150 cursor-pointer shadow-xs border border-black/10 ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-zinc-950 scale-110 z-10'
                        : 'hover:scale-105 hover:shadow-sm opacity-90 hover:opacity-100'
                    }`}
                    title={color.name}
                    aria-label={`Select ${color.name} colour`}
                  />
                );
              })}
            </div>
          </div>

          {/* In Stock Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 select-none ${
              isSoldOut
                ? 'bg-zinc-100 text-zinc-500'
                : 'bg-[#eaf8ee] text-[#16a34a]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isSoldOut ? 'bg-zinc-400' : 'bg-[#16a34a]'
              }`}
            />
            <span>{isSoldOut ? 'Out of Stock' : 'In Stock'}</span>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-zinc-200/60 my-3.5 sm:my-4" />

        {/* Bottom Pricing & Action Buttons Row */}
        <div className="flex items-end justify-between gap-2.5 pt-0.5">
          {/* Price & Savings Block */}
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-400 tracking-tight">
              Starting From
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mt-0.5">
              <span className="text-xl sm:text-[26px] font-black text-zinc-950 tracking-tight leading-none">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm font-semibold text-zinc-400 line-through">
                  ₹{originalMrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Save Amount with Percentage */}
            {hasDiscount && (
              <span className="text-xs sm:text-[13px] font-bold text-[#16a34a] mt-1 tracking-tight block">
                Save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}%)
              </span>
            )}
          </div>

          {/* Action Buttons: Quick View Eye + Cart */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick View Button */}
            <button
              type="button"
              onClick={handleQuickViewOpen}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-800 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              title="Quick View"
              aria-label="Quick View product"
            >
              <Eye className="h-5 w-5 stroke-[1.8]" />
            </button>

            {/* Add to Cart Button */}
            {!isSoldOut && (
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Add to Cart"
                aria-label="Add to Cart"
              >
                <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
              </button>
            )}
          </div>
        </div>

        {/* Small Toast on Add to Cart */}
        {addedToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20 animate-in fade-in zoom-in-95 duration-200 flex items-center gap-1.5 whitespace-nowrap">
            <Check className="h-3.5 w-3.5 text-green-400" />
            <span>Added to Cart!</span>
          </div>
        )}
      </div>

      {/* Integrated Apple Quick View Modal */}
      {isQuickViewOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsQuickViewOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-zinc-200/80 max-h-[90vh] overflow-y-auto overscroll-contain animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
              aria-label="Close Quick View"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-left">
              {/* Left: Product Image */}
              <div className="h-60 sm:h-72 bg-zinc-50 rounded-2xl p-4 flex items-center justify-center border border-zinc-100">
                <CleanProductImage
                  src={currentDisplayImage}
                  alt={cleanTitle}
                  className="max-h-full max-w-full object-contain"
                  containerClassName="w-full h-full flex items-center justify-center"
                />
              </div>

              {/* Right: Details & Purchase */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#008a00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">New</span>
                    {hasDiscount && (
                      <span className="bg-[#e11d48] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#16a34a]">● In Stock</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 leading-snug">
                    {cleanTitle}
                  </h2>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-zinc-600">
                  {keySpecs.map((spec, sIdx) => (
                    <span key={sIdx} className="bg-zinc-100 px-2.5 py-1 rounded-lg">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Color Selector */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-zinc-900 block">
                    Colour: <span className="text-zinc-600 font-semibold">{activeColor}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {normalizedColors.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleColorClick(color.name, e)}
                        style={{ backgroundColor: color.colorHex }}
                        className={`w-7 h-7 rounded-full cursor-pointer transition-all border border-black/10 ${
                          activeColor.toLowerCase() === color.name.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-black scale-110'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs text-zinc-400 font-semibold block">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950">
                      ₹{sellingPrice.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm font-semibold text-zinc-400 line-through">
                        ₹{originalMrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-[#16a34a] block mt-0.5">
                      You save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}%)
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={(e) => {
                      handleAddToCartClick(e);
                      setIsQuickViewOpen(false);
                    }}
                    className="w-full bg-[#18181b] hover:bg-black text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickViewOpen(false);
                      navigate(`/product/${prodId}`);
                    }}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
                  >
                    <span>View Complete Product Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
