import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Loader2, ChevronDown, Search, Laptop, Tablet, Smartphone, Watch, Headphones, Tv, Sparkles, Plug, CircleDot, Keyboard, Accessibility, Gamepad, Camera, PenTool, Activity, Home } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import { fetchProducts } from '../redux/productSlice';
import { matchesProductSearch } from '../utils/searchUtils';
import { getProductCardPricing } from '../utils/pricingUtils';
import CleanProductImage from '../components/CleanProductImage';
import AppleProductCard from '../components/AppleProductCard';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';
import { resolveColorValue, isValidHex, normalizeHex } from '../utils/colorResolver';

// Products are loaded dynamically from e-commerce database API

// Products and sub-nav icons are loaded dynamically from e-commerce database API

const DEFAULT_ACCESSORIES_SUB_NAV_ITEMS = [
  { name: 'iPhone', query: 'iphone', path: '/accessories?product=iphone', image: '/uploads/upload_1794292689853_322.png' },
  { name: 'iPad', query: 'ipad', path: '/accessories?product=ipad', image: '/uploads/upload_1794292702660_545.png' },
  { name: 'Mac', query: 'mac', path: '/accessories?product=mac', image: '/uploads/upload_1794293051487_815.png' },
  { name: 'Apple Watch', query: 'watch', path: '/accessories?product=watch', image: '/uploads/upload_1794292728655_907.png' },
  { name: 'AirPods', query: 'airpods', path: '/accessories?product=airpods', image: '/uploads/upload_1794292736726_552.png' },
  { name: 'Home', query: 'home', path: '/accessories?product=home', image: '/uploads/upload_1794292742147_25.png' },
  { name: 'AirTag', query: 'airtag', path: '/accessories?product=airtag', image: '/uploads/upload_1794292747643_181.png' },
  { name: 'Beats', query: 'beats', path: '/accessories?product=beats', image: '/uploads/upload_1794292752316_305.png' }
];

const resolveIconImage = (img, label) => {
  if (img && typeof img === 'string' && img.trim()) {
    let clean = img.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:') && !clean.startsWith('blob:') && !clean.startsWith('/')) {
      clean = '/' + clean;
    }
    // Sanitize old white-background images from previous cache or database
    if (clean.includes('upload_1792581168881_4')) return '/uploads/upload_1794292689853_322.png';
    if (clean.includes('upload_1792581153922_319')) return '/uploads/upload_1794292702660_545.png';
    if (clean.includes('upload_1792648517264_52')) return '/uploads/upload_1794293051487_815.png';
    if (clean.includes('upload_1792581179789_461')) return '/uploads/upload_1794292728655_907.png';
    if (clean.includes('upload_1792581185398_230')) return '/uploads/upload_1794292736726_552.png';
    if (clean.includes('upload_1792581288180_720')) return '/uploads/upload_1794292742147_25.png';
    if (clean.includes('upload_1792581436622_385')) return '/uploads/upload_1794292747643_181.png';
    if (clean.includes('upload_1792648112910_540')) return '/uploads/upload_1794292752316_305.png';
    return clean;
  }
  const lbl = (label || '').toLowerCase();
  if (lbl.includes('iphone')) return '/uploads/upload_1794292689853_322.png';
  if (lbl.includes('ipad')) return '/uploads/upload_1794292702660_545.png';
  if (lbl.includes('mac')) return '/uploads/upload_1794293051487_815.png';
  if (lbl.includes('watch')) return '/uploads/upload_1794292728655_907.png';
  if (lbl.includes('airpod')) return '/uploads/upload_1794292736726_552.png';
  if (lbl.includes('home')) return '/uploads/upload_1794292742147_25.png';
  if (lbl.includes('tag')) return '/uploads/upload_1794292747643_181.png';
  if (lbl.includes('beat')) return '/uploads/upload_1794292752316_305.png';
  return '/accessories_category_uploaded.png';
};

export default function Accessories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, loading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [selectedColors, setSelectedColors] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [localWishlist, setLocalWishlist] = useState({});
  const [showBrowseMenu, setShowBrowseMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('search') || '';
    } catch (e) {
      return '';
    }
  });
  const [selectedProductFilter, setSelectedProductFilter] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const prod = sp.get('product');
      if (prod) return prod.toLowerCase().trim();
      const srch = sp.get('search');
      const cat = sp.get('category');
      if (srch || cat) return '';
      return 'iphone';
    } catch (e) {
      return 'iphone';
    }
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('category') || '';
    } catch (e) {
      return '';
    }
  });
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleCountRef = useRef(visibleCount);
  const isLoadingMore = useRef(false);

  const [subItems, setSubItems] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_sub_items_v2_accessories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => ({
            ...item,
            image: resolveIconImage(item.image, item.name)
          }));
        }
      }
    } catch (e) {}
    return DEFAULT_ACCESSORIES_SUB_NAV_ITEMS;
  });

  useEffect(() => {
    fetchSubNavItems();
    const unsub = subscribeToLiveSync((data) => {
      if (data?.type === 'categories') {
        fetchSubNavItems();
      }
    });
    return () => unsub();
  }, []);

  const fetchSubNavItems = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data) {
        if (response.data.categoryIconGroups) {
          const accGrp = response.data.categoryIconGroups.find(g => g.categoryKey === 'accessories');
          if (accGrp && accGrp.icons && accGrp.icons.length > 0) {
            const activeSub = accGrp.icons.filter(d => d.isActive !== false);
            if (activeSub.length > 0) {
              const mapped = activeSub.map(d => ({
                name: d.label,
                query: d.query || d.label,
                path: d.path || `/accessories?product=${encodeURIComponent((d.query || d.label).toLowerCase())}`,
                image: resolveIconImage(d.image, d.label)
              }));
              try {
                localStorage.setItem('iincept_sub_items_v2_accessories', JSON.stringify(mapped));
              } catch (e) {}
              setSubItems(prev => (JSON.stringify(prev) !== JSON.stringify(mapped) ? mapped : prev));
              return;
            }
          }
        }
        if (response.data.navbarMenuItems) {
          const accItem = response.data.navbarMenuItems.find(i => (i.name || '').toLowerCase().includes('accessori'));
          if (accItem && accItem.dropdownItems && accItem.dropdownItems.length > 0) {
            const activeSub = accItem.dropdownItems.filter(d => d.isActive !== false && !(d.label || '').toLowerCase().startsWith('shop all'));
            if (activeSub.length > 0) {
              const mapped = activeSub.map(d => ({
                name: d.label,
                query: d.query || d.label,
                path: d.path || `/accessories?product=${encodeURIComponent((d.query || d.label).toLowerCase())}`,
                image: resolveIconImage(d.image, d.label)
              }));
              try {
                localStorage.setItem('iincept_sub_items_v2_accessories', JSON.stringify(mapped));
              } catch (e) {}
              setSubItems(prev => (JSON.stringify(prev) !== JSON.stringify(mapped) ? mapped : prev));
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load accessories sub nav settings:', err);
    }
  };

  const handleSubItemClick = (e, item) => {
    e.preventDefault();
    const itemQuery = (item.query || item.name || '').toLowerCase().trim();
    if (selectedProductFilter.toLowerCase() === itemQuery) {
      // If toggling the active item, fallback to iphone rather than bare /accessories
      setSelectedProductFilter('iphone');
      navigate('/accessories?product=iphone', { replace: true });
    } else {
      setSelectedProductFilter(itemQuery);
      navigate(`/accessories?product=${encodeURIComponent(itemQuery)}`, { replace: true });
    }
  };

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    dispatch(fetchProducts());
    const unsubscribe = subscribeToLiveSync(() => {
      dispatch(fetchProducts());
    });
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    setSelectedColors({});
  }, [products]);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeTab, searchQuery, selectedProductFilter, selectedCategoryFilter, searchParams]);

  const filteredProductsLengthRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop > 150 && (clientHeight + scrollTop >= scrollHeight - 140)) {
        if (visibleCountRef.current >= filteredProductsLengthRef.current) return;
        isLoadingMore.current = true;
        setVisibleCount(prev => {
          if (prev >= filteredProductsLengthRef.current) return prev;
          return prev + 6;
        });
        setTimeout(() => {
          isLoadingMore.current = false;
        }, 300);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const urlProduct = searchParams.get('product');
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');

    // If on bare /accessories without any parameters, automatically redirect to /accessories?product=iphone
    if (!urlProduct && !urlSearch && !urlCategory) {
      navigate('/accessories?product=iphone', { replace: true });
      setSelectedProductFilter('iphone');
    } else if (urlProduct) {
      setSelectedProductFilter(urlProduct.toLowerCase().trim());
    } else if (urlSearch || urlCategory) {
      setSelectedProductFilter('');
    } else {
      setSelectedProductFilter('iphone');
    }

    setSearchQuery(urlSearch || '');
    setSelectedCategoryFilter(urlCategory || '');
  }, [searchParams, navigate]);


  const handleColorChange = (productId, colorVal) => {
    setSelectedColors({ [productId]: colorVal });
  };

  const getVariantForSelectedColor = (prod, selectedColorName) => {
    if (!prod || !selectedColorName) return null;
    const targetNorm = String(selectedColorName).trim().toLowerCase();

    if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
      const matched = prod.variants.find(v => {
        const vColor = (v.color || v.title || v.displayTitle || '').toString().trim().toLowerCase();
        return vColor === targetNorm;
      });
      if (matched) return matched;
    }
    return null;
  };

  const getProductImage = (prod) => {
    if (!prod) return '/avatar.png';

    const pId = prod.id || prod._id;
    const selectedColorName = selectedColors[pId];
    
    if (selectedColorName) {
      const targetNorm = String(selectedColorName).trim().toLowerCase();

      // 1. Check prod.variants array for color image
      if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
        const matchedVariant = prod.variants.find(v => {
          const vColor = (v.color || v.title || v.displayTitle || '').toString().trim().toLowerCase();
          return vColor === targetNorm;
        });

        if (matchedVariant) {
          if (matchedVariant.displayImage && typeof matchedVariant.displayImage === 'string' && matchedVariant.displayImage.trim()) {
            return matchedVariant.displayImage.trim();
          }
          if (matchedVariant.image && typeof matchedVariant.image === 'string' && matchedVariant.image.trim() && matchedVariant.image !== 'undefined') {
            return matchedVariant.image.trim();
          }
          if (matchedVariant.images && Array.isArray(matchedVariant.images) && matchedVariant.images.length > 0) {
            const validImg = matchedVariant.images.find(img => img && typeof img === 'string' && img.trim() && img !== 'undefined');
            if (validImg) return validImg.trim();
          }
          if (matchedVariant.imageUrl && typeof matchedVariant.imageUrl === 'string' && matchedVariant.imageUrl.trim()) {
            return matchedVariant.imageUrl.trim();
          }
        }
      }

      // 2. Check prod.colorImages object mapping (e.g. { "White": "...", "Black": "..." })
      if (prod.colorImages && typeof prod.colorImages === 'object') {
        const matchedKey = Object.keys(prod.colorImages).find(k => k.trim().toLowerCase() === targetNorm);
        if (matchedKey && prod.colorImages[matchedKey]) {
          const val = prod.colorImages[matchedKey];
          if (typeof val === 'string' && val.trim() && val !== 'undefined') return val.trim();
          if (Array.isArray(val) && val.length > 0) {
            const validImg = val.find(img => img && typeof img === 'string' && img.trim() && img !== 'undefined');
            if (validImg) return validImg.trim();
          }
        }
      }

      // 3. Check prod.colors array objects (e.g. [{ name: "Black", image: "...", images: [...] }])
      if (prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0) {
        const foundColorObj = prod.colors.find(c => {
          const cName = typeof c === 'string' ? c : (c.name || c.title || '');
          return cName.toString().trim().toLowerCase() === targetNorm;
        });

        if (foundColorObj && typeof foundColorObj === 'object') {
          if (foundColorObj.image && typeof foundColorObj.image === 'string' && foundColorObj.image.trim()) {
            return foundColorObj.image.trim();
          }
          if (foundColorObj.displayImage && typeof foundColorObj.displayImage === 'string' && foundColorObj.displayImage.trim()) {
            return foundColorObj.displayImage.trim();
          }
          if (foundColorObj.images && Array.isArray(foundColorObj.images) && foundColorObj.images.length > 0) {
            const validImg = foundColorObj.images.find(img => img && typeof img === 'string' && img.trim() && img !== 'undefined');
            if (validImg) return validImg.trim();
          }
        }

        // 4. Index-based lookup in prod.images
        const colorIdx = prod.colors.findIndex(c => {
          const cName = typeof c === 'string' ? c : (c.name || c.title || '');
          return cName.toString().trim().toLowerCase() === targetNorm;
        });
        if (colorIdx !== -1 && prod.images && Array.isArray(prod.images) && prod.images[colorIdx]) {
          const imgAtIdx = prod.images[colorIdx];
          if (imgAtIdx && typeof imgAtIdx === 'string' && imgAtIdx.trim() && imgAtIdx !== 'undefined') {
            return imgAtIdx.trim();
          }
        }
      }
    }

    // Default primary image fallbacks when no color is selected or no variant image matched
    if (prod.displayImage && typeof prod.displayImage === 'string' && prod.displayImage.trim()) {
      return prod.displayImage.trim();
    }
    if (prod.image && typeof prod.image === 'string' && prod.image.trim() && prod.image !== 'undefined') {
      return prod.image.trim();
    }
    if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
      const validImg = prod.images.find(img => img && typeof img === 'string' && img.trim() && img !== 'undefined');
      if (validImg) return validImg.trim();
    }

    return '/avatar.png';
  };

  const handleAddToCart = (prod) => {
    const pId = prod.id || prod._id;
    const selectedColor = selectedColors[pId] || (prod.colors && prod.colors[0]?.name) || (prod.colors && typeof prod.colors[0] === 'string' ? prod.colors[0] : 'Standard');
    const matchedVariant = getVariantForSelectedColor(prod, selectedColor);
    const variantPrice = matchedVariant?.price || prod.price;
    const variantImage = getProductImage(prod);
    const variantSku = matchedVariant?.sku || matchedVariant?.partNumber || prod.sku || prod.partNumber || '';

    dispatch(addToCart({
      id: matchedVariant ? `${pId}-${matchedVariant._id || selectedColor}` : pId,
      productId: pId,
      name: selectedColor && selectedColor !== 'Standard' ? `${prod.name} (${selectedColor})` : prod.name,
      price: variantPrice,
      image: variantImage,
      quantity: 1,
      selectedColor: selectedColor,
      sku: variantSku
    }));
  };

  const isWishlisted = (id) => {
    if (localWishlist[id] !== undefined) return localWishlist[id];
    return wishlistItems.some(item => String(item.id || item._id) === String(id));
  };

  const handleAddToWishlist = (prod) => {
    const pId = prod.id || prod._id;
    const selectedColor = selectedColors[pId] || (prod.colors && prod.colors[0]?.name) || (prod.colors && typeof prod.colors[0] === 'string' ? prod.colors[0] : '');
    const matchedVariant = getVariantForSelectedColor(prod, selectedColor);
    const variantPrice = matchedVariant?.price || prod.price;
    const variantImage = getProductImage(prod);
    const variantSku = matchedVariant?.sku || matchedVariant?.partNumber || prod.sku || prod.partNumber || '';

    const nextVal = !isWishlisted(pId);
    setLocalWishlist((prev) => ({ ...prev, [pId]: nextVal }));
    dispatch(addToWishlist({
      id: pId,
      name: selectedColor ? `${prod.name} (${selectedColor})` : prod.name,
      price: variantPrice,
      image: variantImage,
      rating: prod.rating,
      selectedColor: selectedColor,
      sku: variantSku
    }));
  };

  const dbAccessories = useMemo(() => {
    return products.filter(p => {
      const catName = (p.category?.name || p.category?.toString() || '').toLowerCase();
      const catSlug = (p.category?.slug || '').toLowerCase();
      const titleLower = (p.title || p.name || '').toLowerCase();

      const isAccessoriesCat = catName === 'accessories' || catSlug === 'accessories' || catName.includes('accessori');
      const isAccessoryKeyword = titleLower.includes('case') || 
                                 titleLower.includes('charger') || 
                                 titleLower.includes('adapter') || 
                                 titleLower.includes('cable') || 
                                 titleLower.includes('magsafe') || 
                                 titleLower.includes('pencil') || 
                                 titleLower.includes('keyboard') || 
                                 titleLower.includes('mouse') || 
                                 titleLower.includes('strap') || 
                                 titleLower.includes('band') || 
                                 titleLower.includes('loop') ||
                                 titleLower.includes('power') ||
                                 titleLower.includes('stand') ||
                                 titleLower.includes('dock') ||
                                 titleLower.includes('mount') ||
                                 titleLower.includes('earpods');

      let isMainDevice = false;

      if (titleLower.includes('iphone') && 
          !titleLower.includes('case') && 
          !titleLower.includes('wallet') && 
          !titleLower.includes('cover') && 
          !titleLower.includes('protector') && 
          !titleLower.includes('mount') && 
          !titleLower.includes('charger')) {
        isMainDevice = true;
      }

      if (titleLower.includes('ipad') && 
          !titleLower.includes('pencil') && 
          !titleLower.includes('case') && 
          !titleLower.includes('cover') && 
          !titleLower.includes('keyboard') && 
          !titleLower.includes('folio')) {
        isMainDevice = true;
      }

      if ((titleLower.includes('macbook') || titleLower.includes('laptop') || titleLower.includes('pc ')) &&
          !titleLower.includes('adapter') &&
          !titleLower.includes('charger') &&
          !titleLower.includes('power') &&
          !titleLower.includes('magsafe') &&
          !titleLower.includes('cable') &&
          !titleLower.includes('sleeve') &&
          !titleLower.includes('case') &&
          !titleLower.includes('cover') &&
          !titleLower.includes('dock') &&
          !titleLower.includes('stand')) {
        isMainDevice = true;
      }

      if (titleLower.includes('watch') && 
          !titleLower.includes('band') && 
          !titleLower.includes('loop') && 
          !titleLower.includes('strap') && 
          !titleLower.includes('case') && 
          !titleLower.includes('charger')) {
        isMainDevice = true;
      }

      if ((titleLower.includes('airpods') || titleLower.includes('air pods') || titleLower.includes('headphone') || titleLower.includes('headphones')) && 
          !titleLower.includes('earpods') &&
          !titleLower.includes('plug') &&
          !titleLower.includes('adapter') &&
          !titleLower.includes('cable') &&
          !titleLower.includes('case') && 
          !titleLower.includes('charm') && 
          !titleLower.includes('strap') && 
          !titleLower.includes('stand')) {
        isMainDevice = true;
      }

      if (titleLower.includes('tv') && 
          !titleLower.includes('mount') && 
          !titleLower.includes('cable') && 
          !titleLower.includes('holder') &&
          !titleLower.includes('accessories') &&
          catName !== 'accessories') {
        isMainDevice = true;
      }

      if (titleLower.includes('homepod') && !titleLower.includes('mount') && !titleLower.includes('stand')) {
        isMainDevice = true;
      }

      return (isAccessoriesCat || isAccessoryKeyword) && !isMainDevice;
    }).map(p => {
      const firstImg = p.image || (p.images && p.images[0]);
      const primaryImg = p.displayImage || (firstImg && !firstImg.includes('mock-cloud') ? firstImg : (p.image || '/iphone17e_cases.jpg'));
      const idStr = p._id ? (typeof p._id === 'object' ? p._id.toString() : String(p._id)) : String(p.id || p.title);
      return {
        id: idStr,
        name: p.title || p.name,
        price: p.price,
        priceStr: `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
        discountPercent: p.discountPercent,
        discountPrice: p.discountPrice,
        displayImage: primaryImg,
        colorImages: p.colorImages || {},
        image: primaryImg,
        images: p.images || [],
        variants: p.variants || [],
        colors: Array.isArray(p.colors) ? p.colors.map(c => {
          const name = typeof c === 'string' ? c : (c.name || '');
          const matchedVariant = p.variants && Array.isArray(p.variants)
            ? p.variants.find(v => (v.color || '').trim().toLowerCase() === name.trim().toLowerCase())
            : null;
          const val = typeof c === 'string' ? c : (c.colorHex || c.value || c.name || '');
          const hex = (typeof c === 'object' && c.colorHex && isValidHex(c.colorHex))
            ? normalizeHex(c.colorHex)
            : (typeof c === 'object' && c.value && isValidHex(c.value))
              ? normalizeHex(c.value)
              : (matchedVariant?.colorHex && isValidHex(matchedVariant.colorHex))
                ? normalizeHex(matchedVariant.colorHex)
                : resolveColorValue(val);
          return { name, value: hex, colorHex: hex };
        }) : [],
        rating: p.rating || 5.0,
        isSoldOut: p.stock <= 0,
        accessoryDevice: (p.accessoryDevice || '').toString().toLowerCase().trim()
      };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return dbAccessories.filter((prod) => {
      const nameLower = (prod.name || '').toLowerCase();

      if (activeTab === 'available' && prod.isSoldOut) return false;
      if (activeTab === 'soldout' && !prod.isSoldOut) return false;

      if (searchQuery && !matchesProductSearch(prod, searchQuery)) return false;

      if (selectedProductFilter) {
        const f = selectedProductFilter.toLowerCase().trim();
        const dev = (prod.accessoryDevice || '').toLowerCase().trim();

        // 1. Direct match if product has an explicit accessoryDevice set in Admin Panel
        if (dev) {
          const isWatchMatch = (f === 'watch' || f === 'apple watch') && (dev === 'watch' || dev === 'apple watch');
          const isHomeMatch = (f === 'home' || f === 'tv' || f === 'tv-home') && (dev === 'home' || dev === 'tv' || dev === 'tv-home');
          const isTagMatch = (f === 'airtag' || f === 'tag') && (dev === 'airtag' || dev === 'tag');
          const isDirectMatch = dev === f || isWatchMatch || isHomeMatch || isTagMatch;
          if (!isDirectMatch) return false;
        } else {
          // 2. Intelligent keyword fallback for accessories without an explicit accessoryDevice
          if (f === 'mac') {
            if (nameLower.includes('ipad') || nameLower.includes('iphone') || nameLower.includes('watch')) return false;
            if (!nameLower.includes('mac') && !nameLower.includes('keyboard') && !nameLower.includes('mouse') && !nameLower.includes('trackpad') && !nameLower.includes('adapter') && !nameLower.includes('cable') && !nameLower.includes('dock') && !nameLower.includes('stand')) return false;
          } else if (f === 'ipad') {
            if (nameLower.includes('for mac') || nameLower.includes('mac models') || nameLower.includes('macbook')) return false;
            if (!nameLower.includes('ipad') && !nameLower.includes('pencil') && !nameLower.includes('folio') && !nameLower.includes('cover')) return false;
          } else if (f === 'iphone') {
            if (!nameLower.includes('iphone') && !nameLower.includes('case') && !nameLower.includes('cover') && !nameLower.includes('wallet') && !nameLower.includes('magsafe') && !nameLower.includes('charger')) return false;
          } else if (f === 'watch' || f === 'apple watch') {
            if (!nameLower.includes('watch') && !nameLower.includes('band') && !nameLower.includes('loop') && !nameLower.includes('strap') && !nameLower.includes('charger')) return false;
          } else if (f === 'airpods') {
            if (nameLower.includes('pencil') || nameLower.includes('thunderbolt') || nameLower.includes('watch')) return false;
            if (!nameLower.includes('airpod') && !nameLower.includes('earpod') && !nameLower.includes('earbuds') && !nameLower.includes('audio cable')) return false;
          } else if (f === 'home' || f === 'tv-home' || f === 'tv') {
            if (nameLower.includes('earpod')) return false;
            if (!nameLower.includes('tv') && !nameLower.includes('homepod') && !nameLower.includes('home pod') && !nameLower.includes('home') && !nameLower.includes('remote') && !nameLower.includes('mount')) return false;
          } else if (f === 'airtag' || f === 'tag') {
            if (!nameLower.includes('airtag') && !nameLower.includes('air tag') && !nameLower.includes('tag') && !nameLower.includes('ring') && !nameLower.includes('loop')) return false;
          } else if (f === 'beats' || f === 'beat') {
            if (!nameLower.includes('beats') && !nameLower.includes('beat') && !nameLower.includes('solo') && !nameLower.includes('studio') && !nameLower.includes('pill')) return false;
          } else {
            if (!nameLower.includes(f) && !matchesProductSearch(prod, f)) return false;
          }
        }
      }

      return true;
    });
  }, [dbAccessories, activeTab, searchQuery, selectedProductFilter]);

  useEffect(() => {
    filteredProductsLengthRef.current = filteredProducts.length;
  }, [filteredProducts.length]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1d1d1f] pt-2 sm:pt-3 pb-8 select-none relative font-sans">

      {/* Title & Category Sub-Nav Header */}
      <div className="w-full bg-[#fcfcfc] pt-0 pb-2 select-none font-sans mb-3 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 text-left mb-2">Accessories</h1>

          {/* Horizontal Accessories Category Selector Row (Apple Style) */}
          <div className="flex items-end justify-start gap-7 sm:gap-9 md:gap-11 lg:gap-12 overflow-x-auto no-scrollbar py-3 px-1">
            {subItems.map((item, idx) => {
              const itemQuery = (item.query || item.name || '').toLowerCase().trim();
              const isActive = selectedProductFilter.toLowerCase() === itemQuery;

              return (
                <button
                  key={item.name || idx}
                  type="button"
                  onClick={(e) => handleSubItemClick(e, item)}
                  className={`flex flex-col items-center gap-2 shrink-0 group cursor-pointer bg-transparent border-0 p-0 transition-transform duration-200 opacity-100 ${
                    isActive ? 'scale-105' : ''
                  }`}
                >
                  <div className="h-16 sm:h-20 w-16 sm:w-20 md:w-24 flex items-center justify-center p-1 overflow-visible">
                    <img
                      src={resolveIconImage(item.image, item.name)}
                      alt={item.name}
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = resolveIconImage('', item.name);
                      }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1"
                    />
                  </div>
                  <span className={`text-[12px] sm:text-[13px] tracking-tight transition-colors duration-200 ${
                    isActive ? 'font-bold text-zinc-950' : 'font-medium text-zinc-700 group-hover:text-zinc-950'
                  }`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-3">


        {/* Category Products Grid List */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mb-3" />
            <span className="text-sm">Loading premium accessories catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-zinc-400">
            <span className="text-sm">No accessories found in this criteria.</span>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.slice(0, visibleCount).map((prod) => {
              const pId = prod.id || prod._id;
              return (
                <AppleProductCard
                  key={pId}
                  product={prod}
                  selectedColor={selectedColors[pId]}
                  onColorChange={(colorName) => handleColorChange(pId, colorName)}
                  isWishlisted={isWishlisted(pId)}
                  onToggleWishlist={() => handleAddToWishlist(prod)}
                  onAddToCart={() => handleAddToCart(prod)}
                />
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Indicator */}
        {visibleCount < filteredProducts.length && (
          <div className="text-center py-10">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 text-white text-xs font-bold tracking-wide hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
            >
              <span>Scroll for More Products ({Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
