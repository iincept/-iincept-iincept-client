import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../redux/productSlice';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';

// Default Category Icons for the store strip
const DEFAULT_CATEGORY_STRIP = [
  { name: 'Mac', label: 'Mac', icon: '💻', image: '/mac_category_uploaded.png', path: '/macbook', isActive: true },
  { name: 'iPhone', label: 'iPhone', icon: '📱', image: '/iphone_category_uploaded.png', path: '/iphone', isActive: true },
  { name: 'iPad', label: 'iPad', icon: '📱', image: '/ipad_category_uploaded.png', path: '/ipad', isActive: true },
  { name: 'Watch', label: 'Watch', icon: '⌚', image: '/watch_category_uploaded.png', path: '/watch', isActive: true },
  { name: 'AirPods', label: 'AirPods', icon: '🎧', image: '/airpods_category_uploaded.png', path: '/airpods', isActive: true },
  { name: 'AirTag', label: 'AirTag', icon: '📍', image: '/airtag_category_uploaded.png', path: '/airtag', isActive: true },
  { name: 'Apple TV 4K', label: 'Apple TV 4K', icon: '📺', image: '/appletv_category_uploaded.png', path: '/tv-home', isActive: true },
  { name: 'HomePod', label: 'HomePod', icon: '🔊', image: '/homepod_category_uploaded.png', path: '/tv-home?search=HomePod', isActive: true },
  { name: 'Accessories', label: 'Accessories', icon: '🔌', image: '/accessories_category_uploaded.png', path: '/accessories', isActive: true },
];

const DEFAULT_HERO_IMAGE = 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-18-pro-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80';

// Configurable Autoplay Timer Interval for Homepage Hero Slider (in milliseconds)
const HERO_SLIDER_AUTOPLAY_INTERVAL = 5000;

const formatRupee = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  if (str.startsWith('₹')) return str;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return str;
  return `₹${num.toLocaleString('en-IN')}`;
};

const DEFAULT_DEAL_BANNERS = [
  {
    id: 'default-deal-1',
    name: 'MacBook Neo – Stock Clearance',
    smallLabel: 'DEAL OF THE WEEK',
    title: 'MacBook Neo – Stock Clearance',
    description: 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.',
    productImage: '/mac_deal_fan.png',
    originalMrp: 79900,
    discount: 8.76,
    finalPrice: 72900,
    buttonText: 'Grab the Deal',
    buttonLink: '/macbook',
    isActive: true,
    displayOrder: 1
  }
];

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Rajesh Sharma',
    role: 'IT Head, Fintech Firm',
    location: 'Bengaluru',
    stars: 5,
    avatar: '/avatars/avatar2.jpg',
    text: '“Purchased MacBook Air M4 from the authorised store. Staff was extremely knowledgeable and helped with EMI options. Delivery was next day. Highly recommended.”',
    isActive: true
  },
  {
    name: 'Priya Patel',
    role: 'Procurement Lead, D2C Brand',
    location: 'Mumbai',
    stars: 5,
    avatar: '/avatars/avatar1.jpg',
    text: '“Best experience buying iPhone 17 Pro. Got bank offer + trade-in value explained clearly. Genuine product with full warranty. Will buy again.”',
    isActive: true
  },
  {
    name: 'Vikram Malhotra',
    role: 'Operations Manager, Consulting Firm',
    location: 'Delhi NCR',
    stars: 5,
    avatar: '/avatars/avatar3.jpg',
    text: '“Corporate order for 25 iPads was handled smoothly. Dedicated manager, proper invoicing and on-time delivery. Excellent B2B support.”',
    isActive: true
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Admin Head, Enterprise BPO',
    location: 'Pune',
    stars: 5,
    avatar: '/avatars/avatar4.jpg',
    text: '“Reliable for repeat bulk orders, delivered to three city offices without issue. Smooth billing and genuine Apple products throughout.”',
    isActive: true
  },
  {
    name: 'Amitav Sen',
    role: 'Creative Director, Design Studio',
    location: 'Hyderabad',
    stars: 5,
    avatar: '/avatars/avatar5.jpg',
    text: '“Upgraded our whole design team to MacBook Pro M4s with iincept. Super fast delivery, authentic GST invoice, and unbeatable corporate discount.”',
    isActive: true
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Senior Consultant, Tech Advisory',
    location: 'Ahmedabad',
    stars: 5,
    avatar: '/avatars/avatar6.jpg',
    text: '“Seamless ordering for iPad Air and Apple Pencil. Packaging was immaculate and received genuine AppleCare+ support. Wonderful customer care!”',
    isActive: true
  }
];

const formatTestimonialItem = (t, idx) => {
  const defaults = [
    {
      name: 'Rajesh Sharma',
      role: 'IT Head, Fintech Firm',
      location: 'Bengaluru',
      avatar: '/avatars/avatar2.jpg',
      text: '“Purchased MacBook Air M4 from the authorised store. Staff was extremely knowledgeable and helped with EMI options. Delivery was next day. Highly recommended.”'
    },
    {
      name: 'Priya Patel',
      role: 'Procurement Lead, D2C Brand',
      location: 'Mumbai',
      avatar: '/avatars/avatar1.jpg',
      text: '“Best experience buying iPhone 17 Pro. Got bank offer + trade-in value explained clearly. Genuine product with full warranty. Will buy again.”'
    },
    {
      name: 'Vikram Malhotra',
      role: 'Operations Manager, Consulting Firm',
      location: 'Delhi NCR',
      avatar: '/avatars/avatar3.jpg',
      text: '“Corporate order for 25 iPads was handled smoothly. Dedicated manager, proper invoicing and on-time delivery. Excellent B2B support.”'
    },
    {
      name: 'Sneha Kulkarni',
      role: 'Admin Head, Enterprise BPO',
      location: 'Pune',
      avatar: '/avatars/avatar4.jpg',
      text: '“Reliable for repeat bulk orders, delivered to three city offices without issue. Smooth billing and genuine Apple products throughout.”'
    },
    {
      name: 'Amitav Sen',
      role: 'Creative Director, Design Studio',
      location: 'Hyderabad',
      avatar: '/avatars/avatar5.jpg',
      text: '“Upgraded our whole design team to MacBook Pro M4s with iincept. Super fast delivery, authentic GST invoice, and unbeatable corporate discount.”'
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Senior Consultant, Tech Advisory',
      location: 'Ahmedabad',
      avatar: '/avatars/avatar6.jpg',
      text: '“Seamless ordering for iPad Air and Apple Pencil. Packaging was immaculate and received genuine AppleCare+ support. Wonderful customer care!”'
    }
  ];
  const d = defaults[idx % defaults.length];

  let name = (t.name || '').trim();
  let role = (t.role || t.title || t.designation || '').trim();
  let location = (t.location || t.city || t.sub || '').trim();

  if (t.author && !t.author.toLowerCase().includes('customer name')) {
    const cleanAuthor = t.author.replace(/^[—\-–]\s*/, '').trim();
    const parts = cleanAuthor.split(',').map(s => s.trim()).filter(Boolean);

    if (parts.length >= 3) {
      if (!location) location = parts[parts.length - 1];
      if (!role) role = parts.slice(parts.length > 3 ? 1 : 0, parts.length - 1).join(', ');
      if (!name) name = parts.length > 3 ? parts[0] : d.name;
    } else if (parts.length === 2) {
      if (!location) location = parts[1];
      if (!role) role = parts[0];
      if (!name) name = d.name;
    } else if (parts.length === 1 && !name) {
      if (['IT Head', 'Procurement', 'Ops', 'Admin', 'Manager', 'Lead', 'Head'].some(w => parts[0].includes(w))) {
        role = role || parts[0];
        name = d.name;
      } else {
        name = parts[0];
      }
    }
  }

  name = name || d.name;
  role = role || d.role;
  location = location || d.location;

  let avatar = t.avatar || t.avatarUrl || t.image;
  if (!avatar || avatar.includes('upload_1790758201407_72.png') || avatar.includes('upload_1791723433996_239.png')) {
    avatar = d.avatar;
  }

  let text = (t.text || '').trim();
  if (!text || text.toLowerCase().includes('enter customer review') || text === '""' || text === "''") {
    text = d.text;
  }

  return {
    ...t,
    name,
    role,
    location,
    avatar,
    stars: 5,
    text
  };
};

export default function Home() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products || { products: [] });

  const testimonialSliderRef = useRef(null);
  const newArrivalsSliderRef = useRef(null);
  const trendingSliderRef = useRef(null);
  const categoryStripRef = useRef(null);

  const scrollCategoryStrip = (direction) => {
    if (categoryStripRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryStripRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollNewArrivals = (direction) => {
    if (newArrivalsSliderRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      newArrivalsSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollTrending = (direction) => {
    if (trendingSliderRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      trendingSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollTestimonials = (direction) => {
    if (testimonialSliderRef.current) {
      const slider = testimonialSliderRef.current;
      const step = 370;
      if (direction === 'left') {
        if (slider.scrollLeft <= 10) {
          slider.scrollTo({ left: slider.scrollWidth - slider.clientWidth, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: -step, behavior: 'smooth' });
        }
      } else {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 15) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }
  };

  // B2B Form State
  const [b2bForm, setB2bForm] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    productInterest: 'Select category',
    message: ''
  });
  const [b2bSubmitting, setB2bSubmitting] = useState(false);
  const [b2bSuccess, setB2bSuccess] = useState('');

  // Hero Section Settings with LocalStorage Cache
  const [heroData, setHeroData] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_home_hero_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return {
            homeHeroBadge: parsed.homeHeroBadge || 'Apple Authorised Resellers across India',
            homeHeroTitle: parsed.homeHeroTitle || 'The latest.\nThe best. Authorised.',
            homeHeroSubtitle: parsed.homeHeroSubtitle || 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
            homeHeroPrimaryBtnText: parsed.homeHeroPrimaryBtnText || 'Shop Now',
            homeHeroPrimaryBtnLink: parsed.homeHeroPrimaryBtnLink || '/iphone',
            homeHeroSecondaryBtnText: parsed.homeHeroSecondaryBtnText || 'Find Nearest Store',
            homeHeroSecondaryBtnLink: parsed.homeHeroSecondaryBtnLink || '#b2b-section',
            homeHeroImage: (parsed.homeHeroImage && typeof parsed.homeHeroImage === 'string' && parsed.homeHeroImage.trim())
              ? parsed.homeHeroImage.trim()
              : DEFAULT_HERO_IMAGE
          };
        }
      }
    } catch (e) { }
    return {
      homeHeroBadge: 'Apple Authorised Resellers across India',
      homeHeroTitle: 'The latest.\nThe best. Authorised.',
      homeHeroSubtitle: 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
      homeHeroPrimaryBtnText: 'Shop Now',
      homeHeroPrimaryBtnLink: '/iphone',
      homeHeroSecondaryBtnText: 'Find Nearest Store',
      homeHeroSecondaryBtnLink: '#b2b-section',
      homeHeroImage: DEFAULT_HERO_IMAGE
    };
  });

  // Hero Banner Slider States
  const [heroSlides, setHeroSlides] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_home_hero_slides_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(s => s.isActive !== false);
          if (active.length > 0) return active;
        }
      }
    } catch (e) { }
    return [];
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Compute active effective hero slides array with graceful fallback
  const effectiveHeroSlides = (heroSlides && heroSlides.length > 0)
    ? heroSlides
    : [{
        _id: 'default-fallback-hero-slide',
        title: heroData.homeHeroTitle || 'The latest.\nThe best. Authorised.',
        subtitle: heroData.homeHeroSubtitle || 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
        buttonText: heroData.homeHeroPrimaryBtnText || 'Shop Now',
        buttonLink: heroData.homeHeroPrimaryBtnLink || '#shop-by-category',
        secondaryButtonText: heroData.homeHeroSecondaryBtnText || 'Find Nearest Store',
        secondaryButtonLink: heroData.homeHeroSecondaryBtnLink || '#b2b-section',
        badge: heroData.homeHeroBadge || 'Apple Authorised Resellers across India',
        image: heroData.homeHeroImage || DEFAULT_HERO_IMAGE,
        bgStyle: 'slide-dark',
        isActive: true
      }];

  // Clamp currentSlideIndex if array shrinks
  useEffect(() => {
    if (currentSlideIndex >= effectiveHeroSlides.length && effectiveHeroSlides.length > 0) {
      setCurrentSlideIndex(Math.max(0, effectiveHeroSlides.length - 1));
    }
  }, [effectiveHeroSlides.length, currentSlideIndex]);

  // Autoplay slider timer (5000ms configurable) with infinite looping and unmount cleanup
  useEffect(() => {
    if (isHeroPaused || effectiveHeroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % effectiveHeroSlides.length);
    }, HERO_SLIDER_AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isHeroPaused, effectiveHeroSlides.length, currentSlideIndex]);

  // Deal of the Week State (with LocalStorage Cache)
  const [dealBanners, setDealBanners] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_home_deal_banners_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const active = parsed.filter(b => b.isActive !== false);
          if (active.length > 0) return active;
        }
      }
    } catch (e) { }
    return DEFAULT_DEAL_BANNERS;
  });

  // Category Strip Default Images Lookup
  const DEFAULT_CATEGORY_IMAGES = {
    'Mac': '/mac_category_uploaded.png',
    'iPhone': '/iphone_category_uploaded.png',
    'iPad': '/ipad_category_uploaded.png',
    'Watch': '/watch_category_uploaded.png',
    'AirPods': '/airpods_category_uploaded.png',
    'AirTag': '/airtag_category_uploaded.png',
    'Apple TV 4K': '/appletv_category_uploaded.png',
    'HomePod': '/homepod_category_uploaded.png',
    'Accessories': '/accessories_category_uploaded.png',
  };

  const sanitizeCategoryItem = (item) => {
    if (!item) return null;
    const key = (item.name || item.label || '').trim();
    if (key === 'Gift Card') return null;

    const matchKey = Object.keys(DEFAULT_CATEGORY_IMAGES).find(
      k => k.toLowerCase() === key.toLowerCase()
    ) || key;

    const fallbackImg = DEFAULT_CATEGORY_IMAGES[matchKey] || DEFAULT_CATEGORY_IMAGES['Mac'];

    let img = (item.image || '').trim();
    if (img.startsWith('*')) img = img.replace(/^\*\s*/, '');

    if (!img || img.includes('…') || (img.includes('traceId') && !img.includes('storeimages.cdn-apple.com')) || img.includes('/category_strip/')) {
      img = fallbackImg;
    }

    return { ...item, image: img || fallbackImg };
  };

  // Category Strip Icons
  const [categoryStrip, setCategoryStrip] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_home_category_icons_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeCategoryItem).filter(Boolean);
        }
      }
    } catch (e) { }
    return DEFAULT_CATEGORY_STRIP.map(sanitizeCategoryItem).filter(Boolean);
  });

  // Dynamic Categories from Settings
  const [appleCategories, setAppleCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_apple_categories_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) { }
    return [
      { name: 'Mac', startingPrice: '₹89,900', actionText: 'Shop all models →', link: '/macbook', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/mac/home-img-1776683069_8064.png', icon: '💻' },
      { name: 'iPhone', startingPrice: '₹59,900', actionText: 'Shop all models →', link: '/iphone', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/iphone/home-img-1776683084_2967.png', icon: '📱' },
      { name: 'iPad', startingPrice: '₹34,900', actionText: 'Shop all models →', link: '/ipad', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/ipad/home-img-1776683096_1014.png', icon: '📱' },
      { name: 'Watch', startingPrice: '₹29,900', actionText: 'Shop all models →', link: '/watch', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/watch/home-img-1757682221_3904.jpg', icon: '⌚' },
      { name: 'AirPods', startingPrice: '₹12,900', actionText: 'Shop all models →', link: '/airpods', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/music/home-img-1757682200_3577.jpg', icon: '🎧' },
      { name: 'TV & Home', startingPrice: '₹14,900', actionText: 'Shop all models →', link: '/tv-home', image: 'https://i3-prod-assets.indiaistore.com/files/uploads/categories/tv/home-img-1694070636_757.png', icon: '📺' },
      { name: 'Accessories', startingPrice: '₹1,900', actionText: 'Shop all models →', link: '/accessories', image: '/accessories_category.png', icon: '🔌' },
      { name: 'AppleCare+', startingPrice: '₹2,900', actionText: 'Explore coverage →', link: '/applecare', image: '/applecare_official_hero.png', icon: '🛡️' },
    ];
  });

  // Dynamic New Arrivals from Admin Settings
  const [homeNewArrivals, setHomeNewArrivals] = useState(() => {
    try {
      const cached = localStorage.getItem('iincept_home_new_arrivals_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });

  // Testimonials State & Autoplay Slider
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [isTestimonialsPaused, setIsTestimonialsPaused] = useState(false);

  // Autoplay Testimonials Slider (every 3800ms) with smooth wrap-around and pause-on-hover/touch
  useEffect(() => {
    if (isTestimonialsPaused) return;

    const timer = setInterval(() => {
      if (testimonialSliderRef.current) {
        const slider = testimonialSliderRef.current;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (maxScroll <= 10) return;

        const step = 370;
        if (slider.scrollLeft >= maxScroll - 15) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [isTestimonialsPaused]);

  useEffect(() => {
    dispatch(fetchProducts());
    fetchSiteSettings();
    const unsubscribe = subscribeToLiveSync(() => {
      dispatch(fetchProducts());
      fetchSiteSettings();
    });
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    if (scrollTarget === 'procurement' || scrollTarget === 'b2b') {
      setTimeout(() => {
        const section = document.getElementById('b2b-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location]);

  const fetchSiteSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data) {
        const updatedHero = {
          homeHeroBadge: response.data.homeHeroBadge || 'Apple Authorised Resellers across India',
          homeHeroTitle: response.data.homeHeroTitle || 'The latest.\nThe best. Authorised.',
          homeHeroSubtitle: response.data.homeHeroSubtitle || 'Genuine Apple products from India’s trusted mono-brand premium resellers. Exclusive offers, EMI & expert support.',
          homeHeroPrimaryBtnText: response.data.homeHeroPrimaryBtnText || 'Shop Now',
          homeHeroPrimaryBtnLink: response.data.homeHeroPrimaryBtnLink || '/iphone',
          homeHeroSecondaryBtnText: response.data.homeHeroSecondaryBtnText || 'Find Nearest Store',
          homeHeroSecondaryBtnLink: response.data.homeHeroSecondaryBtnLink || '#b2b-section',
          homeHeroImage: (response.data.homeHeroImage && typeof response.data.homeHeroImage === 'string' && response.data.homeHeroImage.trim())
            ? response.data.homeHeroImage.trim()
            : DEFAULT_HERO_IMAGE
        };

        setHeroData(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(updatedHero)) {
            try {
              localStorage.setItem('iincept_home_hero_v2', JSON.stringify(updatedHero));
            } catch (e) { }

            if (prev.homeHeroImage && updatedHero.homeHeroImage && prev.homeHeroImage !== updatedHero.homeHeroImage) {
              const imgPreloader = new Image();
              imgPreloader.src = updatedHero.homeHeroImage;
              imgPreloader.onload = () => {
                setHeroData(updatedHero);
              };
              imgPreloader.onerror = () => {
                setHeroData(updatedHero);
              };
              return prev;
            }

            return updatedHero;
          }
          return prev;
        });

        if (response.data.heroSlides && Array.isArray(response.data.heroSlides)) {
          const activeSlides = response.data.heroSlides
            .filter(s => s.isActive !== false)
            .map(s => ({
              ...s,
              title: (s.title || (s.titleBold ? `${s.titleBold || ''} ${s.titleNormal || ''}`.trim() : '') || 'The latest. The best. Authorised.'),
              subtitle: s.subtitle || response.data.homeHeroSubtitle || 'Genuine Apple products from India’s trusted mono-brand premium resellers.',
              buttonText: s.buttonText || response.data.homeHeroPrimaryBtnText || 'Shop Now',
              buttonLink: s.buttonLink || response.data.homeHeroPrimaryBtnLink || '#shop-by-category',
              secondaryButtonText: s.secondaryButtonText || response.data.homeHeroSecondaryBtnText || 'Find Nearest Store',
              secondaryButtonLink: s.secondaryButtonLink || response.data.homeHeroSecondaryBtnLink || '#b2b-section',
              badge: s.badge || response.data.homeHeroBadge || 'Apple Authorised Resellers across India',
              image: (s.image && typeof s.image === 'string' && s.image.trim()) ? s.image.trim() : (response.data.homeHeroImage || DEFAULT_HERO_IMAGE)
            }));

          setHeroSlides(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(activeSlides)) {
              try {
                localStorage.setItem('iincept_home_hero_slides_v2', JSON.stringify(activeSlides));
              } catch (e) { }
              return activeSlides;
            }
            return prev;
          });
        }

        if (response.data.homeDealBanners && Array.isArray(response.data.homeDealBanners) && response.data.homeDealBanners.length > 0) {
          const activeBanners = response.data.homeDealBanners
            .filter(b => b.isActive !== false)
            .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

          if (activeBanners.length > 0) {
            setDealBanners(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(activeBanners)) {
                try {
                  localStorage.setItem('iincept_home_deal_banners_v2', JSON.stringify(response.data.homeDealBanners));
                } catch (e) { }
                return activeBanners;
              }
              return prev;
            });
          }
        } else if (response.data.dealTitle || response.data.dealPrice) {
          const legacyBanner = [{
            id: 'legacy-deal',
            smallLabel: response.data.dealEyebrow || 'DEAL OF THE WEEK',
            title: response.data.dealTitle || 'MacBook Neo – Stock Clearance',
            description: response.data.dealDesc || 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.',
            finalPrice: response.data.dealPrice || '₹72,900',
            originalMrp: response.data.dealOldPrice || '₹79,900',
            buttonText: response.data.dealButtonText || 'Grab the Deal',
            buttonLink: response.data.dealButtonLink || '/macbook',
            productImage: (response.data.dealImage && response.data.dealImage !== '/mac_nav/macbook_neo.png') ? response.data.dealImage : '/mac_deal_fan.png',
            isActive: true
          }];
          setDealBanners(legacyBanner);
        }

        if (response.data.homeCategoryIcons && response.data.homeCategoryIcons.length > 0) {
          const activeIcons = response.data.homeCategoryIcons
            .filter(i => i.isActive !== false)
            .map(sanitizeCategoryItem)
            .filter(Boolean);
          if (activeIcons.length > 0) {
            setCategoryStrip(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(activeIcons)) {
                try {
                  localStorage.setItem('iincept_home_category_icons_v2', JSON.stringify(activeIcons));
                } catch (e) { }
                return activeIcons;
              }
              return prev;
            });
          }
        }

        if (response.data.homeNewArrivals && Array.isArray(response.data.homeNewArrivals)) {
          const activeArrivals = response.data.homeNewArrivals.filter(i => i.isActive !== false);
          if (activeArrivals.length > 0) {
            setHomeNewArrivals(activeArrivals);
            try {
              localStorage.setItem('iincept_home_new_arrivals_v2', JSON.stringify(activeArrivals));
            } catch (e) { }
          }
        }

        if (response.data.appleCategories && response.data.appleCategories.length > 0) {
          const activeCats = response.data.appleCategories
            .filter(c => c.isActive !== false)
            .map(c => ({ ...c, image: (c.image || '').trim() }));
          if (activeCats.length > 0) {
            setAppleCategories(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(activeCats)) {
                try {
                  localStorage.setItem('iincept_apple_categories_v2', JSON.stringify(activeCats));
                } catch (e) { }
                return activeCats;
              }
              return prev;
            });
          }
        }

        if (response.data.testimonials && response.data.testimonials.length > 0) {
          const activeTestimonials = response.data.testimonials
            .filter(t => t.isActive !== false)
            .map((t, idx) => {
              const loc = t.location !== undefined && t.location !== '' ? t.location : (t.sub || t.city || '');
              return {
                ...t,
                stars: 5,
                text: t.text || '',
                author: t.author || 'Verified Customer',
                name: t.name || '',
                role: t.role || '',
                location: String(loc || '').trim(),
                sub: String(loc || '').trim(),
                avatar: t.image || t.avatar || t.avatarUrl || null
              };
            });
          if (activeTestimonials.length > 0) {
            setTestimonials(activeTestimonials);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load homepage settings:', err);
    }
  };

  const handleB2bSubmit = async (e) => {
    e.preventDefault();
    if (!b2bForm.fullName.trim() || !b2bForm.email.trim()) {
      alert('Full Name and Email are mandatory.');
      return;
    }

    setB2bSubmitting(true);
    const waMessage = `Hello iiNCEPT Team! 👋\n\nI want to request a corporate / retail quotation:\n\n👤 *Name:* ${b2bForm.fullName}\n🏢 *Company:* ${b2bForm.company || 'N/A'}\n📧 *Email:* ${b2bForm.email}\n📞 *Phone:* ${b2bForm.phone || 'N/A'}\n📦 *Product Interest:* ${b2bForm.productInterest}\n💬 *Message:* ${b2bForm.message || 'N/A'}`;
    const waUrl = `https://wa.me/918607222417?text=${encodeURIComponent(waMessage)}`;

    try {
      await axiosClient.post('/enquiries', {
        companyName: b2bForm.company || 'N/A',
        fullName: b2bForm.fullName,
        email: b2bForm.email,
        phone: b2bForm.phone,
        productInterest: b2bForm.productInterest,
        quantity: 1,
        message: b2bForm.message
      });
    } catch (err) {
      console.error('Enquiry submission note:', err);
    } finally {
      window.open(waUrl, '_blank');
      setB2bSuccess('Request submitted successfully! Opening WhatsApp chat...');
      setB2bForm({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        productInterest: 'Select category',
        message: ''
      });
      setB2bSubmitting(false);
      setTimeout(() => setB2bSuccess(''), 5000);
    }
  };

  const extractFirstValidImage = (p) => {
    if (!p) return null;
    if (p.image && typeof p.image === 'string' && p.image.trim() && !p.image.includes('mock-cloud')) {
      return p.image.trim();
    }
    if (Array.isArray(p.images) && p.images.length > 0) {
      const found = p.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
      if (found) return found.trim();
    }
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        if (v.image && typeof v.image === 'string' && v.image.trim() && !v.image.includes('mock-cloud')) {
          return v.image.trim();
        }
        if (Array.isArray(v.images) && v.images.length > 0) {
          const found = v.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
          if (found) return found.trim();
        }
      }
    }
    if (Array.isArray(p.colors) && p.colors.length > 0) {
      for (const c of p.colors) {
        if (typeof c === 'object' && c) {
          if (c.image && typeof c.image === 'string' && c.image.trim() && !c.image.includes('mock-cloud')) {
            return c.image.trim();
          }
          if (Array.isArray(c.images) && c.images.length > 0) {
            const found = c.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
            if (found) return found.trim();
          }
        }
      }
    }
    return null;
  };

  const getProductImage = (p, fallback) => {
    const titleLower = (p?.title || p?.name || '').toLowerCase();
    if (titleLower.includes('mini') && titleLower.includes('mac')) {
      return 'https://www.apple.com/assets-www/en_WW/mac/04_chapternav/small/nav_mac_mini_f628f615d_2x.png';
    }
    const extracted = extractFirstValidImage(p);
    if (extracted) {
      return extracted;
    }
    return fallback;
  };

  // Products from Database / Admin Settings for New Arrivals & Trending
  const defaultNewArrivals = [
    { id: '1', name: 'iPhone Duo', tagline: 'Hello, hello.', price: 'From ₹299900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-duo-202609_GEO_IN?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=UzBXQnlhUWdraTNvNU1Kb3pEQlpXTmRieWJxSUI5TWh3VExiQnFCdzRFUVIzWjZtanZvZXBzWDFVU2JjN3Z3cXN2Mmx4a3VvSnUzaFUvSVlVRUJkbEd4TmxtT1p0QkhPako5RlJBUjZ0OU9Hc0wyUy9Qc3BoTzNXSHJVRHo5eGk&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-duo-202609_GEO_IN?wid=800&hei=1000&fmt=webp&qlt=90&.v=UzBXQnlhUWdraTNvNU1Kb3pEQlpXTmRieWJxSUI5TWh3VExiQnFCdzRFUVIzWjZtanZvZXBzWDFVU2JjN3Z3cXBxK0ZBNmxGbmUyUFZlUkRMaDBrbFIrM1V0MXQ3L01IeDRJOXlOYjZtNC9JTVpqRTIzSGM4czgvT0dWYlpqZnY&traceId=1', path: '/iphone' },
    { id: '2', name: 'iPhone 18 Pro', tagline: 'The ultimate performance and camera of any iPhone, with exceptional battery life.', price: 'From ₹164900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-18-pro-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=UzBXQnlhUWdraTNvNU1Kb3pEQlpXSWQybG1sZ1oxVnEyWjA5KzltU01ZTFNab1lJcUZwSFVRK1htYlNmZUtPTFN5aWNYUFpIbkFhdm03T3BzSjdVSTVTUzBFNlNoQ3JiRWpkVzhGb1Q5YkVkMVhIT21KNHhMTmc3TkpqWGZITDg&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-18-pro-202609?wid=800&hei=1000&fmt=webp&qlt=90&.v=UzBXQnlhUWdraTNvNU1Kb3pEQlpXSWQybG1sZ1oxVnEyWjA5KzltU01ZTFNab1lJcUZwSFVRK1htYlNmZUtPTFJ2R3NEUGt3Q2tTUTNWU09neHFkdWRUL1Azd1lsYk5RbEsxZXhvbThSV3VXS3B5dFRDdHdOWGF6ZzVmZHdiRWc&traceId=1', path: '/iphone', isDark: true },
    { id: '3', name: 'Apple Watch Series 12', tagline: 'The most accurate heart rate sensing in a wearable.', price: 'From ₹56900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-series-12-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=QWhYaUFuRS9hTUliZ3N5RWVCV09vaG9ZUW1EeWY5MUtXMHdLVXUrS2thUHJ5SDBWM0EzY1NDZnVpYTkvandVRHFmS3YvQ0doSFZENndQR0J4TTRqbndQU2JvQ0JiRmZoU0hNWVplaGs5aHNPYUtSMVh2bmhjSFBDSFo4T3FRS0E&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-series-12-202609?wid=800&hei=1000&fmt=webp&qlt=90&.v=QWhYaUFuRS9hTUliZ3N5RWVCV09vaG9ZUW1EeWY5MUtXMHdLVXUrS2thUHJ5SDBWM0EzY1NDZnVpYTkvandVRGdpcjhyQnJrZTk3NDVpVGh0RDBPL1dlb1hSRFZ1bHlsVUx3SFRzY0JhYVpmcTUrTlhNMWhLS2RHRXhjZnVURVQ&traceId=1', path: '/watch', isDark: true },
    { id: '4', name: 'Apple Watch Ultra 4', tagline: 'The ultimate sports and adventure watch.', price: 'From ₹89900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-ultra-4-202609_GEO_IN?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=QWhYaUFuRS9hTUliZ3N5RWVCV09vdmMxTi9MK0F4TUMvaEkrKzQrSzRpbmJRMGtnQk93bkNnOFNhZmw1MVVDSWVEb1lRcjg2U0o3bTMvMkR2S2VvTnZXdlJRYjdSZWJHVUh4aFVDb0hhVVdPc2ZIZ0tBZThMV3hSNUJIL00xdlQ&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-ultra-4-202609_GEO_IN?wid=800&hei=1000&fmt=webp&qlt=90&.v=QWhYaUFuRS9hTUliZ3N5RWVCV09vdmMxTi9MK0F4TUMvaEkrKzQrSzRpbmJRMGtnQk93bkNnOFNhZmw1MVVDSWVKTWtXODFGZ1ZIUk9hUHM3RHc0QTYyL0ZSTzZrMWlpUU5CQlpuNHNUZzhtZXFyaVZWaHlPbUpXd09SVC9rbDc&traceId=1', altText: 'Apple Watch Ultra 4, titanium case, natural colour, right side exterior, raised side button, microphone, Digital Crown dial, Ocean Band, translucent grey colour', path: '/watch', isDark: true },
    { id: '5', name: 'AirPods 5', tagline: 'Discover the magic of Active Noise Cancellation.', price: 'From ₹14900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-airpods-5-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=WlczMnlkejNQakk5eW14MEJjQmdLL1htQlViQlcvWm01TkRFbWQ1bFdVbjkvamYzRzRvcFlnajNacmhEOC9BeGJLRkx3RDVvZWFBZ2pOaXMvUXhHQ2FFWGwxTDd3djQwdSt4b3ZkbTdjbXVKTExiOEFsRmxtQ2Nua0tRSC83MkI&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-airpods-5-202609?wid=800&hei=1000&fmt=webp&qlt=90&.v=WlczMnlkejNQakk5eW14MEJjQmdLL1htQlViQlcvWm01TkRFbWQ1bFdVbjkvamYzRzRvcFlnajNacmhEOC9BeEZXZzlzM2cwVmJseGdsS3RYT09za2g5YnJpZi9mWTcyN0pxRVpBcDU2UnArYWpGdS9XeFgvbS9ITnNYOEhYaG4&traceId=1', altText: 'AirPods 5: wireless earbuds, white color, oval-shaped, ear tip with interior acoustic speaker mesh, short stem with silver charging connector, left and right letter indicators', path: '/airpods', isDark: false },
    { id: '6', name: 'Mac mini', tagline: 'Now with M6 and M5 Pro.', price: 'From ₹99900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-mini-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=MjhMcWJ2MGZwbXEwdnBkcUN6ZnhyejZjVlVyTm9aMTIzM2ZlTDJiaTlnRDZXYXJlRUd1cTBYTnRnbTNlazIvM01BZktNRDRIeDREMEYwa1NOSWNvMENpK0pSNjVsZ2N0cUJVQnVDU1lqdHQrYWpGdS9XeFgvbS9ITnNYOEhYaG4&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-mini-202609?wid=800&hei=1000&fmt=webp&qlt=90&.v=MjhMcWJ2MGZwbXEwdnBkcUN6ZnhyejZjVlVyTm9aMTIzM2ZlTDJiaTlnRDZXYXJlRUd1cTBYTnRnbTNlazIvMzl4VGJTa0Z6K25XajlIZ3dxUWxxaFVyemZ6RkRPaG5jU2paRVdtZHhabXc&traceId=1', altText: 'Mac mini, front exterior, two Thunderbolt ports, status indicator light and 3.5‑millimetre headphone jack, tapered black base at bottom, flat top, rounded sides, straight edges, silver colour enclosure', path: '/macbook', isDark: false },
    { id: '7', name: 'Mac Studio', tagline: 'Now with M5 Max and M5 Ultra.', price: 'From ₹279900.00', image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-studio-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80&.v=MjhMcWJ2MGZwbXEwdnBkcUN6ZnhyeU9aVHlIUTN0TDFoV3YrODdyNm1Ucm45S05qekNUdVUwMVFyK1pKaERUd3ZGdXpoZGFjcnJiZGtXTlNNRSszQWpLV0ZtaSt4V1ZKUFd0a1JsdUUwbENacXFoWC9uNWRBVmx4VTBHaHVxM3Y&traceId=1', imageWebp: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-studio-202609?wid=800&hei=1000&fmt=webp&qlt=90&.v=MjhMcWJ2MGZwbXEwdnBkcUN6ZnhyeU9aVHlIUTN0TDFoV3YrODdyNm1Ucm45S05qekNUdVUwMVFyK1pKaERUd3lPWjFvdU5EZVdwUnRCZ2RHSDBFS3R0bEJITXZrbjRjcGpoK0NsSlhQUCtWZWZKZEpnTUg2bTJtOU9qU1hvcWw&traceId=1', altText: 'Mac Studio, front exterior, two USB‑C ports, SDXC card slot, status indicator light, tapered base at bottom, flat top, rounded sides, straight edges, silver colour enclosure', path: '/macbook', isDark: false }
  ];

  const resolveArrivalProductPath = (item) => {
    if (!item) return '/shop';

    // 1. Explicit productId stored on card
    if (item.productId) {
      const matched = products.find(p => String(p._id || p.id) === String(item.productId));
      if (matched) {
        return `/product/${matched._id || matched.id}`;
      }
      return `/product/${item.productId}`;
    }

    // 2. Match by title / name in store products
    if (item.name || item.title) {
      const searchName = (item.name || item.title || '').trim().toLowerCase();
      const matched = products.find(p => {
        const pTitle = (p.title || p.name || '').trim().toLowerCase();
        return pTitle === searchName || pTitle.includes(searchName) || searchName.includes(pTitle);
      });
      if (matched) {
        return `/product/${matched._id || matched.id}`;
      }
    }

    // 3. Check path if it's already a product route
    if (item.path && item.path.startsWith('/product/')) {
      return item.path;
    }

    // 4. Default path or fallback to /shop
    return item.path || '/shop';
  };

  const activeHomeArrivals = (homeNewArrivals && Array.isArray(homeNewArrivals))
    ? homeNewArrivals.filter(i => i.isActive !== false)
    : [];

  const newArrivalsList = activeHomeArrivals.length > 0
    ? activeHomeArrivals
    : defaultNewArrivals;

  const displayCategoryStrip = (categoryStrip && Array.isArray(categoryStrip) && categoryStrip.length > 0)
    ? categoryStrip
    : DEFAULT_CATEGORY_STRIP;

  const trendingList = products.length > 3
    ? products.slice(3, 7).map(p => ({
      id: p._id || p.id,
      name: p.title || p.name,
      price: `From ₹${(p.price || 59900).toLocaleString('en-IN')}`,
      image: getProductImage(p, '/iphone_nav/iphone_17.png'),
      path: `/product/${p._id || p.id}`
    }))
    : [
      { id: 't1', name: 'iPhone 17', price: 'From ₹82,900', image: '/iphone_nav/iphone_17.png', path: '/iphone' },
      { id: 't2', name: 'MacBook Air M5', price: 'From ₹1,09,900', image: '/mac_nav/macbook_air.png', path: '/macbook' },
      { id: 't3', name: 'AirPods Pro 3', price: 'From ₹24,900', image: '/airpods_category_uploaded.png', path: '/airpods' },
      { id: 't4', name: 'iPad Air M4', price: 'From ₹59,900', image: '/ipad_nav/ipad_air.png', path: '/ipad' }
    ];

  return (
    <div className="indiaistore-theme">
      <style>{`
        .indiaistore-theme {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          --apple-black: #1d1d1f;
          --apple-gray: #86868b;
          --apple-light: #f5f5f7;
          --apple-blue: #0071e3;
          --apple-blue-hover: #0077ed;
          --white: #ffffff;
          --border: #d2d2d7;
          --shadow: 0 4px 24px rgba(0,0,0,0.06);
          --shadow-hover: 0 12px 40px rgba(0,0,0,0.12);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          color: var(--apple-black);
          background: var(--white);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          user-select: none;
        }

        .indiaistore-theme a { text-decoration: none; color: inherit; }
        .indiaistore-theme img { max-width: 100%; display: block; }

        /* ========== HERO BANNER (Apple style wide banner) ========== */
        .indiaistore-theme .hero-banner {
          position: relative;
          width: 100%;
          height: auto;
          min-height: auto;
          padding: 40px 16px 32px;
          background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }

        @media (min-width: 768px) {
          .indiaistore-theme .hero-banner {
            padding: 48px 24px 36px;
          }
        }

        .indiaistore-theme .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0,113,227,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .indiaistore-theme .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 0 16px;
        }

        .indiaistore-theme .hero-eyebrow {
          font-size: 13.5px;
          font-weight: 600;
          color: #2997ff;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
        }

        .indiaistore-theme .hero-banner h1 {
          font-size: clamp(26px, 3.8vw, 42px);
          font-weight: 700;
          letter-spacing: -1px;
          line-height: 1.08;
          margin-bottom: 8px;
        }

        .indiaistore-theme .hero-sub {
          font-size: 14.5px;
          color: rgba(255,255,255,0.85);
          max-width: 480px;
          margin: 0 auto 14px;
          font-weight: 400;
        }

        .indiaistore-theme .hero-ctas {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .indiaistore-theme .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 20px;
          border-radius: 980px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s ease;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }

        .indiaistore-theme .btn-primary {
          background: var(--apple-blue);
          color: white !important;
        }
        .indiaistore-theme .btn-primary:hover {
          background: var(--apple-blue-hover);
          transform: scale(1.03);
        }

        .indiaistore-theme .btn-secondary {
          background: transparent;
          color: #2997ff !important;
          border: 1px solid rgba(41,151,255,0.6);
        }
        .indiaistore-theme .btn-secondary:hover {
          background: rgba(41,151,255,0.12);
        }

        .indiaistore-theme .hero-visual-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
        }

        .indiaistore-theme .hero-image-wrap {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          overflow: hidden;
        }

        /* ========== CATEGORY STRIP (Apple Store style with side arrows) ========== */
        .indiaistore-theme .category-strip-wrapper {
          position: relative;
          width: 100%;
          min-height: 90px;
          background: #ffffff;
          display: flex;
          align-items: center;
          border-bottom: none;
          padding: 14px 0 16px;
          contain: layout style;
        }

        .indiaistore-theme .category-strip {
          background: #ffffff;
          border-bottom: none;
          padding: 4px 0 6px;
          overflow-x: auto;
          overflow-y: visible;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }

        .indiaistore-theme .category-strip::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        .indiaistore-theme .category-strip-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 8px;
          padding: 0 22px 4px;
          min-width: max-content;
        }

        .indiaistore-theme .category-strip-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: none; /* Hidden on desktop */
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          color: #1d1d1f;
        }

        .indiaistore-theme .category-strip-arrow:hover {
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          transform: translateY(-50%) scale(1.08);
        }

        .indiaistore-theme .category-strip-arrow-left,
        .indiaistore-theme .slider-side-arrow-left {
          left: 6px;
        }

        .indiaistore-theme .category-strip-arrow-right,
        .indiaistore-theme .slider-side-arrow-right {
          right: 6px;
        }

        .indiaistore-theme .slider-side-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: none; /* Hidden on desktop */
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          color: #1d1d1f;
        }

        .indiaistore-theme .slider-side-arrow:hover {
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
          transform: translateY(-50%) scale(1.08);
        }

        .indiaistore-theme .strip-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px 14px 10px;
          min-width: 96px;
          cursor: pointer;
          transition: all 0.25s ease;
          border-radius: 14px;
          text-decoration: none;
          box-sizing: border-box;
        }

        .indiaistore-theme .strip-item:hover {
          background: var(--apple-light);
        }

        .indiaistore-theme .strip-icon {
          width: 96px;
          height: 64px;
          background: transparent;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .indiaistore-theme .strip-icon img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .indiaistore-theme .strip-icon img.strip-img-appletv {
          transform: scale(1.06);
        }

        .indiaistore-theme .strip-item:hover .strip-icon {
          transform: scale(1.10);
        }

        .indiaistore-theme .strip-name {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
          color: var(--apple-black);
          text-align: center;
          white-space: nowrap;
          display: block;
          padding-bottom: 2px;
        }

        /* ========== SECTION COMMON ========== */
        .indiaistore-theme .section {
          padding: 64px 22px;
          max-width: 1400px;
          margin: 0 auto;
          background: #ffffff;
        }

        .indiaistore-theme .section-header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 36px;
        }

        .indiaistore-theme .section-title,
        .indiaistore-theme .wby-title,
        .indiaistore-theme .testimonials-section .section-title,
        .indiaistore-theme .new-arrivals-header .section-title,
        .indiaistore-theme .trending-header .section-title {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          text-align: center;
          margin: 0;
          color: var(--apple-black);
        }

        .indiaistore-theme .section-link {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: var(--apple-blue);
          font-weight: 500;
          text-decoration: none;
        }
        .indiaistore-theme .section-link:hover { text-decoration: underline; }

        @media (max-width: 640px) {
          .indiaistore-theme .section-link {
            position: static;
            transform: none;
          }
        }

        .indiaistore-theme .testimonials-section .section-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          margin-bottom: 48px;
        }
        .indiaistore-theme .testimonials-section .section-title {
          margin: 0 auto;
          text-align: center;
          color: #1d1d1f !important;
          font-size: 36px !important;
          letter-spacing: -0.02em !important;
        }
        .indiaistore-theme .testimonials-section .section-subtitle {
          margin-top: 10px;
          font-size: 15px;
          color: #6e6e73;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        .indiaistore-theme .testimonials-section .slider-nav-btns {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ========== NEW ARRIVALS SLIDER ========== */
        .indiaistore-theme .new-arrivals-section {
          padding-top: 18px;
          padding-bottom: 36px;
        }

        .indiaistore-theme .new-arrivals-header {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          margin-bottom: 28px;
        }

        .indiaistore-theme .new-arrivals-header .section-title {
          text-align: center;
          margin: 0 auto;
        }

        .indiaistore-theme .new-arrivals-header .slider-nav-btns {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .indiaistore-theme .slider-circle-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #e8e8ed;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
          outline: none;
          color: #1d1d1f;
        }

        .indiaistore-theme .slider-circle-btn:hover {
          background: #d2d2d7;
          transform: scale(1.05);
        }

        .indiaistore-theme .slider-circle-btn:active {
          transform: scale(0.95);
        }

        .indiaistore-theme .new-arrivals-slider-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .indiaistore-theme .new-arrivals-slider {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          padding: 8px 4px 20px;
          scrollbar-width: none;
        }
        .indiaistore-theme .new-arrivals-slider::-webkit-scrollbar { display: none; }

        /* ========== APPLE OFFICIAL STORE CARD 40 STYLING ========== */
        .indiaistore-theme .rf-ccard-40 {
          position: relative;
          width: 380px;
          min-width: 320px;
          height: 480px;
          border-radius: 28px;
          background: #ffffff;
          overflow: visible;
          text-decoration: none;
          color: #1d1d1f;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.04);
          flex: 0 0 380px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          text-align: left;
          isolation: isolate;
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          position: relative;
        }

        .indiaistore-theme .rf-ccard-40:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.20);
        }

        .indiaistore-theme .as-util-relatedlink,
        .indiaistore-theme .rf-ccard-content-withfullimg {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          border-radius: inherit;
          overflow: hidden;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          mask-image: -webkit-radial-gradient(white, black);
        }

        .indiaistore-theme .rf-ccard-img-full-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          background: #ffffff;
          overflow: hidden;
          border-radius: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          mask-image: -webkit-radial-gradient(white, black);
        }

        .indiaistore-theme .rf-ccard-img-full {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          border-radius: inherit;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .indiaistore-theme .rf-ccard-40:hover .rf-ccard-img-full {
          transform: scale(1.04);
        }

        .indiaistore-theme .rf-ccard-content-info {
          position: relative;
          z-index: 2;
          padding: 28px 26px;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0) 100%);
        }

        .indiaistore-theme .rf-ccard-content-header-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #b64400;
          margin: 0 0 6px 0;
        }

        .indiaistore-theme .rf-ccard-content-header {
          margin-bottom: 6px;
        }

        .indiaistore-theme .rf-ccard-content-headerlink {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.15;
          color: #1d1d1f;
          letter-spacing: -0.015em;
          display: block;
        }

        .indiaistore-theme .rf-ccard-content-desc {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .indiaistore-theme .rf-ccard-content-desccontent {
          font-size: 15px;
          font-weight: 400;
          color: #1d1d1f;
          line-height: 1.3;
        }

        .indiaistore-theme .rf-ccard-content-descprice {
          font-size: 13px;
          font-weight: 400;
          color: #6e6e73;
        }

        /* Dark Theme Card Variant (e.g., Box 2) */
        .indiaistore-theme .rf-ccard-dark {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: transparent !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-img-full-wrapper {
          background: #000000 !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-content-info {
          background: linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0) 100%) !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-content-header-eyebrow {
          color: #ff7a00 !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-content-headerlink {
          color: #ffffff !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-content-desccontent {
          color: #f5f5f7 !important;
        }

        .indiaistore-theme .rf-ccard-dark .rf-ccard-content-descprice {
          color: #a1a1a6 !important;
        }

        .indiaistore-theme .product-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 24px;
          padding: 18px 18px 24px;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          overflow: hidden;
          flex: 1 1 0px;
          min-width: 280px;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .indiaistore-theme .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.12);
        }

        .indiaistore-theme .product-card .badge {
          position: absolute;
          top: 24px;
          left: 24px;
          background: var(--apple-blue);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 980px;
          z-index: 2;
        }

        .indiaistore-theme .product-img {
          width: 100%;
          height: 240px;
          background: #f5f5f7;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          overflow: hidden;
          position: relative;
          padding: 0;
          box-sizing: border-box;
        }

        .indiaistore-theme .product-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
          mix-blend-mode: multiply;
          filter: contrast(1.03) brightness(1.01);
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          transform: scale3d(1, 1, 1);
          will-change: transform;
          display: block;
          margin: 0 auto;
        }

        .indiaistore-theme .product-card:hover .product-img img {
          transform: scale3d(1.06, 1.06, 1);
        }

        .indiaistore-theme .product-img .placeholder {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--apple-gray);
          font-size: 14px;
          font-weight: 500;
          text-align: center;
        }

        .indiaistore-theme .product-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
          color: var(--apple-black);
          word-break: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .indiaistore-theme .product-tagline {
          font-size: 14px;
          color: var(--apple-gray);
          margin-bottom: 10px;
        }

        .indiaistore-theme .product-price {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--apple-black);
        }

        .indiaistore-theme .product-price span {
          color: var(--apple-gray);
          font-weight: 400;
          font-size: 13px;
        }

        .indiaistore-theme .shop-btn {
          display: inline-block;
          background: var(--apple-blue);
          color: white;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 24px;
          border-radius: 980px;
          transition: background 0.2s;
        }
        .indiaistore-theme .product-card:hover .shop-btn {
          background: var(--apple-blue-hover);
        }

        /* ========== SHOP BY CATEGORY ========== */
        .indiaistore-theme .categories {
          background: #ffffff;
          padding: 0px 22px 52px;
          margin-top: 0px;
        }

        .indiaistore-theme .categories-divider {
          width: 100%;
          height: 1px;
          background-color: #E5E7EB;
          margin: 0 auto 32px;
          border: none;
        }

        .indiaistore-theme .section-trending {
          padding-top: 20px;
        }

        .indiaistore-theme .categories-inner { max-width: 1440px; margin: 0 auto; }

        .indiaistore-theme .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .indiaistore-theme .category-card {
          background: #ffffff;
          border-radius: 28px;
          overflow: hidden;
          text-align: left;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          text-decoration: none;
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .indiaistore-theme .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
        }

        .indiaistore-theme .category-card-body {
          padding: 26px 28px 20px;
          background: #ffffff;
          text-align: center;
        }

        .indiaistore-theme .category-card-eyebrow {
          font-size: 22px;
          font-weight: 700;
          color: #1d1d1f;
          letter-spacing: -0.015em;
          margin-bottom: 0;
          text-align: center;
        }

        .indiaistore-theme .category-card-title {
          font-size: 24px;
          font-weight: 700;
          color: #1d1d1f;
          line-height: 1.25;
          letter-spacing: -0.015em;
        }

        .indiaistore-theme .category-card-title .text-primary {
          color: #0066cc;
          font-weight: 700;
        }

        .indiaistore-theme .category-icon {
          width: 100%;
          height: 290px;
          margin: 0;
          background: #f5f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          overflow: hidden;
          padding: 28px 24px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 28px;
          transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .indiaistore-theme .category-card:hover .category-icon {
          background: #ebebeb;
        }

        .indiaistore-theme .category-icon img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          transform: scale3d(1, 1, 1);
          will-change: transform;
        }

        .indiaistore-theme .category-icon img.cat-img-applecare {
          transform: scale3d(1.35, 1.35, 1);
        }

        .indiaistore-theme .category-card:hover .category-icon img {
          transform: scale3d(1.06, 1.06, 1);
          filter: brightness(1.02);
        }

        .indiaistore-theme .category-card:hover .category-icon img.cat-img-applecare {
          transform: scale3d(1.42, 1.42, 1);
          filter: brightness(1.02);
        }

          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1d1d1f;
          transition: color 0.3s ease;
        }

        .indiaistore-theme .category-card:hover .category-name {
          color: #000000;
        }

        /* ========== TRENDING SLIDER ========== */
        .indiaistore-theme .trending-header {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          margin-bottom: 28px;
        }

        .indiaistore-theme .trending-header .section-title {
          text-align: center;
          margin: 0 auto;
        }

        .indiaistore-theme .trending-header .slider-nav-btns {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .indiaistore-theme .trending-slider-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .indiaistore-theme .trending-grid {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          padding: 8px 4px 20px;
          scrollbar-width: none;
        }
        .indiaistore-theme .trending-grid::-webkit-scrollbar { display: none; }

        .indiaistore-theme .trending-card {
          background: #f8f8fa;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 24px;
          overflow: hidden;
          transition: box-shadow 0.5s cubic-bezier(0.2, 1, 0.3, 1);
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
          flex: 0 0 calc((100% - 48px) / 4);
          min-width: 280px;
          box-sizing: border-box;
        }

        .indiaistore-theme .trending-card:hover {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
        }

        .indiaistore-theme .trending-img {
          width: 100%;
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          background: #ffffff;
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          overflow: hidden;
          padding: 24px 20px;
          box-sizing: border-box;
          position: relative;
          color: #86868b;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: background-color 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .indiaistore-theme .trending-card:hover .trending-img {
          background: #e5e5ea;
        }

        .indiaistore-theme .trending-img img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
          filter: contrast(1.03) brightness(1.01);
          transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), filter 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          transform: scale3d(1, 1, 1);
          will-change: transform;
        }

        .indiaistore-theme .trending-card:hover .trending-img img {
          transform: scale3d(1.06, 1.06, 1);
          filter: brightness(1.02);
        }

        .indiaistore-theme .trending-info-strip {
          background: #f8f8fa;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.03);
          width: 100%;
          box-sizing: border-box;
          flex: 1;
        }

        .indiaistore-theme .trending-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1d1d1f;
          text-align: center;
          letter-spacing: -0.3px;
          transition: color 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.25;
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .indiaistore-theme .trending-card:hover .trending-name {
          color: #000000;
        }

        .indiaistore-theme .trending-price {
          font-size: 14px;
          color: #86868b;
          font-weight: 500;
          text-align: center;
        }

        /* ========== DEAL OF THE WEEK ========== */
        .indiaistore-theme .deal-banner {
          margin: 0 22px 40px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          background: linear-gradient(135deg, #161617 0%, #2a2a2c 100%);
          border-radius: 28px;
          padding: 56px 64px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }

        .indiaistore-theme .deal-content { flex: 1; max-width: 580px; }

        .indiaistore-theme .deal-eyebrow {
          font-size: 13px;
          font-weight: 700;
          color: #f5a623;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .indiaistore-theme .deal-title {
          font-size: 38px;
          font-weight: 700;
          letter-spacing: -0.8px;
          margin-bottom: 14px;
          line-height: 1.15;
          color: #ffffff;
        }

        .indiaistore-theme .deal-desc {
          font-size: 17px;
          opacity: 0.88;
          margin-bottom: 28px;
          line-height: 1.55;
          color: #d2d2d7;
        }

        .indiaistore-theme .deal-price {
          font-size: 34px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .indiaistore-theme .deal-price span {
          font-size: 18px;
          opacity: 0.6;
          text-decoration: line-through;
          margin-left: 12px;
          font-weight: 400;
        }

        .indiaistore-theme .deal-visual {
          flex-shrink: 0;
          width: 520px;
          height: 340px;
          background: transparent;
          border-radius: 20px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
          padding: 0;
        }

        .indiaistore-theme .deal-visual img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
          transform: translateY(24px) scale(1.18);
          filter: drop-shadow(0 14px 32px rgba(0, 0, 0, 0.5));
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .indiaistore-theme .deal-banner:hover .deal-visual img {
          transform: translateY(24px) scale(1.22);
        }

        /* ========== WHY BUY FROM AUTHORISED RESELLER ========== */
        .indiaistore-theme .wby-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0px 22px 64px;
        }

        .indiaistore-theme .wby-title {
          text-align: center;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 20px;
          color: var(--apple-black);
        }

        .indiaistore-theme .wby-subtitle {
          text-align: center;
          font-size: 19px;
          color: var(--apple-gray);
          max-width: 620px;
          margin: 0 auto 48px;
          line-height: 1.5;
        }

        .indiaistore-theme .wby-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        @media (max-width: 1100px) {
          .indiaistore-theme .wby-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 720px) {
          .indiaistore-theme .wby-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .indiaistore-theme .wby-grid { grid-template-columns: 1fr; }
        }

        .indiaistore-theme .wby-card {
          background: var(--apple-light);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 32px 22px 30px;
          text-align: center;
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .indiaistore-theme .wby-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px -16px rgba(0,0,0,.12);
        }

        .indiaistore-theme .wby-card.featured {
          background: var(--white);
          box-shadow: 0 20px 44px -18px rgba(0,0,0,.14);
          border-color: var(--border);
        }

        .indiaistore-theme .wby-badge {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #eeeeef;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 22px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: .06em;
          color: var(--apple-black);
          box-shadow: 0 4px 10px -4px rgba(0,0,0,.08);
        }

        .indiaistore-theme .wby-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: #eeeeef;
          border: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 22px;
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          padding: 8px;
        }

        .indiaistore-theme .wby-icon img.wby-img-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
          filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.15));
        }

        .indiaistore-theme .wby-icon svg {
          width: 26px;
          height: 26px;
          color: var(--apple-black);
        }

        .indiaistore-theme .wby-card-title {
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 12px;
          line-height: 1.3;
          color: var(--apple-black);
        }

        .indiaistore-theme .wby-card-desc {
          font-size: 14.5px;
          color: var(--apple-gray);
          line-height: 1.6;
          margin: 0;
        }

        /* ========== BANK OFFERS STRIP ========== */
        .indiaistore-theme .bank-offer-strip {
          background: linear-gradient(90deg, #eef3fb, #f3f4f7 60%, #eef1f5);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
          margin-bottom: 48px;
        }

        .indiaistore-theme .bank-offer-inner {
          max-width: 1400px;
          margin: 0 auto;
          font-size: 15px;
          color: var(--apple-black);
          text-align: center;
        }

        .indiaistore-theme .bank-offer-inner strong {
          color: var(--apple-blue);
          font-weight: 700;
        }

        /* ========== B2B ========== */
        .indiaistore-theme .b2b {
          background: var(--apple-light);
          padding: 64px 22px;
        }

        .indiaistore-theme .b2b-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: flex-start;
        }

        .indiaistore-theme .b2b-text {
          padding-top: 16px;
        }

        .indiaistore-theme .b2b-text h2 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.6px;
          margin-bottom: 14px;
          text-align: left;
          color: var(--apple-black);
          text-transform: uppercase;
        }

        .indiaistore-theme .b2b-text p {
          font-size: 16px;
          color: var(--apple-gray);
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .indiaistore-theme .b2b-features {
          list-style: none;
          margin-bottom: 28px;
        }

        .indiaistore-theme .b2b-features li {
          font-size: 16.5px;
          font-weight: 600;
          color: #1d1d1f;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.01em;
        }

        .indiaistore-theme .b2b-features li::before {
          content: "✓";
          color: #0071e3;
          font-weight: 800;
          font-size: 18px;
        }

        .indiaistore-theme .b2b-form {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: var(--shadow);
        }

        .indiaistore-theme .b2b-form h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 18px;
        }

        .indiaistore-theme .form-group { margin-bottom: 14px; }

        .indiaistore-theme .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 5px;
          color: var(--apple-gray);
        }

        .indiaistore-theme .form-group input,
        .indiaistore-theme .form-group select,
        .indiaistore-theme .form-group textarea {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .indiaistore-theme .form-group input:focus,
        .indiaistore-theme .form-group select:focus,
        .indiaistore-theme .form-group textarea:focus {
          outline: none;
          border-color: var(--apple-blue);
        }

        .indiaistore-theme .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* ========== TESTIMONIALS SLIDER ========== */
        .indiaistore-theme .testimonials-section {
          background: #ffffff;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .indiaistore-theme .testimonials-slider-wrap {
          position: relative;
          width: 100%;
        }

        .indiaistore-theme .testimonials-slider {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          padding: 8px 4px 28px;
          scrollbar-width: none;
        }
        .indiaistore-theme .testimonials-slider::-webkit-scrollbar {
          display: none;
        }

        .indiaistore-theme .testimonial-card {
          flex: 0 0 350px;
          width: 350px;
          min-width: 320px;
          max-width: 360px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 24px 20px;
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0;
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .indiaistore-theme .testimonial-card.featured,
        .indiaistore-theme .testimonial-card:first-child {
          border: 1.5px solid #0071e3;
          box-shadow: 0 8px 24px rgba(0, 113, 227, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .indiaistore-theme .testimonial-card:hover {
          transform: translateY(-4px);
          border-color: #d1d5db;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
        }

        .indiaistore-theme .testimonial-card.featured:hover,
        .indiaistore-theme .testimonial-card:first-child:hover {
          transform: translateY(-4px);
          border-color: #0071e3;
          box-shadow: 0 14px 34px rgba(0, 113, 227, 0.18);
        }

        .indiaistore-theme .testimonial-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
        }

        .indiaistore-theme .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .indiaistore-theme .author-avatar,
        .indiaistore-theme .author-avatar-img {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1.5px solid #f3f4f6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .indiaistore-theme .author-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .indiaistore-theme .author-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #111827;
          line-height: 1.25;
          word-break: break-word;
        }

        .indiaistore-theme .author-role {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          line-height: 1.3;
          word-break: break-word;
        }

        .indiaistore-theme .author-location {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 500;
          color: #4b5563;
          line-height: 1.3;
          margin-top: 2px;
        }

        .indiaistore-theme .location-pin-icon {
          color: #0071e3;
          flex-shrink: 0;
        }

        .indiaistore-theme .testimonial-stars-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
          padding-top: 2px;
        }

        .indiaistore-theme .stars {
          color: #f59e0b;
          font-size: 14px;
          letter-spacing: 1.5px;
          white-space: nowrap;
          flex-shrink: 0;
          line-height: 1;
        }

        .indiaistore-theme .stars-rating-label {
          font-size: 12px;
          font-weight: 700;
          color: #1f2937;
          margin-top: 3px;
          text-align: right;
        }

        .indiaistore-theme .testimonial-divider {
          width: 100%;
          height: 1px;
          background: #e5e7eb;
          margin: 16px 0 14px;
          flex-shrink: 0;
        }

        .indiaistore-theme .testimonial-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .indiaistore-theme .testimonial-text {
          font-size: 13.5px;
          line-height: 1.65;
          color: #374151;
          margin: 0;
          font-style: italic;
          word-break: break-word;
        }

        .indiaistore-theme .slider-circle-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f5f5f7;
          border: 1px solid #e0e0e5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .indiaistore-theme .slider-circle-btn:hover {
          background: #0071e3;
          border-color: #0071e3;
          box-shadow: 0 4px 16px rgba(0,113,227,0.3);
        }
        .indiaistore-theme .slider-circle-btn svg {
          stroke: #1d1d1f;
        }
        .indiaistore-theme .slider-circle-btn:hover svg {
          stroke: #ffffff;
        }

        @media (max-width: 1200px) {
          .indiaistore-theme .testimonial-card {
            flex: 0 0 calc((100% - 40px) / 3);
            min-width: 280px;
          }
        }
        @media (max-width: 900px) {
          .indiaistore-theme .testimonial-card {
            flex: 0 0 calc((100% - 20px) / 2);
            min-width: 270px;
          }
        }

        @media (max-width: 1100px) {
          .indiaistore-theme .category-grid { grid-template-columns: repeat(4, 1fr); }
          .indiaistore-theme .deal-banner {
            flex-direction: row !important;
            text-align: left !important;
            padding: 22px 18px !important;
            margin: 0 16px 36px !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            overflow: hidden !important;
            position: relative !important;
            border-radius: 24px !important;
          }
          .indiaistore-theme .deal-content {
            flex: 1 !important;
            max-width: 58% !important;
            text-align: left !important;
            z-index: 2 !important;
          }
          .indiaistore-theme .deal-eyebrow {
            font-size: 10px !important;
            letter-spacing: 0.5px !important;
            margin-bottom: 4px !important;
            color: #f59e0b !important;
          }
          .indiaistore-theme .deal-title {
            font-size: 16px !important;
            line-height: 1.2 !important;
            margin-bottom: 6px !important;
          }
          .indiaistore-theme .deal-desc {
            font-size: 10px !important;
            line-height: 1.35 !important;
            margin-bottom: 10px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .indiaistore-theme .deal-price {
            font-size: 18px !important;
            margin-bottom: 10px !important;
          }
          .indiaistore-theme .deal-price span {
            font-size: 11px !important;
            margin-left: 6px !important;
          }
          .indiaistore-theme .deal-banner .btn {
            font-size: 11px !important;
            padding: 7px 16px !important;
            border-radius: 20px !important;
            margin-top: 0 !important;
            display: inline-flex !important;
          }
          .indiaistore-theme .deal-visual {
            width: 46% !important;
            max-width: 205px !important;
            height: 145px !important;
            shrink: 0 !important;
            margin-left: auto !important;
            position: relative !important;
            overflow: visible !important;
          }
          .indiaistore-theme .deal-visual img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            transform: translateY(8px) scale(1.32) !important;
          }
          .indiaistore-theme .b2b-inner { grid-template-columns: 1fr; }
          .indiaistore-theme .b2b-text { padding-top: 0; }
        }

        @media (max-width: 900px) {
          .indiaistore-theme .category-strip-arrow,
          .indiaistore-theme .slider-side-arrow,
          .indiaistore-theme .slider-nav-btns,
          .indiaistore-theme .slider-circle-btn {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .indiaistore-theme .hero-banner { height: auto; min-height: auto; padding: 92px 16px 28px; }
          .indiaistore-theme .hero-banner h1 { font-size: 32px; }
          .indiaistore-theme .section { padding: 36px 16px; }
          .indiaistore-theme .new-arrivals-section { padding-top: 14px; padding-bottom: 24px; }
          .indiaistore-theme .categories { padding: 0px 16px 36px; margin-top: 0px; }
          .indiaistore-theme .categories-divider { margin-bottom: 24px; }
          .indiaistore-theme .section-trending { padding-top: 16px; }
          .indiaistore-theme .wby-section { padding: 0px 16px 40px; margin-top: 0px; }
          .indiaistore-theme .section-title,
          .indiaistore-theme .wby-title,
          .indiaistore-theme .new-arrivals-header .section-title,
          .indiaistore-theme .trending-header .section-title,
          .indiaistore-theme .testimonials-section .section-title {
            font-size: 24px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            text-align: center !important;
            margin: 0 auto !important;
          }
          .indiaistore-theme .wby-title {
            margin-bottom: 24px !important;
          }

          .indiaistore-theme .new-arrivals-header .slider-nav-btns,
          .indiaistore-theme .trending-header .slider-nav-btns,
          .indiaistore-theme .testimonials-section .slider-nav-btns {
            display: none !important;
          }

          .indiaistore-theme .slider-circle-btn {
            width: 34px;
            height: 34px;
          }

          .indiaistore-theme .rf-ccard-40 {
            width: 270px;
            flex: 0 0 270px;
            height: 360px;
            min-width: 260px;
            border-radius: 20px;
          }
          .indiaistore-theme .rf-ccard-content-info {
            padding: 18px 16px;
          }
          .indiaistore-theme .rf-ccard-content-headerlink {
            font-size: 20px;
            line-height: 1.2;
          }
          .indiaistore-theme .rf-ccard-content-desccontent {
            font-size: 13px;
          }
          .indiaistore-theme .rf-ccard-content-descprice {
            font-size: 12px;
          }
          .indiaistore-theme .new-arrivals-slider {
            gap: 14px;
            padding: 6px 2px 16px;
          }

          .indiaistore-theme .category-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .indiaistore-theme .category-card-body { padding: 18px 18px 14px; text-align: center; }
          .indiaistore-theme .category-card-eyebrow { font-size: 16px; font-weight: 700; color: #1d1d1f; text-align: center; }
          .indiaistore-theme .category-card-title { font-size: 18px; }
          .indiaistore-theme .category-icon { height: 210px; padding: 18px 14px; }
          .indiaistore-theme .testimonials-grid { grid-template-columns: 1fr; }
          .indiaistore-theme .testimonial-card { flex: 0 0 310px; width: 310px; min-width: 290px; }
          .indiaistore-theme .form-row { grid-template-columns: 1fr; }
          .indiaistore-theme .category-strip-wrapper { padding: 8px 10px 12px; background: #ffffff; }
          .indiaistore-theme .category-strip { padding: 0; overflow-x: visible; overflow-y: visible; }
          .indiaistore-theme .category-strip-inner {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 16px 10px !important;
            min-width: 100% !important;
            width: 100% !important;
            padding: 0 0 6px !important;
            justify-content: center !important;
          }
          .indiaistore-theme .strip-item {
            min-width: 0 !important;
            width: 100% !important;
            padding: 6px 2px 8px !important;
            gap: 6px !important;
            align-items: center !important;
            box-sizing: border-box !important;
          }
          .indiaistore-theme .strip-icon {
            width: 100% !important;
            height: 64px !important;
          }
          .indiaistore-theme .strip-icon img {
            max-height: 58px !important;
            filter: none !important;
            mix-blend-mode: multiply !important;
          }
          .indiaistore-theme .strip-name {
            font-size: 12px !important;
            font-weight: 500 !important;
            line-height: 1.35 !important;
            color: #1d1d1f !important;
            text-align: center !important;
            padding-bottom: 2px !important;
          }
          .indiaistore-theme .product-card { flex: 0 0 240px; min-width: 220px; padding: 14px; }
          .indiaistore-theme .trending-card { flex: 0 0 280px; min-width: 260px; }
          .indiaistore-theme .trending-img { height: 220px; }
        }

        @media (max-width: 480px) {
          .indiaistore-theme .section { padding: 28px 14px; }
          .indiaistore-theme .section-title,
          .indiaistore-theme .wby-title,
          .indiaistore-theme .new-arrivals-header .section-title,
          .indiaistore-theme .trending-header .section-title,
          .indiaistore-theme .testimonials-section .section-title {
            font-size: 20px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
          }

          .indiaistore-theme .testimonial-card {
            flex: 0 0 280px;
            min-width: 260px;
            max-width: 300px;
            padding: 18px 16px;
          }

          .indiaistore-theme .rf-ccard-40 {
            width: 250px;
            flex: 0 0 250px;
            height: 340px;
            min-width: 240px;
            border-radius: 18px;
          }
          .indiaistore-theme .rf-ccard-content-info {
            padding: 14px 14px;
          }
          .indiaistore-theme .rf-ccard-content-headerlink {
            font-size: 18px;
          }
          .indiaistore-theme .rf-ccard-content-header-eyebrow {
            font-size: 10px;
          }
          .indiaistore-theme .slider-circle-btn {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>

      {/* 1. HERO BANNER SLIDER (Full-width continuous background extending behind navbar to top edge) */}
      <section 
        className="hero-banner-slider-container relative w-full rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[36px] lg:rounded-b-[40px] h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] overflow-hidden select-none bg-gradient-to-b from-[#18191c] via-[#232528] to-[#2c2d32] text-white shadow-xl shadow-black/10"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onTouchStart={() => setIsHeroPaused(true)}
        onTouchEnd={() => setIsHeroPaused(false)}
      >
        {/* Track Container */}
        <div 
          className="hero-slider-track flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
        >
          {effectiveHeroSlides.map((slide, idx) => {
            return (
              <div 
                key={slide._id || slide.id || idx}
                className="hero-slide-item flex-none w-full h-full relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#18191c] via-[#232528] to-[#2c2d32]"
              >
                {/* Full-width Admin Banner Image */}
                <img
                  src={slide.image || DEFAULT_HERO_IMAGE}
                  alt={slide.title || 'Apple Showcase Banner'}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_HERO_IMAGE) {
                      e.currentTarget.src = DEFAULT_HERO_IMAGE;
                    }
                  }}
                />

                {/* Subtle Gradient Overlay for Text Readability (rendered when slide has text) */}
                {(slide.title || slide.subtitle || slide.titleBold || slide.badge) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
                )}

                {/* Slide Text & Interactive CTA Buttons Overlay */}
                <div className="relative z-20 w-full max-w-7xl mx-auto h-full px-6 sm:px-10 md:px-16 pt-24 sm:pt-28 md:pt-32 pb-8 flex items-center justify-start pointer-events-none">
                  {/* Dedicated Left-Aligned Content Column */}
                  <div className="w-full max-w-[400px] sm:max-w-[440px] md:max-w-[460px] lg:max-w-[480px] xl:max-w-[500px] flex flex-col items-start text-left pointer-events-auto shrink-0">
                    {(slide.badge || heroData.homeHeroBadge) && (
                      <div className="hero-eyebrow text-xs md:text-sm font-semibold text-[#2997ff] mb-2 tracking-wide uppercase">
                        {slide.badge || heroData.homeHeroBadge}
                      </div>
                    )}
                    
                    {(slide.title || slide.titleBold || slide.titleNormal) && (
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.12] mb-3 text-white drop-shadow-md break-words">
                        {slide.titleBold || slide.titleNormal ? (
                          <>
                            <span className="font-bold">{slide.titleBold} </span>
                            <span className="font-normal opacity-90">{slide.titleNormal}</span>
                          </>
                        ) : (
                          slide.title
                        )}
                      </h1>
                    )}
                    
                    {slide.subtitle && (
                      <p className="hero-sub text-xs sm:text-sm md:text-[15px] text-white/90 w-full mb-5 leading-relaxed drop-shadow break-words line-clamp-3 sm:line-clamp-none">
                        {slide.subtitle}
                      </p>
                    )}

                    <div className="hero-ctas flex items-center gap-3.5 flex-wrap mt-0">
                      {slide.buttonText && (
                        slide.buttonLink?.startsWith('/') ? (
                          <Link
                            to={slide.buttonLink}
                            className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs md:text-sm font-medium transition-all transform hover:scale-[1.03] shadow-lg shadow-blue-500/25"
                          >
                            {slide.buttonText}
                          </Link>
                        ) : (
                          <a
                            href={slide.buttonLink || '#shop-by-category'}
                            onClick={(e) => {
                              const target = slide.buttonLink || '#shop-by-category';
                              if (target.startsWith('#')) {
                                e.preventDefault();
                                const section = document.getElementById(target.replace('#', ''));
                                if (section) {
                                  const navbarHeight = 90;
                                  const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
                                  const offsetPosition = elementPosition - navbarHeight;
                                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                }
                              }
                            }}
                            className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs md:text-sm font-medium transition-all transform hover:scale-[1.03] shadow-lg shadow-blue-500/25"
                          >
                            {slide.buttonText}
                          </a>
                        )
                      )}

                      {slide.secondaryButtonText && (
                        slide.secondaryButtonLink?.startsWith('/') ? (
                          <Link
                            to={slide.secondaryButtonLink}
                            className="px-6 py-2.5 rounded-full border border-white/40 hover:border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium transition-all backdrop-blur-sm"
                          >
                            {slide.secondaryButtonText}
                          </Link>
                        ) : (
                          <a
                            href={slide.secondaryButtonLink || '#b2b-section'}
                            onClick={(e) => {
                              const target = slide.secondaryButtonLink || '#b2b-section';
                              if (target && target.startsWith('#')) {
                                e.preventDefault();
                                const section = document.getElementById(target.replace('#', ''));
                                if (section) {
                                  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }}
                            className="px-6 py-2.5 rounded-full border border-white/40 hover:border-white text-white hover:bg-white/10 text-xs md:text-sm font-medium transition-all backdrop-blur-sm"
                          >
                            {slide.secondaryButtonText}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous Arrow Button */}
        {effectiveHeroSlides.length > 1 && (
          <button
            type="button"
            onClick={() => setCurrentSlideIndex(prev => (prev === 0 ? effectiveHeroSlides.length - 1 : prev - 1))}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Next Arrow Button */}
        {effectiveHeroSlides.length > 1 && (
          <button
            type="button"
            onClick={() => setCurrentSlideIndex(prev => (prev + 1) % effectiveHeroSlides.length)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Pagination Dots */}
        {effectiveHeroSlides.length > 1 && (
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            {effectiveHeroSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentSlideIndex(dotIdx)}
                className={`transition-all duration-300 cursor-pointer rounded-full ${
                  dotIdx === currentSlideIndex
                    ? 'w-6 md:w-7 h-2 bg-white shadow-sm'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
                title={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. CATEGORY STRIP (Apple.com/store Style with side navigation arrows) */}
      <div id="shop-by-category" className="category-strip-wrapper">
        <button
          type="button"
          className="category-strip-arrow category-strip-arrow-left"
          onClick={() => scrollCategoryStrip('left')}
          title="Previous Categories"
          aria-label="Previous Categories"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="category-strip" ref={categoryStripRef}>
          <div className="category-strip-inner">
            {displayCategoryStrip.map((rawItem, idx) => {
              const item = sanitizeCategoryItem(rawItem);
              if (!item) return null;
              const hasImg = Boolean(item.image && item.image.trim());
              return (
                <Link key={idx} to={item.path || '/shop'} className="strip-item">
                  <div className="strip-icon">
                    {hasImg ? (
                      <img
                        src={item.image.trim().startsWith('/') || item.image.trim().startsWith('http') ? item.image.trim() : '/' + item.image.trim()}
                        alt={item.label || item.name}
                        className={`w-full h-full object-contain ${(item.name || item.label || '').toLowerCase().includes('tv') ? 'strip-img-appletv' : 'p-1'}`}
                        onError={(e) => {
                          const key = item.name || item.label;
                          const fb = DEFAULT_CATEGORY_IMAGES[key] || '/macbook_category_uploaded.png';
                          if (e.currentTarget.src !== window.location.origin + fb && e.currentTarget.src !== fb) {
                            e.currentTarget.src = fb;
                          }
                        }}
                      />
                    ) : (
                      <span>{item.icon || '📱'}</span>
                    )}
                  </div>
                  <div className="strip-name">{item.label || item.name}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="category-strip-arrow category-strip-arrow-right"
          onClick={() => scrollCategoryStrip('right')}
          title="Next Categories"
          aria-label="Next Categories"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* 3. NEW ARRIVALS SLIDER */}
      <section className="section new-arrivals-section">
        <div className="section-header new-arrivals-header">
          <h2 className="section-title">THE LATEST FROM APPLE</h2>
          <div className="slider-nav-btns">
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollNewArrivals('left')}
              title="Previous"
              aria-label="Previous New Arrivals"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollNewArrivals('right')}
              title="Next"
              aria-label="Next New Arrivals"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div className="new-arrivals-slider-wrap">
          <button
            type="button"
            className="slider-side-arrow slider-side-arrow-left"
            onClick={() => scrollNewArrivals('left')}
            title="Previous New Arrivals"
            aria-label="Previous New Arrivals"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div ref={newArrivalsSliderRef} className="new-arrivals-slider">
            {newArrivalsList.map((item, idx) => {
              const card1ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-duo-202609_GEO_IN?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card2ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-iphone-18-pro-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card3ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-series-12-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card4ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-watch-ultra-4-202609_GEO_IN?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card5ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-airpods-5-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card6ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-mini-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80";
              const card7ImgJpg = "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/store-card-40-mac-studio-202609?wid=800&hei=1000&fmt=p-jpg&qlt=80";

              const itemName = (item.name || '').toLowerCase();
              let displayImg = item.image;
              if (!displayImg || displayImg.includes('traceId')) {
                if (itemName.includes('duo')) displayImg = card1ImgJpg;
                else if (itemName.includes('18 pro')) displayImg = card2ImgJpg;
                else if (itemName.includes('series 12')) displayImg = card3ImgJpg;
                else if (itemName.includes('ultra')) displayImg = card4ImgJpg;
                else if (itemName.includes('airpods')) displayImg = card5ImgJpg;
                else if (itemName.includes('mini')) displayImg = card6ImgJpg;
                else if (itemName.includes('studio')) displayImg = card7ImgJpg;
                else if (idx === 0) displayImg = card1ImgJpg;
                else if (idx === 1) displayImg = card2ImgJpg;
                else displayImg = card1ImgJpg;
              }

              const altText = item.altText || item.alt || item.name || "Apple Product";
              const isAirPods = itemName.includes('airpod');
              const isDarkCard = !isAirPods && !itemName.includes('duo') && !itemName.includes('mini') && !itemName.includes('studio') && (
                item.isDark === true ||
                (item.isDark !== false && (
                  itemName.includes('ultra') ||
                  itemName.includes('series 12') ||
                  itemName.includes('18 pro')
                ))
              );
              const targetPath = resolveArrivalProductPath(item);

              return (
                <Link key={item.id || idx} to={targetPath} className={`rf-ccard rf-ccard-40 ${isDarkCard ? 'rf-ccard-dark' : 'rf-card-msgtag-orange'}`}>
                  <div className="as-util-relatedlink">
                    <div className="rf-ccard-content rf-ccard-content-withfullimg">
                      <div className="rf-ccard-img-full-wrapper">
                        <img
                          width="400"
                          height="500"
                          alt={altText}
                          className="rf-ccard-img-full"
                          src={displayImg}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = card1ImgJpg;
                          }}
                        />
                      </div>
                      <div className="rf-ccard-content-info">
                        {item.eyebrow ? (
                          <h3 className="rf-ccard-content-header-eyebrow">
                            {item.eyebrow}
                          </h3>
                        ) : null}
                        <div className="rf-ccard-content-header">
                          <span className="rf-ccard-content-headerlink">
                            {item.name || 'Apple Product'}
                          </span>
                        </div>
                        <div className="rf-ccard-content-desc">
                          <span className="typography-body-tight rf-ccard-content-desccontent">
                            {item.tagline || ''}
                          </span>
                          <span className="typography-body-reduced-tight rf-ccard-content-descprice">
                            {item.price || ''}{' '}
                            {item.monthlyPrice ? item.monthlyPrice : ''}
                            <sup className="as-footnote footnote">†</sup>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="slider-side-arrow slider-side-arrow-right"
            onClick={() => scrollNewArrivals('right')}
            title="Next New Arrivals"
            aria-label="Next New Arrivals"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="categories">
        <div className="categories-inner">
          <div className="categories-divider" />
          <div className="section-header" style={{ marginBottom: '18px' }}>
            <h2 className="section-title">SHOP BY CATEGORY</h2>
          </div>
          <div className="category-grid">
            {appleCategories.map((cat, idx) => {
              const displayImg = (cat.image || '').trim();
              const displayPrice = cat.startingPrice || cat.price || (cat.name === 'Mac' ? '₹89,900' : cat.name === 'iPhone' ? '₹59,900' : cat.name === 'iPad' ? '₹34,900' : cat.name === 'Watch' ? '₹29,900' : cat.name === 'AirPods' ? '₹12,900' : cat.name === 'TV & Home' ? '₹14,900' : cat.name === 'Accessories' ? '₹1,900' : cat.name === 'AppleCare+' ? '₹2,900' : '');

              return (
                <Link key={idx} to={cat.link || '/shop'} className="category-card">
                  <div className="category-card-body">
                    <div className="category-card-eyebrow">{cat.name}</div>
                  </div>
                  <div className="category-icon">
                    {displayImg ? (
                      <img
                        src={displayImg.startsWith('/') || displayImg.startsWith('http') ? displayImg : '/' + displayImg}
                        alt={cat.name}
                        className={(cat.name || '').toLowerCase().includes('applecare') ? 'cat-img-applecare' : ''}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{cat.icon || '📱'}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TRENDING NOW SLIDER */}
      <section className="section section-trending">
        <div className="section-header trending-header">
          <h2 className="section-title">TRENDING NOW</h2>
          <div className="slider-nav-btns">
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollTrending('left')}
              title="Previous"
              aria-label="Previous Trending"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollTrending('right')}
              title="Next"
              aria-label="Next Trending"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div className="trending-slider-wrap">
          <button
            type="button"
            className="slider-side-arrow slider-side-arrow-left"
            onClick={() => scrollTrending('left')}
            title="Previous Trending"
            aria-label="Previous Trending"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div ref={trendingSliderRef} className="trending-grid">
            {trendingList.map((item) => (
              <Link key={item.id} to={item.path} className="trending-card">
                <div className="trending-img">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerText = item.name;
                        }
                      }}
                    />
                  ) : (
                    <span>{item.name}</span>
                  )}
                </div>
                <div className="trending-info-strip">
                  <div className="trending-name">{item.name}</div>
                  <div className="trending-price">{item.price}</div>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="slider-side-arrow slider-side-arrow-right"
            onClick={() => scrollTrending('right')}
            title="Next Trending"
            aria-label="Next Trending"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* 6. DEAL OF THE WEEK */}
      {dealBanners && dealBanners.length > 0 && (() => {
        const banner = dealBanners[0];
        if (!banner) return null;
        const productTarget = banner.productId ? `/product/${banner.productId}` : (banner.buttonLink || '/shop');
        const formattedFinal = formatRupee(banner.finalPrice !== undefined && banner.finalPrice !== null ? banner.finalPrice : banner.dealPrice);
        const formattedMrp = formatRupee(banner.originalMrp !== undefined && banner.originalMrp !== null ? banner.originalMrp : banner.dealOldPrice);
        const displayImg = banner.productImage || banner.dealImage || '/mac_deal_fan.png';

        return (
          <div key={banner.id || banner._id || 'single-deal'} className="deal-banner">
            <div className="deal-content">
              <div className="deal-eyebrow">{banner.smallLabel || banner.dealEyebrow || 'DEAL OF THE WEEK'}</div>
              <h2 className="deal-title">{banner.title || banner.dealTitle || 'MacBook Neo – Stock Clearance'}</h2>
              <p className="deal-desc">
                {banner.description || banner.dealDesc || 'Amazing Mac at a surprising price. Limited stock this week. Exclusive bank offers + free AppleCare+ for first 50 buyers.'}
              </p>
              <div className="deal-price">
                {formattedFinal} {formattedMrp && <span>{formattedMrp}</span>}
              </div>
              <Link to={productTarget} className="btn btn-primary" style={{ marginTop: '18px' }}>
                {banner.buttonText || banner.dealButtonText || 'Grab the Deal'}
              </Link>
            </div>
            <div className="deal-visual">
              <img
                src={displayImg}
                alt={banner.title || 'Deal Product'}
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
            </div>
          </div>
        );
      })()}

      {/* 5.5 WHY BUY FROM AUTHORISED RESELLER */}
      <div className="wby-section">
        <h2 className="wby-title">WHY CHOOSE iiNCEPT?</h2>

        <div className="wby-grid">
          <div className="wby-card">
            <div className="wby-icon">
              <img src="/why_buy/icon_shield_check.png" alt="100% Original Products" className="wby-img-icon" />
            </div>
            <h3 className="wby-card-title">100% Original Products</h3>
            <p className="wby-card-desc">Only genuine Apple products sourced through official channels with full authenticity.</p>
          </div>

          <div className="wby-card">
            <div className="wby-icon">
              <img src="/why_buy/icon_warranty_ribbon.png" alt="1 Year Apple Warranty" className="wby-img-icon" />
            </div>
            <h3 className="wby-card-title">1 Year Apple Warranty</h3>
            <p className="wby-card-desc">Complete manufacturer warranty support across all Apple Authorised service centres.</p>
          </div>

          <div className="wby-card">
            <div className="wby-icon">
              <img src="/why_buy/icon_shield_star.png" alt="Trusted Apple Seller" className="wby-img-icon" />
            </div>
            <h3 className="wby-card-title">Trusted Apple Seller</h3>
            <p className="wby-card-desc">Official mono-brand authorised resellers trusted by thousands of customers across India.</p>
          </div>

          <div className="wby-card">
            <div className="wby-icon">
              <img src="/why_buy/icon_headset.png" alt="Expert Guidance & Support" className="wby-img-icon" />
            </div>
            <h3 className="wby-card-title">Expert Guidance &amp; Support</h3>
            <p className="wby-card-desc">Trained Apple specialists for product advice, setup and after-sales support.</p>
          </div>

          <div className="wby-card">
            <div className="wby-icon">
              <img src="/why_buy/icon_shield_service.png" alt="Service You Can Trust" className="wby-img-icon" />
            </div>
            <h3 className="wby-card-title">Service You Can Trust</h3>
            <p className="wby-card-desc">Comprehensive support and transparent service for complete peace of mind.</p>
          </div>
        </div>
      </div>

      {/* 7. B2B / CORPORATE ORDERS */}
      <section id="b2b-section" className="b2b">
        <div className="b2b-inner">
          <div className="b2b-text">
            <h2>BUSINESS SOLUTIONS BY iiNCEPT</h2>
            <p>Looking for volume purchases, education pricing or enterprise solutions? Our dedicated team helps businesses get the right Apple setup with preferential pricing and support.</p>
            <ul className="b2b-features">
              <li>Volume & bulk pricing</li>
              <li>Dedicated account manager</li>
              <li>AppleCare+</li>
              <li>Fast delivery across India</li>
            </ul>
            <a
              href="https://wa.me/918607222417?text=Hello%20iiNCEPT%20B2B%20Desk!%20I%20want%20to%20talk%20to%20sales."
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Talk to Sales
            </a>
          </div>

          <div className="b2b-form">
            <h3>Request a Quote</h3>
            {b2bSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '12px', fontWeight: 'bold', padding: '10px', borderRadius: '8px', marginBottom: '14px' }}>
                {b2bSuccess}
              </div>
            )}
            <form onSubmit={handleB2bSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={b2bForm.fullName}
                    onChange={(e) => setB2bForm({ ...b2bForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={b2bForm.company}
                    onChange={(e) => setB2bForm({ ...b2bForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="work@email.com"
                    value={b2bForm.email}
                    onChange={(e) => setB2bForm({ ...b2bForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={b2bForm.phone}
                    onChange={(e) => setB2bForm({ ...b2bForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Interest</label>
                <select
                  value={b2bForm.productInterest}
                  onChange={(e) => setB2bForm({ ...b2bForm, productInterest: e.target.value })}
                >
                  <option disabled>Select category</option>
                  <option value="Mac">Mac</option>
                  <option value="iPhone">iPhone</option>
                  <option value="iPad">iPad</option>
                  <option value="Watch & Accessories">Watch & Accessories</option>
                  <option value="Mixed / Multiple">Mixed / Multiple</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Quantity, timeline, any specific requirements..."
                  value={b2bForm.message}
                  onChange={(e) => setB2bForm({ ...b2bForm, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={b2bSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {b2bSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SLIDER */}
      <section className="section testimonials-section" id="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">WHAT OUR CUSTOMERS SAY</h2>
          <p className="section-subtitle">Trusted by thousands of happy customers across India</p>
          <div className="slider-nav-btns">
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollTestimonials('left')}
              title="Previous"
              aria-label="Previous Testimonials"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className="slider-circle-btn"
              onClick={() => scrollTestimonials('right')}
              title="Next"
              aria-label="Next Testimonials"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div
          className="testimonials-slider-wrap"
          onMouseEnter={() => setIsTestimonialsPaused(true)}
          onMouseLeave={() => setIsTestimonialsPaused(false)}
          onTouchStart={() => setIsTestimonialsPaused(true)}
          onTouchEnd={() => setIsTestimonialsPaused(false)}
        >
          <div ref={testimonialSliderRef} className="testimonials-slider">
            {(testimonials && testimonials.length > 0
              ? (testimonials.length < 6 ? [...testimonials, ...testimonials] : testimonials)
              : DEFAULT_TESTIMONIALS
            ).map((rawItem, idx) => {
              const item = formatTestimonialItem(rawItem, idx);
              return (
                <div key={`${item.id || item._id || 't'}-${idx}`} className={`testimonial-card ${idx === 0 ? 'featured' : ''}`}>
                  {/* Top Row: Author details LEFT + Stars/Rating RIGHT */}
                  <div className="testimonial-card-header">
                    <div className="testimonial-author">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="author-avatar-img"
                        onError={(e) => {
                          e.currentTarget.src = `/avatars/avatar${(idx % 6) + 1}.jpg`;
                        }}
                      />
                      <div className="author-info">
                        <strong className="author-name">{item.name}</strong>
                        <span className="author-role">{item.role}</span>
                        <span className="author-location">
                          <svg
                            className="location-pin-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#0071e3"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{item.location}</span>
                        </span>
                      </div>
                    </div>

                    <div className="testimonial-stars-col">
                      <span className="stars" aria-label="5 out of 5 stars">
                        {'★'.repeat(item.stars || 5)}
                      </span>
                      <span className="stars-rating-label">5.0</span>
                    </div>
                  </div>

                  {/* Thin Light-Grey Divider */}
                  <div className="testimonial-divider" />

                  {/* Review Text */}
                  <div className="testimonial-card-body">
                    <p className="testimonial-text">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
