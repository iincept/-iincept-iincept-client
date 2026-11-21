import React, { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { closeCart, removeFromCart, updateQuantity, addToCart } from '../redux/cartSlice';
import { fetchProducts } from '../redux/productSlice';

// Helper to detect device category of a cart item
const getCartItemDevice = (item) => {
  const n = ((item?.name || item?.title || '') + ' ' + (item?.category?.name || '')).toLowerCase();
  if (/macbook|mac\b|imac|studio display|mac mini|mac pro/i.test(n)) return 'mac';
  if (/iphone/i.test(n)) return 'iphone';
  if (/ipad/i.test(n)) return 'ipad';
  if (/watch|ultra/i.test(n)) return 'watch';
  if (/airpod|earpod/i.test(n)) return 'airpods';
  if (/tv|homepod|homeview/i.test(n)) return 'tvhome';
  return 'general';
};

// Helper to check if a product is an accessory
const isAccessoryProduct = (p) => {
  if (!p) return false;
  const catName = (p.category?.name || '').toLowerCase();
  const catSlug = (p.category?.slug || '').toLowerCase();
  const title = (p.title || p.name || '').toLowerCase();
  if (catName.includes('accessori') || catSlug.includes('accessori')) return true;
  if (/^(iphone \d|macbook|11-inch ipad|13-inch ipad|ipad mini|apple watch series|apple watch ultra|apple watch se|imac)/i.test(title)) return false;
  return /cable|adapter|charger|case|folio|pencil|mouse|trackpad|keyboard|strap|band|loop|wallet/i.test(title);
};

// Helper to classify an accessory by the device it belongs to
const getAccessoryDeviceTarget = (title) => {
  const t = (title || '').toLowerCase();
  if (/watch|loop|band|milanese|sport band|sport loop|alpine|trail|ocean|link bracelet/i.test(t)) return 'watch';
  if (/pencil|smart folio|folio|for ipad/i.test(t)) return 'ipad';
  if (/magic mouse|magic trackpad|magic keyboard|thunderbolt|140w|96w|70w|35w dual|woven design charge cable|extension cable|multiport|usb-c to usb adapter|for mac|macbook/i.test(t)) return 'mac';
  if (/iphone|wallet|case with magsafe|silicone case|clear case|finewoven|magsafe charger|20w usb-c/i.test(t)) return 'iphone';
  if (/airpods|earpod|ear tip/i.test(t)) return 'airpods';
  if (/siri remote|tv|homepod/i.test(t)) return 'tvhome';
  return 'general';
};

// Prioritize top/flagship accessories
const getAccessoryScore = (p, target) => {
  const t = (p.title || p.name || '').toLowerCase();
  if (target === 'mac') {
    if (/magic mouse/i.test(t)) return 100;
    if (/magic keyboard/i.test(t)) return 95;
    if (/magic trackpad/i.test(t)) return 90;
    if (/240w usb-c woven/i.test(t)) return 85;
    if (/70w|96w|140w/i.test(t)) return 80;
    if (/power adapter/i.test(t)) return 75;
    if (/multiport|thunderbolt/i.test(t)) return 70;
  }
  if (target === 'iphone') {
    if (/magsafe charger/i.test(t)) return 100;
    if (/20w usb-c/i.test(t)) return 95;
    if (/silicone case|clear case/i.test(t)) return 90;
    if (/wallet/i.test(t)) return 85;
  }
  if (target === 'ipad') {
    if (/pencil pro/i.test(t)) return 100;
    if (/apple pencil/i.test(t)) return 95;
    if (/magic keyboard/i.test(t)) return 90;
    if (/smart folio|folio/i.test(t)) return 85;
  }
  if (target === 'watch') {
    if (/milanese/i.test(t)) return 100;
    if (/magnetic fast charger/i.test(t)) return 95;
    if (/sport band|sport loop/i.test(t)) return 90;
    if (/alpine|trail|ocean/i.test(t)) return 85;
  }
  if (target === 'airpods') {
    if (/ear tip/i.test(t)) return 100;
    if (/earpod/i.test(t)) return 95;
    if (/magsafe charger/i.test(t)) return 90;
  }
  return 50;
};

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  
  const { cartItems, isCartOpen } = useSelector((state) => state.cart);
  const { products } = useSelector((state) => state.products || { products: [] });

  // Ensure products list is loaded in Redux for accessory recommendations
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        dispatch(closeCart());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, dispatch]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isCartOpen]);

  // Recommendations dynamically tailored to the products in the user's cart (Hook called unconditionally)
  const recommendations = useMemo(() => {
    try {
      if (!cartItems || cartItems.length === 0) return [];

      // Extract device types in order from newest added to oldest
      const deviceTypes = [];
      for (let i = cartItems.length - 1; i >= 0; i--) {
        const dev = getCartItemDevice(cartItems[i]);
        if (dev !== 'general' && !deviceTypes.includes(dev)) {
          deviceTypes.push(dev);
        }
      }
      if (deviceTypes.length === 0) deviceTypes.push('general');

      const allAccessories = (products || []).filter(p => {
        if (!p || !isAccessoryProduct(p)) return false;
        const pid = String(p._id || p.id || '');
        if (!pid) return false;
        // Exclude items already in cart
        return !cartItems.some(c => {
          const cid = String(c.id || c.productId || '');
          return cid === pid || (cid && cid.startsWith(pid));
        });
      });

      const recs = [];
      if (deviceTypes.length === 1) {
        const dev = deviceTypes[0];
        const matched = allAccessories
          .filter(a => getAccessoryDeviceTarget(a?.title || a?.name) === dev)
          .sort((a, b) => getAccessoryScore(b, dev) - getAccessoryScore(a, dev));
        recs.push(...matched.slice(0, 2));
      } else {
        // Multiple devices in cart (e.g. Mac + iPhone): pick 1 top accessory for each
        for (const dev of deviceTypes.slice(0, 2)) {
          const matched = allAccessories
            .filter(a => getAccessoryDeviceTarget(a?.title || a?.name) === dev && !recs.some(r => String(r._id || r.id) === String(a._id || a.id)))
            .sort((a, b) => getAccessoryScore(b, dev) - getAccessoryScore(a, dev));
          if (matched[0]) recs.push(matched[0]);
        }
      }

      // If still less than 2, fill from remaining accessories
      if (recs.length < 2) {
        const remaining = allAccessories.filter(a => !recs.some(r => String(r._id || r.id) === String(a._id || a.id)));
        recs.push(...remaining.slice(0, 2 - recs.length));
      }

      return recs.map(p => {
        const numPrice = Number(p.price) || 0;
        let img = (p.images && p.images[0]) || p.image || '/iphone_nav/iphone_17.png';
        if (typeof img === 'string' && img.startsWith('uploads/')) {
          img = `/${img}`;
        }
        return {
          id: p._id || p.id,
          name: p.title || p.name || 'Apple Accessory',
          price: numPrice,
          priceStr: `₹${numPrice.toLocaleString('en-IN')}`,
          image: img
        };
      });
    } catch (err) {
      console.warn('Accessory recommendation calculation warning:', err);
      return [];
    }
  }, [cartItems, products]);

  // Context-aware fallbacks in case products list is still loading
  const primaryDev = (cartItems && cartItems.length > 0) ? getCartItemDevice(cartItems[cartItems.length - 1]) : 'mac';
  const categoryFallbacks = {
    mac: [
      { id: 'mac-mouse-rec', name: 'Magic Mouse -(USB–C) White Multi-Touch Surface', price: 11900, priceStr: '₹11,900', image: '/uploads/upload_1786620850543_596.jpeg' },
      { id: 'mac-cable-rec', name: '240W USB-C Woven Design Charge Cable (2M)', price: 2900, priceStr: '₹2,900', image: '/uploads/upload_1786606494206_130.jpeg' }
    ],
    iphone: [
      { id: 'iphone-magsafe-rec', name: 'MagSafe Charger (1 m)', price: 4500, priceStr: '₹4,500', image: '/iphone_nav/iphone_17.png' },
      { id: 'iphone-adapter-rec', name: '20W USB-C Power Adapter', price: 2190, priceStr: '₹2,190', image: '/iphone_nav/iphone_17.png' }
    ],
    ipad: [
      { id: 'ipad-pencil-rec', name: 'Apple Pencil Pro', price: 11900, priceStr: '₹11,900', image: '/ipad_nav/ipad_air.png' },
      { id: 'ipad-adapter-rec', name: 'USB-C to Apple Pencil Adapter', price: 900, priceStr: '₹900', image: '/ipad_nav/ipad_air.png' }
    ],
    watch: [
      { id: 'watch-loop-rec', name: '46mm Slate Milanese Loop', price: 9500, priceStr: '₹9,500', image: '/watch_nav/watch_ultra.png' },
      { id: 'watch-charger-rec', name: 'Apple Watch Magnetic Fast Charger to USB-C Cable (1 m)', price: 2900, priceStr: '₹2,900', image: '/watch_nav/watch_ultra.png' }
    ],
    airpods: [
      { id: 'airpods-tips-rec', name: 'AirPods Pro 3 Ear Tips - 5 pairs', price: 1690, priceStr: '₹1,690', image: '/airpods_nav/airpods_pro.png' },
      { id: 'airpods-earpods-rec', name: 'EarPods (USB-C)', price: 2190, priceStr: '₹2,190', image: '/airpods_nav/airpods_pro.png' }
    ],
    general: [
      { id: 'gen-cable-rec', name: '240W USB-C Woven Design Charge Cable (2M)', price: 2900, priceStr: '₹2,900', image: '/uploads/upload_1786606494206_130.jpeg' },
      { id: 'gen-adapter-rec', name: '20W USB-C Power Adapter', price: 2190, priceStr: '₹2,190', image: '/iphone_nav/iphone_17.png' }
    ]
  };

  const activeFallback = (categoryFallbacks[primaryDev] || categoryFallbacks.general)
    .filter(p => !(cartItems || []).some(item => String(item.id) === String(p.id)));

  const displayRecs = recommendations.length > 0 ? recommendations : activeFallback.slice(0, 2);

  if (!isCartOpen) return null;

  // Calculate total price safely
  const subtotal = (cartItems || []).reduce((acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0);
  const totalItemsCount = (cartItems || []).reduce((a, b) => a + (Number(b?.quantity) || 1), 0);

  const handleRecommendationAdd = (rec) => {
    dispatch(addToCart({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      image: rec.image,
      quantity: 1
    }));
  };

  const handleCheckoutClick = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    dispatch(closeCart());
    navigate('/cart');
  };

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    let message = `🛒 *NEW ORDER REQUEST - iiNCEPT Electronics* 🛒\n\n`;
    message += `Hello iiNCEPT! 👋\n`;
    message += `I would like to place an order for the following items in my cart:\n\n`;

    cartItems.forEach((item, idx) => {
      const itemTitle = item.name || item.title || 'Product';
      const skuText = (item.sku && !itemTitle.includes('SKU:')) ? ` (SKU: ${item.sku})` : '';
      const itemQty = item.quantity || 1;
      const itemPrice = (item.price || 0) * itemQty;
      message += `${idx + 1}. *${itemTitle}${skuText}*\n   Qty: ${itemQty} | Price: ₹${itemPrice.toLocaleString('en-IN')}\n`;
    });

    message += `\n💰 *Total Amount:* ₹${subtotal.toLocaleString('en-IN')}\n\n`;
    message += `Please confirm my order and share payment & delivery details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919971002348?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end items-stretch font-sans select-none overflow-hidden animate-in fade-in duration-200 p-2.5 sm:p-4">
      {/* Dark Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 touch-none"
        onClick={() => dispatch(closeCart())}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Cart Drawer Panel matching Laptop View on Mobile & Desktop */}
      <div 
        ref={drawerRef}
        className="relative w-[92vw] sm:w-[440px] max-w-full h-[95vh] sm:h-full max-h-[96vh] my-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col z-10 border border-zinc-200 animate-in slide-in-from-right duration-300 select-text overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900 tracking-tight leading-none">YOUR BAG</h2>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your shopping bag
              </p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeCart())}
            className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-950 transition-colors bg-zinc-100 hover:bg-zinc-200 cursor-pointer focus:outline-none"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 stroke-[2]" />
          </button>
        </div>

        {/* Scrollable Cart Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 touch-pan-y">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-xs">
                <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-800">Your bag is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">Explore our Apple collection to add items to your shopping bag.</p>
              </div>
              <button 
                onClick={() => {
                  dispatch(closeCart());
                  navigate('/');
                }}
                className="bg-zinc-950 hover:bg-zinc-850 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Items List */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Items in your order</h3>
                <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {(cartItems || []).map((item) => {
                    const itemTotalPrice = (Number(item?.price) || 0) * (Number(item?.quantity) || 1);
                    return (
                      <div 
                        key={item.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors text-left"
                      >
                        {/* Image & Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-zinc-50 p-1 border border-zinc-200/80 shrink-0 flex items-center justify-center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="max-h-full max-w-full object-contain mix-blend-multiply" 
                            />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-zinc-900 leading-snug tracking-tight line-clamp-2">
                              {item.name}
                            </h4>
                            {Boolean(item.appleCare || (item.name && item.name.toLowerCase().includes('applecare'))) && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 mt-0.5 rounded-md bg-rose-50 border border-rose-200/80 text-[10px] font-bold text-rose-700 w-fit">
                                <img src="/applecare_red_logo.png" alt="AppleCare+" className="w-3 h-3 object-contain shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <span className="line-clamp-1">{item.appleCarePlan || 'AppleCare+ Included'}</span>
                              </div>
                            )}
                            {item.sku && <p className="text-[9px] text-zinc-400 font-mono">SKU: {item.sku}</p>}
                            <p className="text-xs font-extrabold text-zinc-950 pt-0.5">
                              ₹{itemTotalPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Counter & Remove */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden h-7">
                            <button 
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                              className="px-2 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer h-full flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-zinc-900 min-w-[18px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                              className="px-2 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer h-full flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Accessories (Compact 2 Items) */}
              {displayRecs.length > 0 && (
                <div className="space-y-2 text-left pt-1">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Recommended Accessories</h4>
                  <div className="space-y-1.5">
                    {displayRecs.map((rec) => (
                      <div 
                        key={rec.id}
                        className="bg-white border border-zinc-200/80 p-2 rounded-xl flex items-center gap-2.5 hover:border-zinc-300 transition-all shadow-2xs"
                      >
                        <img 
                          src={rec.image} 
                          alt={rec.name} 
                          className="w-9 h-9 object-contain rounded-lg bg-zinc-50 p-1 border border-zinc-100 shrink-0 mix-blend-multiply" 
                          onError={(e) => { e.currentTarget.src = '/iphone_nav/iphone_17.png'; }}
                        />
                        <div className="min-w-0 flex-1 text-left space-y-0.5">
                          <h5 className="text-xs font-bold text-zinc-900 truncate leading-snug">{rec.name}</h5>
                          <p className="text-[10px] font-extrabold text-zinc-700">{rec.priceStr}</p>
                        </div>
                        <button 
                          onClick={() => handleRecommendationAdd(rec)}
                          className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 hover:bg-zinc-950 hover:text-white border border-zinc-300 rounded-lg px-2.5 py-1 transition-colors cursor-pointer shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Fixed Footer at Bottom of Drawer */}
        {cartItems.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-zinc-100 bg-white shrink-0 space-y-2.5 text-left shadow-lg">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-zinc-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-600 font-medium">
                <span>Shipping & Taxes</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-black text-zinc-950 pt-1 border-t border-zinc-200/80">
                <span>Total Amount</span>
                <span className="text-sm sm:text-base font-black text-zinc-950">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
              <button 
                onClick={handleCheckoutClick}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm text-center block cursor-pointer"
              >
                PROCEED TO CHECKOUT →
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button 
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span className="truncate">WHATSAPP ORDER</span>
                </button>

                <button 
                  onClick={handleViewCartClick}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer text-center block truncate"
                >
                  VIEW FULL BAG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
