import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

export const resolveNavbarImageUrl = (img) => {
  if (!img || typeof img !== 'string') return '';
  const trimmed = img.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (cleanPath.startsWith('/uploads') && apiUrl && apiUrl.startsWith('http')) {
    try {
      const serverOrigin = new URL(apiUrl).origin;
      return `${serverOrigin}${cleanPath}`;
    } catch (e) {
      // fallback
    }
  }
  return cleanPath;
};

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
  const [isDropdownClosing, setIsDropdownClosing] = useState(false);

  const getNavBtnClass = (isOpen) => {
    return `transition-colors duration-150 font-[600] text-[16px] xl:text-[17px] tracking-normal cursor-pointer bg-transparent border-0 focus:outline-none whitespace-nowrap font-sans px-1.5 py-1 ${isOpen
      ? 'text-black font-[650]'
      : 'text-[#1d1d1f] hover:text-black'
      }`;
  };

  const dropdownClass = `nav-dropdown-panel absolute left-0 w-full shadow-lg z-20 pt-6 pb-8 px-6 sm:px-12 md:px-16 text-left select-text ${
    isDropdownClosing
      ? 'nav-dropdown-closing'
      : 'nav-dropdown-open animate-in fade-in slide-in-from-top-2 duration-200'
  } ${
    isIphonePage
      ? 'bg-white text-zinc-900 border-b border-zinc-200 iphone-dropdown-theme'
      : 'bg-zinc-950 text-[#f5f5f7]'
  }`;

  const styleTag = (
    <style>{`
      /* APPLE-STYLE MEGA DROPDOWN TRANSITIONS & DISMISSAL */
      .nav-dropdown-panel {
        transform-origin: top center;
        will-change: opacity, transform;
      }
      .nav-dropdown-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .nav-dropdown-closing {
        opacity: 0 !important;
        transform: translateY(-8px) scale(0.992) !important;
        pointer-events: none !important;
        transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

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
        font-size: 22px !important;
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
  const [openMobileAccordion, setOpenMobileAccordion] = useState(null);
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
      setOpenMobileAccordion(null);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
        if (isAnyDropdownOpenRef.current) {
          dismissDropdownSmoothly(true);
        }
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

  const isAnyDropdownOpenRef = useRef(false);
  const scrollSuppressedRef = useRef(false);
  const scrollCooldownTimerRef = useRef(null);
  const closeAnimationTimerRef = useRef(null);
  const navContainerRef = useRef(null);

  const isAnyMegaDropdownOpen = Boolean(
    isMacDropdownOpen ||
    isIpadDropdownOpen ||
    isIphoneDropdownOpen ||
    isWatchDropdownOpen ||
    isAirpodsDropdownOpen ||
    isTvDropdownOpen ||
    isEntertainmentDropdownOpen ||
    isAccessoriesDropdownOpen ||
    isSupportDropdownOpen
  );

  useEffect(() => {
    isAnyDropdownOpenRef.current = isAnyMegaDropdownOpen;
  }, [isAnyMegaDropdownOpen]);

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
    if (closeAnimationTimerRef.current) clearTimeout(closeAnimationTimerRef.current);
  };

  const dismissDropdownSmoothly = (immediate = false) => {
    if (!isAnyDropdownOpenRef.current && !isDropdownClosing) return;

    clearAllTimeouts();
    setIsDropdownClosing(true);

    // Instantly remove pointer-events on open dropdown panels so underlying page is immediately interactive
    if (typeof document !== 'undefined') {
      const openPanels = document.querySelectorAll('.nav-dropdown-panel');
      openPanels.forEach(panel => {
        panel.style.pointerEvents = 'none';
      });
    }

    if (closeAnimationTimerRef.current) {
      clearTimeout(closeAnimationTimerRef.current);
    }

    const duration = immediate ? 90 : 180;
    closeAnimationTimerRef.current = setTimeout(() => {
      closeAllDropdowns();
      setHoveredProduct(null);
      setIsDropdownClosing(false);
      isAnyDropdownOpenRef.current = false;
    }, duration);
  };

  // Apple-style automatic scroll dismissal & hover suppression
  useEffect(() => {
    const handleScrollOrWheel = (e) => {
      // Ignore imperceptible micro-wheel ticks (< 2px) on high-precision trackpads
      if (e.type === 'wheel') {
        if (Math.abs(e.deltaY) < 2 && Math.abs(e.deltaX) < 2) {
          return;
        }
      }

      // Suppress hover while actively scrolling so cursor resting on navbar does NOT reopen dropdown
      scrollSuppressedRef.current = true;
      if (scrollCooldownTimerRef.current) {
        clearTimeout(scrollCooldownTimerRef.current);
      }
      scrollCooldownTimerRef.current = setTimeout(() => {
        scrollSuppressedRef.current = false;
      }, 350);

      // If any menu dropdown is open, smoothly fade out and dismiss
      if (isAnyDropdownOpenRef.current) {
        dismissDropdownSmoothly(false);
      }
    };

    const handleMouseMove = () => {
      if (!scrollCooldownTimerRef.current && scrollSuppressedRef.current) {
        scrollSuppressedRef.current = false;
      }
    };

    const handleClickOutside = (e) => {
      if (isAnyDropdownOpenRef.current && navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        dismissDropdownSmoothly(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrWheel, { passive: true });
    window.addEventListener('wheel', handleScrollOrWheel, { passive: true });
    window.addEventListener('touchmove', handleScrollOrWheel, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrWheel);
      window.removeEventListener('wheel', handleScrollOrWheel);
      window.removeEventListener('touchmove', handleScrollOrWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleClickOutside);
      if (scrollCooldownTimerRef.current) clearTimeout(scrollCooldownTimerRef.current);
      if (closeAnimationTimerRef.current) clearTimeout(closeAnimationTimerRef.current);
    };
  }, []);

  // Floating Navbar stays STILL (permanently fixed and visible on scroll down and scroll up)
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Ensure navbar is immediately visible on route navigation and dropdowns are reset
  useEffect(() => {
    setIsNavVisible(true);
    closeAllDropdowns();
    setIsDropdownClosing(false);
    clearAllTimeouts();
  }, [location.pathname]);

  const preloadedNavImagesRef = useRef(new Set());
  const preloadNavImages = (items) => {
    if (!items || !Array.isArray(items)) return;
    items.forEach(category => {
      if (category && category.dropdownItems && Array.isArray(category.dropdownItems)) {
        category.dropdownItems.forEach(item => {
          if (item && item.image && typeof item.image === 'string' && item.image.trim().length > 0) {
            const url = resolveNavbarImageUrl(item.image.trim());
            if (url && !preloadedNavImagesRef.current.has(url)) {
              preloadedNavImagesRef.current.add(url);
              const img = new Image();
              img.decoding = 'async';
              img.src = url;
            }
          }
        });
      }
    });
  };

  const getCategoryInitialPreview = (catKey) => {
    const kLower = (catKey || '').toLowerCase();
    const navItems = dynamicNavItems || dynamicNavItemsRef.current || [];
    const matched = navItems.find(item => {
      const nLower = (item.name || '').toLowerCase();
      if (kLower === 'mac') return nLower.includes('mac');
      if (kLower === 'ipad') return nLower.includes('ipad');
      if (kLower === 'iphone') return nLower.includes('iphone');
      if (kLower === 'watch') return nLower.includes('watch');
      if (kLower === 'airpods') return nLower.includes('airpod');
      if (kLower === 'tv-home' || kLower === 'tv') return nLower.includes('tv') || nLower.includes('home');
      if (kLower === 'accessories') return nLower.includes('accessori');
      if (kLower === 'applecare') return nLower.includes('applecare');
      return false;
    });

    const activeDropdown = matched?.dropdownItems?.filter(d => d.isActive !== false) || [];
    const firstSub = activeDropdown.find(d => d.image && typeof d.image === 'string' && d.image.trim().length > 0);
    if (firstSub) {
      return {
        name: firstSub.label || matched?.name || catKey,
        price: firstSub.price || '',
        image: resolveNavbarImageUrl(firstSub.image)
      };
    }

    return null;
  };

  const handleMacMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsMacDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('mac'));
  };

  const handleMacMouseLeave = () => {
    macTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleIpadMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsIpadDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('ipad'));
  };

  const handleIpadMouseLeave = () => {
    ipadTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleIphoneMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsIphoneDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('iphone'));
  };

  const handleIphoneMouseLeave = () => {
    iphoneTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleWatchMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsWatchDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('watch'));
  };

  const handleWatchMouseLeave = () => {
    watchTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleAirpodsMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsAirpodsDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('airpods'));
  };

  const handleAirpodsMouseLeave = () => {
    airpodsTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleTvMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsTvDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('tv-home'));
  };

  const handleTvMouseLeave = () => {
    tvTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleEntertainmentMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsEntertainmentDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
  };

  const handleEntertainmentMouseLeave = () => {
    entertainmentTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleAccessoriesMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsAccessoriesDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
    preloadNavImages(dynamicNavItems || dynamicNavItemsRef.current);
    setHoveredProduct(getCategoryInitialPreview('accessories'));
  };

  const handleAccessoriesMouseLeave = () => {
    accessoriesTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
  };

  const handleSupportMouseEnter = () => {
    if (scrollSuppressedRef.current) return;
    clearAllTimeouts();
    setIsDropdownClosing(false);
    closeAllDropdowns();
    setIsSupportDropdownOpen(true);
    setIsCategoriesOpen(false);
    setIsGiftOpen(false);
    setIsProfileOpen(false);
  };

  const handleSupportMouseLeave = () => {
    supportTimeoutRef.current = setTimeout(() => {
      dismissDropdownSmoothly(false);
    }, 250);
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
      mainLink: { label: 'Explore All Accessories', path: '/accessories?product=iphone' },
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

  const getCategoryKey = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('mac')) return 'mac';
    if (l.includes('ipad')) return 'ipad';
    if (l.includes('iphone')) return 'iphone';
    if (l.includes('watch')) return 'watch';
    if (l.includes('airpod')) return 'airpods';
    if (l.includes('tv') || l.includes('home')) return 'tv-home';
    if (l.includes('accessori')) return 'accessories';
    return null;
  };

  const getMobileDropdownConfig = (label) => {
    const key = getCategoryKey(label);
    if (!key) return null;

    const navItems = dynamicNavItems || dynamicNavItemsRef.current || [];
    if (navItems.length > 0) {
      const matchedNavItem = navItems.find(item => {
        const nLower = (item.name || '').toLowerCase();
        if (key === 'mac') return nLower.includes('mac');
        if (key === 'ipad') return nLower.includes('ipad');
        if (key === 'iphone') return nLower.includes('iphone');
        if (key === 'watch') return nLower.includes('watch');
        if (key === 'airpods') return nLower.includes('airpod');
        if (key === 'tv-home') return nLower.includes('tv') || nLower.includes('home');
        if (key === 'accessories') return nLower.includes('accessori');
        return false;
      });

      if (matchedNavItem && matchedNavItem.dropdownItems && matchedNavItem.dropdownItems.length > 0) {
        const activeItems = matchedNavItem.dropdownItems.filter(d => d.isActive !== false);
        if (activeItems.length > 0) {
          const mainPath = matchedNavItem.link || getCategoryPath(matchedNavItem.name, matchedNavItem.link);
          return {
            mainLink: { label: `Explore All ${matchedNavItem.name}`, path: mainPath },
            items: activeItems.map(d => ({
              label: d.label,
              path: d.path ? normalizeTargetPath(d.path) : (d.query ? `${mainPath}?search=${encodeURIComponent(d.query)}` : mainPath),
              image: d.image || ''
            }))
          };
        }
      }
    }

    return CATEGORY_MODEL_MAP[key] || null;
  };

  const renderProductCategoryList = (catKey, catTitle, catPath, closeDropdown) => {
    // Find matching item in dynamicNavItems
    const navItems = dynamicNavItems || dynamicNavItemsRef.current || [];
    const matchedNavItem = navItems.find(item => {
      const nLower = (item.name || '').toLowerCase();
      const kLower = (catKey || '').toLowerCase();
      if (kLower === 'mac') return nLower.includes('mac');
      if (kLower === 'ipad') return nLower.includes('ipad');
      if (kLower === 'iphone') return nLower.includes('iphone');
      if (kLower === 'watch') return nLower.includes('watch');
      if (kLower === 'airpods') return nLower.includes('airpod');
      if (kLower === 'tv-home' || kLower === 'tv') return nLower.includes('tv') || nLower.includes('home');
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
      const name = customItem?.label || defaultLabel;
      let price = customItem?.price || '';
      let rawImg = customItem?.image || null;

      // If no direct image and it's the main Explore link, fallback to first sub-item with an admin image
      if ((!rawImg || typeof rawImg !== 'string' || !rawImg.trim()) && name && (name.toLowerCase().includes('explore') || name.toLowerCase().includes(catKey.toLowerCase()))) {
        const firstSubWithImg = matchedNavItem?.dropdownItems?.find(d => d.isActive !== false && d.image && typeof d.image === 'string' && d.image.trim().length > 0);
        if (firstSubWithImg) {
          rawImg = firstSubWithImg.image;
          if (!price && firstSubWithImg.price) price = firstSubWithImg.price;
        }
      }

      const img = (rawImg && typeof rawImg === 'string' && rawImg.trim().length > 0)
        ? resolveNavbarImageUrl(rawImg.trim())
        : null;

      setHoveredProduct({
        name: name || defaultLabel,
        price: price || '',
        image: img
      });
    };

    return (
      <div className="md:col-span-6 text-left">
        <span className="text-[15px] font-semibold text-[#6E6E73] dark:text-zinc-400 block mb-4">
          {config?.title || catTitle}
        </span>

        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-2">
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
                  className="nav-dropdown-link text-[20px] sm:text-[22px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1.5"
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
                  className="nav-dropdown-link text-[20px] sm:text-[22px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1.5"
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
                onMouseEnter={() => setHoveredProduct({ name: prod.title || prod.name, price: prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : '', image: resolveNavbarImageUrl(prod.images?.[0] || prod.image) })}
                onClick={() => {
                  closeDropdown();
                  setHoveredProduct(null);
                }}
                className="nav-dropdown-link text-[20px] sm:text-[22px] font-bold text-[#1D1D1F] dark:text-white leading-snug tracking-tight hover:text-black transition-colors block py-1.5"
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
        navigate('/accessories?product=iphone');
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

  const renderProductPreview = (catKey) => {
    const hasImage = hoveredProduct && hoveredProduct.image && typeof hoveredProduct.image === 'string' && hoveredProduct.image.trim().length > 0;

    return (
      <div className="hidden md:flex md:col-span-6 pl-4 flex-col text-left shrink-0 justify-center items-center">
        {hasImage ? (
          <div className="w-full h-[420px] sm:h-[480px] rounded-3xl bg-white border border-zinc-200/80 p-4 shadow-xs overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-white p-1">
              <img
                src={hoveredProduct.image}
                alt={hoveredProduct.name || 'Preview'}
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain object-center hover:scale-105 select-none"
                style={{
                  imageRendering: 'high-quality',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  objectPosition: 'center'
                }}
                onError={() => {
                  setHoveredProduct(prev => prev ? { ...prev, image: null } : null);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-[420px] sm:h-[480px] rounded-3xl bg-white border border-dashed border-zinc-200 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-zinc-600 font-medium text-sm mb-1">{hoveredProduct?.name || 'Hover to Preview'}</span>
            <span className="text-zinc-400 text-xs">{hoveredProduct?.name ? 'No image uploaded' : 'Select an item to view'}</span>
          </div>
        )}
      </div>
    );
  };

  const [dynamicNavItems, setDynamicNavItems] = useState(null);
  const dynamicNavItemsRef = useRef(null);

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
      let items = [];
      if (response.data && response.data.navbarMenuItems && response.data.navbarMenuItems.length > 0) {
        items = response.data.navbarMenuItems.filter(c => c.isActive !== false);
      } else if (response.data && response.data.appleCategories && response.data.appleCategories.length > 0) {
        items = response.data.appleCategories.filter(c => c.isActive !== false);
      }
      setDynamicNavItems(items);
      dynamicNavItemsRef.current = items;
      preloadNavImages(items);
    } catch (err) {
      console.error('Failed to load header categories:', err);
      setDynamicNavItems([]);
      dynamicNavItemsRef.current = [];
    }
  };

  const getCategoryPath = (name, customLink) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('applecare')) return '/applecare';
    if (lower.includes('accessories')) return '/accessories?product=iphone';
    if (lower.includes('iphone')) return '/iphone';
    if (lower.includes('mac')) return '/macbook';
    if (lower.includes('ipad')) return '/ipad';
    if (lower.includes('watch')) return '/watch';
    if (lower.includes('airpod')) return '/airpods';
    if (lower.includes('tv')) return '/tv-home';
    return (customLink && customLink !== '/accessories') ? customLink : '/accessories?product=iphone';
  };

  const defaultMenuItems = [
    { label: 'Mac', path: '/macbook' },
    { label: 'iPad', path: '/ipad' },
    { label: 'iPhone', path: '/iphone' },
    { label: 'Watch', path: '/watch' },
    { label: 'AirPods', path: '/airpods' },
    { label: 'TV & Home', path: '/tv-home' },
    { label: 'Accessories', path: '/accessories?product=iphone' },
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
      <div
        className={`w-full shrink-0 ${isHomePage ? 'h-[60px] sm:h-[66px] lg:h-[74px]' : 'h-[76px] sm:h-[84px] lg:h-[92px]'} pointer-events-none select-none`}
        aria-hidden="true"
      />
      <div className={`pill-nav-stage ${isNavVisible ? 'nav-visible' : 'nav-hidden'}`}>
        <nav ref={navContainerRef} className="pill-nav-container select-none relative z-40 text-black">

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
                        { label: 'Shop Accessories', path: '/accessories?product=iphone' }
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
            <div className="hidden lg:flex items-center justify-center gap-[28px] xl:gap-[40px] 2xl:gap-[48px] font-[600] text-[16px] xl:text-[17px] relative flex-1 mx-2 whitespace-nowrap">
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
                      className={getNavBtnClass((isMacDropdownOpen && !isDropdownClosing) || location.pathname === '/macbook')}
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
                      className={getNavBtnClass((isIpadDropdownOpen && !isDropdownClosing) || location.pathname === '/ipad')}
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
                      className={getNavBtnClass((isIphoneDropdownOpen && !isDropdownClosing) || location.pathname === '/iphone')}
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
                      className={getNavBtnClass((isWatchDropdownOpen && !isDropdownClosing) || location.pathname === '/watch')}
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
                      className={getNavBtnClass((isAirpodsDropdownOpen && !isDropdownClosing) || location.pathname === '/airpods')}
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
                      className={getNavBtnClass((isTvDropdownOpen && !isDropdownClosing) || location.pathname === '/tv-home')}
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
                        navigate(item.path && item.path !== '/accessories' ? item.path : '/accessories?product=iphone');
                      }}
                      className={getNavBtnClass((isAccessoriesDropdownOpen && !isDropdownClosing) || location.pathname.startsWith('/accessories'))}
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
                      className={getNavBtnClass(isSupportDropdownOpen && !isDropdownClosing)}
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
                      const targetPath = (item.path && item.path !== '/shop' && !item.path.startsWith('/shop')) 
                        ? (item.path === '/accessories' ? '/accessories?product=iphone' : item.path) 
                        : '/accessories?product=iphone';
                      navigate(targetPath);
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
                  {renderProductPreview('mac')}
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
                  {renderProductPreview('ipad')}
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
                  {renderProductPreview('iphone')}
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
                  {renderProductPreview('watch')}
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
                  {renderProductPreview('airpods')}
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
                  {renderProductPreview('tv-home')}
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
                        { label: 'Explore Entertainment', path: '/tv-home' },
                        { label: 'Apple One', path: '/tv-home' },
                        { label: 'Apple TV', path: '/tv-home' },
                        { label: 'Apple Music', path: '/tv-home' },
                        { label: 'Apple Arcade', path: '/tv-home' },
                        { label: 'Apple Fitness+', path: '/tv-home' },
                        { label: 'Apple Podcasts', path: '/tv-home' },
                        { label: 'Apple Books', path: '/tv-home' },
                        { label: 'App Store', path: '/tv-home' }
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
                  {renderProductCategoryList('accessories', 'Explore Accessories', '/accessories?product=iphone', () => setIsAccessoriesDropdownOpen(false))}
                  {renderProductPreview('accessories')}
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

      {/* Mobile Navigation Drawer (Mounted directly to document.body to break out of all parent stacking contexts & transforms) */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-[99999] lg:hidden overflow-hidden ${
            isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          {/* Dimmed Backdrop */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* White Drawer Panel Sliding in from Left */}
          <div
            className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-[360px] sm:max-w-[400px] h-full h-screen h-[100dvh] bg-white text-zinc-900 flex flex-col z-10 shadow-2xl border-r border-zinc-200 transition-transform duration-300 ease-in-out select-none overflow-hidden ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Header inside Menu Drawer */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-100 shrink-0 bg-white">
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
            <div className="flex-1 px-6 sm:px-8 py-6 overflow-y-auto overscroll-contain">
              <nav className="flex flex-col text-left w-full divide-y divide-zinc-100/80">
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
                        className="text-[19px] sm:text-[21px] font-bold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors block py-3.5"
                      >
                        {item.label}
                      </a>
                    );
                  }

                  const catKey = getCategoryKey(item.label);
                  const dropdownConfig = getMobileDropdownConfig(item.label);
                  const hasDropdown = !!(catKey && dropdownConfig && dropdownConfig.items && dropdownConfig.items.length > 0);
                  const isExpanded = openMobileAccordion === (catKey || item.label);

                  if (hasDropdown) {
                    return (
                      <div key={idx} className="w-full">
                        <button
                          type="button"
                          onClick={() => setOpenMobileAccordion(isExpanded ? null : (catKey || item.label))}
                          className="w-full flex items-center justify-between py-3.5 text-left text-[19px] sm:text-[21px] font-bold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors bg-transparent border-0 cursor-pointer select-none"
                          aria-expanded={isExpanded}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                              isExpanded ? 'rotate-180 text-black' : ''
                            }`}
                          />
                        </button>

                        {/* Accordion Submenu Items */}
                        {isExpanded && (
                          <div className="pb-3 pl-3.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l-2 border-zinc-200 ml-1.5 mb-2">
                            {dropdownConfig.mainLink && (
                              <Link
                                to={dropdownConfig.mainLink.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-[15px] sm:text-[16px] font-semibold text-blue-600 hover:text-blue-700 transition-colors block py-2 border-b border-zinc-100/60"
                              >
                                {dropdownConfig.mainLink.label} &rarr;
                              </Link>
                            )}
                            {dropdownConfig.items.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                to={sub.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-[15px] sm:text-[16px] font-medium text-zinc-700 hover:text-black transition-colors block py-2 border-b border-zinc-100/40 last:border-b-0"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[19px] sm:text-[21px] font-bold tracking-tight text-zinc-900 hover:text-zinc-500 transition-colors block py-3.5"
                    >
                      {item.label}
                    </Link>
                  );
                })}


              </nav>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
