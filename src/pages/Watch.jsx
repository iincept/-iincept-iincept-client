import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, SlidersHorizontal, ArrowUpDown, X, ShoppingBag, ChevronLeft, ChevronRight, ShieldCheck, Wrench, Headphones, Check } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';
import { addToWishlist } from '../redux/wishlistSlice';
import { fetchProducts } from '../redux/productSlice';
import { matchesProductSearch, normalizeTargetPath } from '../utils/searchUtils';
import { getProductCardPricing } from '../utils/pricingUtils';
import { prefetchProduct } from '../utils/prefetchUtils';
import axiosClient from '../services/axiosClient';
import { subscribeToLiveSync } from '../services/liveSyncService';
import CleanProductImage from '../components/CleanProductImage';
import { resolveColorValue } from '../utils/colorResolver';
import AppleCareFeaturesGrid from '../components/AppleCareFeaturesGrid';

// Default Watch AppleCare rows fallback
const DEFAULT_WATCH_APPLECARE_ROWS = [
  { 
    model: 'Apple Watch SE', 
    title: 'AppleCare+ for Apple Watch SE', 
    description: 'Apple-certified coverage for Apple Watch SE with accidental damage protection.', 
    description1yr: '1 Year Apple-certified coverage for Apple Watch SE with accidental damage protection.',
    description2yr: '2 Years Apple-certified coverage for Apple Watch SE with accidental damage protection.',
    sku: 'AC-WATCH-SE', 
    sku1yr: 'AC-WATCH-SE-1YR',
    sku2yr: 'AC-WATCH-SE-2YR',
    mrp: '₹5,900.00', 
    mrp1yr: '₹3,900.00',
    mrp2yr: '₹5,900.00',
    discount: '16% OFF', 
    discount1yr: '10% OFF',
    discount2yr: '16% OFF',
    salePrice: '₹4,900.00', 
    salePrice1yr: '₹3,510.00',
    salePrice2yr: '₹4,900.00',
    monthly: '₹249.00', 
    yearly: '₹4,900.00', 
    image: '/watch_nav/apple_watch_se.png', 
    isActive: true 
  },
  { 
    model: 'Apple Watch SE 3', 
    title: 'AppleCare+ for Apple Watch SE 3 (40mm & 44mm)', 
    description: 'Apple-certified coverage for Apple Watch SE 3 with accidental damage protection.', 
    description1yr: '1 Year Apple-certified coverage for Apple Watch SE 3 with accidental damage protection.',
    description2yr: '2 Years Apple-certified coverage for Apple Watch SE 3 with accidental damage protection.',
    sku: 'AC-WATCH-SE3', 
    sku1yr: 'AC-WATCH-SE3-1YR',
    sku2yr: 'AC-WATCH-SE3-2YR',
    mrp: '₹5,900.00', 
    mrp1yr: '₹3,900.00',
    mrp2yr: '₹5,900.00',
    discount: '16% OFF', 
    discount1yr: '10% OFF',
    discount2yr: '16% OFF',
    salePrice: '₹4,900.00', 
    salePrice1yr: '₹3,510.00',
    salePrice2yr: '₹4,900.00',
    monthly: '₹249.00', 
    yearly: '₹4,900.00', 
    image: '/watch_nav/apple_watch_se.png', 
    isActive: true 
  },
  { 
    model: 'Apple Watch Series 10', 
    title: 'AppleCare+ for Apple Watch Series 10', 
    description: 'Apple-certified coverage for Apple Watch Series 10 with accidental damage protection.', 
    description1yr: '1 Year Apple-certified coverage for Apple Watch Series 10 with accidental damage protection.',
    description2yr: '2 Years Apple-certified coverage for Apple Watch Series 10 with accidental damage protection.',
    sku: 'AC-WATCH-S10', 
    sku1yr: 'AC-WATCH-S10-1YR',
    sku2yr: 'AC-WATCH-S10-2YR',
    mrp: '₹8,900.00', 
    mrp1yr: '₹5,900.00',
    mrp2yr: '₹8,900.00',
    discount: '12% OFF', 
    discount1yr: '10% OFF',
    discount2yr: '12% OFF',
    salePrice: '₹7,900.00', 
    salePrice1yr: '₹5,310.00',
    salePrice2yr: '₹7,900.00',
    monthly: '₹399.00', 
    yearly: '₹7,900.00', 
    image: '/watch_nav/apple_watch_s10.png', 
    isActive: true 
  },
  { 
    model: 'Apple Watch Ultra 2', 
    title: 'AppleCare+ for Apple Watch Ultra 2', 
    description: 'Apple-certified coverage for Apple Watch Ultra 2 with accidental damage protection.', 
    description1yr: '1 Year Apple-certified coverage for Apple Watch Ultra 2 with accidental damage protection.',
    description2yr: '2 Years Apple-certified coverage for Apple Watch Ultra 2 with accidental damage protection.',
    sku: 'AC-WATCH-ULTRA', 
    sku1yr: 'AC-WATCH-ULTRA-1YR',
    sku2yr: 'AC-WATCH-ULTRA-2YR',
    mrp: '₹11,900.00', 
    mrp1yr: '₹7,900.00',
    mrp2yr: '₹11,900.00',
    discount: '16% OFF', 
    discount1yr: '10% OFF',
    discount2yr: '16% OFF',
    salePrice: '₹9,900.00', 
    salePrice1yr: '₹7,110.00',
    salePrice2yr: '₹9,900.00',
    monthly: '₹499.00', 
    yearly: '₹9,900.00', 
    image: '/watch_nav/apple_watch_ultra.png', 
    isActive: true 
  }
];

const WATCH_SUB_NAV_ITEMS = [
  { name: 'Apple Watch Series 11', query: 'Series', image: '/watch_nav/watch_series_10.png', scale: 'scale-100' },
  { name: 'Apple Watch Ultra 3', query: 'Ultra', image: '/watch_nav/watch_ultra_2.png', scale: 'scale-100' },
  { name: 'Apple Watch SE 3', query: 'SE', image: '/watch_nav/watch_se.png', scale: 'scale-95' },
  { name: 'AppleCare+', path: '/watch?tab=applecare', image: '/applecare_official_hero.png', scale: 'scale-100' },
  { name: 'Compare', path: '/compare?category=watch', image: '/watch_nav/watch_compare.png', scale: 'scale-100' }
];

const resolveSubItemPath = (item) => {
  const nameLower = (item?.name || item?.label || '').toLowerCase();
  const queryLower = (item?.query || '').toLowerCase();
  const pathLower = (item?.path || '').toLowerCase();

  if (nameLower.includes('care') || queryLower.includes('care') || pathLower.includes('care')) {
    return '/watch?tab=applecare';
  }
  if (nameLower.includes('compare') || queryLower.includes('compare') || pathLower.includes('compare')) {
    return '/compare?category=watch';
  }
  if (item?.path && item.path.trim()) {
    const normalized = normalizeTargetPath(item.path.trim());
    if (normalized && normalized !== '/watch') return normalized;
  }
  const queryVal = item?.query || item?.label || item?.name || '';
  if (queryVal && queryVal.trim()) {
    return `/watch?search=${encodeURIComponent(queryVal.trim())}`;
  }
  return '/watch';
};

const ensureAppleCareInSubItems = (items = []) => {
  if (!items || items.length === 0) return WATCH_SUB_NAV_ITEMS;

  let careItem = items.find(item => (item.name || item.label || '').toLowerCase().includes('care'));
  if (!careItem) {
    careItem = {
      name: 'AppleCare+',
      path: '/watch?tab=applecare',
      image: '/applecare_official_hero.png',
      scale: 'scale-100'
    };
  }

  let compareItem = items.find(item => (item.name || item.label || '').toLowerCase().includes('compare'));
  const regularItems = items.filter(item => {
    const lbl = (item.name || item.label || '').toLowerCase();
    return !lbl.includes('care') && !lbl.includes('compare');
  });

  const result = [...regularItems];
  if (compareItem) result.push(compareItem);
  result.push(careItem);

  return result;
};

const getInitialSubItems = (categoryKey, defaultItems) => {
  try {
    const cached = localStorage.getItem(`iincept_sub_items_v2_${categoryKey}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ensureAppleCareInSubItems(parsed);
      }
    }
  } catch (e) {}
  return ensureAppleCareInSubItems(defaultItems);
};

const resolveIconImage = (img, label) => {
  if (img && typeof img === 'string' && img.trim()) {
    let clean = img.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:') && !clean.startsWith('blob:') && !clean.startsWith('/')) {
      clean = '/' + clean;
    }
    return clean;
  }
  const lblLower = (label || '').toLowerCase().trim();
  if (lblLower.includes('care')) return '/applecare_official_hero.png';
  const matched = WATCH_SUB_NAV_ITEMS.find(m => m.name.toLowerCase().trim() === lblLower);
  return matched?.image || '/watch_nav/watch_series_10.png';
};

const getModelImageByName = (modelName = '') => {
  const m = modelName.toLowerCase();
  if (m.includes('ultra')) return '/watch_nav/watch_ultra_2.png';
  if (m.includes('se')) return '/watch_nav/watch_se.png';
  return '/watch_nav/watch_series_10.png';
};

const parsePriceNumber = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const calculateFinalPriceStr = (mrp, discount) => {
  const mrpNum = parsePriceNumber(mrp);
  const discNum = Math.min(100, Math.max(0, parseFloat(discount) || 0));
  const finalNum = Math.max(0, Math.round(mrpNum - (mrpNum * discNum / 100)));
  return `₹${finalNum.toLocaleString('en-IN')}`;
};

const resolve1YrDetails = (row) => {
  const defaultRow = DEFAULT_WATCH_APPLECARE_ROWS.find(d => 
    (d.model && row.model && d.model.toLowerCase().trim() === row.model.toLowerCase().trim()) ||
    (d.title && row.title && d.title.toLowerCase().trim() === row.title.toLowerCase().trim())
  ) || {};

  const mrp = row.mrp1yr || defaultRow.mrp1yr || '₹3,900.00';
  const discount = (row.discount1yr !== undefined && row.discount1yr !== null && row.discount1yr !== '') ? String(row.discount1yr) : (defaultRow.discount1yr || '10% OFF');
  const salePrice = row.salePrice1yr || defaultRow.salePrice1yr || calculateFinalPriceStr(mrp, discount);
  const sku = row.sku1yr || defaultRow.sku1yr || (row.sku ? `${row.sku.replace(/-2YR$/i, '')}-1YR` : 'AC-WATCH-1YR');
  const description = row.description1yr || defaultRow.description1yr || `1 Year Apple-certified coverage for ${row.model || 'Apple Watch'}.`;

  return { mrp, discount, salePrice, sku, description };
};

const resolve2YrDetails = (row) => {
  const defaultRow = DEFAULT_WATCH_APPLECARE_ROWS.find(d => 
    (d.model && row.model && d.model.toLowerCase().trim() === row.model.toLowerCase().trim()) ||
    (d.title && row.title && d.title.toLowerCase().trim() === row.title.toLowerCase().trim())
  ) || {};

  const mrp = row.mrp2yr || row.mrp || defaultRow.mrp2yr || defaultRow.mrp || '₹5,900.00';
  const discount = (row.discount2yr !== undefined && row.discount2yr !== null && row.discount2yr !== '') ? String(row.discount2yr) : ((row.discount !== undefined && row.discount !== null && row.discount !== '') ? String(row.discount) : (defaultRow.discount2yr || defaultRow.discount || '16% OFF'));
  const salePrice = row.salePrice2yr || row.salePrice || row.yearly || defaultRow.salePrice2yr || defaultRow.salePrice || calculateFinalPriceStr(mrp, discount);
  const sku = row.sku2yr || row.sku || defaultRow.sku2yr || defaultRow.sku || 'AC-WATCH-2YR';
  const description = row.description2yr || row.description || defaultRow.description2yr || defaultRow.description || `2 Years Apple-certified coverage for ${row.model || 'Apple Watch'}.`;

  return { mrp, discount, salePrice, sku, description };
};

const getInitialAppleCareData = () => {
  try {
    const cached = localStorage.getItem('iincept_watch_applecare_cache_v2');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        return {
          headerTitle: parsed.headerTitle || 'AppleCare+',
          durationLabel: parsed.durationLabel || '2 Years',
          rows: parsed.rows,
          isCached: true
        };
      }
    }
  } catch (e) {}
  return {
    headerTitle: 'AppleCare+',
    durationLabel: '2 Years',
    rows: [],
    isCached: false
  };
};

const WatchAppleCareSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto my-6 animate-pulse">
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-200/60 overflow-hidden shadow-xs p-6 sm:p-10 text-left">
        <div className="border-b border-zinc-100 pb-4 mb-4 text-center flex justify-center">
          <div className="h-10 w-48 sm:w-64 bg-zinc-200/70 rounded-xl mb-1"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 items-stretch">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full min-h-[480px]"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-5 bg-zinc-50 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between min-h-[260px] sm:min-h-[280px] h-full border border-zinc-100">
                    <div className="w-20 h-5 bg-zinc-200/70 rounded-full self-start mb-1"></div>
                    <div className="w-24 h-28 bg-zinc-200/60 rounded-lg my-1"></div>
                    <div className="flex items-center justify-center gap-1.5 my-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-200"></div>
                    </div>
                    <div className="w-32 h-4 bg-zinc-200/70 rounded-md"></div>
                  </div>

                  <div className="md:col-span-7 space-y-3 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-24 h-3 bg-zinc-200/60 rounded mb-1"></div>
                      <div className="w-48 h-6 bg-zinc-200/70 rounded-md mb-2"></div>
                      <div className="w-full h-4 bg-zinc-200/50 rounded-md mb-1"></div>
                      <div className="w-3/4 h-4 bg-zinc-200/50 rounded-md"></div>
                    </div>

                    <div className="space-y-2 pt-2.5 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-3 bg-zinc-200/60 rounded"></div>
                        <div className="w-20 h-4 bg-zinc-200/60 rounded"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-3 bg-zinc-200/60 rounded"></div>
                        <div className="w-12 h-3 bg-zinc-200/60 rounded"></div>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <div className="w-20 h-5 bg-zinc-200/70 rounded"></div>
                        <div className="w-28 h-7 bg-zinc-200/80 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 py-4 my-4 border-y border-zinc-100">
                  {[1, 2, 3, 4].map((f) => (
                    <div key={f} className="flex flex-col items-center gap-2 p-2">
                      <div className="w-10 h-10 rounded-full bg-zinc-100"></div>
                      <div className="w-16 h-3 bg-zinc-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 mt-auto">
                <div className="w-full h-11 bg-zinc-200/70 rounded-xl"></div>
                <div className="w-full h-11 bg-zinc-200/70 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Watch() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navRef = useRef(null);
  const { products } = useSelector((state) => state.products);
  const [viewCols, setViewCols] = useState(4);
  const [showLimit, setShowLimit] = useState(16);
  const [sortBy, setSortBy] = useState('latest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [subItems, setSubItems] = useState(() => getInitialSubItems('watch', WATCH_SUB_NAV_ITEMS));
  const [localWishlist, setLocalWishlist] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);
  const isLoadingMore = useRef(false);

  // Watch AppleCare Dynamic Data
  const initialCareData = getInitialAppleCareData();
  const [dbAppleCareRows, setDbAppleCareRows] = useState(initialCareData.rows.length > 0 ? initialCareData.rows : DEFAULT_WATCH_APPLECARE_ROWS);
  const [selectedAppleCareModel, setSelectedAppleCareModel] = useState(initialCareData.rows.length > 0 ? initialCareData.rows[0] : DEFAULT_WATCH_APPLECARE_ROWS[0]);
  const [selectedAppleCareMap, setSelectedAppleCareMap] = useState({});
  const [selectedGlobalDuration, setSelectedGlobalDuration] = useState('2yr');
  const [selectedDurationMap, setSelectedDurationMap] = useState({});
  const [dbHeaderTitle, setDbHeaderTitle] = useState(initialCareData.headerTitle);
  const [dbDurationLabel, setDbDurationLabel] = useState(initialCareData.durationLabel);
  const [isSettingsLoading, setIsSettingsLoading] = useState(!initialCareData.isCached);

  useEffect(() => {
    dispatch(fetchProducts());
    fetchNavSettings();
    const unsubscribe = subscribeToLiveSync(() => {
      dispatch(fetchProducts());
      fetchNavSettings();
    });
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    setSelectedColors({});
  }, [products]);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeTab, sortBy, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop > 150 && (clientHeight + scrollTop >= scrollHeight - 120)) {
        isLoadingMore.current = true;
        setVisibleCount(prev => prev + 6);
        setTimeout(() => {
          isLoadingMore.current = false;
        }, 600);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNavSettings = async () => {
    try {
      const response = await axiosClient.get('/settings');
      if (response.data) {
        // Load Watch AppleCare Pricing Table
        if (response.data.appleCarePricingTables && response.data.appleCarePricingTables.length > 0) {
          const watchTable = response.data.appleCarePricingTables.find(t => t.categoryKey === 'watch');
          if (watchTable) {
            const hTitle = watchTable.headerTitle || 'AppleCare+';
            const dLabel = watchTable.durationLabel || '1 Year & 2 Years';
            setDbHeaderTitle(prev => (prev !== hTitle ? hTitle : prev));
            setDbDurationLabel(prev => (prev !== dLabel ? dLabel : prev));
            if (watchTable.rows && watchTable.rows.length > 0) {
              const activeRows = watchTable.rows.filter(r => r.isActive !== false);
              if (activeRows.length > 0) {
                const mappedRows = activeRows.map(r => ({
                  model: r.model || '',
                  title: r.title || `AppleCare+ for ${r.model}`,
                  description: r.description || r.description2yr || `Apple-certified coverage for ${r.model}`,
                  description1yr: r.description1yr || `1 Year Apple-certified coverage for ${r.model}`,
                  description2yr: r.description2yr || r.description || `2 Years Apple-certified coverage for ${r.model}`,
                  sku: r.sku || r.sku2yr || '',
                  sku1yr: r.sku1yr || (r.sku ? `${r.sku}-1YR` : ''),
                  sku2yr: r.sku2yr || r.sku || '',
                  mrp: r.mrp || r.mrp2yr || '',
                  mrp1yr: r.mrp1yr || '',
                  mrp2yr: r.mrp2yr || r.mrp || '',
                  discount: r.discount || r.discount2yr || '',
                  discount1yr: r.discount1yr || '',
                  discount2yr: r.discount2yr || r.discount || '',
                  salePrice: r.salePrice || r.salePrice2yr || r.yearly || '',
                  salePrice1yr: r.salePrice1yr || '',
                  salePrice2yr: r.salePrice2yr || r.salePrice || r.yearly || '',
                  monthly: r.monthly || '',
                  yearly: r.yearly || r.salePrice || r.salePrice2yr || '',
                  image: r.image || getModelImageByName(r.model),
                  isActive: r.isActive !== false
                }));

                try {
                  localStorage.setItem('iincept_watch_applecare_cache_v2', JSON.stringify({
                    headerTitle: hTitle,
                    durationLabel: dLabel,
                    rows: mappedRows
                  }));
                } catch (e) {}

                setDbAppleCareRows(prev => (JSON.stringify(prev) !== JSON.stringify(mappedRows) ? mappedRows : prev));
                setSelectedAppleCareModel(mappedRows[0]);
              }
            }
          }
        }

        // Sub Nav items
        if (response.data.categoryIconGroups && response.data.categoryIconGroups.length > 0) {
          const watchGrp = response.data.categoryIconGroups.find(g => g.categoryKey === 'watch');
          if (watchGrp && watchGrp.icons && watchGrp.icons.length > 0) {
            const activeSub = watchGrp.icons.filter(d => d.isActive !== false);
            if (activeSub.length > 0) {
              const mapped = activeSub.map(d => {
                const fallback = WATCH_SUB_NAV_ITEMS.find(m => m.name.toLowerCase() === (d.label || '').toLowerCase());
                return {
                  name: d.label,
                  query: d.query || d.label,
                  path: resolveSubItemPath(d),
                  image: resolveIconImage(d.image, d.label),
                  scale: fallback?.scale || 'scale-100'
                };
              });
              const withCare = ensureAppleCareInSubItems(mapped);
              try {
                localStorage.setItem('iincept_sub_items_v2_watch', JSON.stringify(withCare));
              } catch (e) {}
              setSubItems(prev => (JSON.stringify(prev) !== JSON.stringify(withCare) ? withCare : prev));
              return;
            }
          }
        }
        if (response.data.navbarMenuItems) {
          const watchItem = response.data.navbarMenuItems.find(i => (i.name || '').toLowerCase().includes('watch'));
          if (watchItem && watchItem.dropdownItems && watchItem.dropdownItems.length > 0) {
            const activeSub = watchItem.dropdownItems.filter(d => d.isActive !== false);
            if (activeSub.length > 0) {
              const mapped = activeSub.map(d => {
                const fallback = WATCH_SUB_NAV_ITEMS.find(m => m.name.toLowerCase() === (d.label || '').toLowerCase());
                return {
                  name: d.label,
                  query: d.query || d.label,
                  path: resolveSubItemPath(d),
                  image: resolveIconImage(d.image, d.label),
                  scale: fallback?.scale || 'scale-100'
                };
              });
              const withCare = ensureAppleCareInSubItems(mapped);
              try {
                localStorage.setItem('iincept_sub_items_v2_watch', JSON.stringify(withCare));
              } catch (e) {}
              setSubItems(prev => (JSON.stringify(prev) !== JSON.stringify(withCare) ? withCare : prev));
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load watch sub nav settings:', err);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleBuyAppleCareWhatsApp = (modelObj = {}) => {
    const modelName = modelObj.title || modelObj.model || 'Watch';
    const salePrice = modelObj.salePrice || modelObj.yearly || '₹7,900.00';
    const mrp = modelObj.mrp ? ` (MRP: ${modelObj.mrp})` : '';
    const discount = modelObj.discount ? ` [${modelObj.discount}]` : '';
    const sku = modelObj.sku ? `\n• *SKU Number:* ${modelObj.sku}` : '';
    const desc = modelObj.description ? `\n• *Details:* ${modelObj.description}` : '';
    const header = dbHeaderTitle ? `${dbHeaderTitle} ` : '';
    const duration = dbDurationLabel ? `\n• *Duration:* ${dbDurationLabel}` : '';

    const message = `Hello iiNCEPT Team! 👋\n\nI want to buy *${header}AppleCare+ Coverage*:\n• *Product:* ${modelName}${sku}${duration}${desc}\n• *Sale Price:* ${salePrice}${mrp}${discount}\n\nPlease share the payment link & activation process. Thank you!`;
    const whatsappUrl = `https://wa.me/918607222417?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleAppleCareSelection = (rowObj) => {
    const key = rowObj.model || rowObj.title;
    setSelectedAppleCareMap((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = rowObj;
      }
      return next;
    });
  };

  const handleBuyMultipleAppleCareWhatsApp = (selectedMap = {}) => {
    const selectedList = Object.values(selectedMap);
    if (selectedList.length === 0) return;

    if (selectedList.length === 1) {
      handleBuyAppleCareWhatsApp(selectedList[0]);
      return;
    }

    const header = dbHeaderTitle ? `${dbHeaderTitle} ` : '';
    let totalCost = 0;
    let itemsText = '';

    selectedList.forEach((item, index) => {
      const title = item.title || item.model || 'AppleCare+ Plan';
      const sku = item.sku ? ` (SKU: ${item.sku})` : '';
      const priceStr = item.salePrice || item.yearly || '₹0';
      const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
      totalCost += numericPrice;
      const mrp = item.mrp ? ` [MRP: ${item.mrp}]` : '';
      const discount = item.discount ? ` (${item.discount})` : '';

      itemsText += `${index + 1}. *${title}*${sku}\n   • Price: ${priceStr}${mrp}${discount}\n`;
    });

    const formattedTotal = `₹${totalCost.toLocaleString('en-IN')}.00`;
    const message = `Hello iiNCEPT Team! 👋\n\nI want to buy *${selectedList.length} ${header}AppleCare+ Coverage Plans*:\n\n${itemsText}\n• *Total Combined Price:* ${formattedTotal}\n\nPlease share the combined payment link & activation steps. Thank you!`;

    const whatsappUrl = `https://wa.me/918607222417?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddAppleCareToCart = (rowObj, i) => {
    const planTitle = rowObj.title || `Apple Care+ ${rowObj.model}`;
    const sku = rowObj.sku || '';
    const nameWithSku = sku ? `${planTitle} (SKU: ${sku})` : planTitle;
    const priceStr = rowObj.salePrice || rowObj.yearly || '0';
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 7900;
    const image = rowObj.image || getModelImageByName(rowObj.model);
    const itemId = `ac-watch-${sku || i}`;

    dispatch(
      addToCart({
        id: itemId,
        name: nameWithSku,
        title: nameWithSku,
        price: numericPrice,
        image: image,
        quantity: 1,
        isAppleCare: true,
        sku: sku
      })
    );
  };

  const handleAddAppleCareToWishlist = (rowObj, i) => {
    const planTitle = rowObj.title || `Apple Care+ ${rowObj.model}`;
    const sku = rowObj.sku || '';
    const nameWithSku = sku ? `${planTitle} (SKU: ${sku})` : planTitle;
    const priceStr = rowObj.salePrice || rowObj.yearly || '0';
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 7900;
    const image = rowObj.image || getModelImageByName(rowObj.model);
    const itemId = `ac-watch-${sku || i}`;

    setLocalWishlist((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

    dispatch(
      addToWishlist({
        id: itemId,
        name: nameWithSku,
        title: nameWithSku,
        price: numericPrice,
        image: image,
        rating: 5.0,
        isAppleCare: true,
        sku: sku
      })
    );
  };

  const handleColorChange = (productId, colorVal) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: colorVal }));
  };

  const getProductImage = (prod) => {
    const hasUserSelectedColor = Boolean(selectedColors[prod.id]);
    if (!hasUserSelectedColor && prod.displayImage) {
      return prod.displayImage;
    }

    const selectedColorName = selectedColors[prod.id] || (prod.colors && prod.colors[0] ? (prod.colors[0].name || (typeof prod.colors[0] === 'string' ? prod.colors[0] : '')) : null);
    if (selectedColorName) {
      if (prod.colorImages && typeof prod.colorImages === 'object') {
        const targetNorm = selectedColorName.replace(/\s+/g, ' ').trim().toLowerCase();
        const matchedKey = Object.keys(prod.colorImages).find(k => k.replace(/\s+/g, ' ').trim().toLowerCase() === targetNorm);
        if (matchedKey && prod.colorImages[matchedKey]) {
          return prod.colorImages[matchedKey];
        }
      }
      const foundColor = prod.colors.find((c) => (c.name || c) === selectedColorName);
      if (foundColor && foundColor.image) {
        return foundColor.image;
      }
      const colorIdx = prod.colors.findIndex((c) => (c.name || c) === selectedColorName);
      if (colorIdx !== -1 && prod.images && prod.images[colorIdx]) {
        return prod.images[colorIdx];
      }
    }
    return prod.displayImage || prod.image;
  };

  const handleAddToCart = (prod) => {
    const selectedColor = selectedColors[prod.id] || prod.colors[0]?.name || 'Standard';
    dispatch(addToCart({
      id: prod.id,
      name: `${prod.name} (${selectedColor})`,
      price: prod.price,
      image: getProductImage(prod),
      quantity: 1
    }));
  };

  const handleAddToWishlist = (prod) => {
    setLocalWishlist((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }));
    dispatch(addToWishlist({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: getProductImage(prod),
      rating: prod.rating
    }));
  };


  const extractFirstValidImage = (p) => {
    if (!p) return null;
    if (p.image && typeof p.image === 'string' && p.image.trim() && !p.image.includes('mock-cloud')) {
      return p.image;
    }
    if (Array.isArray(p.images) && p.images.length > 0) {
      const found = p.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
      if (found) return found;
    }
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        if (v.image && typeof v.image === 'string' && v.image.trim() && !v.image.includes('mock-cloud')) {
          return v.image;
        }
        if (Array.isArray(v.images) && v.images.length > 0) {
          const found = v.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
          if (found) return found;
        }
      }
    }
    if (Array.isArray(p.colors) && p.colors.length > 0) {
      for (const c of p.colors) {
        if (typeof c === 'object' && c) {
          if (c.image && typeof c.image === 'string' && c.image.trim() && !c.image.includes('mock-cloud')) {
            return c.image;
          }
          if (Array.isArray(c.images) && c.images.length > 0) {
            const found = c.images.find(img => typeof img === 'string' && img.trim() && !img.includes('mock-cloud'));
            if (found) return found;
          }
        }
      }
    }
    return null;
  };

  const dbWatches = products.filter(p => {
    const catName = (p.category?.name || p.category?.toString() || '').toLowerCase();
    const catSlug = (p.category?.slug || '').toLowerCase();
    const pTitle = (p.title || p.name || '').toLowerCase();

    // Exclude non-watch products and standalone cables/adapters
    const nonWatchKeywords = ['macbook', 'imac', 'mac mini', 'mac studio', 'ipad', 'iphone', 'airpod', 'headphone', 'cable', 'charger', 'adapter'];
    if (nonWatchKeywords.some(kw => pTitle.includes(kw))) {
      return false;
    }

    const isCategoryMatch = catName === 'watch' || catName === 'watches' || catSlug === 'watch' || catSlug === 'watches' || catName.includes('watch') || catName.includes('wearable');
    const isTitleMatch = pTitle.includes('watch') || pTitle.includes('series') || pTitle.includes('ultra');

    return isCategoryMatch || isTitleMatch;
  }).map(p => {
    const firstImg = extractFirstValidImage(p);
    const isValidImg = !!firstImg;
    return {
      id: p._id || p.id,
      name: p.title || p.name,
      price: p.price,
      priceStr: `₹${p.price.toLocaleString('en-IN')}`,
      discountPercent: p.discountPercent,
      discountPrice: p.discountPrice,
      displayImage: p.displayImage || '',
      colorImages: p.colorImages || {},
      image: p.displayImage || (isValidImg ? firstImg : '/watch_category.jpg'),
      images: p.images || [],
      variants: p.variants || [],
      colors: Array.isArray(p.colors) ? p.colors.map(c => {
        const name = typeof c === 'string' ? c : (c.name || '');
        const val = typeof c === 'string' ? c : (c.colorHex || c.value || c.name || '');
        const resolved = resolveColorValue(val);
        return { name, value: resolved, colorHex: resolved };
      }) : [],
      rating: p.rating || 5.0,
      isSoldOut: p.stock !== undefined && p.stock !== null ? p.stock <= 0 : false
    };
  });

  const combinedProducts = dbWatches;

  const sortedProducts = [...combinedProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const filteredProducts = sortedProducts.filter((prod) => {
    const search = searchParams.get('search') || '';
    if (search && !matchesProductSearch(prod, search)) {
      return false;
    }

    if (activeTab === 'available') return !prod.isSoldOut;
    if (activeTab === 'soldout') return prod.isSoldOut;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1d1d1f] pt-2 sm:pt-3 pb-8 px-4 sm:px-8 md:px-12 lg:px-16 select-none animate-in fade-in duration-300 relative">
      
      {/* Title & Category Sub-Nav Header */}
      <div className="w-full bg-[#fcfcfc] pt-0 pb-2 select-none font-sans mb-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 text-left mb-2">
            Watch
          </h1>

          {/* Horizontal Watch Model Selector Row */}
          <div className="flex items-end gap-7 sm:gap-9 md:gap-11 lg:gap-12 overflow-x-auto no-scrollbar py-3 px-1">
            {subItems.map((item, idx) => {
              const currentTab = searchParams.get('tab') || '';
              const currentSearch = searchParams.get('search') || '';
              const isAppleCareItem = (item.name || item.label || '').toLowerCase().includes('care');
              const isAppleCareActive = currentTab.toLowerCase() === 'applecare' || currentSearch.toLowerCase().includes('care');
              const isActive = isAppleCareActive
                ? isAppleCareItem
                : (currentSearch && currentSearch.toLowerCase() === (item.query || '').toLowerCase());

              return (
                <Link
                  key={item.name || item.query || idx}
                  to={resolveSubItemPath(item)}
                  className={`flex flex-col items-center gap-2 shrink-0 group cursor-pointer opacity-100 ${
                    isActive ? 'font-bold' : ''
                  }`}
                >
                  <div className={`h-20 sm:h-22 ${isAppleCareItem ? 'w-28 sm:w-32' : 'w-24 sm:w-26'} flex items-center justify-center p-1 overflow-visible`}>
                    <img
                      src={resolveIconImage(item.image, item.name)}
                      alt={item.name}
                      onError={(e) => {
                        const lower = (item.name || '').toLowerCase();
                        if (lower.includes('care')) {
                          e.currentTarget.src = '/applecare_official_hero.png';
                        } else {
                          e.currentTarget.src = '/watch_nav/watch_series_10.png';
                        }
                      }}
                      className={`max-h-full max-w-full object-contain transition-all duration-300 ease-out group-hover:scale-112 group-hover:-translate-y-1 ${
                        isAppleCareItem ? 'scale-[1.32] sm:scale-[1.4]' : ''
                      }`}
                      style={{ mixBlendMode: 'multiply', filter: 'contrast(1.06) brightness(1.02)' }}
                    />
                  </div>
                  <span className={`text-xs tracking-tight transition-colors duration-200 ${isActive ? 'font-bold text-zinc-950' : 'font-semibold text-zinc-700 group-hover:text-zinc-950'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conditionally Render Watch AppleCare Grid OR Product Grid */}
      {(() => {
        const currentTab = searchParams.get('tab') || '';
        const currentSearch = searchParams.get('search') || '';
        const isAppleCareActive = currentTab.toLowerCase() === 'applecare' || currentSearch.toLowerCase().includes('care');

        if (isAppleCareActive) {
          if (isSettingsLoading) {
            return <WatchAppleCareSkeleton />;
          }

          return (
            <div className="max-w-7xl mx-auto my-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-200/60 overflow-hidden shadow-xs p-6 sm:p-10 text-left">
                {/* Header section with Global Duration Selector */}
                <div className="border-b border-zinc-100 pb-4 mb-4 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
                    <div className="text-2xl sm:text-4xl md:text-5xl font-black text-[#FF2D55] tracking-tight">
                      {dbHeaderTitle || 'AppleCare+'}
                    </div>

                    {/* Global Duration Selector Pills */}
                    <div className="flex items-center gap-2 bg-zinc-100/90 p-1.5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setSelectedGlobalDuration('1yr')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGlobalDuration === '1yr'
                            ? 'bg-[#0071e3] text-white shadow-sm'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        1 Year Plans
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGlobalDuration('2yr')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGlobalDuration === '2yr'
                            ? 'bg-[#FF2D55] text-white shadow-sm'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        2 Year Plans
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Box Grid matching reference design */}
                {(() => {
                  const rows = dbAppleCareRows.length > 0 ? dbAppleCareRows : DEFAULT_WATCH_APPLECARE_ROWS;

                  return (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 items-stretch">
                        {rows.map((row, i) => {
                          const itemKey = row.model || row.title;
                          const isSelected = !!selectedAppleCareMap[itemKey];

                          const chosenDuration = selectedDurationMap[itemKey] || selectedGlobalDuration || '2yr';
                          const is1Yr = chosenDuration === '1yr';
                          const planDetails = is1Yr ? resolve1YrDetails(row) : resolve2YrDetails(row);

                          const activeMrp = planDetails.mrp;
                          const activeSalePrice = planDetails.salePrice;
                          const activeDiscount = planDetails.discount;
                          const activeSku = planDetails.sku;
                          const activeDescription = planDetails.description;
                          const durationLabelText = is1Yr ? '1 Year' : '2 Years';

                          return (
                            <div 
                              key={i} 
                              onClick={() => {
                                toggleAppleCareSelection({ ...row, salePrice: activeSalePrice, mrp: activeMrp, sku: activeSku, duration: durationLabelText, title: `${row.title || row.model} (${durationLabelText})` });
                              }}
                              className={`group bg-white rounded-[24px] sm:rounded-[28px] border transition-all duration-300 relative text-left cursor-pointer p-5 sm:p-6 shadow-xs hover:shadow-md flex flex-col justify-between h-full ${
                                isSelected 
                                  ? 'border-2 border-black bg-zinc-50/20 ring-1 ring-black/10' 
                                  : 'border-zinc-200/80 hover:border-zinc-300'
                              }`}
                            >
                              {/* Top & Middle Content Container */}
                              <div className="flex-1 flex flex-col justify-between">
                                {/* Top Section: Media Left, Info Right */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                  
                                  {/* LEFT COLUMN: Media Container Box */}
                                  <div className="md:col-span-5 bg-white group-hover:bg-[#f0f0f2] transition-colors duration-300 rounded-2xl p-4 sm:p-5 relative flex flex-col items-center justify-between min-h-[260px] sm:min-h-[280px] h-full border border-zinc-100/80">
                                    
                                    {/* Top Left Badge */}
                                    <div className="w-full flex items-center justify-start z-10 mb-1">
                                      <span className={`text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide transition-colors ${
                                        is1Yr ? 'bg-[#0071e3]' : 'bg-[#FF2D55]'
                                      }`}>
                                        Apple Care+ ({durationLabelText})
                                      </span>
                                    </div>
                                    {/* Main Product Image */}
                                    <div className="w-full h-28 sm:h-32 flex items-center justify-center my-1 overflow-hidden shrink-0 relative">
                                      <img
                                        src={row.image || getModelImageByName(row.model)}
                                        alt={row.title || row.model}
                                        loading="eager"
                                        onError={(e) => {
                                          e.currentTarget.src = getModelImageByName(row.model);
                                        }}
                                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
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
                                        <span>{row.model || row.title}</span>
                                      </div>
                                      {activeSku ? (
                                        <p className="text-[11px] text-zinc-500 font-mono font-semibold mt-0.5">
                                          SKU: {activeSku}
                                        </p>
                                      ) : (
                                        <p className="text-[11px] text-transparent font-mono font-semibold mt-0.5 select-none">
                                          SKU: N/A
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* RIGHT COLUMN: Info & Pricing Block */}
                                  <div className="md:col-span-7 space-y-3 flex flex-col justify-between h-full">
                                    <div>
                                      {/* Per-card Duration Selector Pills */}
                                      <div className="flex items-center gap-1.5 mb-2.5 bg-zinc-100/80 p-1 rounded-xl w-fit">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDurationMap(prev => ({ ...prev, [itemKey]: '1yr' }));
                                          }}
                                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                            is1Yr ? 'bg-white text-[#0071e3] shadow-xs ring-1 ring-black/5' : 'text-zinc-600 hover:text-zinc-900'
                                          }`}
                                        >
                                          1 Year Plan
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDurationMap(prev => ({ ...prev, [itemKey]: '2yr' }));
                                          }}
                                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                            !is1Yr ? 'bg-white text-[#FF2D55] shadow-xs ring-1 ring-black/5' : 'text-zinc-600 hover:text-zinc-900'
                                          }`}
                                        >
                                          2 Year Plan
                                        </button>
                                      </div>

                                      <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#FF2D55] mb-1">
                                        APPLE CARE+ • {is1Yr ? '1 YEAR PLAN' : '2 YEAR PLAN'}
                                      </div>
                                      <h3 className="font-extrabold text-[#1D1D1F] text-lg sm:text-xl leading-snug tracking-tight min-h-[44px] flex items-center">
                                        {row.title || `Apple Care+ ${row.model}`} ({durationLabelText})
                                      </h3>
                                      <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed min-h-[36px] flex items-center">
                                        {activeDescription || `${durationLabelText} Apple-certified coverage for your ${row.model}. Peace of mind for what's next.`}
                                      </p>
                                    </div>

                                    {/* Pricing Details Block */}
                                    <div className="space-y-1.5 pt-2.5 border-t border-zinc-100">
                                      {/* MRP & Discount Pill Row */}
                                      <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="font-semibold text-zinc-500">MRP</span>
                                        <div className="flex items-center gap-2">
                                          {activeMrp && <span className="line-through text-zinc-600 font-semibold">{activeMrp}</span>}
                                        </div>
                                      </div>

                                      {/* Discount Row */}
                                      {activeDiscount ? (
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="font-semibold text-zinc-500">Discount</span>
                                          <span className="font-bold text-[#FF2D55]">-{activeDiscount.replace(/OFF/i, '').trim()}</span>
                                        </div>
                                      ) : (
                                        <div className="h-4"></div>
                                      )}

                                      <div className="border-b border-zinc-100 my-1"></div>

                                      {/* Final Price Row */}
                                      <div className="flex items-baseline justify-between">
                                        <span className="font-extrabold text-[#1D1D1F] text-sm sm:text-base">Final Price</span>
                                        <div className="text-xl sm:text-2xl font-extrabold text-[#00875A] tabular-nums tracking-tight">
                                          {activeSalePrice}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-1 text-[11px] text-zinc-400 font-medium">
                                        <span>GST Paid</span>
                                        <span className="text-xs">ⓘ</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* MIDDLE SECTION: Feature Highlights Grid */}
                                <AppleCareFeaturesGrid years={is1Yr ? "1" : "2"} />
                              </div>

                              {/* BOTTOM ACTION BUTTONS */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 mt-auto">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddAppleCareToWishlist({ ...row, salePrice: activeSalePrice, mrp: activeMrp, sku: activeSku, duration: durationLabelText, title: `${row.title || row.model} (${durationLabelText})` }, i);
                                  }}
                                  className={`w-full border font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer ${
                                    localWishlist[`ac-watch-${activeSku || i}`]
                                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                                      : 'bg-[#1D1D1F] text-white border-zinc-900 hover:bg-zinc-800'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${localWishlist[`ac-watch-${activeSku || i}`] ? 'fill-current text-rose-500' : 'text-white'}`} />
                                  <span>{localWishlist[`ac-watch-${activeSku || i}`] ? 'Wishlisted' : 'Add to Wishlist'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddAppleCareToCart({ ...row, salePrice: activeSalePrice, mrp: activeMrp, sku: activeSku, duration: durationLabelText, title: `${row.title || row.model} (${durationLabelText})` }, i);
                                  }}
                                  className="w-full bg-black hover:bg-zinc-900 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <ShoppingBag className="w-4 h-4 text-white" />
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E6E73]">
                        <p>Prices include applicable taxes. Service fees may apply for repairs.</p>
                      </div>

                      {/* Floating Multi-Selection Action Bar */}
                      {Object.keys(selectedAppleCareMap).length > 0 && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1D1D1F] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-700/80 flex items-center justify-between gap-6 max-w-xl w-[92%] animate-in slide-in-from-bottom-5 duration-300">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#FF2D55] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                              {Object.keys(selectedAppleCareMap).length}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {Object.keys(selectedAppleCareMap).length} Watch AppleCare Plans Selected
                              </div>
                              <div className="text-[11px] text-zinc-400 font-medium">
                                Total: ₹{Object.values(selectedAppleCareMap).reduce((acc, curr) => {
                                  const p = parseFloat((curr.salePrice || curr.yearly || '0').replace(/[^0-9.]/g, '')) || 0;
                                  return acc + p;
                                }, 0).toLocaleString('en-IN')}.00
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAppleCareMap({})}
                              className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                            <button
                              onClick={() => handleBuyMultipleAppleCareWhatsApp(selectedAppleCareMap)}
                              className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <span>Buy on WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        }

        return (
          <>

            {/* Filter Drawer */}
            {filterOpen && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all duration-300 flex justify-end">
                <div className="w-80 bg-white h-full p-8 shadow-2xl animate-in slide-in-from-right duration-350 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                      <h3 className="font-bold text-lg tracking-tight">Filter Options</h3>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Availability</h4>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setActiveTab('all')}
                            className={`text-left text-sm py-1.5 px-3 rounded-lg ${activeTab === 'all' ? 'bg-zinc-100 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'}`}
                          >
                            All Models
                          </button>
                          <button
                            onClick={() => setActiveTab('available')}
                            className={`text-left text-sm py-1.5 px-3 rounded-lg ${activeTab === 'available' ? 'bg-zinc-100 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'}`}
                          >
                            In Stock
                          </button>
                          <button
                            onClick={() => setActiveTab('soldout')}
                            className={`text-left text-sm py-1.5 px-3 rounded-lg ${activeTab === 'soldout' ? 'bg-zinc-100 font-semibold' : 'text-zinc-600 hover:bg-zinc-50'}`}
                          >
                            Sold Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-3 rounded-xl font-medium tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer text-center"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.slice(0, visibleCount).map((prod) => {
                const pricing = getProductCardPricing(prod);

                return (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-2xl overflow-hidden flex flex-col justify-between p-6 shadow-sm border border-zinc-100/50 hover:shadow-md hover:border-zinc-200/55 transition-all duration-300 relative text-left"
                  >
                    <div className="flex items-center justify-between absolute top-4 left-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {prod.isSoldOut && (
                          <span className="bg-[#f5f5f7] text-[#1d1d1f] font-bold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded shadow-2xs">
                            SOLD OUT
                          </span>
                        )}
                        {pricing.hasDiscount && (
                          <span className="bg-[#FF2D55] text-white font-extrabold text-[9.5px] tracking-wide uppercase px-2.5 py-1 rounded shadow-2xs">
                            {pricing.discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToWishlist(prod)}
                        className={`p-2 rounded-full shadow-sm border border-zinc-100/80 bg-white/90 hover:scale-110 transition-all cursor-pointer ${
                          localWishlist[prod.id] ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${localWishlist[prod.id] ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Clickable Area: Image and Title */}
                    <Link
                      to={`/product/${prod.id}`}
                      onMouseEnter={() => prefetchProduct(prod.id, dispatch)}
                      className="block cursor-pointer"
                    >
                      {/* Product Visual - Apple Showcase Background (#f5f5f7) */}
                      <CleanProductImage
                        src={getProductImage(prod)}
                        alt={prod.name}
                        className="max-h-[92%] max-w-[92%] object-contain group-hover:scale-110 transition-transform duration-500 select-none transform scale-115 sm:scale-125"
                        containerClassName="w-full h-72 sm:h-80 bg-white rounded-2xl flex items-center justify-center p-2 overflow-hidden relative mb-5 transition-colors duration-300 group-hover:bg-[#f0f0f2]"
                      />

                      {/* Title */}
                      <h3 className="font-semibold text-[16px] leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-900 transition-colors min-h-[48px]">
                        {(() => {
                          const cleanProductTitle = (rawTitle) => {
                            if (!rawTitle) return '';
                            return rawTitle.replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();
                          };
                          return (
                            <span>{cleanProductTitle(prod.name || prod.title)}</span>
                          );
                        })()}
                      </h3>
                    </Link>

                    {/* Non-clickable configurations / actions */}
                    <div className="space-y-4 pt-2">
                      {/* Color Dot Options Row */}
                      <div className="flex items-center justify-between gap-2 border-t border-zinc-100/60 pt-3">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Colors</span>
                        <div className="flex items-center gap-3 shrink-0 py-1">
                          {prod.colors.map((color) => {
                            const isSelected = selectedColors[prod.id] === color.name || (!selectedColors[prod.id] && prod.colors[0]?.name === color.name);
                            return (
                              <button
                                key={color.name}
                                onClick={() => handleColorChange(prod.id, color.name)}
                                style={{ backgroundColor: resolveColorValue(color.colorHex || color.value || color.name) }}
                                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${
                                  isSelected ? 'scale-110 ring-2 ring-offset-2 ring-zinc-800 shadow-sm z-10' : 'border border-zinc-300 hover:scale-105'
                                }`}
                                title={color.name}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Price</span>
                          {pricing.hasDiscount ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-extrabold text-zinc-950 text-base">
                                ₹{pricing.sellingPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-zinc-400 line-through font-bold">
                                ₹{pricing.originalMrp.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-zinc-900 text-base">
                              {prod.priceStr || `₹${Number(prod.price || 0).toLocaleString('en-IN')}`}
                            </span>
                          )}
                        </div>

                        {!prod.isSoldOut && (
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="flex items-center justify-center p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 transition-all cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
          </>
        );
      })()}
    </div>
  );
}
