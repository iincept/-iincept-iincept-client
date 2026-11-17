import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Star } from 'lucide-react';
import AppleCareFeaturesGrid from '../components/AppleCareFeaturesGrid';
import { fetchProductById, fetchProducts, setCurrentProduct } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import Loader from '../components/Loader';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';
import { resolveColorHex, resolveColorValue, isValidHex, normalizeHex } from '../utils/colorResolver';

// In-memory cache for processed canvas images to prevent main thread re-processing
const canvasProcessedCache = new Map();

export default function ProductDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProduct, loading, products } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeImage, setActiveImage] = useState('');
  const [processedImage, setProcessedImage] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  const handleGalleryMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleGalleryMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleGalleryMouseLeave = () => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 });
  };
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedRam, setSelectedRam] = useState('');
  const [selectedGlass, setSelectedGlass] = useState('');
  const [selectedConnectivity, setSelectedConnectivity] = useState('');
  const [selectedBandSize, setSelectedBandSize] = useState('');
  const [selectedAccessoriesSize, setSelectedAccessoriesSize] = useState('');
  const [selectedStrapSize, setSelectedStrapSize] = useState('');
  const [selectedCaseSize, setSelectedCaseSize] = useState('');
  const [selectedAppleCare, setSelectedAppleCare] = useState(false);
  const [selectedAppleCarePlan, setSelectedAppleCarePlan] = useState(null);
  const [isAppleCareExpanded, setIsAppleCareExpanded] = useState(false);
  const [selectedIpadDuration, setSelectedIpadDuration] = useState('2yr');
  const [selectedIphoneDuration, setSelectedIphoneDuration] = useState('2yr');
  const [selectedWatchDuration, setSelectedWatchDuration] = useState('2yr');
  const [selectedAirpodsDuration, setSelectedAirpodsDuration] = useState('2yr');
  const [selectedTvHomeDuration, setSelectedTvHomeDuration] = useState('2yr');
  const [activeTab, setActiveTab] = useState('specs');

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Pincode states
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeMessage, setPincodeMessage] = useState('');

  // Product AppleCare state
  const [productAppleCare, setProductAppleCare] = useState(null);
  const [appleCarePricingTables, setAppleCarePricingTables] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetchReviews();
    fetchAppleCareSettings();
  }, [id]);

  const fetchAppleCareSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data?.productAppleCare) {
        setProductAppleCare(response.data.productAppleCare);
      }
      if (response.data?.appleCarePricingTables) {
        setAppleCarePricingTables(response.data.appleCarePricingTables);
      }
    } catch (err) {
      console.error('Failed to load Product AppleCare settings:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosClient.get(`/reviews/${id}`);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating) return alert('Please select a star rating');

    setSubmittingReview(true);
    try {
      await axiosClient.post('/reviews', {
        product: id,
        rating: newRating,
        comment: newComment
      });
      setNewComment('');
      setNewRating(5);
      fetchReviews(); // reload list
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };


  useEffect(() => {
    if (id) {
      const isCurrentMatching = currentProduct && 
        (currentProduct._id === id || currentProduct.id === id || currentProduct.slug === id);

      if (!isCurrentMatching) {
        dispatch(setCurrentProduct(null));
        setActiveImage('');
        setProcessedImage('');
        setSelectedColor(null);
        setSelectedAppleCare(false);
        setSelectedAppleCarePlan(null);
        setIsAppleCareExpanded(false);
        setSelectedIpadDuration('2yr');

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          dispatch(fetchProductById(id));
        } else if (!products || products.length === 0) {
          dispatch(fetchProducts());
        }
      }
    }
    const unsubscribe = subscribeToLiveSync(() => {
      if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        dispatch(fetchProductById(id));
      }
    });
    return () => unsubscribe();
  }, [id, dispatch]);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products?.length]);

  // Pincode calculation helper
  const checkPincodeDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('error');
      setPincodeMessage('Please enter a valid 6-digit Indian pincode.');
      return;
    }
    const metroPrefixes = ['11', '40', '56', '60', '70'];
    const prefix = pincode.substring(0, 2);
    if (metroPrefixes.includes(prefix)) {
      setPincodeStatus('metro');
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);
      const formattedDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
      setPincodeMessage(`Express Delivery Available! Estimated delivery by ${formattedDate} (Free Shipping).`);
    } else {
      setPincodeStatus('standard');
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      const formattedDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
      setPincodeMessage(`Standard Shipping Available. Estimated delivery by ${formattedDate} (Free Shipping).`);
    }
  };

  const FALLBACK_PRODUCTS_MAP = {
    'default-iphone-15': {
      id: 'default-iphone-15',
      _id: 'default-iphone-15',
      title: 'iPhone 15',
      name: 'iPhone 15',
      price: 69900,
      priceStr: '₹69,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_15.png',
      images: ['/iphone_nav/iphone_15.png', '/iphone16_group.jpg'],
      description: 'Dynamic Island, 48MP Main camera, and USB-C. All in a durable color-infused glass and aluminum design.',
      colors: [
        { name: 'Black', value: '#111111', image: '/iphone_nav/iphone_15.png' },
        { name: 'Blue', value: '#bae6fd', image: '/iphone_nav/iphone_15.png' },
        { name: 'Green', value: '#bbf7d0', image: '/iphone_nav/iphone_15.png' },
        { name: 'Yellow', value: '#eab308', image: '/iphone_nav/iphone_15.png' },
        { name: 'Pink', value: '#ec4899', image: '/iphone_nav/iphone_15.png' }
      ],
      storage: ['128GB', '256GB', '512GB'],
      variants: [
        { storage: '128GB', price: 69900 },
        { storage: '256GB', price: 79900 },
        { storage: '512GB', price: 99900 }
      ],
      rating: 4.8
    },
    'default-iphone-se': {
      id: 'default-iphone-se',
      _id: 'default-iphone-se',
      title: 'iPhone SE',
      name: 'iPhone SE',
      price: 49900,
      priceStr: '₹49,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_se.png',
      images: ['/iphone_nav/iphone_se.png', '/iphone17e_group.jpg'],
      description: 'Serious power in a compact design. Lightning-fast A15 Bionic chip and great battery life.',
      colors: [
        { name: 'Midnight', value: '#1e293b', image: '/iphone_nav/iphone_se.png' },
        { name: 'Starlight', value: '#f5f5f4', image: '/iphone_nav/iphone_se.png' },
        { name: 'RED', value: '#e0115f', image: '/iphone_nav/iphone_se.png' }
      ],
      storage: ['64GB', '128GB', '256GB'],
      variants: [
        { storage: '64GB', price: 49900 },
        { storage: '128GB', price: 54900 },
        { storage: '256GB', price: 64900 }
      ],
      rating: 4.7
    },
    'default-iphone-air': {
      id: 'default-iphone-air',
      _id: 'default-iphone-air',
      title: 'iPhone Air',
      name: 'iPhone Air',
      price: 119900,
      priceStr: '₹1,19,900',
      category: 'iphone',
      image: '/iphone_nav/dropdown_iphone_air.png',
      images: ['/iphone_nav/dropdown_iphone_air.png', '/iphone_air_group.jpg'],
      description: 'Impossibly thin. Unbelievably powerful. Built for Apple Intelligence.',
      colors: [
        { name: 'Silver', value: '#e5e6e8', image: '/iphone_nav/dropdown_iphone_air.png' },
        { name: 'Space Gray', value: '#4b4c4e', image: '/iphone_nav/dropdown_iphone_air.png' }
      ],
      storage: ['256GB', '512GB', '1TB'],
      variants: [
        { storage: '256GB', price: 119900 },
        { storage: '512GB', price: 139900 },
        { storage: '1TB', price: 179900 }
      ],
      rating: 4.9
    },
    'default-iphone-17': {
      id: 'default-iphone-17',
      _id: 'default-iphone-17',
      title: 'iPhone 17',
      name: 'iPhone 17',
      price: 79900,
      priceStr: '₹79,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_17.png',
      images: ['/iphone_nav/iphone_17.png', '/iphone17_group.jpg'],
      description: 'Next-generation performance with A19 chip and ProMotion display.',
      colors: [
        { name: 'Lavender', value: '#d8b4fe', image: '/iphone_nav/iphone_17.png' },
        { name: 'Sage Green', value: '#a7f3d0', image: '/iphone_nav/iphone_17.png' },
        { name: 'Starlight', value: '#fafaf9', image: '/iphone_nav/iphone_17.png' }
      ],
      storage: ['128GB', '256GB', '512GB'],
      variants: [
        { storage: '128GB', price: 79900 },
        { storage: '256GB', price: 89900 },
        { storage: '512GB', price: 109900 }
      ],
      rating: 4.9
    },
    'default-iphone-17e': {
      id: 'default-iphone-17e',
      _id: 'default-iphone-17e',
      title: 'iPhone 17e',
      name: 'iPhone 17e',
      price: 59900,
      priceStr: '₹59,900',
      category: 'iphone',
      image: '/iphone_nav/dropdown_iphone_17e.png',
      images: ['/iphone_nav/dropdown_iphone_17e.png', '/iphone17e_group.jpg'],
      description: 'Essential Apple performance at a groundbreaking value.',
      colors: [
        { name: 'Soft Pink', value: '#fbcfe8', image: '/iphone_nav/dropdown_iphone_17e.png' },
        { name: 'White', value: '#ffffff', image: '/iphone_nav/dropdown_iphone_17e.png' },
        { name: 'Midnight', value: '#1e293b', image: '/iphone_nav/dropdown_iphone_17e.png' }
      ],
      storage: ['128GB', '256GB'],
      variants: [
        { storage: '128GB', price: 59900 },
        { storage: '256GB', price: 69900 }
      ],
      rating: 4.8
    },
    'default-iphone-17-pro': {
      id: 'default-iphone-17-pro',
      _id: 'default-iphone-17-pro',
      title: 'iPhone 17 Pro',
      name: 'iPhone 17 Pro',
      price: 134900,
      priceStr: '₹1,34,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_17_pro.png',
      images: ['/iphone_nav/iphone_17_pro.png', '/iphone17p_white.jpg'],
      description: 'Forged in titanium. Powered by A19 Pro chip with breakthrough camera capabilities.',
      colors: [
        { name: 'Cosmic Orange', value: '#e07a5f', image: '/iphone_nav/iphone_17_pro.png' },
        { name: 'White Titanium', value: '#f4f4f6', image: '/iphone17p_white.jpg' },
        { name: 'Black Titanium', value: '#323335', image: '/iphone_nav/iphone_17_pro.png' }
      ],
      storage: ['128GB', '256GB', '512GB', '1TB'],
      variants: [
        { storage: '128GB', price: 134900 },
        { storage: '256GB', price: 144900 },
        { storage: '512GB', price: 164900 },
        { storage: '1TB', price: 184900 }
      ],
      rating: 5.0
    },
    'default-iphone-16-pro': {
      id: 'default-iphone-16-pro',
      _id: 'default-iphone-16-pro',
      title: 'iPhone 16 Pro',
      name: 'iPhone 16 Pro',
      price: 119900,
      priceStr: '₹1,19,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_16_pro.png',
      images: ['/iphone_nav/iphone_16_pro.png'],
      description: 'Titanium design with A18 Pro chip and 48MP Fusion camera.',
      colors: [
        { name: 'Desert Titanium', value: '#e6c2b9', image: '/iphone_nav/iphone_16_pro.png' },
        { name: 'Natural Titanium', value: '#a39e99', image: '/iphone_nav/iphone_16_pro.png' },
        { name: 'Black Titanium', value: '#232426', image: '/iphone_nav/iphone_16_pro.png' },
        { name: 'White Titanium', value: '#f2f1ed', image: '/iphone_nav/iphone_16_pro.png' }
      ],
      storage: ['128GB', '256GB', '512GB', '1TB'],
      variants: [
        { storage: '128GB', price: 119900 },
        { storage: '256GB', price: 129900 },
        { storage: '512GB', price: 149900 },
        { storage: '1TB', price: 169900 }
      ],
      rating: 5.0
    },
    'default-iphone-16': {
      id: 'default-iphone-16',
      _id: 'default-iphone-16',
      title: 'iPhone 16',
      name: 'iPhone 16',
      price: 79900,
      priceStr: '₹79,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_16.png',
      images: ['/iphone_nav/iphone_16.png', '/iphone16_group.jpg'],
      description: 'Camera Control, 48MP Fusion camera, A18 chip, and Vibrant colors.',
      colors: [
        { name: 'Ultramarine', value: '#2a4b7c', image: '/iphone_nav/iphone_16.png' },
        { name: 'Teal', value: '#1d3557', image: '/iphone_nav/iphone_16.png' },
        { name: 'Pink', value: '#ec4899', image: '/iphone_nav/iphone_16.png' },
        { name: 'White', value: '#ffffff', image: '/iphone_nav/iphone_16.png' },
        { name: 'Black', value: '#111111', image: '/iphone_nav/iphone_16.png' }
      ],
      storage: ['128GB', '256GB', '512GB'],
      variants: [
        { storage: '128GB', price: 79900 },
        { storage: '256GB', price: 89900 },
        { storage: '512GB', price: 109900 }
      ],
      rating: 4.9
    },
    'default-iphone-18-pro': {
      id: 'default-iphone-18-pro',
      _id: 'default-iphone-18-pro',
      title: 'iPhone 18 Pro',
      name: 'iPhone 18 Pro',
      price: 164900,
      priceStr: '₹1,64,900',
      category: 'iphone',
      image: '/iphone_nav/iphone_18_pro.jpg',
      images: ['/iphone_nav/iphone_18_pro.jpg'],
      description: 'The pinnacle of mobile engineering and Apple Intelligence.',
      colors: [
        { name: 'Burgundy', value: '#4a1525', image: '/iphone_nav/iphone_18_pro.jpg' },
        { name: 'Glacier', value: '#e4effb', image: '/iphone_nav/iphone_18_pro.jpg' },
        { name: 'Silver', value: '#e5e6e8', image: '/iphone_nav/iphone_18_pro.jpg' }
      ],
      storage: ['256GB', '512GB', '1TB', '2TB'],
      variants: [
        { storage: '256GB', price: 164900 },
        { storage: '512GB', price: 189000 },
        { storage: '1TB', price: 239900 },
        { storage: '2TB', price: 314900 }
      ],
      rating: 5.0
    },
    'default-iphone-duo': {
      id: 'default-iphone-duo',
      _id: 'default-iphone-duo',
      title: 'iPhone Duo',
      name: 'iPhone Duo',
      price: 299900,
      priceStr: '₹2,99,900',
      category: 'iphone',
      image: '/iphone_nav/dropdown_iphone_duo.png',
      images: ['/iphone_nav/dropdown_iphone_duo.png'],
      description: 'Revolutionary dual display iPhone experience.',
      colors: [
        { name: 'Star White', value: '#fafafa', image: '/iphone_nav/dropdown_iphone_duo.png' },
        { name: 'Night Sky', value: '#353e4a', image: '/iphone_nav/dropdown_iphone_duo.png' }
      ],
      storage: ['512GB', '1TB'],
      variants: [
        { storage: '512GB', price: 299900 },
        { storage: '1TB', price: 349900 }
      ],
      rating: 5.0
    },
    'iphone-duo': {
      id: 'default-iphone-duo',
      _id: 'default-iphone-duo',
      title: 'iPhone Duo',
      name: 'iPhone Duo',
      price: 299900,
      priceStr: '₹2,99,900',
      category: 'iphone',
      image: '/iphone_nav/dropdown_iphone_duo.png',
      images: ['/iphone_nav/dropdown_iphone_duo.png'],
      description: 'Revolutionary dual display iPhone experience.',
      colors: [
        { name: 'Star White', value: '#fafafa', image: '/iphone_nav/dropdown_iphone_duo.png' },
        { name: 'Night Sky', value: '#353e4a', image: '/iphone_nav/dropdown_iphone_duo.png' }
      ],
      storage: ['512GB', '1TB'],
      variants: [
        { storage: '512GB', price: 299900 },
        { storage: '1TB', price: 349900 }
      ],
      rating: 5.0
    },
    'iphone_duo': {
      id: 'default-iphone-duo',
      _id: 'default-iphone-duo',
      title: 'iPhone Duo',
      name: 'iPhone Duo',
      price: 299900,
      priceStr: '₹2,99,900',
      category: 'iphone',
      image: '/iphone_nav/dropdown_iphone_duo.png',
      images: ['/iphone_nav/dropdown_iphone_duo.png'],
      description: 'Revolutionary dual display iPhone experience.',
      colors: [
        { name: 'Star White', value: '#fafafa', image: '/iphone_nav/dropdown_iphone_duo.png' },
        { name: 'Night Sky', value: '#353e4a', image: '/iphone_nav/dropdown_iphone_duo.png' }
      ],
      storage: ['512GB', '1TB'],
      variants: [
        { storage: '512GB', price: 299900 },
        { storage: '1TB', price: 349900 }
      ],
      rating: 5.0
    }
  };

  // Synchronously reset image and selection state when route param `id` changes
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActiveImage('');
    setProcessedImage('');
    setSelectedColor(null);
  }

  const getProductFromStore = (prodId) => {
    if (!prodId) return null;

    if (products && products.length > 0) {
      // 1. Direct _id, id, or slug match in products array
      const directMatch = products.find(p => (p._id === prodId || p.id === prodId || p.slug === prodId));
      if (directMatch) return directMatch;

      // Do not match aliases for 24-char MongoDB ObjectIds
      if (prodId.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
      }

      // 2. Title substring match against real database products
      const mockIdMap = {
        'iphone-18-pro': 'iPhone 18 Pro',
        'default-iphone-18-pro': 'iPhone 18 Pro',
        'iphone-duo': 'iPhone Duo',
        'default-iphone-duo': 'iPhone Duo',
        'ip17pm': 'iPhone 17 Pro Max',
        'ip17p': 'iPhone 17 Pro',
        'iphone-17-pro': 'iPhone 17 Pro',
        'ipair': 'iPhone Air',
        'iphone-air': 'iPhone Air',
        'ip17': 'iPhone 17',
        'iphone-17': 'iPhone 17',
        'ip17e': 'iPhone 17e',
        'iphone-17e': 'iPhone 17e',
        'ip16pm': 'iPhone 16 Pro Max',
        'ip16p': 'iPhone 16 Pro',
        'iphone-16-pro': 'iPhone 16 Pro',
        'ip16': 'iPhone 16',
        'iphone-16': 'iPhone 16',
        'ip15': 'iPhone 15',
        'iphone-15': 'iPhone 15',
        'ipse': 'iPhone SE',
        'iphone-se': 'iPhone SE'
      };

      const targetTitle = mockIdMap[prodId] || prodId.replace(/^default-/, '').replace(/-/g, ' ');
      const matchedProduct = products.find(p => {
        const pTitle = (p.title || p.name || '').toLowerCase();
        const tLower = targetTitle.toLowerCase();
        return pTitle === tLower || pTitle.includes(tLower) || tLower.includes(pTitle);
      });
      if (matchedProduct) return matchedProduct;
    }

    return null;
  };

  const isAccessoryProduct = (prod) => {
    if (!prod) return false;
    const catObj = prod.category;
    const catName = (catObj && typeof catObj === 'object') ? (catObj.name || catObj.title || '').toLowerCase() : (typeof catObj === 'string' ? catObj.toLowerCase() : '');
    const catSlug = (catObj && typeof catObj === 'object') ? (catObj.slug || '').toLowerCase() : '';
    const title = (prod.title || prod.name || '').toLowerCase();

    if (catSlug.includes('accessori') || catName.includes('accessori')) return true;

    const accessoryKeywords = [
      'case', 'sleeve', 'cover', 'bag', 'backpack', 'folio', 'screen protector',
      'guard', 'film', 'skin', 'stand', 'mount', 'hub', 'dock', 'dongle', 'converter',
      'adapter', 'charger', 'charging', 'cable', 'cord', 'connector', 'strap', 'band',
      'loop', 'wallet', 'keychain', 'lanyard', 'airtag', 'cleaning cloth', 'polishing cloth',
      'pencil', 'magic mouse', 'magic keyboard', 'magic trackpad', 'power adapter'
    ];

    return accessoryKeywords.some(kw => title.includes(kw));
  };

  const getCategoryGroup = (prod) => {
    if (!prod) return 'other';
    if (isAccessoryProduct(prod)) return 'accessories';

    const catObj = prod.category;
    const catId = (catObj && typeof catObj === 'object') ? (catObj._id?.toString() || catObj.id || '') : (typeof catObj === 'string' ? catObj : '');
    const catName = (catObj && typeof catObj === 'object') ? (catObj.name || catObj.title || '').toLowerCase() : (typeof catObj === 'string' ? catObj.toLowerCase() : '');
    const catSlug = (catObj && typeof catObj === 'object') ? (catObj.slug || '').toLowerCase() : '';
    const title = (prod.title || prod.name || '').toLowerCase();

    // 1. Direct Category Name/Slug Match (Mongoose populated category)
    if (catSlug === 'mac' || catSlug === 'laptops-pcs' || catName === 'mac' || catName === 'laptops & pcs') return 'mac';
    if (catSlug === 'iphone' || catSlug === 'smartphones' || catName === 'iphone' || catName === 'smartphones') return 'iphone';
    if (catSlug === 'ipad' || catSlug === 'ipads' || catName === 'ipad' || catName === 'ipads') return 'ipad';
    if (catSlug === 'watch' || catSlug === 'wearables' || catName === 'watch' || catName === 'wearables' || catName.includes('apple watch')) return 'watch';
    if (catSlug === 'airpods' || catSlug === 'premium-audio' || catName === 'airpods' || catName === 'premium-audio') return 'airpods';
    if (catSlug === 'tv-home' || catName.includes('tv') || catName.includes('home')) return 'tv-home';
    if (catSlug === 'accessories' || catName === 'accessories') return 'accessories';

    // 2. Hardware Title Match
    if (title.includes('macbook') || title.includes('mac mini') || title.includes('imac') || title.includes('mac studio') || title.includes('mac pro') || title.startsWith('mac ')) return 'mac';
    if (title.includes('iphone')) return 'iphone';
    if (title.includes('ipad')) return 'ipad';
    if (title.includes('watch')) return 'watch';
    if (title.includes('airpods') || title.includes('airpod')) return 'airpods';
    if (title.includes('homepod') || title.includes('apple tv')) return 'tv-home';

    return catName || 'other';
  };

  const isValidCurrentProduct = currentProduct && 
    (currentProduct._id === id || currentProduct.id === id || currentProduct.slug === id);

  const localProduct = getProductFromStore(id);
  const product = isValidCurrentProduct ? currentProduct : localProduct;

  useEffect(() => {
    const rawTarget = activeImage || (product?.displayImage || product?.images?.[0] || product?.image) || '';
    if (!rawTarget) return;

    let targetSrc = rawTarget.trim();
    if (targetSrc.startsWith('uploads/')) targetSrc = `/${targetSrc}`;

    setProcessedImage(targetSrc);
  }, [activeImage, product]);


  const getColorStr = (c) => (typeof c === 'object' ? (c?.name || c?.value || '') : (c || '')).toString().trim();

  // Helper to extract color-specific images
  const getColorImages = (colorName) => {
    if (!product) return [];
    if (!colorName) return product.images || [];

    const normColor = colorName.toString().trim().toLowerCase();

    // 1. Check variants for matching color (Admin Panel uploaded images)
    if (product.variants && Array.isArray(product.variants)) {
      const colorVariant = product.variants.find(v => {
        const vColorName = getColorStr(v.color).toLowerCase();
        return vColorName === normColor &&
          ((Array.isArray(v.images) && v.images.length > 0) || v.image);
      });
      if (colorVariant) {
        if (Array.isArray(colorVariant.images) && colorVariant.images.length > 0) {
          return colorVariant.images;
        }
        if (colorVariant.image) {
          return [colorVariant.image];
        }
      }
    }

    // 2. Check product.colors array object
    const colorIdx = (product.colors || []).findIndex(c => {
      const name = getColorStr(c);
      return name.toLowerCase() === normColor;
    });

    if (colorIdx !== -1) {
      const colorObj = product.colors[colorIdx];
      if (colorObj && typeof colorObj === 'object') {
        if (Array.isArray(colorObj.images) && colorObj.images.length > 0) {
          return colorObj.images;
        }
        if (colorObj.image) {
          return [colorObj.image];
        }
      } else {
        // Fallback for flat string color arrays
        if (product.images && product.images[colorIdx]) {
          return [product.images[colorIdx]];
        }
      }
    }

    if (normColor.includes('silver') && (product?.name || product?.title || '').toLowerCase().includes('air')) {
      return ['/macbook_category_v3.jpg'];
    }

    return product.images && product.images.length > 0 ? product.images : [];
  };

  // Variant setups
  let rawColors = product?.colors || [];
  if (rawColors.length === 0 && product?.variants && product.variants.length > 0) {
    const uniqueColors = [];
    product.variants.forEach(v => {
      if (v.color && !uniqueColors.some(u => (typeof u === 'object' ? u.name : u).toLowerCase() === v.color.toLowerCase())) {
        uniqueColors.push({ name: v.color, value: v.colorHex, colorHex: v.colorHex });
      }
    });
    rawColors = uniqueColors;
  }

  if (rawColors.length === 0 && ((product?.title || product?.name || id || '').toLowerCase().includes('neo'))) {
    rawColors = ['Silver', 'Blush', 'Citrus', 'Indigo'];
  }

  const colors = rawColors.map(c => {
    const cName = typeof c === 'object' ? c.name : c;
    const cVal = typeof c === 'object'
      ? resolveColorValue(c.colorHex || c.value || c.name)
      : resolveColorValue(c);
    const variantImgs = getColorImages(cName);
    const cImg = typeof c === 'object' ? (c.image || c.images?.[0]) : (variantImgs?.[0] || '');
    return {
      name: cName || 'Default Color',
      value: cVal,
      colorHex: cVal,
      image: cImg,
      images: typeof c === 'object' ? (c.images || (c.image ? [c.image] : [])) : variantImgs
    };
  });


  let storages = [];
  const rawStorages = Array.isArray(product?.storage) ? [...product.storage] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.storage) rawStorages.push(v.storage);
    });
  }
  rawStorages.forEach(st => {
    let trimmed = (st || '').toString().trim();
    if (trimmed) {
      const formatted = trimmed.replace(/^(\d+)\s*(GB|TB|MB)$/i, '$1 $2').toUpperCase();
      const normKey = formatted.replace(/\s+/g, '').toLowerCase();
      if (!storages.some(s => s.replace(/\s+/g, '').toLowerCase() === normKey)) {
        storages.push(formatted);
      }
    }
  });

  if (storages.length === 0 && ((product?.title || product?.name || '').toLowerCase().includes('18 pro'))) {
    storages = ['256 GB', '512 GB', '1 TB', '2 TB'];
  }

  let rams = [];
  const rawRams = Array.isArray(product?.ram) ? [...product.ram] : (Array.isArray(product?.rams) ? [...product.rams] : []);
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.ram) rawRams.push(v.ram);
    });
  }
  rawRams.forEach(r => {
    const trimmed = (r || '').toString().trim();
    if (trimmed && !rams.some(rm => rm.toLowerCase() === trimmed.toLowerCase())) {
      rams.push(trimmed);
    }
  });

  let chipRamLabel = '';
  if (rams.length === 0) {
    const titleUpper = (product?.title || product?.name || '').toUpperCase();
    if (titleUpper.includes('M5-MAX') || titleUpper.includes('M5 MAX')) {
      chipRamLabel = 'M5-MAX';
    } else if (titleUpper.includes('M6')) {
      chipRamLabel = 'M6-CHIP';
    } else if (titleUpper.includes('M5')) {
      chipRamLabel = 'M5-CHIP';
    } else if (titleUpper.includes('M4')) {
      chipRamLabel = 'M4-CHIP';
    } else if (titleUpper.includes('M3')) {
      chipRamLabel = 'M3-CHIP';
    } else if (titleUpper.includes('M2')) {
      chipRamLabel = 'M2-CHIP';
    } else if (titleUpper.includes('MAC') || titleUpper.includes('PC')) {
      chipRamLabel = 'STANDARD';
    }
  }

  let glasses = Array.isArray(product?.glasses) ? [...product.glasses] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.glass) {
        const trimmedGl = v.glass.toString().trim();
        if (trimmedGl && !glasses.some(g => g.toLowerCase() === trimmedGl.toLowerCase())) {
          glasses.push(trimmedGl);
        }
      }
    });
  }

  let connectivities = Array.isArray(product?.connectivities) ? [...product.connectivities] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      const connVal = v.connectivity || (v.displayTitle?.includes('Cellular') || v.title?.includes('Cellular') ? 'GPS + Cellular' : (v.displayTitle?.includes('GPS') || v.title?.includes('GPS') ? 'GPS' : ''));
      if (connVal) {
        const trimmedConn = connVal.toString().trim();
        if (trimmedConn && !connectivities.some(c => c.toLowerCase() === trimmedConn.toLowerCase())) {
          connectivities.push(trimmedConn);
        }
      }
    });
  }

  const KNOWN_STRAP_VALUES = [
    's/m', 'm/l', 'small', 'medium', 'large', 'loop', 'solo loop', 'braided solo loop',
    'sport band', 'sport loop', 'single tour', 'double tour', 'trail loop', 'alpine loop',
    'ocean band', 'link bracelet', 'milanese loop', 'modern buckle'
  ];

  const currentCatGroup = getCategoryGroup(product);
  const currentCatSlug = (product?.category?.slug || product?.category?.name || product?.category || '').toString().toLowerCase();
  const currentProdTitle = (product?.title || product?.name || '').toString().toLowerCase();
  const isWatchOrBand = currentCatGroup === 'watch' ||
    currentCatSlug.includes('watch') ||
    currentCatSlug.includes('wearable') ||
    isAccessoryProduct(product) ||
    product?.isWatchBand === true ||
    (Array.isArray(product?.strapSizes) && product.strapSizes.length > 0) ||
    /\b(watch\s*band|sport\s*band|ocean\s*band|milanese|sport\s*loop|solo\s*loop|alpine\s*loop|trail\s*loop|braided\s*solo|link\s*bracelet|modern\s*buckle|watch\s*strap)\b/i.test(currentProdTitle) ||
    /(\bband\b|\bloop\b|\bstrap\b)/i.test(currentProdTitle);

  // 1. Case Sizes extraction (e.g. 40mm, 42mm, 44mm, 46mm, 49mm)
  let caseSizes = [];
  const rawCaseSizes = [
    ...(Array.isArray(product?.caseSizes) ? product.caseSizes : []),
    ...(Array.isArray(product?.bandSizes) ? product.bandSizes : []),
    ...(Array.isArray(product?.sizes) ? product.sizes : [])
  ];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.caseSize) rawCaseSizes.push(v.caseSize);
      if (v.bandSize) rawCaseSizes.push(v.bandSize);
      if (v.size && (/mm$/i.test(v.size.trim()) || isWatchOrBand)) {
        rawCaseSizes.push(v.size);
      }
    });
  }
  rawCaseSizes.forEach(cs => {
    const trimmed = (cs || '').toString().trim();
    if (!trimmed || trimmed === 'None' || trimmed === 'Not Applicable') return;
    if (KNOWN_STRAP_VALUES.includes(trimmed.toLowerCase())) return;
    if (isWatchOrBand && !/mm$/i.test(trimmed) && !/^\d+$/.test(trimmed)) return;
    if (!caseSizes.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      caseSizes.push(trimmed);
    }
  });

  // 2. Strap Sizes extraction (e.g. S/M, M/L, Loop, Small, Medium, Large)
  let strapSizes = [];
  const rawStrapSizes = [
    ...(Array.isArray(product?.strapSizes) ? product.strapSizes : []),
    ...(Array.isArray(product?.accessoriesSizes) ? product.accessoriesSizes : [])
  ];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.strapSize && v.strapSize !== 'None' && v.strapSize !== 'Not Applicable') {
        rawStrapSizes.push(v.strapSize);
      }
      if (v.accessoriesSize && v.accessoriesSize !== 'None' && v.accessoriesSize !== 'Not Applicable') {
        rawStrapSizes.push(v.accessoriesSize);
      }
      if (v.size && KNOWN_STRAP_VALUES.includes(v.size.trim().toLowerCase())) {
        rawStrapSizes.push(v.size);
      }
    });
  }
  rawStrapSizes.forEach(st => {
    const trimmed = (st || '').toString().trim();
    if (!trimmed || trimmed === 'None' || trimmed === 'Not Applicable') return;
    if (/^\d+\s*mm$/i.test(trimmed)) return;
    if (!strapSizes.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      strapSizes.push(trimmed);
    }
  });
  let accessoriesSizes = strapSizes;

  // 3. General sizes (e.g. 14-inch, 16-inch for MacBook, iPad, etc.)
  let generalSizes = [];
  const rawGenSizes = Array.isArray(product?.sizes) ? [...product.sizes] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.size) rawGenSizes.push(v.size);
    });
  }
  rawGenSizes.forEach(sz => {
    const trimmed = (sz || '').toString().trim();
    if (!trimmed || trimmed === 'None' || trimmed === 'Not Applicable') return;
    if (KNOWN_STRAP_VALUES.includes(trimmed.toLowerCase())) return;
    if (strapSizes.some(st => st.toLowerCase() === trimmed.toLowerCase())) return;
    if (caseSizes.some(cs => cs.toLowerCase() === trimmed.toLowerCase())) return;
    if (/^\d+\s*mm$/i.test(trimmed)) return;
    if (!generalSizes.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
      generalSizes.push(trimmed);
    }
  });

  let sizes = isWatchOrBand ? caseSizes : generalSizes;
  let bandSizes = caseSizes;

  const activeColorName = selectedColor?.name || (colors[0]?.name || '');
  const rawGalleryImages = getColorImages(activeColorName);
  let galleryImages = [];
  rawGalleryImages.forEach(img => {
    if (img && !galleryImages.includes(img)) {
      galleryImages.push(img);
    }
  });
  if (galleryImages.length > 5) {
    galleryImages = galleryImages.slice(0, 5);
  }

  const getCategoryLink = () => {
    const category = (product?.category?.name || product?.category || '').toString().toLowerCase();
    if (category.includes('iphone') || category.includes('smartphone')) return '/iphone';
    if (category.includes('mac') || category.includes('laptop')) return '/macbook';
    if (category.includes('ipad')) return '/ipad';
    if (category.includes('watch')) return '/watch';
    if (category.includes('airpod')) return '/airpods';
    if (category.includes('tv') || category.includes('home')) return '/tv-home';
    if (category.includes('accessory') || category.includes('accessories')) return '/accessories';
    return '/shop';
  };

  const getCategoryName = () => {
    return product?.category?.name || product?.category || 'iPhone';
  };

  // Determine active configurations and initial active image in a single consolidated pass
  useEffect(() => {
    if (product) {
      const skuQuery = searchParams.get('sku') || searchParams.get('variant') || searchParams.get('q');
      let matchedVar = null;

      if (skuQuery && Array.isArray(product.variants) && product.variants.length > 0) {
        const qClean = skuQuery.trim().toLowerCase();
        matchedVar = product.variants.find(v => {
          if (!v) return false;
          const vSku = (v.sku || '').trim().toLowerCase();
          const vPartNumber = (v.partNumber || '').trim().toLowerCase();
          const vModelNumber = (v.modelNumber || '').trim().toLowerCase();
          return vSku === qClean || vPartNumber === qClean || vModelNumber === qClean || (vSku && vSku.includes(qClean)) || (vPartNumber && vPartNumber.includes(qClean));
        });
      }

      if (matchedVar) {
        if (matchedVar.color && colors.length > 0) {
          const matchC = colors.find(c => (c.name || '').toLowerCase() === (matchedVar.color || '').toLowerCase());
          setSelectedColor(matchC || colors[0]);
        } else if (colors.length > 0) {
          setSelectedColor(colors[0]);
        }

        if (matchedVar.size) setSelectedSize(matchedVar.size);
        else if (sizes.length > 0) setSelectedSize(sizes[0]);

        if (matchedVar.storage) setSelectedStorage(matchedVar.storage);
        else if (storages.length > 0) setSelectedStorage(storages[0]);

        if (matchedVar.ram) setSelectedRam(matchedVar.ram);
        else if (rams.length > 0) setSelectedRam(rams[0]);

        if (matchedVar.glass) setSelectedGlass(matchedVar.glass);
        else if (glasses.length > 0) setSelectedGlass(glasses[0]);

        if (matchedVar.connectivity) setSelectedConnectivity(matchedVar.connectivity);
        else if (connectivities.length > 0) setSelectedConnectivity(connectivities[0]);

        if (matchedVar.caseSize) {
          setSelectedCaseSize(matchedVar.caseSize);
          setSelectedBandSize(matchedVar.caseSize);
          setSelectedSize(matchedVar.caseSize);
        } else if (matchedVar.bandSize) {
          setSelectedCaseSize(matchedVar.bandSize);
          setSelectedBandSize(matchedVar.bandSize);
          setSelectedSize(matchedVar.bandSize);
        } else if (matchedVar.size && /mm$/i.test(matchedVar.size)) {
          setSelectedCaseSize(matchedVar.size);
          setSelectedBandSize(matchedVar.size);
          setSelectedSize(matchedVar.size);
        } else if (caseSizes.length > 0) {
          setSelectedCaseSize(caseSizes[0]);
          setSelectedBandSize(caseSizes[0]);
          setSelectedSize(caseSizes[0]);
        } else {
          setSelectedCaseSize('');
          setSelectedBandSize('');
        }

        if (matchedVar.strapSize) {
          setSelectedStrapSize(matchedVar.strapSize);
          setSelectedAccessoriesSize(matchedVar.strapSize);
        } else if (matchedVar.accessoriesSize && matchedVar.accessoriesSize !== 'None') {
          setSelectedStrapSize(matchedVar.accessoriesSize);
          setSelectedAccessoriesSize(matchedVar.accessoriesSize);
        } else if (matchedVar.size && KNOWN_STRAP_VALUES.includes(matchedVar.size.trim().toLowerCase())) {
          setSelectedStrapSize(matchedVar.size);
          setSelectedAccessoriesSize(matchedVar.size);
        } else if (strapSizes.length > 0) {
          setSelectedStrapSize(strapSizes[0]);
          setSelectedAccessoriesSize(strapSizes[0]);
        } else {
          setSelectedStrapSize('');
          setSelectedAccessoriesSize('');
        }

        const varImg = matchedVar.images?.[0] || matchedVar.image;
        if (varImg) {
          setActiveImage(varImg);
        } else {
          const activeColorName = matchedVar.color || (colors[0]?.name || '');
          const imgs = getColorImages(activeColorName);
          if (imgs && imgs.length > 0) setActiveImage(imgs[0]);
          else setActiveImage(product.displayImage || product.image || (product.images?.[0] || ''));
        }
      } else {
        const initialColor = colors.length > 0 ? colors[0] : null;
        setSelectedColor(initialColor);
        setSelectedCaseSize(caseSizes.length > 0 ? caseSizes[0] : '');
        setSelectedBandSize(caseSizes.length > 0 ? caseSizes[0] : '');
        setSelectedStrapSize(strapSizes.length > 0 ? strapSizes[0] : '');
        setSelectedAccessoriesSize(strapSizes.length > 0 ? strapSizes[0] : '');
        setSelectedSize(generalSizes.length > 0 ? generalSizes[0] : (caseSizes.length > 0 ? caseSizes[0] : ''));
        setSelectedStorage(storages.length > 0 ? storages[0] : '');
        setSelectedRam(rams.length > 0 ? rams[0] : '');
        setSelectedGlass(glasses.length > 0 ? glasses[0] : '');
        setSelectedConnectivity(connectivities.length > 0 ? connectivities[0] : '');

        const activeColorName = initialColor?.name || '';
        const imgs = getColorImages(activeColorName);
        if (imgs && imgs.length > 0) {
          setActiveImage(imgs[0]);
        } else if (product.images && product.images.length > 0) {
          setActiveImage(product.images[0]);
        } else if (product.image) {
          setActiveImage(product.image);
        } else {
          setActiveImage('');
        }
      }
    }
  }, [product?._id || product?.id, searchParams]);

  // Update active image when user explicitly selects a color
  useEffect(() => {
    if (product && selectedColor) {
      const imgs = getColorImages(selectedColor.name);
      if (imgs && imgs.length > 0) {
        setActiveImage(imgs[0]);
      }
    }
  }, [selectedColor]);

  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj);
  };

  const handleRamSelect = (ramVal) => {
    setSelectedRam(ramVal);
    // Find compatible storage for this RAM & active color
    if (product && product.variants && product.variants.length > 0) {
      const activeColorStr = (selectedColor?.name || colors[0]?.name || '').toString().toLowerCase();
      const normRam = ramVal.toString().toLowerCase();

      // Check if current selectedStorage works with this RAM
      const currentCompatible = product.variants.find(v => 
        (v.color || '').toString().toLowerCase() === activeColorStr &&
        (v.ram || '').toString().toLowerCase() === normRam &&
        (v.storage || '').toString().toLowerCase() === (selectedStorage || '').toString().toLowerCase()
      );

      if (!currentCompatible) {
        // Find any storage that works with this RAM
        const match = product.variants.find(v => 
          (v.ram || '').toString().toLowerCase() === normRam && v.storage
        );
        if (match && match.storage) {
          setSelectedStorage(match.storage);
        }
      }
    }
  };

  const handleGlassSelect = (glassVal) => {
    setSelectedGlass(glassVal);
    setSelectedConnectivity(glassVal);
    // Find compatible storage for this Glass & active color
    if (product && product.variants && product.variants.length > 0) {
      const activeColorStr = (selectedColor?.name || colors[0]?.name || '').toString().toLowerCase();
      const normGlass = glassVal.toString().toLowerCase();

      // Check if current selectedStorage works with this Glass/Connectivity
      const currentCompatible = product.variants.find(v => 
        (v.color || '').toString().toLowerCase() === activeColorStr &&
        ((v.glass || '').toString().toLowerCase() === normGlass || (v.connectivity || '').toString().toLowerCase() === normGlass) &&
        (v.storage || '').toString().toLowerCase() === (selectedStorage || '').toString().toLowerCase()
      );

      if (!currentCompatible) {
        // Find first storage that works with this glass finish
        const match = product.variants.find(v => 
          ((v.glass || '').toString().toLowerCase() === normGlass || (v.connectivity || '').toString().toLowerCase() === normGlass) && v.storage
        );
        if (match && match.storage) {
          setSelectedStorage(match.storage);
        }
      }
    }
  };

  const handleStorageSelect = (storageVal) => {
    setSelectedStorage(storageVal);
    // Find compatible RAM & Glass for this storage & active color
    if (product && product.variants && product.variants.length > 0) {
      const activeColorStr = (selectedColor?.name || colors[0]?.name || '').toString().toLowerCase();
      const normStorage = storageVal.toString().toLowerCase();

      // Check if current selectedGlass works with this storage
      const currentCompatibleGlass = product.variants.find(v => 
        (v.color || '').toString().toLowerCase() === activeColorStr &&
        (v.storage || '').toString().toLowerCase() === normStorage &&
        ((v.glass || '').toString().toLowerCase() === (selectedGlass || '').toString().toLowerCase() ||
         (v.connectivity || '').toString().toLowerCase() === (selectedGlass || '').toString().toLowerCase())
      );

      if (!currentCompatibleGlass) {
        const matchGlass = product.variants.find(v => 
          (v.storage || '').toString().toLowerCase() === normStorage && (v.glass || v.connectivity)
        );
        if (matchGlass) {
          const matchedVal = matchGlass.glass || matchGlass.connectivity;
          setSelectedGlass(matchedVal);
          setSelectedConnectivity(matchedVal);
        }
      }

      // Check if current selectedRam works with this storage
      const currentCompatibleRam = product.variants.find(v => 
        (v.color || '').toString().toLowerCase() === activeColorStr &&
        (v.storage || '').toString().toLowerCase() === normStorage &&
        (v.ram || '').toString().toLowerCase() === (selectedRam || '').toString().toLowerCase()
      );

      if (!currentCompatibleRam) {
        const matchRam = product.variants.find(v => 
          (v.storage || '').toString().toLowerCase() === normStorage && v.ram
        );
        if (matchRam && matchRam.ram) {
          setSelectedRam(matchRam.ram);
        }
      }
    }
  };

  const cleanProductTitle = (rawTitle) => {
    if (!rawTitle) return '';
    return rawTitle.replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();
  };

  const getProcessorSpec = () => {
    // 1. Admin panel active variant level processor field
    const activeVar = getActiveVariant();
    if (activeVar && (activeVar.processor || activeVar.chip)) {
      return activeVar.processor || activeVar.chip;
    }

    // 2. Admin panel top-level product.processors array
    if (product && product.processors && Array.isArray(product.processors) && product.processors.length > 0) {
      const normRam = (selectedRam || '').toString().toLowerCase();
      const normStorage = (selectedStorage || '').toString().toLowerCase();

      const matched = product.processors.find(p => {
        const pNorm = p.toLowerCase();
        return (normRam && pNorm.includes(normRam)) || (normStorage && pNorm.includes(normStorage));
      });

      if (matched) return matched;
      return product.processors[0];
    }

    // 3. Dynamic default fallback
    const pTitle = (product?.name || product?.title || '').toLowerCase();
    const rStr = (selectedRam || '').toString().toLowerCase();
    const sStr = (selectedStorage || '').toString().toLowerCase();

    const is16 = rStr.includes('16');
    const is24 = rStr.includes('24');
    const is512 = sStr.includes('512');
    const is1TB = sStr.includes('1tb') || sStr.includes('1024') || sStr.includes('1 tb');

    if (pTitle.includes('imac') || pTitle.includes('24-inch')) {
      if (is24 || is1TB || (is16 && is512)) {
        return 'Apple M4 chip with 10‑core CPU and 10‑core GPU';
      }
      return 'Apple M4 chip with 8‑core CPU and 8‑core GPU';
    }

    if (is24 && is1TB) {
      return 'Apple M4 chip with 10‑core CPU and 10‑core GPU';
    }

    if (is16 && is1TB) {
      return 'Apple M4 chip with 10‑core CPU and 10‑core GPU';
    }

    if (is16 && is512) {
      return 'Apple M4 chip with 10‑core CPU and 10‑core GPU';
    }

    if (is24 || is16 || is1TB || sStr.includes('2tb')) {
      return 'Apple M4 chip with 10‑core CPU and 10‑core GPU';
    }

    return 'Apple M4 chip with 8‑core CPU and 8‑core GPU';
  };

  // Helper to extract active variant based on current selectors
  const getActiveVariant = (oColor, oStorage, oRam, oSize, oGlass, oConnectivity, oBandSize, oAccessoriesSize) => {
    if (!product || !product.variants || product.variants.length === 0) return null;

    const targetColorStr = oColor ? (oColor.name || oColor) : (selectedColor?.name || colors[0]?.name || '');
    const targetStorageStr = oStorage !== undefined ? oStorage : selectedStorage;
    const targetRamStr = oRam !== undefined ? oRam : selectedRam;
    const targetSizeStr = oSize !== undefined ? oSize : selectedSize;
    const targetGlassStr = oGlass !== undefined ? oGlass : selectedGlass;
    const targetConnStr = oConnectivity !== undefined ? oConnectivity : selectedConnectivity;
    const targetBandStr = oBandSize !== undefined ? oBandSize : selectedBandSize;
    const targetAccSizeStr = oAccessoriesSize !== undefined ? oAccessoriesSize : selectedAccessoriesSize;

    const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/ssd|ssd storage|storage|\s+/g, '');

    const normColor = norm(targetColorStr);
    const normStorage = norm(targetStorageStr);
    const normRam = norm(targetRamStr);
    const normSize = norm(targetSizeStr);
    const normGlass = norm(targetGlassStr);
    const normConn = norm(targetConnStr);
    const normBand = norm(targetBandStr);
    const normAccSize = norm(targetAccSizeStr);

    let bestMatch = null;
    let maxScore = -10000;

    for (const v of product.variants) {
      const vColor = norm(v.color);
      const vStorage = norm(v.storage);
      const vRam = norm(v.ram);
      const vSize = norm(v.size);
      const vGlass = norm(v.glass);
      const vConnVal = v.connectivity || (v.displayTitle?.includes('Cellular') || v.title?.includes('Cellular') ? 'GPS + Cellular' : (v.displayTitle?.includes('GPS') || v.title?.includes('GPS') ? 'GPS' : ''));
      const vConn = norm(vConnVal);
      const vBand = norm(v.bandSize);
      const vAccSize = norm(v.accessoriesSize);

      let score = 0;

      // Accessories Size matching
      if (normAccSize) {
        if (vAccSize === normAccSize) score += 150;
        else if (vAccSize && vAccSize !== normAccSize && vAccSize !== 'none') score -= 500;
      }

      // Color matching
      if (normColor) {
        if (vColor === normColor) score += 100;
        else if (vColor && vColor !== normColor) score -= 500;
      }

      // Storage matching
      if (normStorage) {
        if (vStorage === normStorage) score += 100;
        else if (vStorage && (vStorage.includes(normStorage) || normStorage.includes(vStorage))) score += 50;
        else if (vStorage && vStorage !== normStorage) score -= 500;
      }

      // Glass & Connectivity matching
      if (normGlass) {
        if (vGlass === normGlass || vConn === normGlass) score += 200;
        else if ((vGlass && vGlass !== normGlass) && (!vConn || vConn !== normGlass)) score -= 500;
      }

      if (normConn) {
        if (vConn === normConn || vGlass === normConn) score += 200;
        else if ((vConn && vConn !== normConn) && (!vGlass || vGlass !== normConn)) score -= 500;
      }

      // Band Size matching
      if (normBand) {
        if (vBand === normBand) score += 150;
        else if (vBand && vBand !== normBand) score -= 500;
      }

      // RAM matching
      if (normRam) {
        if (vRam === normRam) score += 100;
        else if (vRam && (vRam.includes(normRam) || normRam.includes(vRam))) score += 50;
        else if (vRam && vRam !== normRam) score -= 500;
      }

      // Size matching
      if (normSize) {
        if (vSize === normSize) score += 100;
        else if (vSize && vSize !== normSize) score -= 500;
      }

      // Part number presence bonus
      if (v.partNumber && v.partNumber.trim()) {
        score += 20;
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = v;
      }
    }

    return bestMatch || product.variants[0];
  };

  // Helper to dynamically match variant pricing info based on current selectors
  const getVariantPricingInfo = (oColor, oSize, oStorage, oRam, oGlass, oConnectivity) => {
    if (!product) return { sellingPrice: 0, originalMrp: 0, youSave: 0, savePercent: 0 };

    const matchedVar = getActiveVariant(oColor, oStorage, oRam, oGlass, oConnectivity);

    // 1. Gather price and discount fields from matched variant
    const vPrice = matchedVar && Number(matchedVar.price) > 0 ? Number(matchedVar.price) : 0;
    const vDiscPrice = matchedVar && Number(matchedVar.discountPrice) > 0 ? Number(matchedVar.discountPrice) : 0;
    const vDiscPercent = matchedVar && Number(matchedVar.discountPercent ?? matchedVar.discount ?? 0) > 0
      ? Number(matchedVar.discountPercent ?? matchedVar.discount)
      : 0;
    const vMrp = matchedVar && Number(matchedVar.mrp || matchedVar.originalPrice) > 0 ? Number(matchedVar.mrp || matchedVar.originalPrice) : 0;

    // 2. Fall back to parent product fields if variant lacks explicit pricing
    const pPrice = Number(product.price || 0);
    const pDiscPrice = Number(product.discountPrice || 0);
    const pDiscPercent = Number(product.discountPercent ?? product.discount ?? 0);
    const pMrp = Number(product.mrp || product.originalPrice || 0);

    // Base MRP is the starting price (vMrp || vPrice || pMrp || pPrice)
    const baseMrp = vMrp > 0 ? vMrp : (vPrice > 0 ? vPrice : (pMrp > 0 ? pMrp : pPrice));

    // Effective discount values
    const discPercent = vDiscPercent > 0 ? vDiscPercent : pDiscPercent;
    const discPrice = vDiscPrice > 0 ? vDiscPrice : pDiscPrice;

    if (baseMrp <= 0) {
      return { sellingPrice: 0, originalMrp: 0, youSave: 0, savePercent: 0 };
    }

    let sellingPrice = baseMrp;
    let originalMrp = 0;
    let computedPercent = 0;

    // Calculate selling price and original MRP based on configured discount
    if (discPrice > 0 && discPrice < baseMrp) {
      originalMrp = baseMrp;
      sellingPrice = discPrice;
      computedPercent = discPercent > 0
        ? Math.round(discPercent)
        : Math.round(((baseMrp - discPrice) / baseMrp) * 100);
    } else if (discPercent > 0 && discPercent <= 99) {
      originalMrp = baseMrp;
      sellingPrice = Math.round(baseMrp - (baseMrp * discPercent / 100));
      computedPercent = Math.round(discPercent);
    } else if (vMrp > vPrice && vPrice > 0) {
      originalMrp = vMrp;
      sellingPrice = vPrice;
      computedPercent = Math.round(((vMrp - vPrice) / vMrp) * 100);
    } else if (pMrp > pPrice && pPrice > 0) {
      originalMrp = pMrp;
      sellingPrice = pPrice;
      computedPercent = Math.round(((pMrp - pPrice) / pMrp) * 100);
    }

    if (originalMrp <= sellingPrice) {
      originalMrp = 0;
      computedPercent = 0;
    }

    const youSave = originalMrp > sellingPrice ? originalMrp - sellingPrice : 0;

    return {
      sellingPrice,
      originalMrp,
      youSave,
      savePercent: computedPercent
    };
  };

  const getVariantPrice = (oColor, oSize, oStorage, oRam, oGlass, oConnectivity) => {
    return getVariantPricingInfo(oColor, oSize, oStorage, oRam, oGlass, oConnectivity).sellingPrice;
  };

  const getAppleCareInfo = () => {
    const fallbackIneligible = {
      isEligible: false,
      title: 'Add AppleCare+',
      monthlyText: '',
      mrpText: '',
      features: [],
      price: 0,
      friendlyCatName: 'Mac'
    };

    if (!product) return fallbackIneligible;
    if (productAppleCare?.isEnabled === false) return fallbackIneligible;

    const rawTitle = (product?.title || product?.name || '').trim();
    const lowerTitle = rawTitle.toLowerCase();
    const catGroup = getCategoryGroup(product);

    // Strictly exclude all accessories
    const isAccessory = isAccessoryProduct(product) || catGroup === 'accessories';
    if (isAccessory) return fallbackIneligible;

    const friendlyCatName = catGroup === 'iphone' ? 'iPhone'
      : catGroup === 'ipad' ? 'iPad'
      : catGroup === 'watch' ? 'Apple Watch'
      : catGroup === 'airpods' ? 'AirPods'
      : catGroup === 'tv-home' ? 'Apple TV & HomePod'
      : 'Mac';

    const tableKey = (catGroup === 'laptops-pcs' || catGroup === 'other') ? 'mac' : catGroup;
    const catTable = (appleCarePricingTables || []).find(t => t.categoryKey === tableKey || t.categoryKey === catGroup);
    const activeRows = (catTable?.rows || []).filter(r => r.isActive !== false);

    let matchedCare = null;

    if (activeRows.length > 0) {
      if (catGroup === 'mac' || tableKey === 'mac') {
        if (lowerTitle.includes('neo')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('neo'));
        } else if (lowerTitle.includes('proled') || lowerTitle.includes('pro led')) {
          if (lowerTitle.includes('16')) {
            matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('16') && (r.model || '').toLowerCase().includes('proled'));
          } else {
            matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('14') && (r.model || '').toLowerCase().includes('proled'));
          }
        } else if (lowerTitle.includes('m6') && lowerTitle.includes('imac')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('imac') && (r.model || '').toLowerCase().includes('m6'));
        } else if (lowerTitle.includes('m6') && (lowerTitle.includes('14') || lowerTitle.includes('pro'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('m6') && (r.model || '').toLowerCase().includes('14'));
        } else if (lowerTitle.includes('air 13') || (lowerTitle.includes('air') && lowerTitle.includes('13'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('air 13') || (r.model || '').toLowerCase().includes('13-inch'));
        } else if (lowerTitle.includes('air 15') || (lowerTitle.includes('air') && lowerTitle.includes('15'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('air 15') || (r.model || '').toLowerCase().includes('15-inch'));
        } else if (lowerTitle.includes('pro 14') || (lowerTitle.includes('pro') && lowerTitle.includes('14'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro 14') || (r.model || '').toLowerCase().includes('14-inch'));
        } else if (lowerTitle.includes('pro 16') || (lowerTitle.includes('pro') && lowerTitle.includes('16'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro 16') || (r.model || '').toLowerCase().includes('16-inch'));
        } else if (lowerTitle.includes('mini')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('mini'));
        } else if (lowerTitle.includes('display xdr') || lowerTitle.includes('studio display xdr')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('display xdr'));
        } else if (lowerTitle.includes('studio display')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('apple studio display') || ((r.model || '').toLowerCase().includes('studio display') && !(r.model || '').toLowerCase().includes('xdr')));
        } else if (lowerTitle.includes('studio') && !lowerTitle.includes('display')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('mac studio') || ((r.model || '').toLowerCase().includes('studio') && !(r.model || '').toLowerCase().includes('display')));
        } else if (lowerTitle.includes('imac')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('imac'));
        }
      } else if (catGroup === 'iphone') {
        if (lowerTitle.includes('18 pro max')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('18 pro max'));
        } else if (lowerTitle.includes('duo')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('duo'));
        } else if (lowerTitle.includes('17 pro max') || lowerTitle.includes('16 pro max')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro max')) || activeRows[0];
        } else if (lowerTitle.includes('17 pro') || lowerTitle.includes('16 pro')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro') && !(r.model || '').toLowerCase().includes('max')) || activeRows[0];
        } else if (lowerTitle.includes('17e')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('17e'));
        } else if (lowerTitle.includes('17')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase() === 'iphone 17');
        } else if (lowerTitle.includes('16')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('16'));
        } else {
          matchedCare = activeRows.find(r => lowerTitle.includes((r.model || '').toLowerCase()) || (r.model || '').toLowerCase().includes(lowerTitle)) || activeRows[0];
        }
      } else if (catGroup === 'ipad') {
        if (lowerTitle.includes('13') && (lowerTitle.includes('pro') || lowerTitle.includes('m5'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro 13') || (r.model || '').toLowerCase().includes('pro 13″'));
        } else if (lowerTitle.includes('11') && (lowerTitle.includes('pro') || lowerTitle.includes('m5'))) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro 11') || (r.model || '').toLowerCase().includes('pro 11″'));
        } else if (lowerTitle.includes('13') && lowerTitle.includes('air')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('air 13') || (r.model || '').toLowerCase().includes('air 13″'));
        } else if (lowerTitle.includes('11') && lowerTitle.includes('air')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('air 11') || (r.model || '').toLowerCase().includes('air 11″'));
        } else if (lowerTitle.includes('mini')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('mini'));
        } else if (!lowerTitle.includes('pro') && !lowerTitle.includes('air')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('a16') || (r.model || '').toLowerCase().includes('pad ('));
        } else {
          matchedCare = activeRows.find(r => lowerTitle.includes((r.model || '').toLowerCase()) || (r.model || '').toLowerCase().includes(lowerTitle)) || activeRows[0];
        }
      } else if (catGroup === 'watch') {
        if (lowerTitle.includes('ultra')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('ultra'));
        } else if (lowerTitle.includes('series')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('series'));
        } else if (/\bse\b/i.test(lowerTitle)) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('se'));
        } else {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('series')) || activeRows[0];
        }
      } else if (catGroup === 'airpods') {
        if (lowerTitle.includes('max')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('max'));
        } else if (lowerTitle.includes('pro')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('pro'));
        } else {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('airpods 5') || (r.model || '').toLowerCase().includes('airpods')) || activeRows[0];
        }
      } else if (catGroup === 'tv-home') {
        if (lowerTitle.includes('mini')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('mini'));
        } else if (lowerTitle.includes('homepod')) {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase() === 'homepod') || activeRows.find(r => (r.model || '').toLowerCase().includes('homepod'));
        } else {
          matchedCare = activeRows.find(r => (r.model || '').toLowerCase().includes('tv')) || activeRows[0];
        }
      }

      if (!matchedCare && activeRows.length > 0) {
        matchedCare = activeRows[0];
      }
    }

    const MAC_CARE_FALLBACKS = {
      'mac-mini': {
        model: 'Mac Mini (M4)',
        title: 'AppleCare+ for Mac mini (M4)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SR1C2HN/A',
        mrp: '₹12900',
        discount: '24',
        salePrice: '₹9,804',
        yearly: '₹9,804',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/mac_mini.png',
        isActive: true
      },
      'neo': {
        model: 'MacBook Neo',
        title: 'AppleCare+ for MacBook Neo',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SCNA2HN/A',
        mrp: '₹16,900',
        discount: '24',
        salePrice: '₹12,844',
        yearly: '₹12,844',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/macbook_neo.png',
        isActive: true
      },
      'air-13': {
        model: '13-inch MacBook Air (M5)',
        title: 'AppleCare+ for 13-inch MacBook Air (M5)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SCW83HN/A',
        mrp: '₹22,900',
        discount: '24',
        salePrice: '₹17,404',
        yearly: '₹17,404',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/macbook_air.png',
        isActive: true
      },
      'air-15': {
        model: '15-inch MacBook Air (M5)',
        title: 'AppleCare+ for 15-inch MacBook Air (M5)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SCW93HN/A',
        mrp: '₹24,900',
        discount: '24',
        salePrice: '₹18,924',
        yearly: '₹18,924',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/macbook_air.png',
        isActive: true
      },
      'proled-14': {
        model: '14-inch MacBook Pro with Pro Display XDR',
        title: 'AppleCare+ for 14-inch MacBook Pro with Pro Display XDR',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SGLX3HN/A',
        mrp: '₹49,900',
        discount: '24',
        salePrice: '₹37,924',
        yearly: '₹37,924',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/uploads/upload_1794389737801_347.png',
        isActive: true
      },
      'pro-m6-14': {
        model: '14-inch MacBook Pro (M6)',
        title: 'AppleCare+ for 14-inch MacBook Pro (M6)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SGKE3HN/A',
        mrp: '₹36,900',
        discount: '24',
        salePrice: '₹28,044',
        yearly: '₹28,044',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/uploads/upload_1794389501804_119.png',
        isActive: true
      },
      'pro-14': {
        model: '14-inch MacBook Pro (M5)',
        title: 'AppleCare+ for 14-inch MacBook Pro (M5)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SCXT3HN/A',
        mrp: '₹43,900',
        discount: '24',
        salePrice: '₹33,364',
        yearly: '₹33,364',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/macbook_pro.png',
        isActive: true
      },
      'imac-m4': {
        model: '24-inch iMac (M4)',
        title: 'AppleCare+ for iMac (M4)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SR1A2HN/A',
        mrp: '₹19,900',
        discount: '24',
        salePrice: '₹15,124',
        yearly: '₹15,124',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/mac_nav/imac.png',
        isActive: true
      },
      'imac-m6': {
        model: '24-inch iMac (M6)',
        title: 'AppleCare+ for iMac (M6)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SGHV3HN/A',
        mrp: '₹22,900',
        discount: '10% OFF',
        salePrice: '₹20,610',
        yearly: '₹20,610',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/uploads/upload_1794395236299_673.png',
        isActive: true
      },
      'studio-display-xdr': {
        model: 'Studio Display XDR',
        title: 'AppleCare+ for Studio Display XDR',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SD263HN/A',
        mrp: '₹29,900',
        discount: '24',
        salePrice: '₹22,724',
        yearly: '₹22,724',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/uploads/upload_1790049556385_582.jpeg',
        isActive: true
      },
      'studio-display': {
        model: 'Studio Display',
        title: 'AppleCare+ for Apple Studio Display',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'SD273HN/A',
        mrp: '₹14,900',
        discount: '24',
        salePrice: '₹11,324',
        yearly: '₹11,324',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        image: '/uploads/upload_1790049450284_756.jpeg',
        isActive: true
      },
      'mac-studio': {
        model: 'Mac Studio (M4 Max/M3 Ultra)',
        title: 'AppleCare+ for Mac Studio (M4 Max/M3 Ultra)',
        description: 'Enjoy 3 years of peace of mind when you buy AppleCare+ for Mac',
        sku: 'STKT2HN/A',
        mrp: '₹19,900',
        discount: '24',
        salePrice: '₹15,124',
        yearly: '₹15,124',
        planType: 'APPLE CARE+',
        duration: '3 Years',
        badgeText: 'AppleCare+ (3 Years)',
        image: '/mac_nav/mac_studio.png',
        isActive: true
      }
    };

    const IPHONE_CARE_FALLBACKS = {
      'iphone-18-pro-max': {
        model: 'iPhone 18 Pro Max',
        title: 'AppleCare+ for iPhone 18 Pro Max',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 18 Pro Max.',
        description2yr: '2 Years Apple-certified coverage for iPhone 18 Pro Max.',
        sku: 'SHJ83HN/A',
        sku1yr: 'DHHA2HN/A',
        sku2yr: 'SHJ83HN/A',
        mrp: '₹25,900',
        mrp1yr: '₹12,999',
        mrp2yr: '₹25,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹21,238',
        salePrice1yr: '₹10,659',
        salePrice2yr: '₹21,238',
        duration: '2 Years',
        image: '/uploads/upload_1789401366287_53.png',
        isActive: true
      },
      'iphone-18-pro': {
        model: 'iPhone 18 Pro',
        title: 'AppleCare+ for iPhone 18 Pro',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 18 Pro.',
        description2yr: '2 Years Apple-certified coverage for iPhone 18 Pro.',
        sku: 'SHHL3HN/A',
        sku1yr: 'DHH82HN/A',
        sku2yr: 'SHHL3HN/A',
        mrp: '₹25,900',
        mrp1yr: '₹12,999',
        mrp2yr: '₹25,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹21,238',
        salePrice1yr: '₹10,659',
        salePrice2yr: '₹21,238',
        duration: '2 Years',
        image: '/uploads/upload_1789401429907_843.webp',
        isActive: true
      },
      'iphone-duo': {
        model: 'iPhone Duo',
        title: 'AppleCare+ for iPhone Duo',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone Duo.',
        description2yr: '2 Years Apple-certified coverage for iPhone Duo.',
        sku: 'SHJX3HN/A',
        sku1yr: 'DHHD2HN/A',
        sku2yr: 'SHJX3HN/A',
        mrp: '₹51,900',
        mrp1yr: '₹25,999',
        mrp2yr: '₹51,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹42,558',
        salePrice1yr: '₹21,319',
        salePrice2yr: '₹42,558',
        duration: '2 Years',
        image: '/uploads/upload_1790431187717_101.jpg',
        isActive: true
      },
      'iphone-17-pro-max': {
        model: 'iPhone 17 Pro Max',
        title: 'AppleCare+ for iPhone 17 Pro Max',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 17 Pro Max.',
        description2yr: '2 Years Apple-certified coverage for iPhone 17 Pro Max.',
        sku: 'SWY92HN/A',
        sku1yr: 'DFKC2HN/A',
        sku2yr: 'SWY92HN/A',
        mrp: '₹25,900',
        mrp1yr: '₹12,999',
        mrp2yr: '₹25,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹21,238',
        salePrice1yr: '₹10,659',
        salePrice2yr: '₹21,238',
        duration: '2 Years',
        image: '/uploads/upload_1789231375820_773.webp',
        isActive: true
      },
      'iphone-17-pro': {
        model: 'iPhone 17 Pro',
        title: 'AppleCare+ for iPhone 17 Pro',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 17 Pro.',
        description2yr: '2 Years Apple-certified coverage for iPhone 17 Pro.',
        sku: 'SWY42HN/A',
        sku1yr: 'DFK92HN/A',
        sku2yr: 'SWY42HN/A',
        mrp: '₹25,900',
        mrp1yr: '₹12,999',
        mrp2yr: '₹25,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹21,238',
        salePrice1yr: '₹10,659',
        salePrice2yr: '₹21,238',
        duration: '2 Years',
        image: '/uploads/upload_1789231246638_726.webp',
        isActive: true
      },
      'iphone-17': {
        model: 'iPhone 17',
        title: 'AppleCare+ for iPhone 17',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 17.',
        description2yr: '2 Years Apple-certified coverage for iPhone 17.',
        sku: 'SWXT2HN/A',
        sku1yr: 'DFK72HN/A',
        sku2yr: 'SWXT2HN/A',
        mrp: '₹19,900',
        mrp1yr: '₹9,999',
        mrp2yr: '₹19,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹16,318',
        salePrice1yr: '₹8,199',
        salePrice2yr: '₹16,318',
        duration: '2 Years',
        image: '/uploads/upload_1789230839048_616.jpg',
        isActive: true
      },
      'iphone-17e': {
        model: 'iPhone 17e',
        title: 'AppleCare+ for iPhone 17e',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 17e.',
        description2yr: '2 Years Apple-certified coverage for iPhone 17e.',
        sku: 'SCYW3HN/A',
        sku1yr: 'DGV72HN/A',
        sku2yr: 'SCYW3HN/A',
        mrp: '₹16,900',
        mrp1yr: '₹8,499',
        mrp2yr: '₹16,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹13,858',
        salePrice1yr: '₹6,969',
        salePrice2yr: '₹13,858',
        duration: '2 Years',
        image: '/uploads/upload_1789230677662_90.webp',
        isActive: true
      },
      'iphone-16': {
        model: 'iPhone 16',
        title: 'AppleCare+ for iPhone 16',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for iPhone 16.',
        description2yr: '2 Years Apple-certified coverage for iPhone 16.',
        sku: 'SNHA2HN/A',
        sku1yr: 'DE7G2HN/A',
        sku2yr: 'SNHA2HN/A',
        mrp: '₹19,900',
        mrp1yr: '₹9,999',
        mrp2yr: '₹19,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹16,318',
        salePrice1yr: '₹8,199',
        salePrice2yr: '₹16,318',
        duration: '2 Years',
        image: '/uploads/upload_1789230931152_62.webp',
        isActive: true
      }
    };

    const IPAD_CARE_FALLBACKS = {
      'ipad-pro-13': {
        model: 'iPad Pro 13″',
        title: 'AppleCare+ for iPad Pro 13-inch (M5)',
        description: 'Apple-certified coverage for iPad Pro 13-inch.',
        description1yr: '1 Year Apple-certified coverage for iPad Pro 13-inch (M5).',
        description2yr: '2 Years Apple-certified coverage for iPad Pro 13-inch (M5).',
        sku: 'SXT12HN/A',
        sku1yr: 'DFQL2HN/A',
        sku2yr: 'SXT12HN/A',
        mrp: '₹19,900',
        mrp1yr: '₹9,999',
        mrp2yr: '₹19,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹16,318',
        salePrice1yr: '₹8,199',
        salePrice2yr: '₹16,318',
        duration: '2 Years',
        image: '/ipad_nav/ipad_pro.png',
        isActive: true
      },
      'ipad-pro-11': {
        model: 'iPad Pro 11″',
        title: 'AppleCare+ for iPad Pro 11-inch (M5)',
        description: 'Apple-certified coverage for iPad Pro 11-inch.',
        description1yr: '1 Year Apple-certified coverage for iPad Pro 11-inch (M5).',
        description2yr: '2 Years Apple-certified coverage for iPad Pro 11-inch (M5).',
        sku: 'SXT02HN/A',
        sku1yr: 'DFQK2HN/A',
        sku2yr: 'SXT02HN/A',
        mrp: '₹17,900',
        mrp1yr: '₹8,999',
        mrp2yr: '₹17,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹14,678',
        salePrice1yr: '₹7,379',
        salePrice2yr: '₹14,678',
        duration: '2 Years',
        image: '/ipad_nav/ipad_pro.png',
        isActive: true
      },
      'ipad-air-13': {
        model: 'iPad Air 13″',
        title: 'AppleCare+ for iPad Air 13-inch',
        description: 'Apple-certified coverage for iPad Air 13-inch.',
        description1yr: '1 Year Apple-certified coverage for iPad Air 13-inch.',
        description2yr: '2 Years Apple-certified coverage for iPad Air 13-inch.',
        sku: 'SXT12HN/A',
        sku1yr: 'DFQL2HN/A',
        sku2yr: 'SXT12HN/A',
        mrp: '₹19,900',
        mrp1yr: '₹9,999',
        mrp2yr: '₹19,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹16,318',
        salePrice1yr: '₹8,199',
        salePrice2yr: '₹16,318',
        duration: '2 Years',
        image: '/ipad_nav/ipad_air.png',
        isActive: true
      },
      'ipad-air-11': {
        model: 'iPad Air 11″',
        title: 'AppleCare+ for iPad Air 11-inch',
        description: 'Apple-certified coverage for iPad Air 11-inch.',
        description1yr: '1 Year Apple-certified coverage for iPad Air 11-inch.',
        description2yr: '2 Years Apple-certified coverage for iPad Air 11-inch.',
        sku: 'SXT02HN/A',
        sku1yr: 'DFQK2HN/A',
        sku2yr: 'SXT02HN/A',
        mrp: '₹17,900',
        mrp1yr: '₹8,999',
        mrp2yr: '₹17,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹14,678',
        salePrice1yr: '₹7,379',
        salePrice2yr: '₹14,678',
        duration: '2 Years',
        image: '/uploads/upload_1789399908792_474.webp',
        isActive: true
      },
      'ipad-mini': {
        model: 'iPad mini',
        title: 'AppleCare+ for iPad mini',
        description: 'Apple-certified coverage for iPad mini.',
        description1yr: '1 Year Apple-certified coverage for iPad mini.',
        description2yr: '2 Years Apple-certified coverage for iPad mini.',
        sku: 'SGXF3HN/A',
        sku1yr: 'DHG32HN/A',
        sku2yr: 'SGXF3HN/A',
        mrp: '₹9,900',
        mrp1yr: '₹4,999',
        mrp2yr: '₹9,900',
        discount: '10% OFF',
        discount1yr: '10% OFF',
        discount2yr: '10% OFF',
        salePrice: '₹8,910',
        salePrice1yr: '₹4,499',
        salePrice2yr: '₹8,910',
        duration: '2 Years',
        image: '/uploads/upload_1794395541674_391.png',
        isActive: true
      },
      'ipad-a16': {
        model: 'iPad (A16)',
        title: 'AppleCare+ for iPad (A16)',
        description: 'Apple-certified coverage for iPad.',
        description1yr: '1 Year Apple-certified coverage for iPad.',
        description2yr: '2 Years Apple-certified coverage for iPad.',
        sku: 'SUYD2HN/A',
        sku1yr: 'DEM92HN/A',
        sku2yr: 'SUYD2HN/A',
        mrp: '₹8,900',
        mrp1yr: '₹4,499',
        mrp2yr: '₹8,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹7,298',
        salePrice1yr: '₹3,689',
        salePrice2yr: '₹7,298',
        duration: '2 Years',
        image: '/ipad_nav/ipad.png',
        isActive: true
      }
    };

    const WATCH_CARE_FALLBACKS = {
      'watch-ultra': {
        model: 'Apple Watch Ultra 4',
        title: 'AppleCare+ for Apple Watch Ultra 4',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for Apple Watch Ultra 4.',
        description2yr: '2 Years Apple-certified coverage for Apple Watch Ultra 4.',
        sku: 'SH1E3HN/A',
        sku1yr: 'DHGL2HN/A',
        sku2yr: 'SH1E3HN/A',
        mrp: '₹10,990',
        mrp1yr: '₹5,499',
        mrp2yr: '₹10,990',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹9,012',
        salePrice1yr: '₹4,509',
        salePrice2yr: '₹9,012',
        duration: '2 Years',
        image: '/uploads/upload_1789377193163_963.jpeg',
        isActive: true
      },
      'watch-series': {
        model: 'Apple Watch Series 12',
        title: 'AppleCare+ for Apple Watch Series 12',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for Apple Watch Series 12.',
        description2yr: '2 Years Apple-certified coverage for Apple Watch Series 12.',
        sku: 'SH0G3HN/A',
        sku1yr: 'DHGJ2HN/A',
        sku2yr: 'SH0G3HN/A',
        mrp: '₹8,990',
        mrp1yr: '₹4,499',
        mrp2yr: '₹8,990',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹7,372',
        salePrice1yr: '₹3,689',
        salePrice2yr: '₹7,372',
        duration: '2 Years',
        image: '/uploads/upload_1789377199517_322.jpeg',
        isActive: true
      },
      'watch-se': {
        model: 'Apple Watch SE 3',
        title: 'AppleCare+ for Apple Watch SE',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for Apple Watch SE.',
        description2yr: '2 Years Apple-certified coverage for Apple Watch SE.',
        sku: 'SXHW2HN/A',
        sku1yr: 'DFLL2HN/A',
        sku2yr: 'SXHW2HN/A',
        mrp: '₹5,590',
        mrp1yr: '₹2,799',
        mrp2yr: '₹5,590',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹4,584',
        salePrice1yr: '₹2,295',
        salePrice2yr: '₹4,584',
        duration: '2 Years',
        image: '/uploads/upload_1789377186182_249.jpeg',
        isActive: true
      }
    };

    const AIRPODS_CARE_FALLBACKS = {
      'airpods-max': {
        model: 'AirPods Max 2',
        title: 'AppleCare+ for AirPods Max 2',
        description: 'Apple-certified coverage with battery service.',
        description1yr: '1 Year Apple-certified coverage for AirPods Max 2.',
        description2yr: '2 Years Apple-certified coverage for AirPods Max 2.',
        sku: 'S9086HN/A',
        sku1yr: 'S9086HN/A-1YR',
        sku2yr: 'S9086HN/A',
        mrp: '₹6,890',
        mrp1yr: '₹4,499',
        mrp2yr: '₹6,890',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹5,650',
        salePrice1yr: '₹3,689',
        salePrice2yr: '₹5,650',
        duration: '2 Years',
        image: '/uploads/upload_1789399972058_579.jpeg',
        isActive: true
      },
      'airpods-pro': {
        model: 'AirPods Pro 3',
        title: 'AppleCare+ for AirPods Pro 3',
        description: 'Apple-certified coverage with battery service.',
        description1yr: '1 Year Apple-certified coverage for AirPods Pro 3.',
        description2yr: '2 Years Apple-certified coverage for AirPods Pro 3.',
        sku: 'SYLW2HN/A',
        sku1yr: 'DG7Y2HN/A',
        sku2yr: 'SYLW2HN/A',
        mrp: '₹4,890',
        mrp1yr: '₹2,499',
        mrp2yr: '₹4,890',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹4,010',
        salePrice1yr: '₹2,049',
        salePrice2yr: '₹4,010',
        duration: '2 Years',
        image: '/uploads/upload_1789386462387_751.jpeg',
        isActive: true
      },
      'airpods-std': {
        model: 'AirPods 5',
        title: 'AppleCare+ for AirPods 5',
        description: 'Apple-certified coverage with battery service.',
        description1yr: '1 Year Apple-certified coverage for AirPods 5.',
        description2yr: '2 Years Apple-certified coverage for AirPods 5.',
        sku: 'S9066HN/A',
        sku1yr: 'DE6D2HN/A',
        sku2yr: 'S9066HN/A',
        mrp: '₹3,390',
        mrp1yr: '₹1,799',
        mrp2yr: '₹3,390',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹2,780',
        salePrice1yr: '₹1,475',
        salePrice2yr: '₹2,780',
        duration: '2 Years',
        image: '/uploads/upload_1789366058920_902.jpeg',
        isActive: true
      }
    };

    const TVHOME_CARE_FALLBACKS = {
      'apple-tv': {
        model: 'Apple TV',
        title: 'AppleCare+ for Apple TV',
        description: 'Apple-certified coverage with technical support.',
        description1yr: '1 Year Apple-certified coverage for Apple TV with technical support & hardware service.',
        description2yr: '2 Years Apple-certified coverage for Apple TV with technical support & hardware service.',
        sku: 'S9634HN/A',
        sku1yr: 'S9634HN/A-1YR',
        sku2yr: 'S9634HN/A',
        mrp: '₹2,900',
        mrp1yr: '₹1,499',
        mrp2yr: '₹2,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹2,378',
        salePrice1yr: '₹1,229',
        salePrice2yr: '₹2,378',
        duration: '2 Years',
        image: '/uploads/upload_1789438370600_868.jpeg',
        isActive: true
      },
      'homepod-mini': {
        model: 'HomePod mini',
        title: 'AppleCare+ for HomePod mini',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for HomePod mini with accidental damage protection.',
        description2yr: '2 Years Apple-certified coverage for HomePod mini with accidental damage protection.',
        sku: 'DE6C2HN/A',
        sku1yr: 'DE6C2HN/A-1YR',
        sku2yr: 'DE6C2HN/A',
        mrp: '₹1,990',
        mrp1yr: '₹999',
        mrp2yr: '₹1,990',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹1,600',
        salePrice1yr: '₹819',
        salePrice2yr: '₹1,600',
        duration: '2 Years',
        image: '/uploads/upload_1789438361522_258.jpg',
        isActive: true
      },
      'homepod': {
        model: 'HomePod',
        title: 'AppleCare+ for HomePod',
        description: 'Apple-certified coverage with accidental damage protection.',
        description1yr: '1 Year Apple-certified coverage for HomePod with accidental damage protection.',
        description2yr: '2 Years Apple-certified coverage for HomePod with accidental damage protection.',
        sku: 'S6446HN/A',
        sku1yr: 'S6446HN/A-1YR',
        sku2yr: 'S6446HN/A',
        mrp: '₹3,900',
        mrp1yr: '₹1,999',
        mrp2yr: '₹3,900',
        discount: '18% OFF',
        discount1yr: '18% OFF',
        discount2yr: '18% OFF',
        salePrice: '₹3,198',
        salePrice1yr: '₹1,639',
        salePrice2yr: '₹3,198',
        duration: '2 Years',
        image: '/uploads/upload_1789438355569_951.jpeg',
        isActive: true
      }
    };

    const ALL_CARE_FALLBACKS = {
      ...MAC_CARE_FALLBACKS,
      ...IPHONE_CARE_FALLBACKS,
      ...IPAD_CARE_FALLBACKS,
      ...WATCH_CARE_FALLBACKS,
      ...AIRPODS_CARE_FALLBACKS,
      ...TVHOME_CARE_FALLBACKS
    };

    let fallbackKey = null;
    if (catGroup === 'mac' || tableKey === 'mac') {
      if (lowerTitle.includes('neo')) fallbackKey = 'neo';
      else if (lowerTitle.includes('proled') || lowerTitle.includes('pro display xdr')) fallbackKey = 'proled-14';
      else if (lowerTitle.includes('m6') && lowerTitle.includes('imac')) fallbackKey = 'imac-m6';
      else if (lowerTitle.includes('m6') && (lowerTitle.includes('14') || lowerTitle.includes('pro'))) fallbackKey = 'pro-m6-14';
      else if (lowerTitle.includes('air 13') || (lowerTitle.includes('air') && lowerTitle.includes('13'))) fallbackKey = 'air-13';
      else if (lowerTitle.includes('air 15') || (lowerTitle.includes('air') && lowerTitle.includes('15'))) fallbackKey = 'air-15';
      else if (lowerTitle.includes('pro 14') || (lowerTitle.includes('pro') && lowerTitle.includes('14'))) fallbackKey = 'pro-14';
      else if (lowerTitle.includes('mini')) fallbackKey = 'mac-mini';
      else if (lowerTitle.includes('display xdr') || lowerTitle.includes('studio display xdr')) fallbackKey = 'studio-display-xdr';
      else if (lowerTitle.includes('studio display')) fallbackKey = 'studio-display';
      else if (lowerTitle.includes('studio')) fallbackKey = 'mac-studio';
      else if (lowerTitle.includes('imac')) fallbackKey = 'imac-m4';
    } else if (catGroup === 'iphone') {
      if (lowerTitle.includes('18 pro max')) fallbackKey = 'iphone-18-pro-max';
      else if (lowerTitle.includes('18 pro')) fallbackKey = 'iphone-18-pro';
      else if (lowerTitle.includes('duo')) fallbackKey = 'iphone-duo';
      else if (lowerTitle.includes('17 pro max') || lowerTitle.includes('16 pro max')) fallbackKey = 'iphone-17-pro-max';
      else if (lowerTitle.includes('17 pro') || lowerTitle.includes('16 pro')) fallbackKey = 'iphone-17-pro';
      else if (lowerTitle.includes('17e')) fallbackKey = 'iphone-17e';
      else if (lowerTitle.includes('17')) fallbackKey = 'iphone-17';
      else if (lowerTitle.includes('16')) fallbackKey = 'iphone-16';
      else fallbackKey = 'iphone-17';
    } else if (catGroup === 'ipad') {
      if (lowerTitle.includes('13') && (lowerTitle.includes('pro') || lowerTitle.includes('m5') || lowerTitle.includes('m4'))) fallbackKey = 'ipad-pro-13';
      else if (lowerTitle.includes('11') && (lowerTitle.includes('pro') || lowerTitle.includes('m5') || lowerTitle.includes('m4'))) fallbackKey = 'ipad-pro-11';
      else if (lowerTitle.includes('13') && lowerTitle.includes('air')) fallbackKey = 'ipad-air-13';
      else if (lowerTitle.includes('11') && lowerTitle.includes('air')) fallbackKey = 'ipad-air-11';
      else if (lowerTitle.includes('mini')) fallbackKey = 'ipad-mini';
      else fallbackKey = 'ipad-a16';
    } else if (catGroup === 'watch') {
      if (lowerTitle.includes('ultra')) fallbackKey = 'watch-ultra';
      else if (lowerTitle.includes('series')) fallbackKey = 'watch-series';
      else if (/\bse\b/i.test(lowerTitle)) fallbackKey = 'watch-se';
      else fallbackKey = 'watch-series';
    } else if (catGroup === 'airpods') {
      if (lowerTitle.includes('max')) fallbackKey = 'airpods-max';
      else if (lowerTitle.includes('pro')) fallbackKey = 'airpods-pro';
      else fallbackKey = 'airpods-std';
    } else if (catGroup === 'tv-home') {
      if (lowerTitle.includes('mini')) fallbackKey = 'homepod-mini';
      else if (lowerTitle.includes('homepod')) fallbackKey = 'homepod';
      else fallbackKey = 'apple-tv';
    }

    if (fallbackKey && ALL_CARE_FALLBACKS[fallbackKey]) {
      const fb = ALL_CARE_FALLBACKS[fallbackKey];
      matchedCare = matchedCare
        ? {
            ...fb,
            ...matchedCare,
            title: (matchedCare.title && matchedCare.title !== 'AppleCare+ for New Mac Model') ? matchedCare.title : fb.title,
            sku: matchedCare.sku || fb.sku,
            sku1yr: matchedCare.sku1yr || fb.sku1yr,
            sku2yr: matchedCare.sku2yr || fb.sku2yr,
            model: fb.model || matchedCare.model,
            description: matchedCare.description || fb.description,
            description1yr: matchedCare.description1yr || fb.description1yr,
            description2yr: matchedCare.description2yr || fb.description2yr,
            mrp: matchedCare.mrp ? String(matchedCare.mrp).replace(/^₹+/, '₹') : fb.mrp,
            mrp1yr: matchedCare.mrp1yr || fb.mrp1yr,
            mrp2yr: matchedCare.mrp2yr || fb.mrp2yr,
            discount: matchedCare.discount || fb.discount,
            discount1yr: matchedCare.discount1yr || fb.discount1yr,
            discount2yr: matchedCare.discount2yr || fb.discount2yr,
            salePrice: matchedCare.salePrice || fb.salePrice,
            salePrice1yr: matchedCare.salePrice1yr || fb.salePrice1yr,
            salePrice2yr: matchedCare.salePrice2yr || fb.salePrice2yr,
            duration: matchedCare.duration || fb.duration,
            image: matchedCare.image || fb.image
          }
        : fb;
    }

    let monthlyText = '';
    let mrpText = '';
    let price = 0;

    if (matchedCare) {
      const cleanMonthly = (matchedCare.monthly || '').trim();
      const rawMrp = String(matchedCare.mrp || '').split('.')[0].replace(/[^0-9]/g, '');
      const rawSale = String(matchedCare.salePrice || matchedCare.yearly || matchedCare.mrp || '').split('.')[0].replace(/[^0-9]/g, '');

      if (cleanMonthly) {
        monthlyText = cleanMonthly.toLowerCase().startsWith('from') ? cleanMonthly : `From ${cleanMonthly}/mo.◊`;
      } else if (rawMrp) {
        const calcEmi = Math.round(Number(rawMrp) / 24);
        monthlyText = `From ₹${calcEmi.toLocaleString('en-IN')}.00/mo.◊`;
      }

      if (rawMrp) {
        mrpText = `or MRP ₹${Number(rawMrp).toLocaleString('en-IN')}.00 (inclusive of all taxes)`;
      }

      price = parseInt(rawSale, 10) || (rawMrp ? parseInt(rawMrp, 10) : 0);
    }

    if (!monthlyText) monthlyText = 'From ₹579.00/mo.◊';
    if (!mrpText) mrpText = 'or MRP ₹16,900.00 (inclusive of all taxes)';
    if (!price || price <= 0) price = 2900;

    const thirdBullet = (catGroup === 'airpods') ? 'AirPods, battery and included charging case covered'
      : (catGroup === 'tv-home') ? 'Apple TV / HomePod, power supply and included accessories covered'
      : `${friendlyCatName}, battery and included accessories covered`;

    const features = [
      'Unlimited repairs for accidental damage protection‡',
      'Apple-certified repairs using genuine Apple parts',
      thirdBullet,
      'Priority access to Apple experts'
    ];

    return {
      isEligible: true,
      title: productAppleCare?.title || 'Add AppleCare+',
      monthlyText,
      mrpText,
      features,
      price: price > 0 ? price : 2900,
      friendlyCatName,
      matchedPlan: matchedCare
    };
  };

  const appleCareInfo = getAppleCareInfo();
  const rawTitle = (product?.title || product?.name || '').trim();
  const lowerTitle = rawTitle.toLowerCase();
  const catGroup = getCategoryGroup(product);
  const isMacMini = (lowerTitle.includes('mac mini') || (lowerTitle.includes('mini') && catGroup === 'mac'));

  const isEligibleAppleCareDropdown = Boolean(
    !isAccessoryProduct(product) &&
    catGroup !== 'accessories' &&
    appleCareInfo?.isEligible &&
    ['mac', 'iphone', 'ipad', 'watch', 'airpods', 'tv-home'].includes(catGroup)
  );
  const activeCarePlan = appleCareInfo?.matchedPlan;

  const currentAppleCarePlan = (() => {
    if (!activeCarePlan) return null;

    if (catGroup === 'ipad' || catGroup === 'iphone' || catGroup === 'watch' || catGroup === 'airpods' || catGroup === 'tv-home') {
      const activeDuration = catGroup === 'iphone'
        ? selectedIphoneDuration
        : (catGroup === 'watch'
          ? selectedWatchDuration
          : (catGroup === 'airpods'
            ? selectedAirpodsDuration
            : (catGroup === 'tv-home'
              ? selectedTvHomeDuration
              : selectedIpadDuration)));
      const is1Yr = activeDuration === '1yr';
      const isIphone = catGroup === 'iphone';
      const isWatch = catGroup === 'watch';
      const isAirpods = catGroup === 'airpods';
      const isTvHome = catGroup === 'tv-home';
      const friendlyModelName = isIphone ? 'iPhone' : (isWatch ? 'Apple Watch' : (isAirpods ? 'AirPods' : (isTvHome ? 'Apple TV / HomePod' : 'iPad')));

      const mrp = is1Yr
        ? (activeCarePlan.mrp1yr || (isIphone ? '₹12,999' : (isWatch ? '₹4,499' : (isAirpods ? '₹2,499' : (isTvHome ? '₹1,499' : '₹8,999')))))
        : (activeCarePlan.mrp2yr || activeCarePlan.mrp || (isIphone ? '₹25,900' : (isWatch ? '₹8,990' : (isAirpods ? '₹4,890' : (isTvHome ? '₹2,900' : '₹17,900')))));
      const discount = is1Yr
        ? (activeCarePlan.discount1yr || '18% OFF')
        : (activeCarePlan.discount2yr || activeCarePlan.discount || '18% OFF');
      const salePrice = is1Yr
        ? (activeCarePlan.salePrice1yr || (isIphone ? '₹10,659' : (isWatch ? '₹3,689' : (isAirpods ? '₹2,049' : (isTvHome ? '₹1,229' : '₹7,379')))))
        : (activeCarePlan.salePrice2yr || activeCarePlan.salePrice || (isIphone ? '₹21,238' : (isWatch ? '₹7,372' : (isAirpods ? '₹4,010' : (isTvHome ? '₹2,378' : '₹14,678')))));
      const sku = is1Yr
        ? (activeCarePlan.sku1yr || (activeCarePlan.sku ? `${activeCarePlan.sku.replace(/-2YR$/i, '')}-1YR` : (isIphone ? 'DHHA2HN/A' : (isWatch ? 'DHGJ2HN/A' : (isAirpods ? 'DG7Y2HN/A' : (isTvHome ? 'S9634HN/A-1YR' : 'DFQK2HN/A'))))))
        : (activeCarePlan.sku2yr || activeCarePlan.sku || (isIphone ? 'SHJ83HN/A' : (isWatch ? 'SH0G3HN/A' : (isAirpods ? 'SYLW2HN/A' : (isTvHome ? 'S9634HN/A' : 'SXT02HN/A')))));
      const desc = is1Yr
        ? (activeCarePlan.description1yr || `1 Year Apple-certified coverage for ${activeCarePlan.model || friendlyModelName}.`)
        : (activeCarePlan.description2yr || activeCarePlan.description || `2 Years Apple-certified coverage for ${activeCarePlan.model || friendlyModelName}.`);
      const dur = is1Yr ? '1 Year' : '2 Years';
      const rawTitle = activeCarePlan.title || `AppleCare+ for ${activeCarePlan.model || friendlyModelName}`;
      const titleWithoutDur = rawTitle.replace(/\s*\((?:1\s*Year|2\s*Years|3\s*Years)\)/gi, '').trim();
      const numSale = parseInt(String(salePrice).replace(/[^0-9]/g, ''), 10) || (is1Yr ? (isIphone ? 10659 : (isWatch ? 3689 : (isAirpods ? 2049 : (isTvHome ? 1229 : 7379)))) : (isIphone ? 21238 : (isWatch ? 7372 : (isAirpods ? 4010 : (isTvHome ? 2378 : 14678)))));

      return {
        ...activeCarePlan,
        title: `${titleWithoutDur} (${dur})`,
        sku,
        mrp,
        discount,
        salePrice,
        price: numSale,
        description: desc,
        duration: dur,
        badgeText: `AppleCare+ (${dur})`,
        image: activeCarePlan.image || (isIphone ? '/iphone_nav/iphone_16.png' : (isWatch ? '/uploads/upload_1789377186182_249.jpeg' : (isAirpods ? '/uploads/upload_1789366058920_902.jpeg' : (isTvHome ? '/uploads/upload_1789438370600_868.jpeg' : '/ipad_nav/ipad.png'))))
      };
    }

    // Non-iPad categories:
    const isMacProduct = catGroup === 'mac' ||
      lowerTitle.includes('macbook') ||
      lowerTitle.includes('mbp') ||
      lowerTitle.includes('imac') ||
      lowerTitle.includes('mac mini') ||
      (lowerTitle.includes('mini') && catGroup === 'mac') ||
      lowerTitle.includes('studio display') ||
      lowerTitle.includes('mac studio') ||
      lowerTitle.includes('mac pro') ||
      (product?.slug || '').toLowerCase().includes('mac') ||
      (product?.slug || '').toLowerCase().includes('display') ||
      (activeCarePlan.model || '').toLowerCase().includes('mac') ||
      (activeCarePlan.model || '').toLowerCase().includes('display') ||
      (activeCarePlan.title || '').toLowerCase().includes('mac');

    const defaultDur = catGroup === 'tv-home'
      ? ((activeCarePlan.model || '').toLowerCase().includes('tv') ? '3 Years' : '2 Years')
      : (isMacProduct ? '3 Years' : '2 Years');
    const dur = isMacProduct ? '3 Years' : (activeCarePlan.duration || defaultDur);
    const badgeText = isMacProduct
      ? 'AppleCare+ (3 Years)'
      : (activeCarePlan.badgeText || `AppleCare+ (${dur})`);
    const numSale = parseInt(String(activeCarePlan.salePrice || activeCarePlan.yearly || activeCarePlan.mrp || '').replace(/[^0-9]/g, ''), 10) || appleCareInfo?.price || 2900;

    return {
      ...activeCarePlan,
      price: numSale,
      duration: dur,
      badgeText
    };
  })();

  const getSelectedAppleCarePrice = () => {
    if (isAccessoryProduct(product) || catGroup === 'accessories') return 0;
    if (!selectedAppleCare && !selectedAppleCarePlan) return 0;
    if (selectedAppleCarePlan?.price) return Number(selectedAppleCarePlan.price) || 0;
    if (currentAppleCarePlan?.price) return currentAppleCarePlan.price;
    return (selectedAppleCare && appleCareInfo?.isEligible) ? appleCareInfo.price : 2900;
  };

  const pricingInfo = getVariantPricingInfo();
  const appleCareCost = getSelectedAppleCarePrice();

  const unitPrice = pricingInfo.sellingPrice + appleCareCost;
  const unitOriginalMrp = pricingInfo.originalMrp > 0 ? pricingInfo.originalMrp + appleCareCost : 0;
  const unitYouSave = pricingInfo.youSave;

  const totalPrice = unitPrice * quantity;
  const totalOriginalMrp = unitOriginalMrp > 0 ? unitOriginalMrp * quantity : 0;
  const totalYouSave = unitYouSave * quantity;
  const savePercent = pricingInfo.savePercent;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full h-80 sm:h-[450px] bg-zinc-100/90 rounded-3xl border border-zinc-200/40"></div>
            <div className="flex gap-3 justify-center pt-2">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl border border-zinc-200/40"></div>
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl border border-zinc-200/40"></div>
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl border border-zinc-200/40"></div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="h-4 w-28 bg-zinc-200/80 rounded-full"></div>
            <div className="h-10 w-4/5 bg-zinc-200/90 rounded-2xl"></div>
            <div className="h-8 w-2/5 bg-zinc-200/80 rounded-xl"></div>
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="h-4 w-full bg-zinc-100 rounded"></div>
              <div className="h-4 w-5/6 bg-zinc-100 rounded"></div>
              <div className="h-4 w-4/6 bg-zinc-100 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-12 bg-zinc-200/80 rounded-2xl"></div>
              <div className="h-12 bg-zinc-900/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;
    const colorName = selectedColor?.name || (colors[0]?.name || 'Standard');
    const activeVar = getActiveVariant();
    const partNum = activeVar?.partNumber || product.partNumber || product.modelNumber || '';
    const glassVal = selectedGlass || selectedConnectivity || activeVar?.glass || activeVar?.connectivity || '';
    const processorVal = activeVar?.processor || activeVar?.chip || getProcessorSpec();

    const detailsArr = [];
    if (selectedStrapSize && selectedStrapSize !== 'None') detailsArr.push(`Strap: ${selectedStrapSize}`);
    else if (selectedAccessoriesSize && selectedAccessoriesSize !== 'None') detailsArr.push(`Strap: ${selectedAccessoriesSize}`);
    if (selectedCaseSize) detailsArr.push(`Case: ${selectedCaseSize}`);
    else if (selectedBandSize && isWatchOrBand) detailsArr.push(`Case: ${selectedBandSize}`);
    else if (selectedSize && !isWatchOrBand) detailsArr.push(selectedSize);
    if (colorName) detailsArr.push(colorName);
    if (selectedConnectivity) detailsArr.push(selectedConnectivity);
    if (selectedStorage) detailsArr.push(selectedStorage);
    if (glassVal && glassVal !== selectedConnectivity) detailsArr.push(glassVal);
    if (selectedRam) detailsArr.push(selectedRam);
    if (processorVal && ((product.title || product.name || '').toLowerCase().includes('mac') || (product.title || product.name || '').toLowerCase().includes('ipad'))) {
      detailsArr.push(processorVal);
    }
    const hasAppleCare = Boolean(!isAccessoryProduct(product) && catGroup !== 'accessories' && (selectedAppleCarePlan || selectedAppleCare));
    if (selectedAppleCarePlan) {
      detailsArr.push(`${selectedAppleCarePlan.name} (₹${selectedAppleCarePlan.price.toLocaleString('en-IN')})`);
    } else if (selectedAppleCare) {
      const careName = currentAppleCarePlan?.title || activeCarePlan?.title || 'AppleCare+';
      const careSkuStr = (currentAppleCarePlan?.sku || activeCarePlan?.sku) ? ` [SKU: ${currentAppleCarePlan?.sku || activeCarePlan?.sku}]` : '';
      detailsArr.push(`${careName}${careSkuStr} (₹${appleCareCost.toLocaleString('en-IN')})`);
    }
    if (partNum) detailsArr.push(`MPN: ${partNum}`);

    const nameDetails = detailsArr.join(' / ');

    try {
      const result = await dispatch(addToCart({
        id: `${id}-${selectedStrapSize || selectedAccessoriesSize || 'nostrap'}-${selectedCaseSize || selectedSize || 'nocase'}-${selectedBandSize || 'std'}-${selectedConnectivity || 'std'}-${selectedStorage || 'std'}-${selectedRam || 'std'}-${glassVal || 'std'}-${hasAppleCare ? (selectedAppleCarePlan?.id || currentAppleCarePlan?.sku || 'ac') : 'noac'}-${colorName}`,
        name: `${cleanProductTitle(product.name || product.title)} (${nameDetails})`,
        price: unitPrice,
        image: activeImage || processedImage || colors[0]?.image || product.images?.[0] || product.image,
        quantity,
        size: selectedSize || selectedCaseSize,
        caseSize: selectedCaseSize,
        strapSize: selectedStrapSize || selectedAccessoriesSize,
        accessoriesSize: selectedAccessoriesSize || selectedStrapSize,
        bandSize: selectedBandSize || selectedCaseSize,
        connectivity: selectedConnectivity,
        storage: selectedStorage,
        glass: glassVal,
        processor: processorVal,
        partNumber: partNum,
        ram: selectedRam,
        color: colorName,
        appleCare: hasAppleCare,
        appleCarePlan: selectedAppleCarePlan?.name || (selectedAppleCare ? (currentAppleCarePlan?.title || activeCarePlan?.title || 'AppleCare+') : ''),
        appleCareSku: selectedAppleCare ? (currentAppleCarePlan?.sku || activeCarePlan?.sku || '') : '',
        appleCarePrice: appleCareCost,
        stock: product.stock || 10
      }));

      // Show error only for real failures (stock, network, etc.)
      // Auth errors (401/403) are handled gracefully in cartSlice with local fallback.
      if (result?.error) {
        const msg = result.payload || result.error?.message || '';
        const isAuthError = msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('token') || msg.toLowerCase().includes('unauthorized');
        if (!isAuthError && msg) {
          alert(msg);
        }
      }
    } catch (err) {
      const msg = err?.message || '';
      const isAuthError = msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('token');
      if (!isAuthError) {
        alert(msg || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleRequestBulkQuote = () => {
    if (!product) return;

    const prodTitle = cleanProductTitle(product.title || product.name || 'Apple Product');
    const activeVar = getActiveVariant();
    const activeColorStr = selectedColor?.name || (colors[0]?.name || '');
    const partNum = activeVar?.partNumber || product.partNumber || product.modelNumber || '';
    const glassVal = selectedGlass || selectedConnectivity || activeVar?.glass || activeVar?.connectivity || '';
    const processorVal = activeVar?.processor || activeVar?.chip || getProcessorSpec();

    let message = `Hello iiNCEPT B2B Desk! 👋\nI would like to request a quote/inquiry for the following Apple Product:\n\n`;
    message += `📦 *Product:* ${prodTitle}\n`;
    if (partNum) message += `🔢 *SKU/Part Number:* ${partNum}\n`;
    if (selectedSize) message += `📏 *Case Size/Model:* ${selectedSize}\n`;
    if (selectedBandSize) message += `⌚ *Band Size:* ${selectedBandSize}\n`;
    if (selectedConnectivity) message += `📡 *Connectivity:* ${selectedConnectivity}\n`;
    if (activeColorStr) message += `🎨 *Color:* ${activeColorStr}\n`;
    if (selectedStorage) message += `💾 *Storage:* ${selectedStorage}\n`;
    if (glassVal) message += `✨ *Glass Finish / Option:* ${glassVal}\n`;
    if (selectedRam) message += `⚡ *RAM:* ${selectedRam}\n`;
    if (processorVal && ((product.title || product.name || '').toLowerCase().includes('mac') || (product.title || product.name || '').toLowerCase().includes('ipad'))) {
      message += `💻 *Chip & Processor:* ${processorVal}\n`;
    }
    if (selectedAppleCarePlan) {
      message += `🛡️ *Protection:* ${selectedAppleCarePlan.name} (₹${selectedAppleCarePlan.price.toLocaleString('en-IN')})\n`;
    } else if (selectedAppleCare) {
      const careName = currentAppleCarePlan?.title || activeCarePlan?.title || 'AppleCare+';
      const careSkuStr = (currentAppleCarePlan?.sku || activeCarePlan?.sku) ? ` [SKU: ${currentAppleCarePlan?.sku || activeCarePlan?.sku}]` : '';
      message += `🛡️ *Protection:* ${careName}${careSkuStr} (₹${appleCareCost.toLocaleString('en-IN')})\n`;
    }
    message += `📊 *Quantity Required:* ${quantity} unit(s)\n`;
    message += `💰 *Total Estimated Price:* ₹${totalPrice.toLocaleString('en-IN')}\n\n`;
    message += `Please provide availability and best B2B pricing. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919971002348?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const colorName = selectedColor?.name || (colors[0]?.name || 'Standard');

  const getIpadModelName = () => {
    const titleStr = (product?.title || product?.name || id || '').toLowerCase();
    if (titleStr.includes('ipad pro') || (titleStr.includes('ipad') && titleStr.includes('pro'))) return 'iPad Pro';
    if (titleStr.includes('ipad air') || (titleStr.includes('ipad') && titleStr.includes('air'))) return 'iPad Air';
    if (titleStr.includes('ipad mini') || (titleStr.includes('ipad') && titleStr.includes('mini'))) return 'iPad mini';
    return 'iPad Air';
  };

  const getAllDisplayFeatures = () => {
    let rawFeats = product?.features && Array.isArray(product.features) && product.features.length > 0
      ? [...product.features]
      : [];

    const isTvProduct = (product?.name || product?.title || '').toLowerCase().includes('apple tv') ||
                        (product?.name || product?.title || '').toLowerCase().includes('tv 4k') ||
                        (product?.category?.name || product?.category || '').toString().toLowerCase().includes('tv');

    if (isTvProduct) {
      rawFeats = rawFeats.filter(f => {
        const fl = (f || '').toLowerCase();
        return !fl.includes('4k high') && !fl.includes('dolby vision') && !fl.includes('a15 bionic');
      });
      if (rawFeats.length === 0) {
        rawFeats = ['Siri Remote', 'USB-C', 'iPhone tracking'];
      }
    }

    const isHomePodProduct = (product?.name || product?.title || '').toLowerCase().includes('homepod');
    if (isHomePodProduct) {
      const isMini = (product?.name || product?.title || '').toLowerCase().includes('mini');
      rawFeats = rawFeats.filter(f => {
        const fl = (f || '').toLowerCase();
        return !fl.includes('room-filling') && !fl.includes('room felling') && !fl.includes('siri smart');
      });
      if (rawFeats.length === 0) {
        rawFeats = isMini
          ? ['Room-filling sound', 'Siri smart assistant', 'Smart home hub']
          : ['Audio', 'Smart Home Hub', 'Safety'];
      }
    }

    const isMacProduct = (product?.name || product?.title || '').toLowerCase().includes('mac') ||
                         (product?.category?.name || product?.category || '').toString().toLowerCase().includes('mac') ||
                         (product?.category?.name || product?.category || '').toString().toLowerCase().includes('laptop') ||
                         (product?.category?.name || product?.category || '').toString().toLowerCase().includes('pc');

    const result = [];

    // 1. Chip & Processor for Mac/PC or custom processor saved in Admin Panel
    if (isMacProduct || (product?.processors && product.processors.length > 0) || getActiveVariant()?.processor) {
      const hasChipInFeats = rawFeats.some(f => {
        const fLower = (f || '').toLowerCase();
        return fLower.includes('chip') || fLower.includes('processor') || fLower.includes('cpu');
      });
      if (!hasChipInFeats) {
        result.push(`Chip & Processor: ${getProcessorSpec()}`);
      }
    }

    // 2. Memory / RAM
    if (!rawFeats.some(f => (f || '').toLowerCase().includes('memory:'))) {
      if (selectedRam || (product?.ram && product.ram.length > 0)) {
        result.push(`Memory: ${selectedRam || product.ram[0]} unified memory`);
      }
    }

    // 3. Storage
    if (!rawFeats.some(f => (f || '').toLowerCase().includes('storage:'))) {
      if (selectedStorage || (product?.storage && product.storage.length > 0)) {
        result.push(`Storage: ${selectedStorage || product.storage[0]} storage`);
      }
    }

    // Add all existing features
    rawFeats.forEach(f => {
      let displayF = f;
      if (f.toLowerCase().includes('memory:') && selectedRam) {
        displayF = `Memory: ${selectedRam} unified memory`;
      } else if (f.toLowerCase().includes('storage:') && selectedStorage) {
        displayF = `Storage: ${selectedStorage} storage`;
      } else if ((f.toLowerCase().includes('chip') || f.toLowerCase().includes('processor') || f.toLowerCase().includes('cpu')) && (isMacProduct || product?.processors?.length > 0)) {
        displayF = `Chip & Processor: ${getProcessorSpec()}`;
      }
      result.push(displayF);
    });

    return result;
  };

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] font-sans pb-12 page-smooth-enter">

      {/* Dynamic Style Sheet block to inject template layout styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --ink: #FFFFFF; --ink-2: #F5F5F7; --ink-3: #101012; --paper: #1D1D1F;
          --blue: #0071E3; --line: rgba(0,0,0,0.10); --muted: rgba(29,29,31,0.62);
        }
        .wrap { max-width: 1240px; margin: 0 auto; padding: 0 28px; }
        @media(max-width: 640px) { .wrap { padding: 0 16px; } }

        .breadcrumb { padding: 18px 0; font-size: 13px; color: var(--muted); text-align: left; word-break: break-word; }
        .breadcrumb a:hover { color: var(--paper); }
        .breadcrumb span { margin: 0 6px; }

        .pdp { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; padding: 20px 0 70px; }
        @media(max-width: 920px) { .pdp { grid-template-columns: 1fr; gap: 32px; padding: 10px 0 40px; } }

        .gallery { position: sticky; top: 90px; align-self: start; }
        @media(max-width: 920px) { .gallery { position: relative; top: 0; } }

        .gallery-main {
          width: 100%; height: 520px; aspect-ratio: 1/1; border-radius: 20px; background: #ffffff;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--line); overflow: hidden;
          transition: background .3s ease, border-color .3s ease;
        }
        @media(max-width: 640px) { .gallery-main { height: 340px; } }
        @media(max-width: 380px) { .gallery-main { height: 280px; } }

        .gallery-main img {
          max-width: 90%; max-height: 90%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;
          transition: opacity 0.35s ease-out, transform 0.35s ease-out;
        }
        .gallery-thumbs { display: flex; gap: 10px; margin-top: 14px; overflow-x: auto; padding-bottom: 4px; }
        .gthumb { width: 64px; height: 64px; shrink: 0; border-radius: 8px; border: 1px solid var(--line); background: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; flex-shrink: 0; }
        .gthumb img { object-fit: contain; width: 100%; height: 100%; }
        .gthumb.active { border-color: var(--paper); border-width: 2px; }

        .pinfo .eyebrow { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--blue); font-weight: 700; margin-bottom: 10px; }
        .pinfo h1 { font-size: clamp(24px, 3.6vw, 38px); margin-bottom: 10px; font-family: 'Fraunces', serif; font-weight: 600; word-break: break-word; }
        .pinfo .price { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .pinfo .gst { font-size: 13px; color: var(--muted); margin-bottom: 28px; }

        .optgroup { margin-bottom: 28px; }
        .optgroup label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); font-weight: 700; margin-bottom: 12px; }
        .swatches { display: flex; gap: 12px; flex-wrap: wrap; }
        .swatch { width: 38px; height: 38px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; position: relative; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .swatch:hover { transform: scale(1.15); box-shadow: 0 0 0 2px rgba(0,0,0,0.3), 0 0 0 4px #ffffff !important; }
        .swatch.active { border-color: transparent; }
        .swatch.active:hover { box-shadow: 0 0 0 2px #0071E3, 0 0 0 4px #ffffff !important; }

        .optrow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .opt {
          border: 1.5px solid rgba(0, 0, 0, 0.14);
          padding: 12px 18px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.01em;
          cursor: pointer;
          justify-content: center;
          box-sizing: border-box;
          user-select: none;
          min-height: 48px;
        }
        .opt:hover {
          border-color: #1d1d1f;
          background: #f5f5f7;
        }
        .opt.active {
          border-color: #1d1d1f;
          background: #f5f5f7;
          color: #1d1d1f;
          font-weight: 700;
          box-shadow: 0 0 0 1px #1d1d1f;
        }
        .opt .sub { display: block; font-size: 11px; color: var(--muted); margin-top: 2px; }

        .acplans { display: flex; flex-direction: column; gap: 10px; }
        .acplan { border: 1px solid var(--line); border-radius: 8px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all .15s ease; text-align: left; }
        .acplan.active { border-color: var(--blue); background: #F0F7FF; }
        .acplan .t { font-size: 14px; font-weight: 600; } .acplan .s { font-size: 12px; color: var(--muted); }
        .acplan .p { font-size: 13px; font-weight: 600; }

        .qty { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
        .qty button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line); background: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .qty input { width: 60px; text-align: center; border: none; font-size: 15px; font-weight: 600; background: transparent; }

        .btnrow { display: flex; gap: 12px; margin-bottom: 30px; }
        @media(max-width: 480px) { .btnrow { flex-direction: column; } }
        .btn { padding: 15px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; flex: 1; text-align: center; transition: transform .15s ease; cursor: pointer; }
        .btn:hover { transform: translateY(-1px); }
        .btn-dark { background: var(--paper); color: #fff; border: none; }
        .btn-line { border: 1px solid var(--line); color: var(--paper); background: transparent; }

        .pdp-note { display: flex; gap: 10px; font-size: 13px; color: var(--muted); align-items: flex-start; margin-bottom: 10px; text-align: left; }
        .pdp-note .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); margin-top: 6px; flex-shrink: 0; }

        /* DIVIDER */
        .divider { position: relative; height: 90px; overflow: hidden; background: var(--ink-3); margin-top: 30px; }
        .divider svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .divider-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; }

        /* BULK PRICING */
        .section { padding: 60px 0; text-align: left; }
        .section-head { max-width: 560px; margin-bottom: 34px; }
        .section-head h2 { font-size: clamp(24px, 3.2vw, 32px); font-family: 'Fraunces', serif; font-weight: 600; }
        .section-head p { color: var(--muted); margin-top: 10px; font-size: 15px; line-height: 1.6; }

        table.pricing { width: 100%; border-collapse: collapse; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
        table.pricing th, table.pricing td { padding: 16px 20px; text-align: left; font-size: 14px; border-bottom: 1px solid var(--line); }
        table.pricing th { background: var(--ink-2); font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 700; }
        table.pricing tr:last-child td { border-bottom: none; }
        table.pricing td.qty-tier { font-weight: 700; }
        table.pricing td.save { color: #1E8E5A; font-weight: 600; }

        /* SPEC TABS */
        .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--line); margin-bottom: 24px; overflow-x: auto; }
        .tab { padding: 14px 22px; font-size: 14px; font-weight: 600; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; flex-shrink: 0; }
        .tab.active { color: var(--paper); border-color: var(--paper); }
        .spectable { display: grid; grid-template-columns: 200px 1fr; gap: 0; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
        @media(max-width: 640px) { .spectable { grid-template-columns: 110px 1fr; } }
        @media(max-width: 400px) { .spectable { grid-template-columns: 1fr; } }
        .spectable .k, .spectable .v { padding: 14px 18px; font-size: 13.5px; border-bottom: 1px solid var(--line); word-break: break-word; }
        .spectable .k { background: var(--ink-2); color: var(--muted); font-weight: 600; }
        .spectable .row { display: contents; }
        .spectable .row:last-child .k, .spectable .row:last-child .v { border-bottom: none; }
      `}} />

      <div className="wrap">
        <div className="breadcrumb">
          <Link to="/">Home</Link><span>/</span><Link to={getCategoryLink()}>{getCategoryName()}</Link><span>/</span>{cleanProductTitle(product.name || product.title)}
        </div>

        <div className="pdp">
          {/* Gallery Column */}
          <div className="gallery">
            <div
              className="gallery-main relative cursor-zoom-in overflow-hidden select-none"
              onMouseMove={handleGalleryMouseMove}
              onMouseEnter={handleGalleryMouseEnter}
              onMouseLeave={handleGalleryMouseLeave}
            >
              <img
                src={processedImage || activeImage || colors[0]?.image || product.images?.[0] || product.image || ''}
                alt={product.name || product.title || ''}
                className="mix-blend-multiply transition-transform duration-150 ease-out pointer-events-none"
                style={{
                  transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                  transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center'
                }}
                onError={(e) => {
                  e.currentTarget.style.opacity = '0.5';
                }}
              />
              {isZoomed && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider pointer-events-none z-10 animate-in fade-in duration-200">
                  🔍 Hover Zoom Active
                </div>
              )}
            </div>
            <div className="gallery-thumbs">
              {galleryImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`gthumb ${activeImage === imgUrl ? 'active' : ''}`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`Thumbnail ${idx}`} 
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Column */}
          <div className="pinfo">


            {/* Title (Clean Product Name) */}
            {(() => {
              const activeVar = getActiveVariant();
              const partNum = activeVar?.partNumber || product.partNumber || null;
              const modelNum = activeVar?.modelNumber || product.modelNumber || null;
              const rawTitle = product.title || product.name || activeVar?.displayTitle || activeVar?.title;
              const displayTitle = cleanProductTitle(rawTitle);

              return (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight text-left leading-snug">
                    {displayTitle}
                  </h1>

                  {modelNum && (
                    <div className="mb-3 mt-1.5 text-left">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-100 rounded-md text-[11px] font-mono text-zinc-700 border border-zinc-200 font-medium">
                        <span className="font-bold text-zinc-900 uppercase tracking-wide">Model:</span> {modelNum}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 mb-6 text-left space-y-2">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl md:text-4xl font-black text-zinc-950 tracking-tight">
                        ₹{totalPrice.toLocaleString('en-IN')}
                      </span>
                      {totalOriginalMrp > totalPrice && (
                        <span className="text-lg md:text-xl font-bold text-zinc-400 line-through tracking-tight">
                          ₹{totalOriginalMrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {totalYouSave > 0 && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                        <span className="text-zinc-500 font-bold">* You Save:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAFBF3] text-[#00A859] border border-[#B3F3D3] rounded-full font-extrabold text-xs shadow-2xs">
                          <span>₹{totalYouSave.toLocaleString('en-IN')}</span>
                          <span className="text-[#A3E9C5]">|</span>
                          <span>{savePercent}% OFF</span>
                        </span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
            {(product.description && product.description.trim() !== '.' && product.description.trim() !== '') && (
              <div className="my-6 text-sm text-zinc-600 leading-relaxed text-left font-sans" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </div>
            )}

            {/* Color swatches */}
            <div className="optgroup mb-8">
              {/* Desktop View: Keep existing layout exactly as it is */}
              <div className="hidden md:block text-base font-semibold text-zinc-900 mb-3 text-left">
                Colour – <span className="text-zinc-700 font-normal">{colorName}</span>
              </div>
              {/* Mobile View: Display "Colours:" on a separate line above the colour swatches */}
              <div className="block md:hidden text-sm sm:text-base font-bold text-zinc-900 mb-2.5 text-left tracking-tight">
                Colours:
              </div>
              <div className="swatches flex items-center gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 max-w-full">
                {colors.map((cObj) => {
                  const isSelected = (selectedColor?.name || '').toString().trim().toLowerCase() === (cObj.name || '').toString().trim().toLowerCase();
                  let bgVal = cObj.value;
                  const cNameLower = (cObj.name || '').toLowerCase();
                  const isSpaceBlack = cNameLower.includes('space black');
                  const isPinkBlush = cNameLower.includes('pink') || cNameLower.includes('blush') || cNameLower.includes('rose');
                  const isYellowCitrus = cNameLower.includes('yellow') || cNameLower.includes('citrus') || cNameLower.includes('lime') || cNameLower.includes('gold') || cNameLower.includes('light gold');
                  const isBlueSlate = cNameLower.includes('sky blue') || cNameLower.includes('blue') || cNameLower.includes('slate') || cNameLower.includes('indigo');
                  const isCloudWhite = cNameLower.includes('cloud white') || cNameLower.includes('silver') || (cNameLower.includes('white') && !cNameLower.includes('titanium'));

                  if (!bgVal || !bgVal.startsWith('#')) {
                    bgVal = resolveColorValue(cObj);
                  }

                  // Detect if this is an iMac product for two-tone Apple swatch chips
                  const isImacProduct = (product?.title || product?.name || '').toLowerCase().includes('imac');

                  let swatchBgImage = 'none';
                  if (cObj.swatchImage || cObj.swatch) {
                    swatchBgImage = `url(${cObj.swatchImage || cObj.swatch})`;
                  } else if (isImacProduct) {
                    // iMac M4 two-tone swatch SVGs
                    if (cNameLower.includes('blue')) swatchBgImage = 'url(/imac_blue_swatch.svg)';
                    else if (cNameLower.includes('pink')) swatchBgImage = 'url(/imac_pink_swatch.svg)';
                    else if (cNameLower.includes('purple') || cNameLower.includes('lavender')) swatchBgImage = 'url(/imac_purple_swatch.svg)';
                    else if (cNameLower.includes('green')) swatchBgImage = 'url(/imac_green_swatch.svg)';
                    else if (cNameLower.includes('yellow') || cNameLower.includes('citrus')) swatchBgImage = 'url(/imac_yellow_swatch.svg)';
                    else if (cNameLower.includes('orange')) swatchBgImage = 'url(/imac_orange_swatch.svg)';
                    else if (cNameLower.includes('silver') || cNameLower.includes('white')) swatchBgImage = 'url(/imac_silver_swatch.svg)';
                  } else if (isSpaceBlack) {
                    swatchBgImage = 'url(/space_black_swatch.png)';
                  } else if (isPinkBlush) {
                    swatchBgImage = 'url(/neo_pink.png)';
                  } else if (isYellowCitrus) {
                    swatchBgImage = 'url(/neo_yellow.png)';
                  } else if (isBlueSlate) {
                    swatchBgImage = 'url(/neo_blue.png)';
                  } else if (isCloudWhite) {
                    swatchBgImage = 'url(/neo_silver.png)';
                  }

                  return (
                    <button
                      key={cObj.name}
                      type="button"
                      onClick={() => handleColorSelect(cObj)}
                      className="relative w-11 h-11 shrink-0 flex items-center justify-center cursor-pointer group focus:outline-hidden border-0 bg-transparent p-0 transition-transform duration-200"
                      title={cObj.name}
                    >
                      {/* Outer Double Blue Concentric Ring when Selected */}
                      {isSelected ? (
                        <>
                          <span
                            className="absolute rounded-full pointer-events-none transition-all duration-200"
                            style={{
                              inset: '0px',
                              border: '2px solid #0071e3'
                            }}
                          />
                          <span
                            className="absolute rounded-full pointer-events-none transition-all duration-200"
                            style={{
                              inset: '2.5px',
                              border: '2px solid #ffffff'
                            }}
                          />
                          <span
                            className="absolute rounded-full pointer-events-none transition-all duration-200"
                            style={{
                              inset: '4.5px',
                              border: '2px solid #0071e3'
                            }}
                          />
                        </>
                      ) : (
                        /* Subtle Outer Ring on Hover when Unselected */
                        <span className="absolute inset-1 rounded-full border border-transparent group-hover:border-zinc-300 transition-all duration-200 pointer-events-none" />
                      )}

                      {/* Inner Swatch Circle */}
                      <span
                        className="w-7 h-7 rounded-full shadow-2xs transition-transform duration-200 group-hover:scale-105"
                        style={{
                          backgroundColor: bgVal,
                          backgroundImage: swatchBgImage,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SKU / Part Number option group (placed right below Colour) */}
            {(() => {
              const activeVar = getActiveVariant();
              const partNum = activeVar?.partNumber || product.partNumber || null;
              if (!partNum) return null;
              return (
                <div className="optgroup mb-8 text-left">
                  <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">SKU / Part Number</label>
                  <div className="optrow flex flex-wrap gap-3">
                    <div className="opt active font-mono">
                      {partNum}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 1. Case Size options (Only shown if admin configured Case Sizes e.g. 40mm, 42mm, 44mm, 46mm, 49mm) */}
            {caseSizes && caseSizes.length > 0 && (
              <div className="optgroup mb-8 text-left">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                  Case Size
                </label>
                <div className="optrow flex flex-wrap gap-3">
                  {caseSizes.map((cs) => {
                    const isActive = selectedCaseSize === cs || selectedBandSize === cs || selectedSize === cs;
                    return (
                      <div
                        key={cs}
                        onClick={() => {
                          setSelectedCaseSize(cs);
                          setSelectedBandSize(cs);
                          setSelectedSize(cs);
                        }}
                        className={`opt ${isActive ? 'active' : ''}`}
                      >
                        {cs}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Strap Size options (Loop, S/M, M/L, etc. - Only shown if admin configured Strap Sizes) */}
            {strapSizes && strapSizes.length > 0 && (
              <div className="optgroup mb-8 text-left">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                  Strap Size
                </label>
                <div className="optrow flex flex-wrap gap-3">
                  {strapSizes.map((stSz) => {
                    const isActive = selectedStrapSize === stSz || selectedAccessoriesSize === stSz;
                    return (
                      <div
                        key={stSz}
                        onClick={() => {
                          setSelectedStrapSize(stSz);
                          setSelectedAccessoriesSize(stSz);
                        }}
                        className={`opt ${isActive ? 'active' : ''}`}
                      >
                        {stSz}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. General Size / Model options (Only for general non-watch products with explicit sizes) */}
            {!isWatchOrBand && generalSizes && generalSizes.length > 0 && (
              <div className="optgroup mb-8 text-left">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                  Size / Model
                </label>
                <div className="optrow flex flex-wrap gap-3">
                  {generalSizes.map((sz) => (
                    <div
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`opt ${selectedSize === sz ? 'active' : ''}`}
                    >
                      {sz}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connectivity options (GPS / GPS + Cellular) */}
            {connectivities && connectivities.length > 0 && (
              <div className="optgroup mb-8">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Connectivity</label>
                <div className="optrow flex flex-wrap gap-3">
                  {connectivities.map((conn) => (
                    <div
                      key={conn}
                      onClick={() => {
                        setSelectedConnectivity(conn);
                        setSelectedGlass(conn);
                      }}
                      className={`opt ${selectedConnectivity === conn || selectedGlass === conn ? 'active' : ''}`}
                    >
                      {conn}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAM options */}
            {((rams && rams.length > 0) || chipRamLabel) && (
              <div className="optgroup mb-8 text-left">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">RAM (MEMORY)</label>
                <div className="optrow flex flex-wrap gap-3">
                  {rams && rams.length > 0 ? (
                    rams.map((r) => (
                      <div
                        key={r}
                        onClick={() => handleRamSelect(r)}
                        className={`opt ${selectedRam === r ? 'active' : ''}`}
                      >
                        {r}
                      </div>
                    ))
                  ) : (
                    <div className="opt active">
                      {chipRamLabel}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Storage options */}
            {storages && storages.length > 0 && (
              <div className="optgroup mb-8">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Storage</label>
                <div className="optrow flex flex-wrap gap-3">
                  {storages.map((st) => (
                    <div
                      key={st}
                      onClick={() => handleStorageSelect(st)}
                      className={`opt ${selectedStorage === st ? 'active' : ''}`}
                    >
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Finish / Glass Finish Options */}
            {glasses && glasses.length > 0 && (!connectivities || connectivities.length === 0) && (
              <div className="optgroup mb-8">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Glass Finish</label>
                <div className="optrow flex flex-wrap gap-3">
                  {glasses.map((gl) => (
                    <div
                      key={gl}
                      onClick={() => handleGlassSelect(gl)}
                      className={`opt ${selectedGlass === gl ? 'active' : ''}`}
                    >
                      {gl}
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Quantity */}
            <div className="optgroup">
              <label>Quantity</label>
              <div className="qty">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="text" value={quantity} readOnly />
                <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* 1. All Hardware Categories: MacBook-Style Complete AppleCare+ Product Card Inside Dropdown */}
            {isEligibleAppleCareDropdown && !isAccessoryProduct(product) && catGroup !== 'accessories' && currentAppleCarePlan && (
              <div
                className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-5 my-5 shadow-xs text-left select-none relative transition-all ${
                  selectedAppleCare
                    ? 'border-[#0071e3] ring-2 ring-[#0071e3]/20 bg-blue-50/15'
                    : 'border-[#d2d2d7] hover:border-zinc-400 bg-white'
                }`}
              >
                {/* Header Row: Apple Icon, Title, Add Button, and Dropdown Button */}
                <div
                  onClick={() => setIsAppleCareExpanded(prev => !prev)}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/applecare_red_logo.png"
                      alt="AppleCare+"
                      className="w-5.5 h-5.5 object-contain shrink-0"
                    />
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] tracking-tight leading-none">
                      Add AppleCare+
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppleCare(!selectedAppleCare);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        selectedAppleCare
                          ? 'bg-[#0071e3] text-white shadow-xs'
                          : 'bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-zinc-200/80'
                      }`}
                    >
                      {selectedAppleCare ? '✓ Added' : '+ Add'}
                    </button>

                    {/* Red Dropdown Button with White Down Arrow (Matching Reference Image) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAppleCareExpanded(prev => !prev);
                      }}
                      title={isAppleCareExpanded ? "Collapse AppleCare+" : "Expand AppleCare+"}
                      aria-label="Toggle AppleCare+"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E30000] hover:bg-[#c90000] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs border-0 shrink-0"
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isAppleCareExpanded ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <polygon points="5,7 15,7 10,13" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Full AppleCare+ Product Card (Matching MacBook Reference) */}
                {isAppleCareExpanded && (
                  <div className="mt-4 pt-4 border-t border-zinc-200/80 text-left">
                    {/* Top Section: Media Left, Info Right */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                      
                      {/* LEFT COLUMN: Media Container Box */}
                      <div className="md:col-span-5 bg-[#F5F5F7] rounded-2xl p-4 sm:p-5 relative flex flex-col items-center justify-between min-h-[260px] sm:min-h-[280px] h-full border border-zinc-200/60">
                        
                        {/* Top Left Badge */}
                        <div className="w-full flex items-center justify-start z-10 mb-1">
                          <span className={`text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide whitespace-nowrap transition-colors ${
                            ((catGroup === 'ipad' && selectedIpadDuration === '1yr') || (catGroup === 'iphone' && selectedIphoneDuration === '1yr') || (catGroup === 'watch' && selectedWatchDuration === '1yr') || (catGroup === 'airpods' && selectedAirpodsDuration === '1yr') || (catGroup === 'tv-home' && selectedTvHomeDuration === '1yr')) ? 'bg-[#0071e3]' : 'bg-[#FF2D55]'
                          }`}>
                            {currentAppleCarePlan.badgeText}
                          </span>
                        </div>

                        {/* Main Product Image */}
                        <div className="w-full h-28 sm:h-32 flex items-center justify-center my-1 overflow-hidden">
                          <img
                            src={
                              currentAppleCarePlan.image || (
                                catGroup === 'ipad' ? '/ipad_nav/ipad.png'
                                : catGroup === 'iphone' ? '/iphone_nav/iphone_16.png'
                                : catGroup === 'watch' ? '/uploads/upload_1789377186182_249.jpeg'
                                : catGroup === 'airpods' ? '/uploads/upload_1789366058920_902.jpeg'
                                : catGroup === 'tv-home' ? '/uploads/upload_1789438370600_868.jpeg'
                                : '/mac_nav/mac_mini.png'
                              )
                            }
                            alt={currentAppleCarePlan.title || 'AppleCare+'}
                            className="max-h-full max-w-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Carousel Dots */}
                        <div className="flex items-center justify-center gap-1.5 my-1">
                          <span className="w-2 h-2 rounded-full bg-black"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                        </div>

                        {/* Bottom Product Logo & Subtitle */}
                        <div className="text-center min-h-[42px] flex flex-col justify-center items-center">
                          <div className="flex items-center justify-center gap-1 font-extrabold text-[#1D1D1F] text-sm sm:text-base tracking-tight">
                            <span></span>
                            <span>{currentAppleCarePlan.model || currentAppleCarePlan.title}</span>
                          </div>
                          {currentAppleCarePlan.sku && (
                            <p className="text-[11px] text-zinc-500 font-mono font-semibold mt-0.5">
                              SKU: {currentAppleCarePlan.sku}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Info & Pricing Block */}
                      <div className="md:col-span-7 space-y-3 flex flex-col justify-between h-full text-left">
                        <div>
                          {/* Duration Selector Pills for iPad, iPhone, Watch, AirPods and TV & Home (Matching Reference Design) */}
                          {(catGroup === 'ipad' || catGroup === 'iphone' || catGroup === 'watch' || catGroup === 'airpods' || catGroup === 'tv-home') && (
                            <div className="flex items-center gap-1.5 mb-2.5 bg-zinc-100/80 p-1 rounded-xl w-fit">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (catGroup === 'iphone') setSelectedIphoneDuration('1yr');
                                  else if (catGroup === 'watch') setSelectedWatchDuration('1yr');
                                  else if (catGroup === 'airpods') setSelectedAirpodsDuration('1yr');
                                  else if (catGroup === 'tv-home') setSelectedTvHomeDuration('1yr');
                                  else setSelectedIpadDuration('1yr');
                                }}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  (catGroup === 'iphone' ? selectedIphoneDuration : (catGroup === 'watch' ? selectedWatchDuration : (catGroup === 'airpods' ? selectedAirpodsDuration : (catGroup === 'tv-home' ? selectedTvHomeDuration : selectedIpadDuration)))) === '1yr'
                                    ? 'bg-white text-[#0071e3] shadow-xs ring-1 ring-black/5'
                                    : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                              >
                                1 Year Plan
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (catGroup === 'iphone') setSelectedIphoneDuration('2yr');
                                  else if (catGroup === 'watch') setSelectedWatchDuration('2yr');
                                  else if (catGroup === 'airpods') setSelectedAirpodsDuration('2yr');
                                  else if (catGroup === 'tv-home') setSelectedTvHomeDuration('2yr');
                                  else setSelectedIpadDuration('2yr');
                                }}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  (catGroup === 'iphone' ? selectedIphoneDuration : (catGroup === 'watch' ? selectedWatchDuration : (catGroup === 'airpods' ? selectedAirpodsDuration : (catGroup === 'tv-home' ? selectedTvHomeDuration : selectedIpadDuration)))) === '2yr'
                                    ? 'bg-white text-[#FF2D55] shadow-xs ring-1 ring-black/5'
                                    : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                              >
                                2 Year Plan
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#FF2D55] mb-1">
                            APPLE CARE+{(catGroup === 'ipad' || catGroup === 'iphone' || catGroup === 'watch' || catGroup === 'airpods' || catGroup === 'tv-home') ? ` • ${(catGroup === 'iphone' ? selectedIphoneDuration : (catGroup === 'watch' ? selectedWatchDuration : (catGroup === 'airpods' ? selectedAirpodsDuration : (catGroup === 'tv-home' ? selectedTvHomeDuration : selectedIpadDuration)))) === '1yr' ? '1 YEAR PLAN' : '2 YEAR PLAN'}` : ''}
                          </div>
                          <h3 className="font-extrabold text-[#1D1D1F] text-lg sm:text-xl leading-snug tracking-tight">
                            {currentAppleCarePlan.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                            {currentAppleCarePlan.description}
                          </p>
                        </div>

                        {/* Pricing Details Block */}
                        <div className="space-y-1.5 pt-2.5 border-t border-zinc-100">
                          {/* MRP Row */}
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span className="font-semibold text-zinc-500">MRP</span>
                            <div className="flex items-center gap-2">
                              <span className="line-through text-zinc-600 font-semibold">
                                {(() => {
                                  const raw = String(currentAppleCarePlan.mrp || '').replace(/^₹+/, '');
                                  if (!raw) return '₹16,900';
                                  const num = Number(raw.replace(/[^0-9]/g, ''));
                                  return num ? `₹${num.toLocaleString('en-IN')}` : `₹${raw}`;
                                })()}
                              </span>
                            </div>
                          </div>

                          {/* Discount Row */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-500">Discount</span>
                            <span className="font-bold text-[#FF2D55]">
                              {(() => {
                                const d = String(currentAppleCarePlan.discount || '18').trim();
                                if (d.includes('%')) {
                                  return d.startsWith('-') ? d : `-${d}`;
                                }
                                const num = d.replace(/[^0-9]/g, '');
                                return num ? `-${num}%` : '-18%';
                              })()}
                            </span>
                          </div>

                          <div className="border-b border-zinc-100 my-1"></div>

                          {/* Final Price Row */}
                          <div className="flex items-baseline justify-between">
                            <span className="font-extrabold text-[#1D1D1F] text-sm sm:text-base">Final Price</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-[#00875A] tabular-nums tracking-tight">
                              {(() => {
                                const raw = String(currentAppleCarePlan.salePrice || currentAppleCarePlan.yearly || '').replace(/^₹+/, '');
                                if (!raw) return '₹12,844';
                                const num = Number(raw.replace(/[^0-9]/g, ''));
                                return num ? `₹${num.toLocaleString('en-IN')}` : `₹${raw}`;
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1 text-[11px] text-zinc-400 font-medium">
                            <span>GST Paid</span>
                            <span className="text-xs">ⓘ</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM SECTION: 4 Feature Highlights Grid */}
                    <AppleCareFeaturesGrid
                      years={
                        (currentAppleCarePlan.duration || '2 Years')
                          .toString()
                          .replace(/years?/i, '')
                          .trim() || '2'
                      }
                      className="border-t border-zinc-100 pt-4 mt-4"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. Other Product Categories: Preserved Existing AppleCare+ Widget (Strictly excluded for accessories) */}
            {!isEligibleAppleCareDropdown && !isAccessoryProduct(product) && catGroup !== 'accessories' && productAppleCare?.isEnabled !== false && (() => {
              if (isAccessoryProduct(product) || catGroup === 'accessories') return null;
              const catName = product?.category?.name || 'Device';
              const hasSettings = productAppleCare !== null;

              const title = hasSettings 
                ? (productAppleCare.title ?? 'Add AppleCare+') 
                : 'Add AppleCare+';

              const override = productAppleCare?.categoryPrices?.find(
                c => c.categoryName && c.categoryName.toLowerCase() === catName.toLowerCase()
              );

              const monthlyText = (override && override.monthlyPrice !== '')
                ? override.monthlyPrice
                : (hasSettings ? (productAppleCare.monthlyPriceText ?? '') : 'From ₹2817.00/mo.◊');

              const mrpText = (override && override.mrpPrice !== '')
                ? override.mrpPrice
                : (hasSettings ? (productAppleCare.mrpText ?? '') : 'or MRP ₹16900.00 (inclusive of all taxes)');

              const features = hasSettings && Array.isArray(productAppleCare.features)
                ? productAppleCare.features
                : [
                    'Unlimited repairs for accidental damage protection‡',
                    'Apple-certified repairs using genuine Apple parts',
                    '{category}, battery and included accessories covered',
                    'Priority access to Apple experts'
                  ];

              if (hasSettings && !title && !monthlyText && !mrpText && features.length === 0) {
                return null;
              }

              return (
                <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 my-5 shadow-xs text-left select-none relative">
                  {title && (
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src="/applecare_red_logo.png"
                        alt="AppleCare+"
                        className="w-5.5 h-5.5 object-contain shrink-0"
                      />
                      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight tracking-tight">
                        {title}
                      </h3>
                    </div>
                  )}

                  {(monthlyText || mrpText) && (
                    <div className="mt-1.5 space-y-0.5">
                      {monthlyText && <p className="text-sm sm:text-base font-bold text-zinc-900">{monthlyText}</p>}
                      {mrpText && <p className="text-xs sm:text-sm text-zinc-600 font-medium">{mrpText}</p>}
                    </div>
                  )}

                  {features.length > 0 && (
                    <>
                      <hr className="my-4 border-zinc-200" />

                      <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-800 font-medium">
                        {features.map((ft, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-zinc-900 font-bold">•</span>
                            <span>{ft.replace('{category}', catName)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="btnrow">
              <button type="button" onClick={handleAddToCart} className="btn btn-dark">Add to Order →</button>
              <button onClick={handleRequestBulkQuote} className="btn btn-line flex items-center justify-center gap-2">
                Request to WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Specs & Reviews Tabs Section */}
        <div className="border-t border-zinc-200 pt-10 mt-8">
          <div className="tabs flex gap-2 border-b border-zinc-200 mb-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${activeTab === 'specs' ? 'border-black text-black' : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeTab === 'specs' ? (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden p-6 bg-zinc-50/50 space-y-6">
              {/* Single Unified Technical & Hardware Specifications Box */}
              {(() => {
                const featsList = getAllDisplayFeatures();
                const isIpadProduct = (product?.title || product?.name || '').toLowerCase().includes('ipad') ||
                                      (product?.category?.name || product?.category || '').toString().toLowerCase().includes('ipad') ||
                                      (id || '').toLowerCase().includes('ipad');

                if (featsList.length === 0 && !isIpadProduct) return null;

                return (
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest mb-4">Technical & Hardware Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Specifications items */}
                      {featsList.map((displayFeat, fIdx) => {
                        const parts = displayFeat.includes(':') ? displayFeat.split(':') : [null, displayFeat];
                        return (
                          <div key={fIdx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs">
                            <div className="h-2 w-2 rounded-full bg-[#0071e3] mt-1.5 shrink-0" />
                            <div className="text-xs text-left">
                              {parts[0] ? (
                                <>
                                  <span className="font-bold text-zinc-900 mr-1.5">{parts[0].trim()}:</span>
                                  <span className="text-zinc-700 font-medium">{parts.slice(1).join(':').trim()}</span>
                                </>
                              ) : (
                                <span className="font-semibold text-zinc-800">{displayFeat}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* AppleCare+ Dedicated Protection Specs for iPad Pro / iPad Air / iPad (Inside same box grid) */}
                      {isIpadProduct && (() => {
                        const ipadModel = getIpadModelName();
                        return (
                          <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-white border border-blue-200/90 shadow-2xs text-left space-y-3">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-[#0071e3] shrink-0" />
                                <span className="font-bold text-xs text-zinc-900 uppercase tracking-wider">
                                  AppleCare+ for {ipadModel} Coverage
                                </span>
                              </div>
                              <span className="font-extrabold text-[10px] text-[#0071e3] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Apple Official Warranty</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-700 font-medium pt-0.5">
                              <p className="flex items-center gap-2">
                                <span className="text-[#0071e3] font-extrabold text-sm shrink-0">✓</span>
                                <span>Unlimited repairs for accidental damage protection</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-[#0071e3] font-extrabold text-sm shrink-0">✓</span>
                                <span>Apple-certified service and support</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-[#0071e3] font-extrabold text-sm shrink-0">✓</span>
                                <span>Pickup and delivery service</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="text-[#0071e3] font-extrabold text-sm shrink-0">✓</span>
                                <span>Priority access to Apple experts</span>
                              </p>
                              <p className="flex items-center gap-2 md:col-span-2">
                                <span className="text-[#0071e3] font-extrabold text-sm shrink-0">✓</span>
                                <span>Coverage for your {ipadModel}, Apple Pencil, and Apple keyboard, all for a single price</span>
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* 3. AppleCare+ Dedicated Plan Banner for Apple TV */}
              {(product.title?.toLowerCase().includes('apple tv') || product.name?.toLowerCase().includes('apple tv') || product.title?.toLowerCase().includes('tv 4k')) && (
                <div className="p-5 rounded-2xl bg-white border border-blue-200/90 shadow-2xs text-left space-y-3 mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src="/applecare_red_logo.png"
                        alt="AppleCare+"
                        className="w-4 h-4 object-contain shrink-0"
                      />
                      <span className="font-extrabold text-sm text-zinc-900">Add AppleCare+ for Apple TV for ₹2,900.00</span>
                    </div>
                    <span className="font-extrabold text-sm text-[#0071e3]">₹2,900.00</span>
                  </div>
                  <div className="space-y-2 text-xs text-zinc-700 font-medium pt-1">
                    <p className="flex items-center gap-2">
                      <span className="text-[#0071e3] font-bold text-sm">✓</span>
                      Unlimited repairs for accidental damage protection<sup className="text-[9px]">◊</sup>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#0071e3] font-bold text-sm">✓</span>
                      Apple-certified repairs using genuine Apple parts
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-[#0071e3] font-bold text-sm">✓</span>
                      Priority access to Apple experts
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Reviews Summary Rating Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-zinc-50/50 border border-zinc-200 rounded-2xl">
                <div className="text-center space-y-1">
                  <span className="text-4xl font-extrabold text-zinc-900">{product.rating || 5.0}</span>
                  <div className="flex justify-center gap-1 text-amber-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating || 5.0) ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">{reviews.length} Customer Reviews</p>
                </div>

                <div className="md:col-span-2 space-y-2 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : (stars === 5 ? 100 : 0);
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-12 text-zinc-500 font-bold">{stars} Stars</span>
                        <div className="flex-grow h-2 bg-zinc-200 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-900" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-zinc-400 font-semibold text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List of customer reviews */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic p-4 text-center">Be the first to review this product.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-5 border border-zinc-200 rounded-2xl bg-white space-y-3 shadow-sm text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 text-sm">{rev.user?.name || 'Anonymous User'}</span>
                            {rev.isVerified && (
                              <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5 text-amber-500 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {rev.comment && <p className="text-xs text-zinc-650 leading-relaxed text-left">{rev.comment}</p>}
                    </div>
                  ))
                )}
              </div>

              {/* Write a review form */}
              <form onSubmit={handleReviewSubmit} className="p-6 border border-zinc-200 rounded-2xl bg-zinc-50/50 space-y-4 text-left">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wide">Write a Customer Review</h3>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Select Star Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="text-zinc-300 hover:text-amber-500 cursor-pointer p-0 bg-transparent border-none"
                      >
                        <Star className={`h-6 w-6 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Write your Comment</label>
                  <textarea
                    rows="3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you like or dislike about this product..."
                    className="w-full bg-white border border-zinc-200 text-xs rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-black hover:bg-zinc-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

            </div>
          )}
        </div>
      </div>

      {/* Recommended Related Products */}
      {(() => {
        const targetProd = product;
        if (!targetProd || !products || products.length === 0) return null;

        const currentGroup = getCategoryGroup(targetProd);
        const currentProdId = (targetProd._id || targetProd.id || '').toString();

        const relatedList = products.filter(p => {
          const pId = (p._id || p.id || '').toString();
          if (pId === currentProdId) return false;
          return getCategoryGroup(p) === currentGroup;
        }).slice(0, 4);

        if (relatedList.length === 0) return null;

        const categoryTitles = {
          'mac': 'Recommended Mac Lineup',
          'iphone': 'Recommended iPhone Lineup',
          'ipad': 'Recommended iPad Lineup',
          'watch': 'Recommended Apple Watch Models',
          'airpods': 'Recommended AirPods & Audio',
          'tv-home': 'Recommended TV & Home Gear',
          'accessories': 'Recommended Accessories'
        };

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-zinc-100 pt-12 text-left">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block">Explore Similar Gear</span>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight mt-2 mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedList.map((p) => {
                const prodImg = p.displayImage || (p.images && p.images[0]) || p.image || '/macbook_category_v3.jpg';
                return (
                  <Link key={p._id || p.id} to={`/product/${p._id || p.id}`} className="group space-y-3 block">
                    <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-50 border border-zinc-100 p-3 flex items-center justify-center overflow-hidden">
                      <img src={prodImg} alt="" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-350" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{p.brand || 'Apple'}</span>
                      <h4 className="font-bold text-xs text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-650 transition-colors">{p.title || p.name}</h4>
                      <p className="font-extrabold text-xs text-zinc-900 font-sans">
                        ₹{(p.price || p.variants?.[0]?.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}


      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/919971002348"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          backgroundColor: '#25d366',
          color: '#fff',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
          <path d="M12.012 2c-5.508 0-9.985 4.478-9.985 9.985 0 1.758.459 3.412 1.258 4.86L2 22l5.312-1.392c1.4.762 2.99 1.196 4.7 1.196 5.508 0 9.985-4.478 9.985-9.985 0-5.507-4.477-9.985-9.985-9.985zm0 17.986c-1.547 0-3.057-.417-4.375-1.206l-.313-.186-3.255.854.87-3.173-.205-.326c-.868-1.383-1.326-2.986-1.326-4.636 0-4.385 3.567-7.952 7.952-7.952 4.384 0 7.951 3.567 7.951 7.952 0 4.384-3.567 7.952-7.951 7.952zm4.359-5.966c-.239-.12-1.414-.698-1.634-.778-.22-.08-.38-.12-.54.12-.16.24-.62.778-.76.938-.14.16-.28.18-.519.06-.24-.12-1.012-.372-1.927-1.188-.713-.636-1.195-1.423-1.335-1.663-.14-.24-.015-.369.105-.489.108-.108.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.195-.47-.393-.406-.54-.414-.14-.007-.3-.007-.46-.007s-.42.06-.64.3c-.22.24-.84.82-.84 2.002 0 1.182.86 2.324.98 2.484.12.16 1.69 2.58 4.096 3.618.572.247 1.02.394 1.368.504.576.183 1.1.157 1.514.095.462-.069 1.414-.578 1.614-1.138.2-.56.2-1.04.14-1.138-.06-.098-.22-.178-.459-.298z" />
        </svg>
      </a>
    </div>
  );
}
