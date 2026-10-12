import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingBag, Heart, User, Search, Menu, X, LogOut,
  ChevronDown, Package, ShieldCheck, Gift, Settings
} from 'lucide-react';
import { logout } from '../redux/authSlice';
import { fetchProducts } from '../redux/productSlice';
import { openCart, fetchCart } from '../redux/cartSlice';
import { fetchWishlist } from '../redux/wishlistSlice';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';
import { normalizeTargetPath } from '../utils/searchUtils';

const AppleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const pathParts = location.pathname.split('/product/');
  const productId = pathParts[1] ? pathParts[1] : null;
  const isAppleProductId = productId && (
    productId.startsWith('ip') ||
    productId.startsWith('mb') ||
    productId.startsWith('aw') ||
    productId.startsWith('ap') ||
    productId.startsWith('tv')
  );
  const isIphonePage = true;

  const getNavBtnClass = (isOpen) => {
    return `transition-colors duration-150 font-[600] text-[13px] tracking-normal cursor-pointer bg-transparent border-0 focus:outline-none whitespace-nowrap font-sans ${isOpen
      ? 'text-black font-[600]'
      : 'text-[#1d1d1f] hover:text-black'
      }`;
  };

  const dropdownClass = `absolute left-0 w-full shadow-lg z-20 pt-6 pb-8 px-6 sm:px-12 md:px-16 animate-in fade-in slide-in-from-top-2 duration-200 text-left select-text ${isIphonePage ? 'bg-white text-zinc-900 border-b border-zinc-200 iphone-dropdown-theme' : 'bg-zinc-950 text-[#f5f5f7]'
    }`;

  const styleTag = (
    <style>{`
      .iphone-dropdown-theme {
        background-color: #ffffff !important;
        color: #1d1d1f !important;
        border: 1px solid rgba(0,0,0,0.08) !important;
        top: calc(100% + 10px) !important;
        border-radius: 24px !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
      }
      .iphone-dropdown-theme a, 
      .iphone-dropdown-theme button {
        color: #3f3f46 !important;
      }
      .iphone-dropdown-theme a.nav-dropdown-link,
      .iphone-dropdown-theme button.nav-dropdown-link {
        color: #1d1d1f !important;
        font-weight: 700 !important;
        font-size: 17px !important;
        letter-spacing: -0.01em !important;
      }
      .iphone-dropdown-theme a:hover, 
      .iphone-dropdown-theme button:hover {
        color: #000000 !important;
      }
      .iphone-dropdown-theme a.nav-dropdown-link:hover,
      .iphone-dropdown-theme button.nav-dropdown-link:hover {
        color: #000000 !important;
      }
      .iphone-dropdown-theme span {
        color: #71717a !important;
      }

      .pill-nav-container > div[class*="absolute"][class*="z-50"] {
        border-radius: 9999px !important;
        overflow: hidden !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
      }

      /* SMART AUTO-HIDE & REVEAL FLOATING PILL NAVBAR */
      .pill-nav-stage {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding-top: 16px;
        padding-bottom: 18px;
        pointer-events: none;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        will-change: transform;
      }

      .pill-nav-stage.nav-hidden {
        transform: translateY(-130%);
        pointer-events: none !important;
      }

      .pill-nav-stage.nav-visible {
        transform: translateY(0);
      }

      .pill-nav-container {
        width: calc(100% - 80px);
        max-width: 1440px;
        margin: 0 auto;
        height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px !important;
        border-radius: 9999px !important;
        background: #ffffff !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04) !important;
        pointer-events: auto;
        position: relative;
        box-sizing: border-box;
      }

      @media (max-width: 1023px) {
        .pill-nav-stage {
          padding-top: 12px;
          padding-bottom: 16px;
        }
        .pill-nav-container {
          width: calc(100% - 40px);
          padding: 0 20px !important;
          height: 56px;
        }
      }

      @media (max-width: 639px) {
        .pill-nav-stage {
          padding-top: 10px;
          padding-bottom: 14px;
        }
        .pill-nav-container {
          width: calc(100% - 24px);
          padding: 0 14px !important;
          height: 52px;
        }
      }

      .pill-nav-container .cta-btn-pill {
        color: #fff !important;
        background: #141414 !important;
        padding: 8px 16px !important;
        border-radius: 9999px !important;
        transition: background .15s ease !important;
        font-size: 11px !important;
        font-weight: 700 !important;
      }
      .pill-nav-container .cta-btn-pill:hover {
        background: #000000 !important;
      }
    `}</style>
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isMacDropdownOpen, setIsMacDropdownOpen] = useState(false);
  const [isIpadDropdownOpen, setIsIpadDropdownOpen] = useState(false);
  const [isIphoneDropdownOpen, setIsIphoneDropdownOpen] = useState(false);
  const [isWatchDropdownOpen, setIsWatchDropdownOpen] = useState(false);
  const [isAirpodsDropdownOpen, setIsAirpodsDropdownOpen] = useState(false);
  const [isTvDropdownOpen, setIsTvDropdownOpen] = useState(false);
  const [isEntertainmentDropdownOpen, setIsEntertainmentDropdownOpen] = useState(false);
  const [isAccessoriesDropdownOpen, setIsAccessoriesDropdownOpen] = useState(false);
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();


  // Body scroll locking and ESC key listener for Mobile Navigation Drawer & Search Overlay
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const macTimeoutRef = useRef(null);
  const ipadTimeoutRef = useRef(null);
  const iphoneTimeoutRef = useRef(null);
  const watchTimeoutRef = useRef(null);
  const airpodsTimeoutRef = useRef(null);
  const tvTimeoutRef = useRef(null);
  const entertainmentTimeoutRef = useRef(null);
  const accessoriesTimeoutRef = useRef(null);
  const supportTimeoutRef = useRef(null);

  const closeAllDropdowns = () => {
    setIsMacDropdownOpen(false);
    setIsIpadDropdownOpen(false);
    setIsIphoneDropdownOpen(false);
    setIsWatchDropdownOpen(false);
    setIsAirpodsDropdownOpen(false);
    setIsTvDropdownOpen(false);
    setIsEntertainmentDropdownOpen(false);
    setIsAccessoriesDropdownOpen(false);
    setIsSupportDropdownOpen(false);
  };

  const clearAllTimeouts = () => {
    if (macTimeoutRef.current) clearTimeout(macTimeoutRef.current);
    if (ipadTimeoutRef.current) clearTimeout(ipadTimeoutRef.current);
    if (iphoneTimeoutRef.current) clearTimeout(iphoneTimeoutRef.current);
    if (watchTimeoutRef.current) clearTimeout(watchTimeoutRef.current);
    if (airpodsTimeoutRef.current) clearTimeout(airpodsTimeoutRef.current);
    if (tvTimeoutRef.current) clearTimeout(tvTimeoutRef.current);
    if (entertainmentTimeoutRef.current) clearTimeout(entertainmentTimeoutRef.current);
    if (accessoriesTimeoutRef.current) clearTimeout(accessoriesTimeoutRef.current);
    if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
  };

  // Smart Auto-Hide on Scroll Down & Reveal on Scroll Up
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop;
          const prevScrollY = lastScrollYRef.current;
          const diff = currentScrollY - prevScrollY;

          // Always visible at the very top of the page
          if (currentScrollY <= 40) {
            setIsNavVisible(true);
          } else if (diff > 8) {
            // Scrolling down by more than 8px -> smoothly hide navbar
            if (!isSearchOpen && !isMobileMenuOpen) {
              setIsNavVisible(false);
              clearAllTimeouts();
              closeAllDropdowns();
            }
          } else if (diff < -8) {
            // Scrolling up by more than 8px -> smoothly reveal navbar
            setIsNavVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchOpen, isMobileMenuOpen]);

  // Ensure navbar is immediately visible on route navigation
  useEffect(() => {
    setIsNavVisible(true);
    lastScrollYRef.current = 0;
  }, [location.pathname]);

  const handleMacMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsMacDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore All Mac']);
  };

  const handleMacMouseLeave = () => {
    macTimeoutRef.current = setTimeout(() => {
      setIsMacDropdownOpen(false);
    }, 350);
  };

  const handleIpadMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsIpadDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore All iPad']);
  };

  const handleIpadMouseLeave = () => {
    ipadTimeoutRef.current = setTimeout(() => {
      setIsIpadDropdownOpen(false);
    }, 350);
  };

  const handleIphoneMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsIphoneDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore All iPhone']);
  };

  const handleIphoneMouseLeave = () => {
    iphoneTimeoutRef.current = setTimeout(() => {
      setIsIphoneDropdownOpen(false);
    }, 350);
  };

  const handleWatchMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsWatchDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore All Apple Watch']);
  };

  const handleWatchMouseLeave = () => {
    watchTimeoutRef.current = setTimeout(() => {
      setIsWatchDropdownOpen(false);
    }, 350);
  };

  const handleAirpodsMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsAirpodsDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore All AirPods']);
  };

  const handleAirpodsMouseLeave = () => {
    airpodsTimeoutRef.current = setTimeout(() => {
      setIsAirpodsDropdownOpen(false);
    }, 350);
  };

  const handleTvMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsTvDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Explore TV & Home']);
  };

  const handleTvMouseLeave = () => {
    tvTimeoutRef.current = setTimeout(() => {
      setIsTvDropdownOpen(false);
    }, 350);
  };

  const handleEntertainmentMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsEntertainmentDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
  };

  const handleEntertainmentMouseLeave = () => {
    entertainmentTimeoutRef.current = setTimeout(() => {
      setIsEntertainmentDropdownOpen(false);
    }, 350);
  };

  const handleAccessoriesMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsAccessoriesDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    setHoveredProduct(productPreviews['Shop All Accessories']);
  };

  const handleAccessoriesMouseLeave = () => {
    accessoriesTimeoutRef.current = setTimeout(() => {
      setIsAccessoriesDropdownOpen(false);
    }, 350);
  };

  const handleSupportMouseEnter = () => {
    clearAllTimeouts();
    closeAllDropdowns();
    setIsSupportDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
  };

  const handleSupportMouseLeave = () => {
    supportTimeoutRef.current = setTimeout(() => {
      setIsSupportDropdownOpen(false);
    }, 350);
  };

  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const { products } = useSelector((state) => state.products || { products: [] });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCart());
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const getMatchingProducts = (query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q || !products) return [];

    return products.filter(p => {
      const title = (p.title || p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const partNum = (p.partNumber || p.variants?.[0]?.partNumber || '').toLowerCase();
      const modelNum = (p.modelNumber || '').toLowerCase();
      const categoryName = (p.category?.name || p.category || '').toLowerCase();
      const description = (p.description || '').toLowerCase();

      return title.includes(q) ||
             brand.includes(q) ||
             partNum.includes(q) ||
             modelNum.includes(q) ||
             categoryName.includes(q) ||
             description.includes(q);
    });
  };

  const resolveProductImage = (prod) => {
    if (!prod) return '/iphone_category_v2.jpg';

    let raw = null;

    if (typeof prod.image === 'string' && prod.image.trim() && !prod.image.includes('mock-cloud') && prod.image !== '/avatar.png') {
      raw = prod.image.trim();
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      const validImg = prod.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud') && img !== '/avatar.png');
      if (validImg) raw = validImg.trim();
    }

    if (!raw && Array.isArray(prod.variants) && prod.variants.length > 0) {
      for (const v of prod.variants) {
        if (!v) continue;
        if (typeof v.image === 'string' && v.image.trim() && !v.image.includes('mock-cloud')) {
          raw = v.image.trim();
          break;
        }
        if (Array.isArray(v.images) && v.images.length > 0) {
          const validVImg = v.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
          if (validVImg) {
            raw = validVImg.trim();
            break;
          }
        }
      }
    }

    if (raw) {
      if (!raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('/')) {
        return '/' + raw;
      }
      return raw;
    }

    const titleLower = (prod.title || prod.name || '').toLowerCase();
    const catLower = (prod.category?.name || prod.category || '').toLowerCase();

    if (titleLower.includes('mac') || catLower.includes('mac')) return '/macbook_category_v3.jpg';
    if (titleLower.includes('ipad') || catLower.includes('ipad')) return '/ipad_category_v3.png';
    if (titleLower.includes('watch') || catLower.includes('watch')) return '/watch_category_uploaded.png';
    if (titleLower.includes('airpod') || catLower.includes('airpod')) return '/airpods_category_uploaded.png';
    if (titleLower.includes('tv') || titleLower.includes('homepod') || catLower.includes('tv')) return '/tvhome_category_uploaded.png';
    if (titleLower.includes('case') || titleLower.includes('charger') || catLower.includes('accessori') || titleLower.includes('power') || titleLower.includes('magsafe')) return '/accessories_category_uploaded.png';

    return '/iphone_category_v2.jpg';
  };

  const getCategoryProducts = (catKey) => {
    if (!products || products.length === 0) return [];
    const k = (catKey || '').toLowerCase();
    
    return products.filter(p => {
      const cName = (p.category?.name || p.category || '').toLowerCase();
      const title = (p.title || p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();

      if (k === 'mac') return cName.includes('mac') || title.includes('mac');
      if (k === 'ipad') return cName.includes('ipad') || title.includes('ipad');
      if (k === 'iphone') return cName.includes('iphone') || title.includes('iphone');
      if (k === 'watch') return cName.includes('watch') || title.includes('watch');
      if (k === 'airpods') return cName.includes('airpod') || title.includes('airpod');
      if (k === 'tv-home') return cName.includes('tv') || cName.includes('home') || title.includes('tv') || title.includes('homepod');
      if (k === 'accessories') return cName.includes('accessori') || title.includes('case') || title.includes('charger') || title.includes('cable') || title.includes('magsafe') || brand.includes('belkin');
      return false;
    });
  };

  const CATEGORY_MODEL_MAP = {
    mac: {
      title: 'Explore Mac',
      mainLink: { label: 'Explore All Mac', path: '/macbook' },
      items: [
        { label: 'MacBook Neo', path: '/macbook?search=MacBook Neo', query: 'MacBook Neo' },
        { label: 'MacBook Air', path: '/macbook?search=MacBook Air', query: 'MacBook Air' },
        { label: 'MacBook Pro', path: '/macbook?search=MacBook Pro', query: 'MacBook Pro' },
        { label: 'iMac', path: '/macbook?search=iMac', query: 'iMac' },
        { label: 'Mac Mini', path: '/macbook?search=Mac Mini', query: 'Mac Mini' },
        { label: 'Mac Studio', path: '/macbook?search=Mac Studio', query: 'Mac Studio' },
        { label: 'Displays', path: '/macbook?search=Studio Display', query: 'Display' },
        { label: 'AppleCare+', path: '/applecare', query: 'AppleCare+' }
      ]
    },
    iphone: {
      title: 'Explore iPhone',
      mainLink: { label: 'Explore All iPhone', path: '/iphone' },
      items: [
        { label: 'iPhone Duo', path: '/iphone?search=iPhone Duo', query: 'iPhone Duo' },
        { label: 'iPhone 18 Pro', path: '/iphone?search=iPhone 18 Pro', query: 'iPhone 18 Pro' },
        { label: 'iPhone 17 Pro Max', path: '/iphone?search=iPhone 17 Pro Max', query: 'iPhone 17 Pro Max' },
        { label: 'iPhone 17 Pro', path: '/iphone?search=iPhone 17 Pro', query: 'iPhone 17 Pro' },
        { label: 'iPhone 17', path: '/iphone?search=iPhone 17', query: 'iPhone 17' },
        { label: 'iPhone 17e', path: '/iphone?search=iPhone 17e', query: 'iPhone 17e' },
        { label: 'iPhone 16', path: '/iphone?search=iPhone 16', query: 'iPhone 16' },
        { label: 'Compare iPhone', path: '/compare?category=iphone', query: 'Compare' }
      ]
    },
    ipad: {
      title: 'Explore iPad',
      mainLink: { label: 'Explore All iPad', path: '/ipad' },
      items: [
        { label: 'iPad Pro', path: '/ipad?search=iPad Pro', query: 'iPad Pro' },
        { label: 'iPad Air', path: '/ipad?search=iPad Air', query: 'iPad Air' },
        { label: 'iPad', path: '/ipad?search=iPad', query: 'iPad' },
        { label: 'iPad Mini', path: '/ipad?search=iPad Mini', query: 'iPad Mini' },
        { label: 'Apple Pencil', path: '/accessories?search=Pencil', query: 'Pencil' },
        { label: 'Keyboards', path: '/accessories?search=Keyboard', query: 'Keyboard' },
        { label: 'AppleCare+', path: '/applecare', query: 'AppleCare+' },
        { label: 'Compare iPad', path: '/compare?category=ipad', query: 'Compare' }
      ]
    },
    watch: {
      title: 'Explore Watch',
      mainLink: { label: 'Explore All Watch', path: '/watch' },
      items: [
        { label: 'Apple Watch Series 12', path: '/watch?search=Series 12', query: 'Series 12' },
        { label: 'Apple Watch Series 10', path: '/watch?search=Series 10', query: 'Series 10' },
        { label: 'Apple Watch Ultra 2', path: '/watch?search=Ultra', query: 'Ultra' },
        { label: 'Apple Watch SE', path: '/watch?search=SE', query: 'SE' },
        { label: 'Compare Watch', path: '/compare?category=watch', query: 'Compare' }
      ]
    },
    airpods: {
      title: 'Explore AirPods',
      mainLink: { label: 'Explore All AirPods', path: '/airpods' },
      items: [
        { label: 'AirPods Pro 2', path: '/airpods?search=Pro', query: 'AirPods Pro' },
        { label: 'AirPods 4', path: '/airpods?search=AirPods 4', query: 'AirPods 4' },
        { label: 'AirPods Max', path: '/airpods?search=Max', query: 'AirPods Max' }
      ]
    },
    'tv-home': {
      title: 'Explore TV & Home',
      mainLink: { label: 'Explore All TV & Home', path: '/tv-home' },
      items: [
        { label: 'Apple TV 4K', path: '/tv-home?search=Apple TV', query: 'Apple TV' },
        { label: 'HomePod', path: '/tv-home?search=HomePod', query: 'HomePod' },
        { label: 'HomePod Mini', path: '/tv-home?search=HomePod Mini', query: 'HomePod Mini' }
      ]
    },
    accessories: {
      title: 'Explore Accessories',
      mainLink: { label: 'Explore All Accessories', path: '/accessories' },
      items: [
        { label: 'Mac Accessories', path: '/accessories?product=mac', query: 'Mac' },
        { label: 'iPad Accessories', path: '/accessories?product=ipad', query: 'iPad' },
        { label: 'iPhone Accessories', path: '/accessories?product=iphone', query: 'iPhone' },
        { label: 'Apple Watch Accessories', path: '/accessories?product=watch', query: 'Watch' },
        { label: 'AirPods Accessories', path: '/accessories?product=airpods', query: 'AirPods' },
        { label: 'TV & Home Accessories', path: '/accessories?product=tv-home', query: 'TV & Home' }
      ]
    }
  };

  const renderProductCategoryList = (catKey, catTitle, catPath, closeDropdown) => {
    // Find matching item in dynamicNavItems
    const matchedNavItem = dynamicNavItems.find(item => {
      const nLower = (item.name || '').toLowerCase();
      const kLower = (catKey || '').toLowerCase();
      if (kLower === 'mac') return nLower.includes('mac');
      if (kLower === 'ipad') return nLower.includes('ipad');
      if (kLower === 'iphone') return nLower.includes('iphone');
      if (kLower === 'watch') return nLower.includes('watch');
      if (kLower === 'airpods') return nLower.includes('airpod');
      if (kLower === 'tv-home') return nLower.includes('tv') || nLower.includes('home');
      if (kLower === 'accessories') return nLower.includes('accessori');
      if (kLower === 'applecare') return nLower.includes('applecare');
      return false;
    });

    let config = null;
    if (matchedNavItem && matchedNavItem.dropdownItems && matchedNavItem.dropdownItems.length > 0) {
      const activeItems = matchedNavItem.dropdownItems.filter(d => d.isActive !== false);
      if (activeItems.length > 0) {
        config = {
          title: `Explore ${matchedNavItem.name}`,
          items: activeItems.map(d => {
            let label = d.label;
            if (label === 'AppleCare' || label === 'Get AppleCare') label = 'AppleCare+';
            if (label && label.toLowerCase() === 'mac mini') label = 'Mac Mini';
            if (label && label.toLowerCase() === 'ipad mini') label = 'iPad Mini';
            if (label && label.toLowerCase() === 'homepod mini') label = 'HomePod Mini';
            return {
              label: label,
              path: d.path ? normalizeTargetPath(d.path) : (d.query ? `${catPath}?search=${encodeURIComponent(d.query)}` : catPath),
              query: d.query || d.label,
              image: d.image || '',
              price: d.price || ''
            };
          })
        };
      }
    }

    if (!config) {
      config = CATEGORY_MODEL_MAP[catKey];
    }

    const catProds = getCategoryProducts(catKey);

    const handleItemHover = (queryStr, defaultLabel, customItem) => {
      let name = defaultLabel;
      let price = customItem?.price || '';
      let img = customItem?.image || null;

      if (!img) {
        const qLower = (queryStr || defaultLabel || '').toLowerCase();
        const combinedStr = `${queryStr || ''} ${defaultLabel || ''} ${customItem?.label || ''} ${customItem?.path || ''} ${customItem?.query || ''}`.toLowerCase();

        if (combinedStr.includes('applecare')) {
          img = '/applecare_official_hero.png';
        } else if (combinedStr.includes('neo')) {
          img = '/mac_nav/macbook_neo_user.jpg';
        } else if (combinedStr.includes('air') && (combinedStr.includes('mac') || combinedStr.includes('book'))) {
          img = '/mac_nav/macbook_air_user.jpg';
        } else if (combinedStr.includes('pro') && (combinedStr.includes('mac') || combinedStr.includes('laptop') || combinedStr.includes('book'))) {
          img = '/mac_nav/macbook_pro_user.jpg';
        } else if (combinedStr.includes('imac')) {
          img = '/mac_nav/imac_user.jpg';
        } else if (combinedStr.includes('mini') && !combinedStr.includes('ipad') && !combinedStr.includes('homepod')) {
          img = '/mac_nav/mac_mini_user.jpg';
        } else if (combinedStr.includes('studio') && !combinedStr.includes('display')) {
          img = '/mac_nav/mac_studio_user.jpg';
        } else if (combinedStr.includes('display')) {
          img = '/mac_nav/mac_displays_user.jpg';
        } else if (catKey === 'ipad' || combinedStr.includes('ipad')) {
          if (qLower === 'ipad' || defaultLabel?.toLowerCase() === 'ipad') img = '/ipad_nav/dropdown_ipad.png';
          else if (combinedStr.includes('applecare')) img = '/applecare_official_hero.png';
          else if (combinedStr.includes('pro')) img = '/ipad_nav/ipad_pro_nav.jpg';
          else if (combinedStr.includes('air')) img = '/ipad_nav/dropdown_ipad_air.png';
          else if (combinedStr.includes('mini')) img = '/ipad_nav/dropdown_ipad_mini.png';
          else if (combinedStr.includes('pencil')) img = '/ipad_nav/dropdown_apple_pencil.png';
          else if (combinedStr.includes('keyboard')) img = '/ipad_nav/keyboards_nav.jpg';
          else if (combinedStr.includes('compare')) img = '/ipad_nav/ipad_compare.png';
          else if (combinedStr.includes('accessori')) img = '/ipad_nav/dropdown_ipad_accessories.jpg';
          else img = '/ipad_nav/dropdown_ipad.png';
        } else if (catKey === 'iphone' || combinedStr.includes('iphone')) {
          if (combinedStr.includes('applecare')) img = '/applecare_official_hero.png';
          else if (combinedStr.includes('duo')) img = '/iphone_nav/dropdown_iphone_duo.png';
          else if (combinedStr.includes('18')) img = '/iphone_nav/dropdown_iphone_18_pro.jpg';
          else if (combinedStr.includes('pro')) img = '/iphone_nav/dropdown_iphone_17_pro.png';
          else if (combinedStr.includes('air')) img = '/iphone_nav/dropdown_iphone_air.png';
          else if (combinedStr.includes('17e')) img = '/iphone_nav/dropdown_iphone_17e.png';
          else if (combinedStr.includes('17')) img = '/iphone_nav/dropdown_iphone_17.png';
          else if (combinedStr.includes('16')) img = '/iphone_nav/dropdown_iphone_16.png';
          else if (combinedStr.includes('compare')) img = '/iphone_nav/iphone_compare.png';
          else if (combinedStr.includes('accessori')) img = '/iphone_nav/dropdown_iphone_accessories.png';
          else img = '/iphone_nav/dropdown_iphone_17_pro.png';
        } else if (catKey === 'watch' || combinedStr.includes('watch')) {
          if (combinedStr.includes('series 12') || combinedStr.includes('12')) img = '/apple_watch_series_12.png';
          else if (combinedStr.includes('ultra')) img = '/apple_watch_ultra_2_single.png';
          else if (combinedStr.includes('series 10') || combinedStr.includes('10')) img = '/apple_watch_three_models.jpg';
          else if (combinedStr.includes('se')) img = '/apple_watch_three_models.jpg';
          else if (combinedStr.includes('compare')) img = '/apple_watch_three_models.jpg';
          else img = '/watch_category_uploaded.png';
        } else if (catKey === 'airpods' || combinedStr.includes('airpod')) {
          if (combinedStr.includes('pro')) img = '/airpods_pro_uploaded.jpg';
          else if (combinedStr.includes('max')) img = '/airpods_pro_uploaded.jpg';
          else if (combinedStr.includes('4')) img = '/airpods_category_uploaded.png';
          else img = '/airpods_category_uploaded.png';
        }
      }

      if (!img) {
        const explicitPreview = productPreviews[defaultLabel] || productPreviews[queryStr];
        const matched = products?.find(p => {
          const title = (p.title || p.name || '').toLowerCase();
          const q = (queryStr || defaultLabel || '').toLowerCase();
          return title.includes(q);
        });

        if (matched) {
          img = matched.images?.[0] || matched.image;
          if (img?.includes('mock-cloud')) img = null;
          if (!name) name = matched.title || matched.name;
          if (!price && matched.price) price = `₹${matched.price.toLocaleString('en-IN')}`;
        }

        if (!img && explicitPreview) {
          img = explicitPreview.image;
          if (!price && explicitPreview.price) price = explicitPreview.price;
          if (explicitPreview.name) name = explicitPreview.name;
        }

        if (!img) {
          if (qLower.includes('neo')) img = '/mac_nav/macbook_neo_fan.jpg';
          else if (qLower.includes('air')) img = '/mac_nav/macbook_air_nav.jpg';
          else if (qLower.includes('pro')) img = '/mac_nav/macbook_pro_nav.png';
          else if (qLower.includes('imac')) img = '/mac_nav/imac_nav.jpg';
          else if (qLower.includes('mini')) img = '/mac_nav/mac_mini.png';
          else if (qLower.includes('studio') && !qLower.includes('display')) img = '/mac_nav/mac_studio_nav.jpg';
          else if (qLower.includes('display')) img = '/mac_nav/mac_displays_nav.jpg';
          else img = '/macbook_category_v3.jpg';
        }
      }

      setHoveredProduct({
        name: name || defaultLabel,
        price: price || '',
        image: img
      });
    };

    return (
      <div className="md:col-span-6 text-left">
        <span className="text-[12px] font-normal text-[#6E6E73] dark:text-zinc-400 block mb-3">
          {config?.title || catTitle}
        </span>

        <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-2">
          {config ? (
            <>
              {config.mainLink && (
                <Link
                  to={config.mainLink.path}
                  onMouseEnter={() => handleItemHover(catKey, config.mainLink.label, config.mainLink)}
                  onClick={() => {
                    closeDropdown();
                    setHoveredProduct(null);
                  }}
                  className="nav-dropdown-link text-[16px] sm:text-[17px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1"
                >
                  {config.mainLink.label}
                </Link>
              )}

              {config.items.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onMouseEnter={() => handleItemHover(item.query, item.label, item)}
                  onClick={() => {
                    closeDropdown();
                    setHoveredProduct(null);
                  }}
                  className="nav-dropdown-link text-[16px] sm:text-[17px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1"
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            catProds.map((prod) => (
              <Link
                key={prod._id || prod.id}
                to={`/product/${prod._id || prod.id}`}
                onMouseEnter={() => setHoveredProduct({ name: prod.title || prod.name, price: prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : '', image: prod.images?.[0] || prod.image })}
                onClick={() => {
                  closeDropdown();
                  setHoveredProduct(null);
                }}
                className="nav-dropdown-link text-[16px] sm:text-[17px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1"
              >
                {prod.title || prod.name}
              </Link>
            ))
          )}
        </div>
      </div>
    );
  };

  const highlightMatch = (text, query) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="font-bold text-zinc-900 dark:text-white">{part}</strong>
          ) : (
            <span key={i} className="font-normal text-zinc-450 dark:text-zinc-500">{part}</span>
          )
        )}
      </span>
    );
  };

  const getSuggestions = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return { links: [], searches: [] };

    // Common search shortcuts
    if (q.startsWith('iph') || q.startsWith('iphone')) {
      return {
        links: [
          { label: 'Explore iPhone', path: '/iphone' },
          { label: 'Shop iPhone', path: '/iphone' },
          { label: 'iPhone 17 Pro', path: '/iphone?search=iPhone 17 Pro' },
          { label: 'iPhone Air', path: '/iphone?search=iPhone Air' },
          { label: 'iPhone 17', path: '/iphone?search=iPhone 17' }
        ],
        searches: [
          { label: 'iPhone Refurbished', path: `/shop?search=${encodeURIComponent('iPhone Refurbished')}` },
          { label: 'iPhone Batteries', path: `/shop?search=${encodeURIComponent('iPhone Batteries')}` },
          { label: 'iPhone Bumpers', path: `/shop?search=${encodeURIComponent('iPhone Bumpers')}` },
          { label: 'iPhone Cases & Covers', path: `/accessories?search=case` },
          { label: 'iPhone MagSafe', path: `/accessories?search=magsafe` }
        ]
      };
    }

    if (q.startsWith('mac') || q.startsWith('macb')) {
      return {
        links: [
          { label: 'Explore Mac', path: '/macbook' },
          { label: 'Shop Mac', path: '/macbook' },
          { label: 'MacBook Neo', path: '/macbook?search=MacBook Neo' },
          { label: 'MacBook Air', path: '/macbook?search=MacBook Air' },
          { label: 'MacBook Pro', path: '/macbook?search=MacBook Pro' }
        ],
        searches: [
          { label: 'MacBook Refurbished', path: `/shop?search=${encodeURIComponent('MacBook Refurbished')}` },
          { label: 'MacBook Accessories', path: '/accessories?product=mac' },
          { label: 'MacBook Cases', path: '/accessories?search=case' },
          { label: 'Mac Studio', path: '/macbook?search=Mac Studio' }
        ]
      };
    }

    if (q.startsWith('wat') || q.startsWith('apple w')) {
      return {
        links: [
          { label: 'Explore Watch', path: '/watch' },
          { label: 'Shop Watch', path: '/watch' },
          { label: 'Apple Watch Ultra 2', path: '/watch?search=Ultra' },
          { label: 'Apple Watch Series 10', path: '/watch?search=Series' }
        ],
        searches: [
          { label: 'Watch Bands', path: '/accessories?product=watch' },
          { label: 'Watch Charger', path: '/accessories?search=charger' },
          { label: 'Watch Accessories', path: '/accessories?product=watch' }
        ]
      };
    }

    if (q.startsWith('air') || q.startsWith('pod')) {
      return {
        links: [
          { label: 'Explore AirPods', path: '/airpods' },
          { label: 'Shop AirPods', path: '/airpods' },
          { label: 'AirPods Pro 2', path: '/airpods?search=Pro' },
          { label: 'AirPods 4', path: '/airpods?search=AirPods 4' }
        ],
        searches: [
          { label: 'AirPods Cases', path: '/accessories?product=airpods' },
          { label: 'AirPods Max', path: '/airpods?search=Max' },
          { label: 'AirPods Accessories', path: '/accessories?product=airpods' }
        ]
      };
    }

    if (q.startsWith('ipa') || q.startsWith('tablet')) {
      return {
        links: [
          { label: 'Explore iPad', path: '/ipad' },
          { label: 'Shop iPad', path: '/ipad' },
          { label: 'iPad Pro', path: '/ipad?search=iPad Pro' },
          { label: 'iPad Air', path: '/ipad?search=iPad Air' }
        ],
        searches: [
          { label: 'iPad Pencil', path: '/accessories?search=pencil' },
          { label: 'iPad Cases', path: '/accessories?product=ipad' },
          { label: 'iPad Keyboards', path: '/accessories?product=ipad' }
        ]
      };
    }

    // Dynamic fallback matching search input to products in state
    const matchedProducts = products.filter(p =>
      (p.title || p.name || '').toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      links: matchedProducts.map(p => ({
        label: p.title || p.name,
        path: `/product/${p._id || p.id}`
      })),
      searches: [
        { label: `Search for "${query}"`, path: `/search?q=${encodeURIComponent(query)}` }
      ]
    };
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logout());
    alert('Logged out successfully!');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      if (query === 'iphone' || query === 'iphones' || query === 'i phone' || query === 'i phones') {
        navigate('/iphone');
      } else if (query === 'mac' || query === 'macbook' || query === 'macbooks' || query === 'laptop' || query === 'laptops') {
        navigate('/macbook');
      } else if (query === 'ipad' || query === 'ipads' || query === 'tablet' || query === 'tablets') {
        navigate('/ipad');
      } else if (query === 'watch' || query === 'watches' || query === 'apple watch' || query === 'iwatch') {
        navigate('/watch');
      } else if (query === 'airpod' || query === 'airpods' || query === 'air pod' || query === 'air pods' || query === 'headphones' || query === 'headphone') {
        navigate('/airpods');
      } else if (query === 'tv' || query === 'apple tv' || query === 'homepod' || query === 'homepods' || query === 'tv-home' || query === 'tv & home') {
        navigate('/tv-home');
      } else if (query === 'accessories' || query === 'accessory' || query === 'case' || query === 'cases') {
        navigate('/accessories');
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Laptops & PCs', path: '/macbook' },
    { name: 'Smartphones', path: '/iphone' },
    { name: 'Premium Audio', path: '/airpods' },
    { name: 'Wearable Devices', path: '/watch' }
  ];

  const productPreviews = {
    // Mac
    'Explore All Mac': { name: 'Mac Workstations', price: 'Procure M3/M4 Series', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/mac/home-img-1776683069_8064.png' },
    'MacBook Neo': { name: 'MacBook Neo', price: 'High Performance Laptop', image: '/mac_nav/macbook_neo_user.jpg' },
    'MacBook Air': { name: 'MacBook Air', price: 'Light & Powerful. From ₹1,14,900', image: '/mac_nav/macbook_air_user.jpg' },
    'MacBook Pro': { name: 'MacBook Pro', price: 'Pro Workflow Leader. From ₹1,69,900', image: '/mac_nav/macbook_pro_user.jpg' },
    'iMac': { name: 'iMac 24"', price: 'All-in-one Desktop. From ₹1,29,900', image: '/mac_nav/imac_user.jpg' },
    'Mac Mini': { name: 'Mac Mini', price: 'Compact Powerhouse. From ₹54,900', image: '/mac_nav/mac_mini_user.jpg' },
    'Mac mini': { name: 'Mac Mini', price: 'Compact Powerhouse. From ₹54,900', image: '/mac_nav/mac_mini_user.jpg' },
    'Mac Studio': { name: 'Mac Studio', price: 'Creator Station. From ₹1,99,900', image: '/mac_nav/mac_studio_user.jpg' },
    'Displays': { name: 'Studio & Pro Display', price: 'Retina 5K & 6K Panels', image: '/mac_nav/mac_displays_user.jpg' },
    'AppleCare+': { name: 'AppleCare+ Protection', price: 'Official Apple Warranty', image: '/applecare_official_hero.png' },
    'AppleCare': { name: 'AppleCare+ Protection', price: 'Official Apple Warranty', image: '/applecare_official_hero.png' },

    // iPad
    'Explore All iPad': { name: 'iPad Catalogue', price: 'Compare all iPads', image: '/ipad_category_v3.png' },
    'iPad Pro': { name: 'iPad Pro M4', price: 'Ultra Thin design. From ₹99,900', image: '/ipad_nav/ipad_pro_nav.jpg' },
    'iPad Air': { name: 'iPad Air M2', price: 'Performance meets Value. From ₹59,900', image: '/ipad_nav/ipad_air.png' },
    'iPad': { name: 'iPad (10th Gen)', price: 'Daily Workhorse. From ₹34,900', image: '/ipad_nav/ipad.png' },
    'iPad Mini': { name: 'iPad mini', price: 'Pocket Sized Power. From ₹49,900', image: '/ipad_nav/ipad_mini.png' },
    'iPad mini': { name: 'iPad mini', price: 'Pocket Sized Power. From ₹49,900', image: '/ipad_nav/ipad_mini.png' },
    'Apple Pencil': { name: 'Apple Pencil Pro', price: 'Pixel perfect precision. From ₹11,900', image: '/ipad_nav/apple_pencil.png' },
    'Keyboards': { name: 'Magic Keyboard', price: 'Floating cantilever design', image: '/ipad_nav/keyboards.png' },

    // iPhone
    'Explore All iPhone': { name: 'iPhone Catalogue', price: 'Compare all models', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/iphone/home-img-1776683084_2967.png' },
    'iPhone Duo': { name: 'iPhone Duo', price: 'The Foldable Revolution. From ₹2,99,900', image: '/iphone_nav/dropdown_iphone_duo.png' },
    'Iphone Duo': { name: 'iPhone Duo', price: 'The Foldable Revolution. From ₹2,99,900', image: '/iphone_nav/dropdown_iphone_duo.png' },
    'iPhone 18 Pro Max': { name: 'iPhone 18 Pro Max', price: 'Crimson Titanium. From ₹1,64,900', image: '/iphone_nav/dropdown_iphone_18_pro.jpg' },
    'iPhone 18 Pro': { name: 'iPhone 18 Pro', price: 'Crimson Titanium. From ₹1,44,900', image: '/iphone_nav/dropdown_iphone_18_pro.jpg' },
    'Iphone 18 pro': { name: 'iPhone 18 Pro', price: 'Crimson Titanium. From ₹1,44,900', image: '/iphone_nav/dropdown_iphone_18_pro.jpg' },
    'iPhone 17 Pro Max': { name: 'iPhone 17 Pro Max', price: 'Peak Performance. From ₹1,64,900', image: '/iphone_category_v2.jpg' },
    'iPhone 17 Pro': { name: 'iPhone 17 Pro', price: 'Titanium Build. From ₹1,34,900', image: '/iphone_category_v2.jpg' },
    'iPhone 17': { name: 'iPhone 17', price: 'Sleek & Durable. From ₹79,900', image: '/iphone_nav/dropdown_iphone_17.png' },
    'iPhone 16 Pro Max': { name: 'iPhone 16 Pro Max', price: 'Camera Control. From ₹1,44,900', image: '/iphone_category_v2.jpg' },
    'iPhone 16 Pro': { name: 'iPhone 16 Pro', price: 'Studio Recording. From ₹1,19,900', image: '/iphone_category_v2.jpg' },
    'iPhone 16': { name: 'iPhone 16', price: 'Action Button. From ₹79,900', image: '/iphone_nav/dropdown_iphone_16.png' },
    'iPhone SE': { name: 'iPhone SE', price: 'Great Value. From ₹49,900', image: '/iphone_category_v2.jpg' },
    'iPhone 17e': { name: 'iPhone 17e', price: 'Value Champion. From ₹59,900', image: '/iphone_nav/dropdown_iphone_17e.png' },
    'iPhone Air': { name: 'iPhone Air', price: 'Ultra Thin. From ₹89,900', image: '/iphone_category_v2.jpg' },

    // Watch
    'Explore All Apple Watch': { name: 'Apple Watch Lineup', price: 'Browse All Apple Watches', image: '/apple_watch_three_models.jpg' },
    'Apple Watch Series 12': { name: 'Apple Watch Series 12', price: 'Advanced heart & health tracking. From ₹56,900', image: '/apple_watch_series_12.png' },
    'Apple Watch Series 11': { name: 'Apple Watch Series 11', price: 'Advanced fitness tracking. From ₹49,900', image: '/apple_watch_three_models.jpg' },
    'Apple Watch Series 10': { name: 'Apple Watch Series 10', price: 'Thinnest watch with biggest display. From ₹46,900', image: '/apple_watch_three_models.jpg' },
    'Apple Watch SE': { name: 'Apple Watch SE', price: 'Essential features to stay connected. From ₹24,900', image: '/apple_watch_three_models.jpg' },
    'Apple Watch SE 3': { name: 'Apple Watch SE 3', price: 'Essential features. From ₹29,900', image: '/apple_watch_three_models.jpg' },
    'Apple Watch Ultra 4': { name: 'Apple Watch Ultra 4', price: 'Ultimate adventure watch. From ₹99,900', image: '/apple_watch_ultra_2_single.png' },
    'Apple Watch Ultra 3': { name: 'Apple Watch Ultra 3', price: 'Rugged capability. From ₹89,900', image: '/apple_watch_ultra_2_single.png' },
    'Apple Watch Ultra 2': { name: 'Apple Watch Ultra 2', price: 'Rugged capability & adventure. From ₹89,900', image: '/apple_watch_ultra_2_single.png' },
    'Apple Watch Nike': { name: 'Apple Watch Nike', price: 'Sport bands & faces', image: '/apple_watch_three_models.jpg' },

    // AirPods
    'Explore All AirPods': { name: 'AirPods Family', price: 'High fidelity audio', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/music/home-img-1757682200_3577.jpg' },
    'AirPods 4': { name: 'AirPods 4', price: 'Open ear comfort. From ₹12,900', image: '/airpods_category_uploaded.png' },
    'AirPods Pro 3': { name: 'AirPods Pro 3', price: 'Intelligent noise cancellation. From ₹24,900', image: '/airpods_pro_3.jpg' },
    'AirPods Max 2': { name: 'AirPods Max 2', price: 'High-fidelity acoustics. From ₹59,900', image: '/airpods_pro_3.jpg' },

    // TV & Home
    'Explore TV & Home': { name: 'TV & Home Ecosystem', price: 'Hub of smart devices', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/tv/home-img-1694070636_757.png' },
    'Apple TV 4K': { name: 'Apple TV 4K', price: 'Cinematic experience. From ₹14,900', image: '/tvhome_category_uploaded.png' },
    'HomePod': { name: 'HomePod (2nd Gen)', price: 'Deep acoustics. From ₹32,900', image: '/tv_home_homepods.jpg' },
    'HomePod mini': { name: 'HomePod mini', price: 'Room filling sound. From ₹9,900', image: '/tv_home_homepods.jpg' },

    // Accessories in Shop Accessories
    'Shop All Accessories': { name: 'Accessories', price: 'Cables, cases & chargers', image: '/accessories_category_uploaded.png' },
    'Mac': { name: 'Mac Accessories', price: 'Mice, keyboards & stands', image: '/accessories_category_uploaded.png' },
    'iPad': { name: 'iPad Accessories', price: 'Cases, Pencils & Keyboards', image: '/ipad_nav/apple_pencil.png' },
    'iPhone': { name: 'iPhone Accessories', price: 'Cases, MagSafe & chargers', image: '/iphone_nav/dropdown_iphone_accessories.png' },
    'Apple Watch': { name: 'Watch Bands', price: 'Premium bands & loops', image: '/watch_category_uploaded.png' },
    'AirPods': { name: 'AirPods Accessories', price: 'Protective cases', image: '/airpods_category_uploaded.png' },
    'TV & Home': { name: 'Home Accessories', price: 'Mounts & smart plugs', image: '/tvhome_category_uploaded.png' }
  };

  const renderProductPreview = () => {
    return (
      <div className="hidden md:flex md:col-span-6 pl-4 flex-col text-left shrink-0 justify-center items-center">
        {hoveredProduct ? (
          <div className="w-full h-[340px] sm:h-[395px] rounded-3xl bg-white border border-zinc-200/80 p-4 shadow-xs overflow-hidden flex items-center justify-center transition-all duration-300 animate-in fade-in">
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-white p-2">
              <img
                src={hoveredProduct.image}
                alt={hoveredProduct.name || 'Preview'}
                className="max-w-[90%] max-h-[90%] object-contain object-center transition-all duration-300 hover:scale-105"
                style={{
                  imageRendering: 'high-quality',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  filter: 'contrast(1.02) brightness(1.01)',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/macbook_category_v3.jpg';
                }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-[340px] sm:h-[395px] rounded-3xl bg-white border border-dashed border-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Hover to Preview</span>
          </div>
        )}
      </div>
    );
  };



  const [dynamicNavItems, setDynamicNavItems] = useState(null);

  useEffect(() => {
    fetchHeaderCategories();
    const unsubscribe = subscribeToLiveSync(() => {
      fetchHeaderCategories();
      dispatch(fetchProducts());
    });
    return () => unsubscribe();
  }, [dispatch]);

  const fetchHeaderCategories = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data && response.data.navbarMenuItems && response.data.navbarMenuItems.length > 0) {
        setDynamicNavItems(response.data.navbarMenuItems.filter(c => c.isActive !== false));
      } else if (response.data && response.data.appleCategories && response.data.appleCategories.length > 0) {
        setDynamicNavItems(response.data.appleCategories.filter(c => c.isActive !== false));
      } else {
        // API returned no items — fall back to defaults
        setDynamicNavItems([]);
      }
    } catch (err) {
      console.error('Failed to load header categories:', err);
      setDynamicNavItems([]);
    }
  };

  const getCategoryPath = (name, customLink) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('applecare')) return '/applecare';
    if (lower.includes('accessories')) return '/accessories';
    if (lower.includes('iphone')) return '/iphone';
    if (lower.includes('mac')) return '/macbook';
    if (lower.includes('ipad')) return '/ipad';
    if (lower.includes('watch')) return '/watch';
    if (lower.includes('airpod')) return '/airpods';
    if (lower.includes('tv')) return '/tv-home';
    return customLink || '/shop';
  };

  const defaultMenuItems = [
    { label: 'New Arrivals', path: '/shop?sort=newest' },
    { label: 'Mac', path: '/macbook' },
    { label: 'iPad', path: '/ipad' },
    { label: 'iPhone', path: '/iphone' },
    { label: 'Watch', path: '/watch' },
    { label: 'AirPods', path: '/airpods' },
    { label: 'TV & Home', path: '/tv-home' },
    { label: 'Accessories', path: '/accessories' },
    { label: 'AppleCare+', path: '/applecare' }
  ];

  // null = loading (show nothing), [] = loaded but empty (show defaults), [...] = admin items
  const activeMenuItems = dynamicNavItems === null
    ? [] // still loading — render nothing to avoid flash of defaults + admin items
    : dynamicNavItems.length > 0
      ? dynamicNavItems.map(c => ({
          label: c.name,
          path: c.link || getCategoryPath(c.name, c.link)
        }))
      : defaultMenuItems;

  const matchedProducts = getMatchingProducts(searchQuery);
  const displayProducts = matchedProducts.slice(0, 6);

  return (
    <>
      {styleTag}
      {!isHomePage && (
        <div
          className="w-full shrink-0 h-[76px] sm:h-[84px] lg:h-[92px] pointer-events-none select-none"
          aria-hidden="true"
        />
      )}
      <div className={`pill-nav-stage ${isNavVisible ? 'nav-visible' : 'nav-hidden'}`}>
        <nav className="pill-nav-container select-none relative z-40 text-black">

          {/* Sliding Search Overlay Input Pill */}
          {isSearchOpen && (
            <div className="absolute inset-0 z-50 animate-in fade-in duration-200 bg-white border border-zinc-200 rounded-full flex items-center px-6">
              <form onSubmit={handleSearchSubmit} className="flex items-center w-full justify-between">
                <Search className="h-5 w-5 mr-3 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search iincept.com"
                  className="w-full bg-transparent border-0 text-sm font-normal py-2 focus:outline-none placeholder:text-zinc-400 text-black"
                  autoFocus
                />
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-zinc-400 hover:text-zinc-600 bg-transparent border-0 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold uppercase tracking-wider py-2 px-3 rounded-lg cursor-pointer text-zinc-600 hover:text-black">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Floating Real-Time Product Search Overlay Dropdown */}
          {isSearchOpen && (
            <div className={dropdownClass}>
              <div className="max-w-4xl mx-auto space-y-6 font-sans py-2">
                {!searchQuery.trim() ? (
                  <div className="space-y-4 text-left">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">Quick Categories</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'iPhone Catalogue', path: '/iphone' },
                        { label: 'MacBook Catalogue', path: '/macbook' },
                        { label: 'iPad Catalogue', path: '/ipad' },
                        { label: 'Watch Catalogue', path: '/watch' },
                        { label: 'AirPods Catalogue', path: '/airpods' },
                        { label: 'Shop Accessories', path: '/accessories' }
                      ].map((link, idx) => (
                        <Link
                          key={idx}
                          to={link.path}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          className="text-xs font-bold p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-900 hover:bg-zinc-100 transition-all flex items-center justify-between text-zinc-900"
                        >
                          <span>{link.label}</span>
                          <span className="text-zinc-400 text-xs">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        Products Matching "{searchQuery}" ({matchedProducts.length})
                      </span>
                      <Link
                        to={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="text-xs font-bold text-[#0071e3] hover:underline"
                      >
                        View all results →
                      </Link>
                    </div>

                    {displayProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1.5">
                        {displayProducts.map((prod) => {
                          const prodImage = resolveProductImage(prod);
                          return (
                            <Link
                              key={prod._id || prod.id}
                              to={`/product/${prod._id || prod.id}`}
                              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                              className="group p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-zinc-900 bg-white hover:bg-zinc-50/90 transition-all flex items-center gap-4 sm:gap-5 shadow-xs hover:shadow-md"
                            >
                              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white border border-zinc-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:border-zinc-300">
                                <img src={prodImage} alt="" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="text-sm sm:text-base font-extrabold text-zinc-900 leading-snug line-clamp-2">
                                  {prod.title || prod.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-md">
                                    {prod.category?.name || prod.category || prod.brand || 'Apple'}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-2">
                        <p className="text-xs text-zinc-500 font-medium">No products found matching "{searchQuery}"</p>
                        <Link
                          to={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          className="inline-block text-xs font-bold text-[#0071e3] hover:underline"
                        >
                          Perform full catalog search →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="w-full mx-auto px-0 h-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">

            {/* Left: Logo */}
            <Link to="/" className="flex items-center shrink min-w-0 group py-1">
              <img 
                src="/iincept_navbar_logo.png" 
                alt="iiNCEPT" 
                className="h-6.5 sm:h-8 md:h-10 w-auto max-h-7 sm:max-h-9 md:max-h-10 object-contain transition-transform duration-200 group-hover:scale-105" 
                style={{
                  mixBlendMode: 'multiply'
                }}
              />
            </Link>

            {/* Center: Navigation Menu (Spacious Apple-Style Layout) */}
            <div className="hidden lg:flex items-center justify-center gap-[32px] xl:gap-[40px] font-[600] text-[13px] relative flex-1 mx-2 whitespace-nowrap">
              {activeMenuItems.map((item, idx) => {
                const labelLower = (item.label || '').toLowerCase();

                if (labelLower.includes('mac')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleMacMouseEnter}
                      onMouseLeave={handleMacMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/macbook');
                      }}
                      className={getNavBtnClass(isMacDropdownOpen || location.pathname === '/macbook')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('ipad')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleIpadMouseEnter}
                      onMouseLeave={handleIpadMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/ipad');
                      }}
                      className={getNavBtnClass(isIpadDropdownOpen || location.pathname === '/ipad')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('iphone')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleIphoneMouseEnter}
                      onMouseLeave={handleIphoneMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/iphone');
                      }}
                      className={getNavBtnClass(isIphoneDropdownOpen || location.pathname === '/iphone')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('watch')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleWatchMouseEnter}
                      onMouseLeave={handleWatchMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/watch');
                      }}
                      className={getNavBtnClass(isWatchDropdownOpen || location.pathname === '/watch')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('airpod')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleAirpodsMouseEnter}
                      onMouseLeave={handleAirpodsMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/airpods');
                      }}
                      className={getNavBtnClass(isAirpodsDropdownOpen || location.pathname === '/airpods')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('tv') || labelLower.includes('home')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleTvMouseEnter}
                      onMouseLeave={handleTvMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/tv-home');
                      }}
                      className={getNavBtnClass(isTvDropdownOpen || location.pathname === '/tv-home')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('accessori')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleAccessoriesMouseEnter}
                      onMouseLeave={handleAccessoriesMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/accessories');
                      }}
                      className={getNavBtnClass(isAccessoriesDropdownOpen || location.pathname === '/accessories')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('applecare')) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate('/applecare');
                      }}
                      className={getNavBtnClass(location.pathname === '/applecare')}
                    >
                      {item.label}
                    </button>
                  );
                }
                if (labelLower.includes('bulk pricing')) {
                  return (
                    <a
                      key={idx}
                      href="/?scroll=procurement"
                      onClick={(e) => {
                        e.preventDefault();
                        clearAllTimeouts();
                        closeAllDropdowns();
                        if (location.pathname === '/') {
                          const section = document.getElementById('procurement-section');
                          if (section) {
                            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        } else {
                          navigate('/?scroll=procurement');
                        }
                      }}
                      className="cta-btn-pill"
                    >
                      {item.label}
                    </a>
                  );
                }
                if (labelLower.includes('support')) {
                  return (
                    <button
                      key={idx}
                      onMouseEnter={handleSupportMouseEnter}
                      onMouseLeave={handleSupportMouseLeave}
                      onClick={() => {
                        closeAllDropdowns();
                        navigate(item.path);
                      }}
                      className={getNavBtnClass(isSupportDropdownOpen)}
                    >
                      {item.label}
                    </button>
                  );
                }

                // Fallback for ANY custom/new category added in Admin Panel (e.g. New Arrivals, Offers, etc.)
                return (
                  <button
                    key={idx}
                    onMouseEnter={() => {
                      clearAllTimeouts();
                      closeAllDropdowns();
                    }}
                    onClick={() => {
                      closeAllDropdowns();
                      navigate(item.path || '/shop');
                    }}
                    className={getNavBtnClass(location.pathname === item.path)}
                  >
                    {item.label}
                  </button>
                );
              })}

            </div>

            {/* Right: Icon Group */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 text-zinc-800">

              {/* Search Trigger Icon */}
              <button
                onClick={() => { setIsSearchOpen(true); closeAllDropdowns(); }}
                onMouseEnter={() => {
                  clearAllTimeouts();
                  closeAllDropdowns();
                }}
                className="p-1.5 rounded-full transition-colors cursor-pointer bg-transparent border-0 hover:text-black hover:bg-zinc-100 text-zinc-800"
                aria-label="Search"
              >
                <Search className="h-5 w-5 stroke-[2]" />
              </button>

              {/* Cart Icon with Always-Visible Red Count Badge (Matching Image 2 / iTech style) */}
              <button
                onClick={() => {
                  dispatch(openCart());
                  closeAllDropdowns();
                }}
                onMouseEnter={() => {
                  clearAllTimeouts();
                  closeAllDropdowns();
                }}
                className="p-1.5 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer bg-transparent border-0 hover:text-black hover:bg-zinc-100 text-zinc-800"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5 stroke-[2]" />
                <span className="absolute -top-1 -right-1.5 text-[10px] font-extrabold h-4.5 w-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center bg-[#e3000f] text-white shadow-xs leading-none">
                  {cartCount || 0}
                </span>
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 lg:hidden rounded-full focus:outline-none cursor-pointer bg-transparent border-0 hover:text-black hover:bg-zinc-100 text-zinc-800"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 stroke-[2]" /> : <Menu className="h-5 w-5 stroke-[2]" />}
              </button>

            </div>
          </div>

          {/* Full-Screen Mobile Navigation Overlay (Covers entire viewport like Image 2) */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 w-screen h-screen min-h-screen z-[9999] lg:hidden bg-white text-zinc-900 flex flex-col animate-in fade-in duration-200 select-none overflow-hidden">
              {/* Header inside Menu Overlay */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-100 shrink-0">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center shrink-0 group py-1"
                >
                  <img
                    src="/iincept_navbar_logo.png"
                    alt="iiNCEPT"
                    className="h-8 sm:h-9 w-auto object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-7 w-7 stroke-[2]" />
                </button>
              </div>

              {/* Main Navigation Links */}
              <div className="flex-1 px-8 sm:px-12 py-6 overflow-y-auto overscroll-contain">
                <nav className="flex flex-col space-y-1 text-left max-w-xl">
                  {activeMenuItems.map((item, idx) => {
                    if (item.label === 'Bulk Pricing') {
                      return (
                        <a
                          key={idx}
                          href="/?scroll=procurement"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            if (location.pathname === '/') {
                              const section = document.getElementById('procurement-section');
                              if (section) {
                                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            } else {
                              navigate('/?scroll=procurement');
                            }
                          }}
                          className="text-[20px] sm:text-[22px] font-bold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors block py-3 border-b border-zinc-100/80"
                        >
                          {item.label}
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={idx}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[20px] sm:text-[22px] font-bold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors block py-3 border-b border-zinc-100/80"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Mega Dropdown for Mac */}
          {isMacDropdownOpen && (
            <>
              <div
                onMouseEnter={handleMacMouseEnter}
                onMouseLeave={() => {
                  handleMacMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('mac', 'Explore Mac', '/macbook', () => setIsMacDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for iPad */}
          {isIpadDropdownOpen && (
            <>
              <div
                onMouseEnter={handleIpadMouseEnter}
                onMouseLeave={() => {
                  handleIpadMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('ipad', 'Explore iPad', '/ipad', () => setIsIpadDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for iPhone */}
          {isIphoneDropdownOpen && (
            <>
              <div
                onMouseEnter={handleIphoneMouseEnter}
                onMouseLeave={() => {
                  handleIphoneMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('iphone', 'Explore iPhone', '/iphone', () => setIsIphoneDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for Watch */}
          {isWatchDropdownOpen && (
            <>
              <div
                onMouseEnter={handleWatchMouseEnter}
                onMouseLeave={() => {
                  handleWatchMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('watch', 'Explore Watch', '/watch', () => setIsWatchDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for AirPods */}
          {isAirpodsDropdownOpen && (
            <>
              <div
                onMouseEnter={handleAirpodsMouseEnter}
                onMouseLeave={() => {
                  handleAirpodsMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('airpods', 'Explore AirPods', '/airpods', () => setIsAirpodsDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for TV & Home */}
          {isTvDropdownOpen && (
            <>
              <div
                onMouseEnter={handleTvMouseEnter}
                onMouseLeave={() => {
                  handleTvMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('tv-home', 'Explore TV & Home', '/tv-home', () => setIsTvDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for Entertainment */}
          {isEntertainmentDropdownOpen && (
            <>
              <div
                onMouseEnter={handleEntertainmentMouseEnter}
                onMouseLeave={handleEntertainmentMouseLeave}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 font-sans">

                  {/* Column 1: Explore Entertainment */}
                  <div className="md:col-span-5 space-y-5 text-left">
                    <span className="text-[12px] font-medium text-zinc-400 block mb-1">
                      Explore Entertainment
                    </span>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'Explore Entertainment', path: '/shop?category=electronics' },
                        { label: 'Apple One', path: '/shop?category=electronics' },
                        { label: 'Apple TV', path: '/shop?category=electronics' },
                        { label: 'Apple Music', path: '/shop?category=electronics' },
                        { label: 'Apple Arcade', path: '/shop?category=electronics' },
                        { label: 'Apple Fitness+', path: '/shop?category=electronics' },
                        { label: 'Apple Podcasts', path: '/shop?category=electronics' },
                        { label: 'Apple Books', path: '/shop?category=electronics' },
                        { label: 'App Store', path: '/shop?category=electronics' }
                      ].map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setIsEntertainmentDropdownOpen(false)}
                          className="text-base sm:text-[17px] font-medium tracking-tight text-white hover:text-zinc-300 transition-colors block leading-snug py-1"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Support */}
                  <div className="md:col-span-3 space-y-5 text-left">
                    <span className="text-[12px] font-medium text-zinc-400 block mb-1">
                      Support
                    </span>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Apple TV Support', path: '/profile' },
                        { label: 'Apple Music Support', path: '/profile' }
                      ].map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setIsEntertainmentDropdownOpen(false)}
                          className="text-[14px] font-semibold text-zinc-200 hover:text-white transition-colors block"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for Accessories */}
          {isAccessoriesDropdownOpen && (
            <>
              <div
                onMouseEnter={handleAccessoriesMouseEnter}
                onMouseLeave={() => {
                  handleAccessoriesMouseLeave();
                  setHoveredProduct(null);
                }}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 font-sans items-start">
                  {renderProductCategoryList('accessories', 'Explore Accessories', '/accessories', () => setIsAccessoriesDropdownOpen(false))}
                  {renderProductPreview()}
                </div>
              </div>
            </>
          )}

          {/* Mega Dropdown for Support */}
          {isSupportDropdownOpen && (
            <>
              <div
                onMouseEnter={handleSupportMouseEnter}
                onMouseLeave={handleSupportMouseLeave}
                className={dropdownClass}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 font-sans">

                  {/* Column 1: Explore Support */}
                  <div className="md:col-span-5 space-y-5 text-left">
                    <span className="text-[12px] font-medium text-zinc-400 block mb-1">
                      Explore Support
                    </span>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'iPhone', path: '/profile' },
                        { label: 'Mac', path: '/profile' },
                        { label: 'iPad', path: '/profile' },
                        { label: 'Watch', path: '/profile' },
                        { label: 'AirPods', path: '/profile' },
                        { label: 'Music', path: '/profile' },
                        { label: 'TV', path: '/profile' }
                      ].map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setIsSupportDropdownOpen(false)}
                          className="text-base sm:text-[17px] font-medium tracking-tight text-white hover:text-zinc-300 transition-colors block leading-snug py-1"
                        >
                          {sub.label}
                        </Link>
                      ))}
                      <div className="pt-5 mt-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsSupportDropdownOpen(false)}
                          className="text-[12px] font-semibold text-zinc-300 hover:text-white transition-colors block"
                        >
                          Explore Support
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Get Help */}
                  <div className="md:col-span-3 space-y-5 text-left">
                    <span className="text-[12px] font-medium text-zinc-400 block mb-1">
                      Get Help
                    </span>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Community', path: '/profile' },
                        { label: 'Check Coverage', path: '/profile' },
                        { label: 'Genius Bar', path: '/profile' },
                        { label: 'Repair', path: '/profile' }
                      ].map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setIsSupportDropdownOpen(false)}
                          className="text-[14px] font-semibold text-zinc-200 hover:text-white transition-colors block"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Helpful Topics */}
                  <div className="md:col-span-4 space-y-5 text-left">
                    <span className="text-[12px] font-medium text-zinc-400 block mb-1">
                      Helpful Topics
                    </span>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: 'Get AppleCare', path: '/applecare' },
                        { label: 'Apple Account and Password', path: '/profile' },
                        { label: 'Billing & Subscriptions', path: '/profile' },
                        { label: 'Accessibility', path: '/profile' }
                      ].map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          onClick={() => setIsSupportDropdownOpen(false)}
                          className="text-[14px] font-semibold text-zinc-200 hover:text-white transition-colors block"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
