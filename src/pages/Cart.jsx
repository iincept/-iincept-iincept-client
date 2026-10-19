import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { updateQuantity, removeFromCart } from '../redux/cartSlice';
import axiosClient from '../services/axiosClient';
import { resolveColorValue } from '../utils/colorResolver';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load cart items from the Redux store
  const { cartItems } = useSelector((state) => state.cart);

  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in rupees
  const [couponError, setCouponError] = useState('');

  const handleUpdateQuantity = (id, newQty) => {
    dispatch(updateQuantity({ id, quantity: Math.max(1, newQty) }));
  };

  const handleQtyChange = (id, currentQty, type) => {
    const newQty = type === 'inc' ? currentQty + 1 : Math.max(1, currentQty - 1);
    handleUpdateQuantity(id, newQty);
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!coupon) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    try {
      const response = await axiosClient.post('/coupons/apply', { code: coupon });
      const { discountAmount, discount } = response.data;
      setAppliedDiscount(discountAmount);
      alert(`Coupon "${coupon.toUpperCase()}" Applied! ₹${discountAmount.toLocaleString('en-IN')} (${discount}% off) deducted.`);
    } catch (err) {
      setAppliedDiscount(0);
      setCouponError(err.response?.data?.message || err.message || 'Failed to apply coupon');
    }
  };

  // Math Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 15.00;
  const total = subtotal + shipping - appliedDiscount;

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

    message += `\n💰 *Total Amount:* ₹${Math.max(0, total).toLocaleString('en-IN')}\n\n`;
    message += `Please confirm my order and share payment & delivery details. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918607222417?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="border border-zinc-200 bg-white rounded-3xl p-16 text-center space-y-6 max-w-xl mx-auto my-8 animate-in fade-in duration-300 shadow-sm">
        <div className="h-16 w-16 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 mx-auto">
          <ShoppingBag className="h-8 w-8 text-black" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900">Your Cart is Empty</h2>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">Looks like you haven't added any products to your electronic collection yet.</p>
        </div>
        <Link 
          to="/?scroll=categories" 
          className="inline-flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-xs shadow-sm"
        >
          Explore Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 text-left animate-in fade-in duration-300">
      
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.id}
              className="flex flex-row items-center justify-between p-3 sm:p-4 bg-white border border-zinc-200 rounded-2xl gap-2 sm:gap-4 hover:border-zinc-300 transition-colors shadow-sm"
            >
              {/* Product Thumbnail & Name */}
              <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-white shrink-0 border border-zinc-200 p-1 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-bold text-zinc-800 text-xs sm:text-sm line-clamp-1">{item.name}</h3>
                  <div className="text-[10px] text-zinc-500 space-y-0.5 mt-0.5 hidden sm:block">
                    {item.accessoriesSize && item.accessoriesSize !== 'None' && <p>Accessories Size: <span className="text-zinc-700">{item.accessoriesSize}</span></p>}
                    {item.size && <p>Config: <span className="text-zinc-700">{item.size}</span></p>}
                    {item.color && (
                      <div className="flex items-center gap-1">
                        <span>Color:</span>
                        <div className="h-3 w-3 rounded-full border border-zinc-300" style={{ backgroundColor: resolveColorValue(item.colorHex || item.color) }} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-750 font-bold block sm:mt-1">₹{(Number(item.price) || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Quantity Controls & Math */}
              <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                
                {/* Quantity */}
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-xl px-1.5 py-0.5 sm:px-2 sm:py-1 gap-1.5 sm:gap-3">
                  <button 
                    onClick={() => handleQtyChange(item.id, item.quantity, 'dec')}
                    className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                  <span className="text-xs font-bold w-4 sm:w-5 text-center text-zinc-800">{item.quantity || 1}</span>
                  <button 
                    onClick={() => handleQtyChange(item.id, item.quantity, 'inc')}
                    className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <span className="font-bold text-xs sm:text-sm w-14 sm:w-20 text-right text-zinc-800">
                  ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                </span>

                {/* Remove */}
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 sm:p-2 bg-zinc-100 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 rounded-xl border border-zinc-200 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary Panel */}
        <aside className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="font-bold text-lg border-b border-zinc-100 pb-3 text-zinc-900">Order Summary</h2>

          {/* Pricing Math */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-bold text-zinc-800">₹{(Number(subtotal) || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping Fee</span>
              <span className="font-bold text-zinc-800">
                {shipping === 0 ? 'Free' : `₹${(Number(shipping) || 0).toLocaleString('en-IN')}`}
              </span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Coupon</span>
                <span>-₹{(Number(appliedDiscount) || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            <hr className="border-zinc-150" />
            <div className="flex justify-between text-sm font-extrabold text-zinc-900">
              <span>Grand Total</span>
              <span>₹{Math.max(0, Number(total) || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Coupon Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-zinc-150">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Have a coupon code?</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter Coupon Code" 
                className="bg-white border border-zinc-200 text-xs rounded-xl px-3 py-2 flex-grow text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
              <button 
                type="submit" 
                className="bg-zinc-900 border border-zinc-900 hover:bg-zinc-850 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-white"
              >
                <Tag className="h-3.5 w-3.5 text-white" />
                Apply
              </button>
            </div>
            {couponError && <p className="text-[10px] text-rose-600 font-bold text-left">{couponError}</p>}
          </form>

          {/* Checkout CTAs */}
          <div className="space-y-2.5">
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black hover:bg-zinc-900 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer text-xs uppercase tracking-wider"
            >
              Proceed to Checkout
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            
            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer text-xs uppercase tracking-wider"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              Order on WhatsApp
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
