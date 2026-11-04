import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Star, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { fetchProductById, fetchProducts, setCurrentProduct } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import Loader from '../components/Loader';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';
import { resolveColorHex, resolveColorValue, isValidHex, normalizeHex } from '../utils/colorResolver';

// In-memory cache for processed canvas images to prevent main thread re-processing
const canvasProcessedCache = new Map();

const DEFAULT_APPLECARE_PRICING_TABLES = [
  {
    categoryKey: 'mac',
    rows: [
      { model: 'Mac Mini (M4)', mrp: '₹12900', salePrice: '₹9,804', discount: '24' },
      { model: 'Mac Studio (M4 Max/M3 Ultra)', mrp: '₹19900', salePrice: '₹15,124', discount: '24' },
      { model: 'iMac', mrp: '₹19900.00', salePrice: '₹15,124', discount: '24' },
      { model: 'Macbook Neo', mrp: '16900', salePrice: '₹12,844', discount: '24' },
      { model: 'MacBook Air 13-inch', mrp: '₹22900', salePrice: '₹17,404', discount: '24' },
      { model: 'MacBook Air 15-inch', mrp: '₹24900', salePrice: '₹18,924', discount: '24' },
      { model: 'MacBook Pro 14-inch', mrp: '₹29900', salePrice: '₹22,724', discount: '24' },
      { model: 'MacBook Pro 16-inch', mrp: '₹40900', salePrice: '₹31,084', discount: '24' },
      { model: 'Apple Studio Display', mrp: '14900', salePrice: '₹11,324', discount: '24' },
      { model: 'Studio Display XDR', mrp: '29900', salePrice: '₹22,724', discount: '24' }
    ]
  },
  {
    categoryKey: 'iphone',
    rows: [
      { model: 'iPhone 17e', mrp: '₹16,900', mrp1yr: '₹8,499', mrp2yr: '₹16,900', salePrice: '₹13,858', salePrice1yr: '₹6,969', salePrice2yr: '₹13,858', discount: '18' },
      { model: 'iPhone 17', mrp: '₹19,900', mrp1yr: '₹9,999', mrp2yr: '₹19,900', salePrice: '₹16,318', salePrice1yr: '₹8,199', salePrice2yr: '₹16,318', discount: '18' },
      { model: 'iPhone 16', mrp: '₹19,900', mrp1yr: '₹9,999', mrp2yr: '₹19,900', salePrice: '₹16,318', salePrice1yr: '₹8,199', salePrice2yr: '₹16,318', discount: '18' },
      { model: 'iPhone 17 Pro', mrp: '₹25,900', mrp1yr: '₹12,999', mrp2yr: '₹25,900', salePrice: '₹21,238', salePrice1yr: '₹10,659', salePrice2yr: '₹21,238', discount: '18' },
      { model: 'IPhone 17 pro Max', mrp: '₹25,900', mrp1yr: '₹12,999', mrp2yr: '₹25,900', salePrice: '₹21,238', salePrice1yr: '₹10,659', salePrice2yr: '₹21,238', discount: '18' },
      { model: 'iPhone 18 Pro', mrp: '25900', mrp1yr: '12999', mrp2yr: '25900', salePrice: '₹21,238', salePrice1yr: '₹10,659', salePrice2yr: '₹21,238', discount: '18' },
      { model: 'iPhone 18 Pro Max', mrp: '25900', mrp1yr: '12999', mrp2yr: '25900', salePrice: '₹21,238', salePrice1yr: '₹10,659', salePrice2yr: '₹21,238', discount: '18' },
      { model: 'iPhone Duo', mrp: '51900', mrp1yr: '25999', mrp2yr: '51900', salePrice: '₹42,558', salePrice1yr: '₹21,319', salePrice2yr: '₹42,558', discount: '18' }
    ]
  },
  {
    categoryKey: 'ipad',
    rows: [
      { model: 'iPad Air 11', mrp: '₹17900', mrp1yr: '₹8999', mrp2yr: '₹17900', salePrice: '₹14,678', salePrice1yr: '₹7,379', salePrice2yr: '₹14,678', discount: '18' },
      { model: 'iPad Air 13″', mrp: '₹19900', mrp1yr: '₹9999', mrp2yr: '₹19900', salePrice: '₹16,318', salePrice1yr: '₹8,199', salePrice2yr: '₹16,318', discount: '18' },
      { model: 'iPad Pro 11″', mrp: '₹17,900', mrp1yr: '₹8,999', mrp2yr: '₹17,900', salePrice: '₹14,678', salePrice1yr: '₹7,379', salePrice2yr: '₹14,678', discount: '18' },
      { model: 'iPad Pro 13″', mrp: '₹19,900', mrp1yr: '₹9,999', mrp2yr: '₹19,900', salePrice: '₹16,318', salePrice1yr: '₹8,199', salePrice2yr: '₹16,318', discount: '18' },
      { model: 'Pad (A16)', mrp: '8900', mrp1yr: '₹4,499', mrp2yr: '8900', salePrice: '₹7,298', salePrice1yr: '₹3,689', salePrice2yr: '₹7,298', discount: '18' },
      { model: 'iPad mini', mrp: '₹8900', mrp1yr: '₹4499', mrp2yr: '₹8900', salePrice: '₹7,298', salePrice1yr: '₹3,689', salePrice2yr: '₹7,298', discount: '18' }
    ]
  },
  {
    categoryKey: 'watch',
    rows: [
      { model: 'Apple Watch SE 3', mrp: '5590', mrp1yr: '2,799', mrp2yr: '5590', salePrice: '₹4,584', salePrice1yr: '₹2,295', salePrice2yr: '₹4,584', discount: '18' },
      { model: 'Apple Watch Ultra 4', mrp: '10990', mrp1yr: '5,499', mrp2yr: '10990', salePrice: '₹9,012', salePrice1yr: '₹4,509', salePrice2yr: '₹9,012', discount: '18' },
      { model: 'Apple Watch Series 12', mrp: '8990', mrp1yr: '4,499', mrp2yr: '8990', salePrice: '₹7,372', salePrice1yr: '₹3,689', salePrice2yr: '₹7,372', discount: '18' }
    ]
  },
  {
    categoryKey: 'airpods',
    rows: [
      { model: 'AirPods 5', mrp: '3390', mrp1yr: '1,799.00', mrp2yr: '3390', salePrice: '₹2,780', salePrice1yr: '₹1,475', salePrice2yr: '₹2,780', discount: '18' },
      { model: 'AirPods Pro 3', mrp: '4890', mrp1yr: '2,499.00', mrp2yr: '4890', salePrice: '₹4,010', salePrice1yr: '₹2,049', salePrice2yr: '₹4,010', discount: '18' },
      { model: 'AirPods Max 2', mrp: '6890', mrp1yr: '', mrp2yr: '6890', salePrice: '₹5,650', salePrice1yr: '', salePrice2yr: '₹5,650', discount: '18' }
    ]
  },
  {
    categoryKey: 'tv-home',
    rows: [
      { model: 'Apple TV', mrp: '2,900.00', mrp2yr: '2,900.00', salePrice: '₹2,378', salePrice2yr: '₹2,378', discount: '18' },
      { model: 'HomePod mini', mrp: '₹11600', mrp2yr: '₹11600', salePrice: '₹9,512', salePrice2yr: '₹9,512', discount: '18' },
      { model: 'HomePod', mrp: '3,900.00', mrp2yr: '3,900.00', salePrice: '₹3,198', salePrice2yr: '₹3,198', discount: '18' }
    ]
  },
  {
    categoryKey: 'display',
    rows: [
      { model: 'Studio Display', mrp: '₹14,900.00', mrp2yr: '₹14,900.00', salePrice: '₹12,218', salePrice2yr: '₹12,218', discount: '18' },
      { model: 'Pro Display XDR', mrp: '₹49,900.00', mrp2yr: '₹49,900.00', salePrice: '₹40,918', salePrice2yr: '₹40,918', discount: '18' }
    ]
  }
];

const parsePriceNumber = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = parseInt(val.toString().replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

const cleanModelStr = (s) => {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
};

const isAccessoryProduct = (prod) => {
  if (!prod) return false;
  const cat = prod.category;
  const catName = (cat && typeof cat === 'object') ? (cat.name || cat.title || '').toLowerCase() : (typeof cat === 'string' ? cat.toLowerCase() : '');
  const catSlug = (cat && typeof cat === 'object') ? (cat.slug || '').toLowerCase() : '';
  const title = (prod.title || prod.name || '').toLowerCase();

  // Explicit category match
  if (catName.includes('accessori') || catSlug.includes('accessori')) return true;

  // Direct hardware categories are NOT accessories
  if (['smartphones', 'iphone', 'laptops-pcs', 'mac', 'ipads', 'ipad', 'wearables', 'watch', 'premium-audio', 'airpods', 'tv-home'].includes(catSlug)) {
    return false;
  }

  // Common accessory keywords
  const accessoryKeywords = [
    'case', 'sleeve', 'cover', 'bag', 'backpack', 'folio', 'screen protector',
    'guard', 'film', 'skin', 'stand', 'mount', 'hub', 'dock', 'dongle', 'converter',
    'adapter', 'charger', 'charging', 'cable', 'cord', 'connector', 'strap', 'band', 'loop',
    'magic mouse', 'magic trackpad', 'magic keyboard', 'apple pencil', 'polishing cloth',
    'airtag', 'wallet', 'buckle', 'link'
  ];
  return accessoryKeywords.some(kw => new RegExp('\\b' + kw + '\\b', 'i').test(title));
};

const findMatchingAppleCareRow = (prod, pricingTables) => {
  if (!prod || isAccessoryProduct(prod)) return null;
  const c = cleanModelStr(prod.category?.name || prod.category || '');
  const t = cleanModelStr(prod.title || prod.name || '');

  let catKey = 'mac';
  if (c.includes('smartphone') || c.includes('iphone') || t.includes('iphone')) catKey = 'iphone';
  else if (c.includes('ipad') || t.includes('ipad')) catKey = 'ipad';
  else if (c.includes('wearable') || c.includes('watch') || t.includes('watch')) catKey = 'watch';
  else if (c.includes('audio') || c.includes('airpod') || c.includes('headphone') || t.includes('airpod') || t.includes('earpod')) catKey = 'airpods';
  else if (c.includes('tv') || c.includes('home') || t.includes('homepod') || t.includes('apple tv')) catKey = 'tv-home';
  else if (t.includes('studio display')) catKey = 'mac';
  else if (c.includes('laptop') || c.includes('pc') || c.includes('mac') || t.includes('mac')) catKey = 'mac';

  const table = (pricingTables || []).find(tbl => {
    const k = (tbl.categoryKey || '').toLowerCase();
    if (catKey === 'tv-home') return k === 'tv-home' || k === 'tv' || k === 'homepod';
    return k === catKey;
  });

  if (!table || !table.rows || table.rows.length === 0) return null;
  const rows = table.rows.filter(r => r.isActive !== false);
  if (rows.length === 0) return null;

  // Watch matching
  if (catKey === 'watch') {
    if (/\bse\b/.test(t)) return rows.find(r => cleanModelStr(r.model).includes('se')) || rows[0];
    if (t.includes('ultra')) return rows.find(r => cleanModelStr(r.model).includes('ultra')) || rows[0];
    if (t.includes('series')) return rows.find(r => cleanModelStr(r.model).includes('series')) || rows[0];
    return rows[0];
  }

  // Mac matching
  if (catKey === 'mac') {
    if (t.includes('xdr')) {
      return rows.find(r => cleanModelStr(r.model).includes('xdr')) || rows[0];
    }
    if (t.includes('imac')) {
      return rows.find(r => cleanModelStr(r.model).includes('imac')) || rows[0];
    }
    if (t.includes('studio display')) {
      return rows.find(r => cleanModelStr(r.model).includes('apple studio display') || cleanModelStr(r.model).includes('studio display')) || rows[0];
    }
    if (t.includes('neo')) return rows.find(r => cleanModelStr(r.model).includes('neo')) || rows[0];
    if (t.includes('mini')) return rows.find(r => cleanModelStr(r.model).includes('mini')) || rows[0];
    if (t.includes('studio')) return rows.find(r => cleanModelStr(r.model).includes('studio')) || rows[0];
    if (t.includes('pro')) {
      if (t.includes('16')) return rows.find(r => cleanModelStr(r.model).includes('16')) || rows[0];
      if (t.includes('14')) return rows.find(r => cleanModelStr(r.model).includes('14')) || rows[0];
    }
    if (t.includes('air')) {
      if (t.includes('15')) return rows.find(r => cleanModelStr(r.model).includes('15')) || rows[0];
      if (t.includes('13')) return rows.find(r => cleanModelStr(r.model).includes('13')) || rows[0];
    }
    return rows[0];
  }

  // iPhone matching
  if (catKey === 'iphone') {
    if (t.includes('duo')) return rows.find(r => cleanModelStr(r.model).includes('duo')) || rows[0];
    if (t.includes('18 pro max')) return rows.find(r => cleanModelStr(r.model).includes('18 pro max')) || rows[0];
    if (t.includes('18 pro')) return rows.find(r => cleanModelStr(r.model).includes('18 pro')) || rows[0];
    if (t.includes('17 pro max')) return rows.find(r => cleanModelStr(r.model).includes('17 pro max')) || rows[0];
    if (t.includes('17 pro')) return rows.find(r => cleanModelStr(r.model).includes('17 pro')) || rows[0];
    if (t.includes('17e') || t.includes('16e')) return rows.find(r => cleanModelStr(r.model).includes('17e')) || rows[0];
    if (t.includes('17') || t.includes('air')) return rows.find(r => cleanModelStr(r.model) === 'iphone 17') || rows[0];
    if (t.includes('16')) return rows.find(r => cleanModelStr(r.model).includes('16')) || rows[0];
    return rows[0];
  }

  // iPad matching
  if (catKey === 'ipad') {
    if (t.includes('mini')) return rows.find(r => cleanModelStr(r.model).includes('mini')) || rows[0];
    if (t.includes('pro 13') || t.includes('13 inch ipad pro')) return rows.find(r => cleanModelStr(r.model).includes('pro 13') || (cleanModelStr(r.model).includes('pro') && cleanModelStr(r.model).includes('13'))) || rows[0];
    if (t.includes('air 13') || t.includes('13 inch ipad air')) return rows.find(r => cleanModelStr(r.model).includes('air 13') || (cleanModelStr(r.model).includes('air') && cleanModelStr(r.model).includes('13'))) || rows[0];
    if (t.includes('pro 11') || t.includes('11 inch ipad pro')) return rows.find(r => cleanModelStr(r.model).includes('pro 11') || (cleanModelStr(r.model).includes('pro') && cleanModelStr(r.model).includes('11'))) || rows[0];
    if (t.includes('air 11') || t.includes('11 inch ipad air')) return rows.find(r => cleanModelStr(r.model).includes('air 11') || (cleanModelStr(r.model).includes('air') && cleanModelStr(r.model).includes('11'))) || rows[0];
    if (t.includes('a16') || t.includes('11 inch ipad') || t.includes('ipad')) return rows.find(r => cleanModelStr(r.model).includes('a16') || cleanModelStr(r.model).includes('ipad')) || rows[0];
    return rows[0];
  }

  // AirPods matching
  if (catKey === 'airpods') {
    if (t.includes('max')) return rows.find(r => cleanModelStr(r.model).includes('max')) || rows[0];
    if (t.includes('pro')) return rows.find(r => cleanModelStr(r.model).includes('pro')) || rows[0];
    return rows.find(r => cleanModelStr(r.model).includes('5') || cleanModelStr(r.model).includes('4')) || rows[0];
  }

  // TV & Home matching
  if (catKey === 'tv-home') {
    if (t.includes('mini')) return rows.find(r => cleanModelStr(r.model).includes('mini')) || rows[0];
    if (t.includes('homepod')) return rows.find(r => cleanModelStr(r.model) === 'homepod') || rows[0];
    if (t.includes('tv')) return rows.find(r => cleanModelStr(r.model).includes('tv')) || rows[0];
    return rows[0];
  }

  return rows[0] || null;
};

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
  const [selectedAppleCarePlan, setSelectedAppleCarePlan] = useState('none');
  const [isAppleCareOpen, setIsAppleCareOpen] = useState(false);
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
  const [appleCarePricingTables, setAppleCarePricingTables] = useState(DEFAULT_APPLECARE_PRICING_TABLES);

  const getAppleCarePlanOptions = () => {
    // 0. Remove AppleCare completely for all accessories
    if (isAccessoryProduct(product)) {
      return [];
    }

    const catN = (product?.category?.name || product?.category || 'Mac').toString().toLowerCase();
    const prodT = (product?.title || product?.name || id || '').toString().toLowerCase();
    const isMacProduct = catN.includes('mac') || prodT.includes('mac') || catN.includes('laptop') || prodT.includes('book') || catN.includes('imac');
    const fallbackDiscount = isMacProduct ? 24 : 18;

    // 1. If product has custom plans defined
    if (product?.appleCarePlans && Array.isArray(product.appleCarePlans) && product.appleCarePlans.length > 0) {
      const activePlans = product.appleCarePlans.filter(p => p.isActive !== false);
      if (activePlans.length > 0) {
        return activePlans.map(p => ({
          ...p,
          discount: p.discount ?? fallbackDiscount
        }));
      }
    }

    // 2. If productAppleCare has custom plans defined by admin
    if (productAppleCare?.plans && Array.isArray(productAppleCare.plans) && productAppleCare.plans.length > 0) {
      const activePlans = productAppleCare.plans.filter(p => p.isActive !== false);
      if (activePlans.length > 0) {
        return activePlans.map(p => ({
          ...p,
          discount: p.discount ?? fallbackDiscount
        }));
      }
    }

    // 3. Match from appleCarePricingTables
    const matchedRow = findMatchingAppleCareRow(product, appleCarePricingTables);

    const catName = catN;
    const prodTitle = prodT;

    let catLabel = 'Mac';
    let durationLabel = '3 Years';
    let productSubtitle = '';

    if (catName.includes('mac') || prodTitle.includes('mac') || catName.includes('laptop') || prodTitle.includes('book') || catName.includes('imac')) {
      catLabel = 'Mac';
      durationLabel = '3 Years';

      // Detect specific MacBook Neo with A18 Pro chip
      if (
        (prodTitle.includes('macbook neo') || prodTitle.includes('neo')) &&
        (prodTitle.includes('a18') || prodTitle.includes('13-inch') || prodTitle.includes('13 inch'))
      ) {
        productSubtitle = '13-inch MacBook Neo: Apple A18 Pro chip with 6‑core CPU and 5‑core GPU';
      } else if (prodTitle.includes('macbook neo') || prodTitle.includes('neo')) {
        productSubtitle = 'MacBook Neo: Apple A18 Pro chip with 6‑core CPU and 5‑core GPU';
      }
    } else if (catName.includes('iphone') || prodTitle.includes('iphone') || catName.includes('phone') || catName.includes('smartphone')) {
      catLabel = 'iPhone';
      durationLabel = '2 Years';
    } else if (catName.includes('ipad') || prodTitle.includes('ipad') || catName.includes('tablet')) {
      catLabel = 'iPad';
      durationLabel = '2 Years';
    } else if (catName.includes('watch') || prodTitle.includes('watch') || catName.includes('wearable')) {
      catLabel = 'Apple Watch';
      durationLabel = '2 Years';
    } else if (catName.includes('airpod') || prodTitle.includes('airpod') || catName.includes('audio') || catName.includes('headphone')) {
      catLabel = 'AirPods';
      durationLabel = '2 Years';
    } else if (catName.includes('tv') || prodTitle.includes('tv') || catName.includes('home') || prodTitle.includes('homepod')) {
      if (prodTitle.includes('tv') || catName.includes('tv')) {
        catLabel = 'Apple TV';
        durationLabel = '3 Years';
      } else if (prodTitle.includes('homepod') || catName.includes('homepod')) {
        catLabel = 'HomePod';
        durationLabel = '2 Years';
      } else {
        catLabel = 'Apple TV & Home';
        durationLabel = '3 Years';
      }
    }

    const catDiscount = catLabel === 'Mac' ? 24 : 18;

    // Determine prices from matched row or fallback
    let salePrice2Yr = matchedRow ? parsePriceNumber(matchedRow.salePrice2yr || matchedRow.salePrice || matchedRow.yearly) : 0;
    let mrp2Yr = matchedRow ? parsePriceNumber(matchedRow.mrp2yr || matchedRow.mrp) : 0;

    if (!mrp2Yr && salePrice2Yr) {
      mrp2Yr = Math.round(salePrice2Yr / (1 - catDiscount / 100));
    } else if (mrp2Yr && !salePrice2Yr) {
      salePrice2Yr = Math.round(mrp2Yr * (1 - catDiscount / 100));
    }

    // Category fallbacks if neither row nor price found
    if (!salePrice2Yr) {
      if (catLabel === 'Mac') {
        mrp2Yr = 22900;
        salePrice2Yr = 17404;
      } else if (catLabel === 'iPhone') {
        mrp2Yr = 19900;
        salePrice2Yr = 16318;
      } else if (catLabel === 'iPad') {
        mrp2Yr = 17900;
        salePrice2Yr = 14678;
      } else if (catLabel === 'Apple Watch') {
        mrp2Yr = 8990;
        salePrice2Yr = 7372;
      } else if (catLabel === 'AirPods') {
        mrp2Yr = 3390;
        salePrice2Yr = 2780;
      } else {
        mrp2Yr = 2900;
        salePrice2Yr = 2378;
      }
    }

    let salePrice1Yr = matchedRow ? parsePriceNumber(matchedRow.salePrice1yr) : 0;
    let mrp1Yr = matchedRow ? parsePriceNumber(matchedRow.mrp1yr) : 0;

    if (!mrp1Yr && salePrice1Yr) {
      mrp1Yr = Math.round(salePrice1Yr / (1 - catDiscount / 100));
    } else if (mrp1Yr && !salePrice1Yr) {
      salePrice1Yr = Math.round(mrp1Yr * (1 - catDiscount / 100));
    }

    const plans = [
      {
        id: `${catLabel.toLowerCase().replace(/\s+/g, '_')}_2yr`,
        name: productSubtitle
          ? `AppleCare+ for ${catLabel} (${durationLabel} Coverage)`
          : `AppleCare+ for ${catLabel} (${durationLabel} Coverage)`,
        price: salePrice2Yr,
        mrp: mrp2Yr,
        discount: catDiscount,
        duration: durationLabel,
        description: productSubtitle
          ? `${productSubtitle} — Official ${durationLabel} coverage with unlimited repairs & priority Apple support`
          : `Official ${durationLabel} coverage with unlimited repairs & priority Apple support`
      }
    ];

    // Add 1-Year plan for non-Mac devices if pricing is present (or calculated)
    if (catLabel !== 'Mac') {
      const finalPrice1Yr = salePrice1Yr || (mrp1Yr ? Math.round(mrp1Yr * (1 - catDiscount / 100)) : (catLabel === 'Apple TV' || catLabel === 'HomePod' || prodTitle.includes('max') ? 0 : Math.round(salePrice2Yr * 0.5)));
      const finalMrp1Yr = mrp1Yr || (finalPrice1Yr > 0 ? Math.round(finalPrice1Yr / (1 - catDiscount / 100)) : 0);

      if (finalPrice1Yr > 0) {
        plans.push({
          id: `${catLabel.toLowerCase().replace(/\s+/g, '_')}_1yr`,
          name: `AppleCare+ for ${catLabel} (1 Year Coverage)`,
          price: finalPrice1Yr,
          mrp: finalMrp1Yr,
          discount: catDiscount,
          duration: '1 Year',
          description: productSubtitle
            ? `${productSubtitle} — Official 1-Year hardware protection & accidental damage coverage`
            : 'Official 1-Year hardware protection & accidental damage coverage'
        });
      }
    }

    return plans;
  };

  useEffect(() => {
    if (!id) return;
    fetchReviews();
    fetchAppleCareSettings();
  }, [id]);

  useEffect(() => {
    fetchAppleCareSettings();
    const unsub = subscribeToLiveSync(() => {
      fetchAppleCareSettings();
    });
    return () => unsub();
  }, []);

  const fetchAppleCareSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data?.productAppleCare) {
        setProductAppleCare(response.data.productAppleCare);
      }
      if (response.data?.appleCarePricingTables && Array.isArray(response.data.appleCarePricingTables) && response.data.appleCarePricingTables.length > 0) {
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

  const getCategoryGroup = (prod) => {
    if (!prod) return 'other';
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

    // 3. Accessories Title Match
    const isExplicitAccessoryTitle = [
      'case', 'sleeve', 'cover', 'bag', 'backpack', 'folio', 'screen protector',
      'guard', 'film', 'skin', 'stand', 'mount', 'hub', 'dock', 'dongle', 'converter',
      'adapter', 'charger', 'charging', 'cable', 'cord', 'connector', 'strap', 'band', 'loop'
    ].some(kw => title.includes(kw));

    if (isExplicitAccessoryTitle) return 'accessories';

    return catName || 'other';
  };

  const isValidCurrentProduct = currentProduct &&
    (currentProduct._id === id || currentProduct.id === id || currentProduct.slug === id);

  const localProduct = getProductFromStore(id);
  const product = isValidCurrentProduct ? currentProduct : localProduct;

  useEffect(() => {
    const rawTarget = activeImage || (selectedColor ? (colors.find(c => c.name === selectedColor.name)?.image || product?.images?.[0]) : (product?.displayImage || colors[0]?.image || product?.images?.[0] || product?.image)) || '';
    if (!rawTarget) return;

    let isMounted = true;
    let targetSrc = rawTarget.trim();
    if (targetSrc.startsWith('uploads/')) targetSrc = `/${targetSrc}`;

    setProcessedImage(targetSrc);

    if (canvasProcessedCache.has(targetSrc)) {
      setProcessedImage(canvasProcessedCache.get(targetSrc));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = targetSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;
        if (origW === 0 || origH === 0) return;

        // Downsample to max 350px for super-fast background threshold calculation (<2ms)
        const maxDim = 350;
        let w = origW;
        let h = origH;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const samplePoints = [
          [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
          [Math.floor(w / 2), 0], [0, Math.floor(h / 2)],
          [w - 1, Math.floor(h / 2)], [Math.floor(w / 2), h - 1]
        ];

        let bgR = 0, bgG = 0, bgB = 0, validSamples = 0;
        samplePoints.forEach(([x, y]) => {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] > 200) {
            bgR += data[idx];
            bgG += data[idx + 1];
            bgB += data[idx + 2];
            validSamples++;
          }
        });

        if (validSamples > 0) {
          bgR = Math.round(bgR / validSamples);
          bgG = Math.round(bgG / validSamples);
          bgB = Math.round(bgB / validSamples);

          // Clean off-white/light-grey background colors (> 180, e.g. #f5f5f7 or #f0f0f2)
          if (bgR > 180 && bgG > 180 && bgB > 180) {
            const tolerance = 45;
            let modified = false;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              if (a > 0) {
                const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
                if (diff <= tolerance) {
                  data[i + 3] = 0;
                  modified = true;
                } else if (diff <= tolerance + 25) {
                  const factor = (diff - tolerance) / 25;
                  data[i + 3] = Math.round(a * factor);
                  modified = true;
                }
              }
            }

            if (modified && isMounted) {
              ctx.putImageData(imgData, 0, 0);
              const processedUrl = canvas.toDataURL('image/png');
              canvasProcessedCache.set(targetSrc, processedUrl);
              setProcessedImage(processedUrl);
              return;
            }
          }
        }
      } catch (e) {
        // Fallback for CORS or canvas errors
      }
      canvasProcessedCache.set(targetSrc, targetSrc);
      if (isMounted) setProcessedImage(targetSrc);
    };

    img.onerror = () => {
      canvasProcessedCache.set(targetSrc, targetSrc);
      if (isMounted) setProcessedImage(targetSrc);
    };

    return () => { isMounted = false; };
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

  let sizes = product?.sizes || [];
  if (sizes.length === 0 && product?.variants && product.variants.length > 0) {
    const uniqueSizes = [];
    product.variants.forEach(v => {
      if (v.size && !uniqueSizes.includes(v.size)) {
        uniqueSizes.push(v.size);
      }
    });
    sizes = uniqueSizes;
  }

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

  let bandSizes = Array.isArray(product?.bandSizes) ? [...product.bandSizes] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.bandSize) {
        const trimmedB = v.bandSize.toString().trim();
        if (trimmedB && !bandSizes.some(b => b.toLowerCase() === trimmedB.toLowerCase())) {
          bandSizes.push(trimmedB);
        }
      }
    });
  }

  let accessoriesSizes = [];
  const rawAccSizes = Array.isArray(product?.accessoriesSizes) ? [...product.accessoriesSizes] : [];
  if (product?.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.accessoriesSize && v.accessoriesSize !== 'None' && v.accessoriesSize !== 'Not Applicable') {
        rawAccSizes.push(v.accessoriesSize);
      }
    });
  }
  rawAccSizes.forEach(accSz => {
    const trimmed = (accSz || '').toString().trim();
    if (trimmed && trimmed !== 'None' && !accessoriesSizes.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      accessoriesSizes.push(trimmed);
    }
  });

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
    return '/accessories';
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

        if (matchedVar.bandSize) setSelectedBandSize(matchedVar.bandSize);
        else if (bandSizes.length > 0) setSelectedBandSize(bandSizes[0]);

        if (matchedVar.accessoriesSize && matchedVar.accessoriesSize !== 'None') setSelectedAccessoriesSize(matchedVar.accessoriesSize);
        else if (accessoriesSizes.length > 0) setSelectedAccessoriesSize(accessoriesSizes[0]);
        else setSelectedAccessoriesSize('');

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
        setSelectedSize(sizes.length > 0 ? sizes[0] : '');
        setSelectedStorage(storages.length > 0 ? storages[0] : '');
        setSelectedRam(rams.length > 0 ? rams[0] : '');
        setSelectedGlass(glasses.length > 0 ? glasses[0] : '');
        setSelectedConnectivity(connectivities.length > 0 ? connectivities[0] : '');
        setSelectedBandSize(bandSizes.length > 0 ? bandSizes[0] : '');
        setSelectedAccessoriesSize(accessoriesSizes.length > 0 ? accessoriesSizes[0] : '');

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

  const pricingInfo = getVariantPricingInfo();
  
  const appleCarePlans = getAppleCarePlanOptions();
  const activeAppleCarePlan = selectedAppleCarePlan !== 'none'
    ? appleCarePlans.find(p => p.id === selectedAppleCarePlan)
    : null;
  const appleCareCost = activeAppleCarePlan ? (Number(activeAppleCarePlan.price) || 0) : 0;
  const selectedAppleCare = !!activeAppleCarePlan;

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
    if (selectedAccessoriesSize && selectedAccessoriesSize !== 'None') detailsArr.push(`Size: ${selectedAccessoriesSize}`);
    if (selectedSize) detailsArr.push(selectedSize);
    if (selectedBandSize) detailsArr.push(`Band: ${selectedBandSize}`);
    if (colorName) detailsArr.push(colorName);
    if (selectedConnectivity) detailsArr.push(selectedConnectivity);
    if (selectedStorage) detailsArr.push(selectedStorage);
    if (glassVal && glassVal !== selectedConnectivity) detailsArr.push(glassVal);
    if (selectedRam) detailsArr.push(selectedRam);
    if (processorVal && ((product.title || product.name || '').toLowerCase().includes('mac') || (product.title || product.name || '').toLowerCase().includes('ipad'))) {
      detailsArr.push(processorVal);
    }
    if (selectedAppleCare && activeAppleCarePlan) {
      detailsArr.push(`${activeAppleCarePlan.name} (₹${appleCareCost.toLocaleString('en-IN')})`);
    }
    if (partNum) detailsArr.push(`MPN: ${partNum}`);

    const nameDetails = detailsArr.join(' / ');

    try {
      const result = await dispatch(addToCart({
        id: `${id}-${selectedAccessoriesSize || 'nosz'}-${selectedSize || 'std'}-${selectedBandSize || 'std'}-${selectedConnectivity || 'std'}-${selectedStorage || 'std'}-${selectedRam || 'std'}-${glassVal || 'std'}-${selectedAppleCare ? (activeAppleCarePlan?.id || 'ac') : 'noac'}-${colorName}`,
        name: `${cleanProductTitle(product.name || product.title)} (${nameDetails})`,
        price: unitPrice,
        image: activeImage || processedImage || colors[0]?.image || product.images?.[0] || product.image,
        quantity,
        size: selectedSize,
        accessoriesSize: selectedAccessoriesSize,
        bandSize: selectedBandSize,
        connectivity: selectedConnectivity,
        storage: selectedStorage,
        glass: glassVal,
        processor: processorVal,
        partNumber: partNum,
        ram: selectedRam,
        color: colorName,
        appleCare: selectedAppleCare ? (activeAppleCarePlan?.name || true) : false,
        appleCarePlan: activeAppleCarePlan?.name || '',
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
    if (selectedAppleCare && activeAppleCarePlan) {
      message += `🛡️ *Protection:* ${activeAppleCarePlan.name} (+₹${appleCareCost.toLocaleString('en-IN')})\n`;
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
    const rawFeats = product?.features && Array.isArray(product.features) && product.features.length > 0
      ? [...product.features]
      : [];

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
              <label className="block text-base font-semibold text-zinc-900 mb-3 text-left">
                Colour – <span className="text-zinc-700 font-normal">{colorName}</span>
              </label>
              <div className="swatches flex items-center gap-2">
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
                      className="relative w-11 h-11 flex items-center justify-center cursor-pointer group focus:outline-hidden border-0 bg-transparent p-0 transition-transform duration-200"
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

            {/* Accessories Size options (XXS, XS, Small, Medium, Large) */}
            {accessoriesSizes && accessoriesSizes.length > 0 && (
              <div className="optgroup mb-8 text-left">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                  Accessories Size
                </label>
                <div className="optrow flex flex-wrap gap-3">
                  {accessoriesSizes.map((accSz) => (
                    <div
                      key={accSz}
                      onClick={() => setSelectedAccessoriesSize(accSz)}
                      className={`opt ${selectedAccessoriesSize === accSz ? 'active' : ''}`}
                    >
                      {accSz}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size / Case Size options */}
            {sizes && sizes.length > 0 && (
              <div className="optgroup mb-8">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
                  {(product?.category?.name || product?.category || '').toString().toLowerCase().includes('watch') ? 'Case Size' : 'Size / Model'}
                </label>
                <div className="optrow flex flex-wrap gap-3">
                  {sizes.map((sz) => (
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

            {/* Band Size options (S/M, M/L) */}
            {bandSizes && bandSizes.length > 0 && (
              <div className="optgroup mb-8">
                <label className="block text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Band Size</label>
                <div className="optrow flex flex-wrap gap-3">
                  {bandSizes.map((bs) => (
                    <div
                      key={bs}
                      onClick={() => setSelectedBandSize(bs)}
                      className={`opt ${selectedBandSize === bs ? 'active' : ''}`}
                    >
                      {bs}
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

            {/* Add AppleCare+ (Hidden for all accessories) */}
            {productAppleCare?.isEnabled !== false && !isAccessoryProduct(product) && (() => {
              const availablePlans = getAppleCarePlanOptions();
              if (!availablePlans || availablePlans.length === 0) return null;

              const hasSettings = productAppleCare !== null;
              const acTitle = hasSettings
                ? (productAppleCare.title ?? 'Add AppleCare+')
                : 'Add AppleCare+';
              const productImg = activeImage || processedImage || colors[0]?.image || product?.images?.[0] || product?.image;
              const prodDisplayName = cleanProductTitle(product?.name || product?.title || '');
              const prodSKU = product?.partNumber || product?.modelNumber || product?.sku || null;

              const catN = (product?.category?.name || product?.category || '').toString().toLowerCase();
              const ptN = (product?.title || product?.name || '').toString().toLowerCase();
              const isMac = catN.includes('mac') || ptN.includes('mac') || ptN.includes('book') || catN.includes('laptop') || ptN.includes('imac');
              const isWatch = catN.includes('watch') || ptN.includes('watch');
              const isAirPods = catN.includes('airpod') || ptN.includes('airpod') || catN.includes('headphone') || ptN.includes('headphone') || catN.includes('audio') || ptN.includes('audio');
              const isPhone = catN.includes('phone') || ptN.includes('phone') || catN.includes('iphone') || ptN.includes('iphone');
              const isIpad = catN.includes('ipad') || ptN.includes('ipad') || catN.includes('tablet');
              const isTvHome = catN.includes('tv') || catN.includes('home') || ptN.includes('tv') || ptN.includes('homepod');

              const benefits = isMac ? [
                { icon: '🔧', label: '3 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '🔋', label: 'Battery service\ncoverage' },
              ] : isWatch ? [
                { icon: '🔧', label: '2 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '📱', label: 'Crack screen\ncoverage' },
              ] : isAirPods ? [
                { icon: '🔧', label: '2 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '🎧', label: 'Battery service\ncoverage' },
              ] : isPhone ? [
                { icon: '🔧', label: '2 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '📱', label: 'Screen & back glass\ndamage coverage' },
              ] : isIpad ? [
                { icon: '🔧', label: '2 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '✏️', label: 'Apple Pencil &\nkeyboard coverage' },
              ] : [
                { icon: '🔧', label: '2 Years Peace of Mind\nwith AppleCare+' },
                { icon: '💬', label: 'Priority access to\ntechnical support' },
                { icon: '🛡️', label: 'Unlimited Damage\nProtection' },
                { icon: '🔋', label: 'Battery service\ncoverage' },
              ];

              const displayPlan = (selectedAppleCarePlan && selectedAppleCarePlan !== 'none'
                ? availablePlans.find(p => p.id === selectedAppleCarePlan)
                : null) || availablePlans[0];
              const displayFinal = displayPlan ? Number(displayPlan.price) : 0;
              const displayDiscount = displayPlan?.discount ?? (isMac ? 24 : 18);
              const displayMrp = displayPlan?.mrp ? Number(displayPlan.mrp) : (displayFinal > 0 ? Math.round(displayFinal / (1 - displayDiscount / 100)) : 0);
              const displayDuration = displayPlan?.duration || (isMac ? '3 Years' : '2 Years');

              return (
                <div
                  className={`bg-white border rounded-2xl my-4 shadow-sm transition-all duration-300 overflow-hidden ${
                    selectedAppleCare ? 'border-zinc-300' : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {/* Header */}
                  <div
                    onClick={() => setIsAppleCareOpen(prev => !prev)}
                    className="px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-zinc-50/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-6 h-6 text-[#E30000] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.11-1 .04-2.19.67-2.9 1.49-.64.74-1.2 1.92-1.05 3.05 1.12.09 2.29-.61 2.96-1.43z" />
                      </svg>
                      <span className="text-base font-semibold text-zinc-900 tracking-tight">{acTitle}</span>
                      {selectedAppleCare && activeAppleCarePlan && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Added
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 shrink-0 ${isAppleCareOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded */}
                  {isAppleCareOpen && (
                    <div className="border-t border-zinc-100">
                      <div className="flex flex-col sm:flex-row gap-0 border-b border-zinc-100">

                        {/* Left — product image */}
                        <div className="sm:w-48 shrink-0 bg-zinc-50 flex flex-col items-center justify-center p-4 gap-1.5 border-b sm:border-b-0 sm:border-r border-zinc-100">
                          <div className="relative w-full flex flex-col items-center">
                            <span className="absolute top-0 left-0 text-[10px] font-bold bg-[#E30000] text-white px-2 py-0.5 rounded-full leading-tight z-10">
                              Apple Care+
                            </span>
                            {productImg ? (
                              <img src={productImg} alt={prodDisplayName} className="w-24 h-20 object-contain mt-5" />
                            ) : (
                              <div className="w-24 h-20 flex items-center justify-center mt-5">
                                <svg className="w-14 h-14 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.11-1 .04-2.19.67-2.9 1.49-.64.74-1.2 1.92-1.05 3.05 1.12.09 2.29-.61 2.96-1.43z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex gap-1 mt-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 inline-block" />
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block" />
                            </div>
                          </div>
                          <div className="text-center mt-1">
                            <p className="text-xs font-semibold text-zinc-800 flex items-center justify-center gap-1">
                              <svg className="w-3 h-3 text-zinc-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.11-1 .04-2.19.67-2.9 1.49-.64.74-1.2 1.92-1.05 3.05 1.12.09 2.29-.61 2.96-1.43z" />
                              </svg>
                              {prodDisplayName}
                            </p>
                            {prodSKU && <p className="text-[10px] text-zinc-400 mt-0.5">SKU: {prodSKU}</p>}
                          </div>
                        </div>

                        {/* Right — plan details */}
                        <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold text-[#E30000] tracking-widest uppercase mb-1">Apple Care+</p>
                            <h4 className="text-sm font-bold text-zinc-900 leading-snug mb-1">AppleCare+ for {prodDisplayName}</h4>
                            <p className="text-xs text-zinc-500 mb-3">
                              Enjoy {displayDuration} of peace of mind when you buy AppleCare+ for {isMac ? 'Mac' : isWatch ? 'Apple Watch' : isAirPods ? 'AirPods' : isPhone ? 'iPhone' : isIpad ? 'iPad' : isTvHome ? 'TV & Home' : 'your device'}
                            </p>
                            <div className="space-y-1 text-sm border-t border-zinc-100 pt-3">
                              <div className="flex justify-between items-center text-zinc-500 text-xs">
                                <span>MRP</span>
                                <span className="line-through text-zinc-400">₹{displayMrp.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-500 text-xs">
                                <span>Discount</span>
                                <span className="text-[#E30000] font-semibold">-{displayDiscount}%</span>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-zinc-100 mt-1">
                                <span className="font-bold text-zinc-900 text-sm">Final Price</span>
                                <div className="text-right">
                                  <span className="text-lg font-extrabold text-[#1a7f3c]">₹{displayFinal.toLocaleString('en-IN')}</span>
                                  <p className="text-[10px] text-zinc-400">GST Paid ⓘ</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Radio options — Mac: 3yr only | Others: 1yr + 2yr */}
                          <div className="space-y-2 pt-1">
                            {availablePlans.filter(p => isMac ? !p.id.endsWith('_1yr') : true).map((plan) => {
                              const isSel = selectedAppleCarePlan === plan.id;
                              return (
                                <div
                                  key={plan.id}
                                  onClick={() => setSelectedAppleCarePlan(isSel ? 'none' : plan.id)}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs select-none ${
                                    isSel ? 'border-[#0071e3] bg-blue-50/40 font-semibold text-zinc-900' : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSel ? 'border-[#0071e3]' : 'border-zinc-300'}`}>
                                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />}
                                  </div>
                                  <span className="truncate">{plan.name}</span>
                                  <span className={`ml-auto font-bold shrink-0 ${isSel ? 'text-[#0071e3]' : 'text-zinc-700'}`}>
                                    +₹{Number(plan.price).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Benefits row */}
                      <div className="grid grid-cols-4 divide-x divide-zinc-100">
                        {benefits.map((b, i) => (
                          <div key={i} className="flex flex-col items-center justify-start gap-1.5 px-2 py-3 text-center">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-sm shrink-0">{b.icon}</div>
                            <p className="text-[9px] text-zinc-600 font-medium leading-tight whitespace-pre-line">{b.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
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


    </div>
  );
}
