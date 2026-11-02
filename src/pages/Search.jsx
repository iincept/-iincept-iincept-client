import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingBag, Heart, Search as SearchIcon, ArrowRight, Loader2 } from 'lucide-react';
import { fetchProducts } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import { matchesProductSearch, getMatchingSku, findMatchingVariant, getVariantPricing } from '../utils/searchUtils';

export default function Search() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    // Fetch products if list is empty
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  // Client-side filtering matching query
  const filteredProducts = products.filter((prod) => {
    if (!query.trim()) return false;
    return matchesProductSearch(prod, query);
  });

  const handleAddToCart = (e, prod, matchedVar, pricing, productImg, matchedSku) => {
    e.preventDefault();
    e.stopPropagation();

    const variantId = matchedVar?._id || matchedVar?.id;
    const finalSku = matchedSku || matchedVar?.sku || matchedVar?.partNumber || prod.sku;
    
    // Attribute description
    const attrString = matchedVar 
      ? [matchedVar.color, matchedVar.storage, matchedVar.ram, matchedVar.size, matchedVar.connectivity].filter(Boolean).join(' / ')
      : '';

    const cartName = matchedVar && attrString
      ? `${prod.title || prod.name} (${attrString})`
      : (prod.title || prod.name);

    dispatch(addToCart({
      id: variantId ? `${prod._id || prod.id}-${variantId}` : (prod._id || prod.id),
      productId: prod._id || prod.id,
      variantId: variantId,
      sku: finalSku,
      partNumber: matchedVar?.partNumber || prod.partNumber,
      name: cartName,
      title: cartName,
      price: pricing.sellingPrice,
      originalMrp: pricing.originalMrp,
      image: productImg,
      color: matchedVar?.color || (prod.colors?.[0]?.name || prod.colors?.[0] || ''),
      storage: matchedVar?.storage || '',
      ram: matchedVar?.ram || '',
      size: matchedVar?.size || '',
      quantity: 1
    }));
  };

  const handleAddToWishlist = (e, prod, matchedVar, pricing, productImg) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToWishlist({
      id: prod._id || prod.id,
      name: prod.title || prod.name,
      price: pricing.sellingPrice,
      image: productImg,
      rating: prod.rating
    }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-400">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900 mb-3" />
        <span className="text-sm font-semibold">Searching catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 text-left animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Search Results</h1>
        <p className="text-sm text-zinc-500 font-medium">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found matching "{query}"
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="border border-dashed border-zinc-200 bg-zinc-50 rounded-3xl p-16 text-center space-y-6 max-w-xl mx-auto my-8 shadow-sm">
          <div className="h-16 w-16 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 mx-auto shadow-sm">
            <SearchIcon className="h-6 w-6 text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900">No Matches Found</h2>
            <p className="text-sm text-zinc-550 max-w-xs mx-auto">
              We couldn't find any items matching your request. Try modifying terms or category filters.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <Link 
              to="/accessories" 
              className="inline-flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-xs shadow-sm"
            >
              Browse Catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const matchedVar = findMatchingVariant(prod, query);
            const pricing = getVariantPricing(matchedVar, prod);

            const matchedSku = matchedVar
              ? (matchedVar.sku || matchedVar.partNumber || matchedVar.modelNumber)
              : getMatchingSku(prod, query);

            const matchedImg = matchedVar?.images?.[0] || matchedVar?.image || (prod.colorImages && matchedVar?.color && prod.colorImages[matchedVar.color]?.[0]);
            const productImg = matchedImg || prod.displayImage || prod.image || (prod.images && prod.images[0]) || '/avatar.png';

            const productId = prod._id || prod.id || prod.partNumber || prod.sku;
            const productLink = matchedSku 
              ? `/product/${encodeURIComponent(productId)}?sku=${encodeURIComponent(matchedSku)}`
              : `/product/${encodeURIComponent(productId)}`;

            return (
              <Link 
                key={prod._id || prod.id}
                to={productLink}
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md animate-in fade-in duration-300 cursor-pointer block"
              >
                {/* Image panel */}
                <div className="relative h-48 bg-white border-b border-zinc-100 overflow-hidden flex items-center justify-center p-3">
                  <img 
                    src={productImg} 
                    alt={prod.title || prod.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                  />
                  <button 
                    onClick={(e) => handleAddToWishlist(e, prod, matchedVar, pricing, productImg)}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white backdrop-blur-sm border border-zinc-150 text-zinc-500 hover:text-rose-500 rounded-full z-10 transition-colors cursor-pointer shadow-sm"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Meta details */}
                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                        {prod.brand || 'Premium'}
                      </span>
                      {matchedSku && (
                        <span className="font-mono text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SKU: {matchedSku}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-zinc-800 text-sm line-clamp-1 group-hover:text-black transition-colors">
                      {prod.title || prod.name}
                    </h3>
                    <div className="flex items-center gap-1 pt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-semibold text-zinc-700">{prod.rating || 5.0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-base text-zinc-900">
                        ₹{pricing.sellingPrice ? pricing.sellingPrice.toLocaleString('en-IN') : '0'}
                      </span>
                      {pricing.originalMrp > pricing.sellingPrice && (
                        <span className="text-[10px] text-zinc-400 line-through font-semibold">
                          ₹{pricing.originalMrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, prod, matchedVar, pricing, productImg, matchedSku)}
                      className="px-3 py-2 bg-black hover:bg-zinc-900 text-[10px] font-bold text-white rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
