import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Trash2, Heart, ArrowRight } from 'lucide-react';
import { removeFromWishlist } from '../redux/wishlistSlice';
import { addToCart } from '../redux/cartSlice';
import { getProductCardPricing } from '../utils/pricingUtils';

const getDiscountPercent = (prod) => {
  if (!prod) return 0;

  const getCalcDisc = (p, d) => {
    const price = Number(p || 0);
    const disc = Number(d || 0);
    if (disc <= 0) return 0;
    if (disc <= 99) return Math.round(disc);
    if (price > disc) return Math.round(((price - disc) / price) * 100);
    return 0;
  };

  let discPercent = 0;
  if (prod.discountPercent && Number(prod.discountPercent) > 0) {
    discPercent = Math.round(Number(prod.discountPercent));
  } else {
    discPercent = getCalcDisc(prod.price, prod.discountPrice);
  }

  if (discPercent === 0 && prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
    const variantDiscounts = prod.variants.map(v => {
      if (v.discountPercent && Number(v.discountPercent) > 0) return Math.round(Number(v.discountPercent));
      return getCalcDisc(v.price || prod.price, v.discountPrice || prod.discountPrice);
    }).filter(d => d > 0);
    if (variantDiscounts.length > 0) {
      discPercent = Math.max(...variantDiscounts);
    }
  }

  return discPercent;
};

export default function Wishlist() {
  const dispatch = useDispatch();

  // Load wishlist items from the Redux store
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const handleRemove = (id, name) => {
    dispatch(removeFromWishlist(id));
    alert(`Removed ${name} from your wishlist.`);
  };

  const handleMoveToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    }));
    dispatch(removeFromWishlist(item.id));
    alert(`Moved ${item.name} to Cart successfully!`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="border border-slate-850 bg-slate-900/30 rounded-3xl p-16 text-center space-y-6 max-w-xl mx-auto my-8 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-550 mx-auto">
          <Heart className="h-8 w-8 text-slate-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Your Wishlist is Empty</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Save items you are interested in here to review or purchase them later.</p>
        </div>
        <Link
          to="/accessories"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-xs"
        >
          Explore Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 text-left animate-in fade-in duration-300">

      <h1 className="text-3xl font-extrabold tracking-tight text-white">Saved Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-slate-850 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-white overflow-hidden flex items-center justify-center p-3 border-b border-slate-800">
              {/* Top Left Overlay Badges: Sold Out & Discount */}
              <div className="flex items-center gap-1.5 flex-wrap absolute top-3 left-3 z-10">
                {(item.isSoldOut || (item.stock !== undefined && item.stock <= 0)) && (
                  <span className="bg-[#f5f5f7] text-[#1d1d1f] font-bold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded shadow-2xs">
                    SOLD OUT
                  </span>
                )}
                {(() => {
                  const discPercent = getDiscountPercent(item);
                  if (discPercent > 0) {
                    return (
                      <span className="bg-[#FF2D55] text-white font-extrabold text-[9.5px] tracking-wide uppercase px-2.5 py-1 rounded shadow-2xs">
                        {discPercent}% OFF
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              <button
                onClick={() => handleRemove(item.id, item.name)}
                className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 text-slate-400 hover:text-rose-400 rounded-full z-10 transition-colors cursor-pointer"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <img
                src={item.image}
                alt={item.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
              />
            </div>

            {/* Information */}
            <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider capitalize">{item.category || 'tech'}</span>
                <h3 className="font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                  <Link to={`/product/${item.id}`}>{item.name}</Link>
                </h3>
                {item.rating && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-350">{item.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850/60">
                {(() => {
                  const pricing = getProductCardPricing(item);

                  if (pricing.hasDiscount) {
                    return (
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base text-slate-100">₹{pricing.sellingPrice.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-500 line-through font-medium">₹{pricing.originalMrp.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  }
                  return <span className="font-extrabold text-base text-slate-100">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>;
                })()}
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="px-3 py-2 bg-violet-650 bg-violet-600 hover:bg-violet-500 hover:text-white text-[10px] font-bold text-white rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Move to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
