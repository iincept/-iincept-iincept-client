import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Eye, ShoppingCart, X, Check, ArrowRight } from 'lucide-react';
import { addToCart, openCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import { getProductCardPricing } from '../utils/pricingUtils';
import { resolveColorValue } from '../utils/colorResolver';
import CleanProductImage from './CleanProductImage';

const cleanStorageSpec = (str) => {
  if (!str) return '';
  const s = String(str).trim();
  const match = s.match(/(\d+)\s*(TB|GB)/i);
  if (match) {
    return `${match[1]}${match[2].toUpperCase()}`;
  }
  const matchNum = s.match(/(\d+)\s*SSD/i) || s.match(/^(\d+)$/);
  if (matchNum) {
    return `${matchNum[1]}GB`;
  }
  return s.replace(/\s*SSD/gi, '').trim();
};

const cleanRamSpec = (str) => {
  if (!str) return '';
  const s = String(str).trim();
  const m = s.match(/\b(\d+GB)\b/i);
  return m ? m[1].toUpperCase() : s;
};

/**
 * Intelligent helper to extract key technical specifications (CPU, GPU, RAM, Storage, etc.)
 * from starting (base) variant, title, and description to match Apple's modern spec-bar layout:
 * Example: "10-core CPU | 10-core GPU | 16GB | 512GB"
 */
export const extractProductKeySpecs = (prod) => {
  if (!prod) return ['Apple Silicon', 'Retina Display', 'Official Warranty'];

  const rawTitle = (prod.name || prod.title || '').trim();
  const rawDesc = (prod.description || '').trim();
  const lowerTitle = rawTitle.toLowerCase();
  const catName = typeof prod.category === 'object' && prod.category !== null
    ? (prod.category.name || '')
    : (typeof prod.category === 'string' ? prod.category : '');
  const lowerCat = catName.toLowerCase();

  // Filter out accessories (chargers, cables, keyboards, adapters, etc.)
  const isAccessory = lowerTitle.includes('adapter') ||
    lowerTitle.includes('cable') ||
    lowerTitle.includes('keyboard') ||
    lowerTitle.includes('mouse') ||
    lowerTitle.includes('trackpad') ||
    lowerTitle.includes('case') ||
    lowerTitle.includes('charger') ||
    lowerTitle.includes('magsafe') ||
    lowerCat.includes('accessories');

  const isMac = !isAccessory && (
    lowerCat.includes('mac') ||
    lowerCat.includes('laptop') ||
    lowerCat.includes('pc') ||
    lowerTitle.includes('macbook') ||
    lowerTitle.includes('imac') ||
    lowerTitle.includes('mac mini') ||
    lowerTitle.includes('mac studio') ||
    lowerTitle.includes('mac pro')
  );

  // Find starting / base variant (lowest price with price > 0)
  let baseVariant = null;
  if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    const pricedVariants = prod.variants.filter(v => (Number(v.price) || 0) > 0);
    if (pricedVariants.length > 0) {
      pricedVariants.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      baseVariant = pricedVariants[0];
    } else {
      baseVariant = prod.variants[0];
    }
  }

  // Combined text to search for specs
  const combinedText = [
    rawTitle,
    baseVariant?.processor || '',
    baseVariant?.chip || '',
    rawDesc,
    ...(Array.isArray(prod.processors) ? prod.processors : [])
  ].filter(Boolean).join(' ');

  // 1. MAC COMPUTERS (MacBook, iMac, Mac mini, Mac Studio):
  // Strictly format as starting variant [CPU, GPU, RAM, Storage]
  // Example: 10-core CPU | 10-core GPU | 16GB | 512GB
  if (isMac) {
    let cpu = null;
    let gpu = null;
    let ram = null;
    let storage = null;

    // CPU Match
    const cpuMatch = combinedText.match(/(\d+[-‑]core\s+CPU)/i);
    if (cpuMatch) {
      cpu = cpuMatch[1].replace('‑', '-');
    }

    // GPU Match
    const gpuMatch = combinedText.match(/(\d+[-‑]core\s+GPU)/i);
    if (gpuMatch) {
      gpu = gpuMatch[1].replace('‑', '-');
    }

    // iMac: strictly display "10-core CPU | 10-core GPU" (RAM & Storage excluded as requested)
    if (lowerTitle.includes('imac')) {
      return [cpu || '10-core CPU', gpu || '10-core GPU'];
    }

    // Mac Studio M5-ULTRA: "30-core CPU | 64-core GPU | 96GB | 1TB"
    if (lowerTitle.includes('studio') && (lowerTitle.includes('ultra') || lowerTitle.includes('m5-ultra'))) {
      const uRam = baseVariant?.ram ? cleanRamSpec(baseVariant.ram) : (Array.isArray(prod.ram) && prod.ram[0] ? cleanRamSpec(prod.ram[0]) : '96GB');
      const uStorage = baseVariant?.storage ? cleanStorageSpec(baseVariant.storage) : (Array.isArray(prod.storage) && prod.storage[0] ? cleanStorageSpec(prod.storage[0]) : '1TB');
      return ['30-core CPU', '64-core GPU', uRam, uStorage];
    }

    // Mac Studio M5-MAX: "18-core CPU | 32-core GPU | 36GB | 512GB"
    if (lowerTitle.includes('studio') && (lowerTitle.includes('max') || lowerTitle.includes('m5-max'))) {
      const mRam = baseVariant?.ram ? cleanRamSpec(baseVariant.ram) : (Array.isArray(prod.ram) && prod.ram[0] ? cleanRamSpec(prod.ram[0]) : '36GB');
      const mStorage = baseVariant?.storage ? cleanStorageSpec(baseVariant.storage) : (Array.isArray(prod.storage) && prod.storage[0] ? cleanStorageSpec(prod.storage[0]) : '512GB');
      return ['18-core CPU', '32-core GPU', mRam, mStorage];
    }

    // Starting RAM (strictly from base variant first)
    if (baseVariant?.ram) {
      ram = cleanRamSpec(baseVariant.ram);
    }
    if (!ram && Array.isArray(prod.ram) && prod.ram[0]) {
      ram = cleanRamSpec(prod.ram[0]);
    }
    if (!ram) {
      const ramMatch = combinedText.match(/\b(8GB|16GB|18GB|24GB|32GB|36GB|48GB|64GB|128GB)\b/i);
      if (ramMatch) ram = ramMatch[1].toUpperCase();
    }

    // Starting Storage (strictly from base variant first)
    if (baseVariant?.storage) {
      storage = cleanStorageSpec(baseVariant.storage);
    }
    if (!storage && Array.isArray(prod.storage) && prod.storage[0]) {
      storage = cleanStorageSpec(prod.storage[0]);
    }
    if (!storage) {
      const storageMatch = combinedText.match(/\b(128GB|256GB|512GB|1TB|2TB|4TB|8TB)\b/i);
      if (storageMatch) storage = storageMatch[1].toUpperCase();
    }

    // Model intelligent fallbacks for any missing specs
    if (!cpu) {
      if (lowerTitle.includes('pro 16')) cpu = '18-core CPU';
      else if (lowerTitle.includes('pro 14')) cpu = '10-core CPU';
      else if (lowerTitle.includes('air 15')) cpu = '10-core CPU';
      else if (lowerTitle.includes('air 13')) cpu = '10-core CPU';
      else if (lowerTitle.includes('neo')) cpu = '6-core CPU';
      else if (lowerTitle.includes('mini')) cpu = '10-core CPU';
      else if (lowerTitle.includes('studio')) cpu = '14-core CPU';
      else if (lowerTitle.includes('imac')) cpu = '8-core CPU';
      else cpu = '10-core CPU';
    }

    if (!gpu) {
      if (lowerTitle.includes('pro 16')) gpu = '20-core GPU';
      else if (lowerTitle.includes('pro 14')) gpu = '10-core GPU';
      else if (lowerTitle.includes('air 15')) gpu = '10-core GPU';
      else if (lowerTitle.includes('air 13')) gpu = '8-core GPU';
      else if (lowerTitle.includes('neo')) gpu = '5-core GPU';
      else if (lowerTitle.includes('mini')) gpu = '10-core GPU';
      else if (lowerTitle.includes('studio')) gpu = '30-core GPU';
      else if (lowerTitle.includes('imac')) gpu = '8-core GPU';
      else gpu = '10-core GPU';
    }

    if (!ram) {
      if (lowerTitle.includes('pro 16')) ram = '24GB';
      else if (lowerTitle.includes('studio')) ram = '36GB';
      else if (lowerTitle.includes('neo')) ram = '8GB';
      else ram = '16GB';
    }

    if (!storage) {
      if (lowerTitle.includes('neo') || lowerTitle.includes('mini') || lowerTitle.includes('imac')) storage = '256GB';
      else if (lowerTitle.includes('pro 16') || lowerTitle.includes('studio')) storage = '1TB';
      else storage = '512GB';
    }

    return [cpu, gpu, ram, storage];
  }

  // Studio Display & Studio Display XDR: Display Stand / RAM options outside on the card
  if (lowerTitle.includes('studio display') || lowerTitle.includes('display xdr') || lowerTitle.includes('pro display')) {
    const rawList = (Array.isArray(prod.specs) && prod.specs.length > 0)
      ? prod.specs
      : (Array.isArray(prod.ram) && prod.ram.length > 0)
        ? prod.ram
        : (Array.isArray(prod.storage) && prod.storage.length > 0)
          ? prod.storage
          : ((prod.variants || []).map(v => v.ram || v.storage).filter(Boolean));
    const uniqueOptions = Array.from(new Set(rawList.map(s => (s || '').trim()).filter(Boolean)));
    if (uniqueOptions.length > 0) {
      return uniqueOptions;
    }
    if (lowerTitle.includes('xdr')) {
      return ['Tilt- and height-adjustable stand', 'VESA mount adapter (Stand not included)'];
    }
    return ['Tilt-adjustable stand', 'Tilt- and height-adjustable stand', 'VESA mount adapter (Stand not included)'];
  }

  // 2. Explicit specs array if defined in admin
  if (Array.isArray(prod.specs) && prod.specs.length >= 2) {
    return prod.specs.slice(0, 4);
  }

  // 3. Accessories
  if (isAccessory) {
    return ['Official Apple Warranty', 'Fast Shipping', '100% Genuine'];
  }

  // 4. iPhone
  if (lowerCat.includes('iphone') || lowerTitle.includes('iphone')) {
    const baseStorage = baseVariant?.storage ? cleanStorageSpec(baseVariant.storage) : '128GB';
    if (lowerTitle.includes('pro')) return ['A18 Pro chip', '48MP Fusion Camera', 'Super Retina XDR', baseStorage];
    return ['A18 chip', 'Camera Control', '48MP 2x Telephoto', baseStorage];
  }

  // 5. iPad
  if (lowerCat.includes('ipad') || lowerTitle.includes('ipad')) {
    const baseStorage = baseVariant?.storage ? cleanStorageSpec(baseVariant.storage) : '128GB';
    if (lowerTitle.includes('pro')) return ['Ultra Retina XDR', 'M4 chip', 'Face ID', baseStorage];
    if (lowerTitle.includes('air')) return ['Liquid Retina', 'M2 chip', 'Touch ID', baseStorage];
    return ['10.9-inch Liquid Retina', 'A14 Bionic', 'USB-C', baseStorage];
  }

  // 6. Apple Watch
  if (lowerCat.includes('watch') || lowerTitle.includes('watch')) {
    return ['Always-On Retina', 'S10 SiP', '50m Water Resistant', 'Blood Oxygen'];
  }

  // 7. AirPods
  if (lowerCat.includes('airpod') || lowerTitle.includes('airpod')) {
    return ['Active Noise Cancellation', 'Spatial Audio', 'Transparency Mode', 'USB-C'];
  }

  // 8. Apple TV
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
  let t = rawTitle.replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();

  // Pattern 1: "15-inch MacBook Air: Apple M5 chip with 10-core CPU and 10-core GPU" -> "15-inch MacBook Air (M5)"
  const chipWithDetails = /:\s*Apple\s+([MA]\d+(?:\s*(?:Pro|Max|Ultra|Bionic))?)\s+chip(?:\s+with.*)?$/i;
  const match1 = t.match(chipWithDetails);
  if (match1) {
    const base = t.substring(0, match1.index).trim();
    const chip = match1[1].trim();
    return `${base} (${chip})`;
  }

  // Pattern 2: "Mac mini: Apple M6" -> "Mac mini (M6)"
  const colonChip = /:\s*(?:Apple\s+)?([MA]\d+(?:\s*(?:Pro|Max|Ultra|Bionic))?)$/i;
  const match2 = t.match(colonChip);
  if (match2) {
    const base = t.substring(0, match2.index).trim();
    const chip = match2[1].trim();
    return `${base} (${chip})`;
  }

  return t;
};

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

  // Colors resolution: ONLY use colors if explicitly added in Admin Panel (product.colors or variant.color)
  const rawColors = Array.isArray(product?.colors) && product.colors.length > 0
    ? product.colors
    : (Array.isArray(product?.variants) && product.variants.some(v => v.color)
      ? [...new Set(product.variants.map(v => v.color).filter(Boolean))].map(c => ({ name: c, value: c }))
      : []);
  const normalizedColors = rawColors.map(c => {
    const name = typeof c === 'string' ? c : (c.name || 'Standard');
    const val = typeof c === 'string' ? c : (c.value || c.colorHex || c.name || '');
    const colorHex = resolveColorValue(c?.colorHex || c?.value || val);
    const img = typeof c === 'object' && c.image ? c.image : null;
    return { name, colorHex, image: img };
  });

  const hasColors = normalizedColors.length > 0;

  // Color selection state: track if user explicitly selected a color
  const [internalColor, setInternalColor] = useState(null);
  const [hasUserClickedColor, setHasUserClickedColor] = useState(false);
  const hasUserSelectedColor = Boolean(controlledColor || hasUserClickedColor);
  const activeColor = controlledColor || internalColor || (hasColors ? normalizedColors[0]?.name : '');

  // Active product image: Prioritize Admin Panel displayImage by default
  const resolveActiveImage = () => {
    // 1. If user has NOT explicitly selected a color swatch or product has no colors, ALWAYS return the Admin Panel displayImage!
    if (!hasUserSelectedColor || !hasColors) {
      if (product?.displayImage && typeof product.displayImage === 'string' && product.displayImage.trim()) {
        return product.displayImage.trim();
      }
      if (product?.image && typeof product.image === 'string' && product.image.trim() && !product.image.includes('mock-cloud')) {
        return product.image.trim();
      }
      if (Array.isArray(product?.images) && product.images[0]) {
        return product.images[0];
      }
    }

    // 2. If user specifically clicked a color swatch, search for an image specific to that color
    if (hasUserSelectedColor && hasColors && activeColor) {
      if (product?.colorImages && typeof product.colorImages === 'object') {
        const directMatch = product.colorImages[activeColor];
        if (directMatch) return directMatch;
        const normActive = activeColor.trim().toLowerCase();
        const matchedKey = Object.keys(product.colorImages).find(k => k.trim().toLowerCase() === normActive);
        if (matchedKey && product.colorImages[matchedKey]) {
          return product.colorImages[matchedKey];
        }
      }
      const matchedColorObj = normalizedColors.find(c => c.name.toLowerCase() === activeColor.toLowerCase());
      if (matchedColorObj?.image) {
        return matchedColorObj.image;
      }
      if (Array.isArray(product?.variants)) {
        const vMatch = product.variants.find(v => (v.color || '').trim().toLowerCase() === activeColor.toLowerCase());
        if (vMatch && Array.isArray(vMatch.images) && vMatch.images[0]) {
          return vMatch.images[0];
        }
      }
    }

    // 3. Fallback: Admin displayImage -> product.image -> first image -> fallback
    if (product?.displayImage && typeof product.displayImage === 'string' && product.displayImage.trim()) {
      return product.displayImage.trim();
    }
    if (product?.image && typeof product.image === 'string' && product.image.trim()) {
      return product.image.trim();
    }
    if (Array.isArray(product?.images) && product.images[0]) {
      return product.images[0];
    }
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
    setHasUserClickedColor(true);
    setInternalColor(colorName);
    if (onColorChange) {
      onColorChange(colorName);
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

    const cartColor = hasColors && activeColor ? activeColor : undefined;
    const cartName = cartColor ? `${cleanTitle} (${cartColor})` : cleanTitle;

    if (controlledAddToCart) {
      controlledAddToCart(product, cartColor);
    } else {
      dispatch(addToCart({
        id: prodId,
        _id: prodId,
        name: cartName,
        price: sellingPrice,
        image: currentDisplayImage,
        quantity: 1,
        color: cartColor
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
              className={`h-6 w-6 stroke-[1.8] transition-all duration-200 ${isWishlistActive ? 'fill-[#e11d48] text-[#e11d48] scale-110' : 'text-zinc-900 hover:text-[#e11d48]'
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
          <h3 className="font-extrabold sm:font-black text-xl sm:text-[22px] xl:text-[23px] leading-snug tracking-tight text-zinc-950 group-hover/link:text-black transition-colors line-clamp-2">
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
        <div className={`flex items-center ${hasColors ? 'justify-between' : 'justify-end'} gap-2 min-h-[32px]`}>
          {/* Colours Selector (only shown if colors were added from Admin Panel) */}
          {hasColors && (
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">Colours:</span>
              <div className="flex items-center gap-3 sm:gap-3.5 py-0.5">
                {normalizedColors.slice(0, 5).map((color, cIdx) => {
                  const isSelected = activeColor && activeColor.toLowerCase() === color.name.toLowerCase();
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={(e) => handleColorClick(color.name, e)}
                      style={{ backgroundColor: color.colorHex }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-150 cursor-pointer shadow-xs border border-black/10 ${isSelected
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
          )}

          {/* In Stock Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 select-none ${isSoldOut
              ? 'bg-zinc-100 text-zinc-500'
              : 'bg-[#eaf8ee] text-[#16a34a]'
              }`}
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${isSoldOut ? 'bg-zinc-400' : 'bg-[#16a34a]'
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
                <span className="text-xs sm:text-[13.5px] font-bold text-zinc-400 line-through">
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
            <button
              type="button"
              onClick={handleAddToCartClick}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
            </button>
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
                {hasColors && (
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
                          className={`w-7 h-7 rounded-full cursor-pointer transition-all border border-black/10 ${activeColor && activeColor.toLowerCase() === color.name.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-black scale-110'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs text-zinc-400 font-semibold block">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950">
                      ₹{sellingPrice.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm font-bold text-zinc-400 line-through">
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
