import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RefreshCw, Sparkles, ShieldAlert, CheckCircle2, ShoppingCart, ChevronDown, Laptop, Tablet, Smartphone } from 'lucide-react';
import { getProducts } from '../services/productApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { resolveColorValue } from '../utils/colorResolver';

const MOCK_MAC_PRODUCTS = [
  {
    _id: '6a438c4c236925a15ed0a57d',
    title: 'MacBook Neo (A18 Pro)',
    name: 'MacBook Neo (A18 Pro)',
    price: 89900,
    brand: 'Apple',
    images: ['/macbook_category_v2.jpg', '/macbook_category_v3.jpg', '/mac_nav/macbook_neo.png', '/macbook_category_uploaded.jpg'],
    stock: 10,
    colors: ['Silver', 'Blush', 'Citrus', 'Indigo'],
    colorImages: {
      'Silver': '/macbook_category_uploaded.jpg',
      'Blush': '/macbook_category_v3.jpg',
      'Citrus': '/mac_nav/macbook_neo.png',
      'Indigo': '/macbook_category_v2.jpg'
    },
    storage: ['256GB', '512GB', '1TB'],
    ram: ['8GB unified memory', '16GB unified memory'],
    material: 'Lightweight Aluminum',
    features: ['A18 Pro chip with 6-core GPU', 'Retina display with True Tone', 'Up to 18 hours battery life', 'Silent fanless design']
  },
  {
    _id: '6a44ca05101e1328003fbb05',
    title: 'MacBook Air 13" (M5)',
    name: 'MacBook Air 13" (M5)',
    price: 119900,
    brand: 'Apple',
    images: ['/macbook_category_v3.jpg', '/mac_nav/macbook_air.png', '/macbook_category_v2.jpg', '/macbook_air_banner.png'],
    stock: 12,
    colors: ['Starlight', 'Space Gray', 'Midnight', 'Silver'],
    colorImages: {
      'Starlight': '/macbook_category_v3.jpg',
      'Space Gray': '/mac_nav/macbook_air.png',
      'Midnight': '/macbook_category_v2.jpg',
      'Silver': '/macbook_air_banner.png'
    },
    storage: ['256GB', '512GB', '1TB', '2TB'],
    ram: ['16GB unified memory', '24GB unified memory'],
    material: 'Recycled Aluminum',
    features: ['Next-generation M5 chip', '13.6-inch Liquid Retina display', 'Up to 18 hours battery life', '1080p FaceTime HD camera']
  },
  {
    _id: '6a44ca05101e1328003fbb04',
    title: 'MacBook Pro 14" (M5)',
    name: 'MacBook Pro 14" (M5)',
    price: 169900,
    brand: 'Apple',
    images: ['/macbook_pro_dark.jpg', '/mac_nav/macbook_pro.png'],
    stock: 8,
    colors: ['Space Black', 'Silver'],
    colorImages: {
      'Space Black': '/macbook_pro_dark.jpg',
      'Silver': '/mac_nav/macbook_pro.png'
    },
    storage: ['512GB', '1TB', '2TB', '4TB'],
    ram: ['24GB unified memory', '36GB unified memory'],
    material: 'Aerospace Aluminum',
    features: ['Supercharged M5 Pro chip', '14.2-inch Liquid Retina XDR display', 'Up to 22 hours battery life', 'HDMI, SDXC, MagSafe 3']
  }
];

const MOCK_IPAD_PRODUCTS = [
  {
    _id: '6a437eb3345ade0885f68a58',
    title: 'iPad Pro 13-inch (M4)',
    name: 'iPad Pro 13-inch (M4)',
    price: 129900,
    brand: 'Apple',
    images: ['/ipad_nav/ipad_pro.png', '/ipad_category_uploaded.png', '/ipad_category.jpg'],
    stock: 10,
    colors: ['Space Black', 'Silver'],
    colorImages: {
      'Space Black': '/ipad_nav/ipad_pro.png',
      'Silver': '/ipad_category_uploaded.png'
    },
    storage: ['256GB', '512GB', '1TB', '2TB'],
    ram: ['8GB unified memory', '16GB unified memory'],
    material: 'Ultra Thin Aluminum Enclosure',
    features: ['Ultra Retina XDR display with Tandem OLED', 'Apple M4 chip with 10-core GPU', 'Supports Apple Pencil Pro & Magic Keyboard', '12MP Wide camera with LiDAR Scanner']
  },
  {
    _id: '6a50e1e85e18f9afadeeb819',
    title: 'iPad Air 11-inch (M2)',
    name: 'iPad Air 11-inch (M2)',
    price: 59900,
    brand: 'Apple',
    images: ['/ipad_nav/ipad_air.png', '/ipad_air_blue.jpg', '/ipad_category_v3.png'],
    stock: 14,
    colors: ['Blue', 'Purple', 'Starlight', 'Space Gray'],
    colorImages: {
      'Blue': '/ipad_nav/ipad_air.png',
      'Purple': '/ipad_category_v3.png',
      'Starlight': '/ipad_air_banner.jpg',
      'Space Gray': '/ipad_category.jpg'
    },
    storage: ['128GB', '256GB', '512GB', '1TB'],
    ram: ['8GB unified memory'],
    material: '100% Recycled Aluminum Enclosure',
    features: ['Liquid Retina display with P3 wide color', 'Apple M2 chip', 'Landscape 12MP Ultra Wide front camera', 'Touch ID in top button']
  },
  {
    _id: '6a44ee3d4a9f2d3d8e71110d',
    title: 'iPad (10th generation)',
    name: 'iPad (10th generation)',
    price: 34900,
    brand: 'Apple',
    images: ['/ipad_nav/ipad.png', '/ipad_air_blue.jpg', '/ipad_category_v3.png'],
    stock: 18,
    colors: ['Blue', 'Pink', 'Yellow', 'Silver'],
    colorImages: {
      'Blue': '/ipad_nav/ipad.png',
      'Pink': '/ipad_category_v3.png',
      'Yellow': '/ipad_category_v2.jpg',
      'Silver': '/ipad_category.jpg'
    },
    storage: ['64GB', '256GB'],
    ram: ['4GB RAM'],
    material: 'Durable Aluminum Enclosure',
    features: ['10.9-inch Liquid Retina display', 'A14 Bionic chip', 'Landscape 12MP Ultra Wide camera', 'USB-C connector']
  },
  {
    _id: '6a44ef4f4a9f2d3d8e71110e',
    title: 'iPad mini (A17 Pro)',
    name: 'iPad mini (A17 Pro)',
    price: 49900,
    brand: 'Apple',
    images: ['/ipad_nav/ipad_mini.png', '/ipad_category_v3.png'],
    stock: 8,
    colors: ['Space Gray', 'Starlight', 'Purple', 'Blue'],
    colorImages: {
      'Space Gray': '/ipad_nav/ipad_mini.png',
      'Starlight': '/ipad_air_banner.jpg',
      'Purple': '/ipad_category_v3.png',
      'Blue': '/ipad_air_blue.jpg'
    },
    storage: ['128GB', '256GB', '512GB'],
    ram: ['8GB RAM'],
    material: 'Compact Aluminum Enclosure',
    features: ['8.3-inch Liquid Retina display', 'A17 Pro chip with Apple Intelligence', 'Supports Apple Pencil Pro', 'Wi-Fi 6E & 5G support']
  }
];

const MOCK_IPHONE_PRODUCTS = [
  {
    _id: '6a437eb3345ade0885f68a50',
    title: 'iPhone 17 Pro',
    name: 'iPhone 17 Pro',
    price: 134900,
    brand: 'Apple',
    images: ['/iphone_nav/iphone_17_pro.png', '/iphone17p_white.jpg', '/iphone17p_blue.jpg'],
    stock: 12,
    colors: ['Cosmic Orange', 'White Titanium', 'Deep Blue'],
    colorImages: {
      'Cosmic Orange': '/iphone_nav/iphone_17_pro.png',
      'White Titanium': '/iphone17p_white.jpg',
      'Deep Blue': '/iphone17p_blue.jpg'
    },
    storage: ['256GB', '512GB', '1TB'],
    ram: ['8GB RAM'],
    material: 'Titanium Enclosure with Ceramic Shield',
    features: ['A19 Pro chip with 6-core GPU', '48MP Pro camera system with 5x Telephoto', 'Super Retina XDR display with ProMotion', 'Action button & Camera Control button']
  },
  {
    _id: '6a437eb3345ade0885f68a51',
    title: 'iPhone Air',
    name: 'iPhone Air',
    price: 119900,
    brand: 'Apple',
    images: ['/iphone_nav/iphone_air.png', '/iphone_air_gold.jpg', '/iphone_air_group.jpg'],
    stock: 15,
    colors: ['Sky Blue', 'Light Gold', 'Midnight'],
    colorImages: {
      'Sky Blue': '/iphone_nav/iphone_air.png',
      'Light Gold': '/iphone_air_gold.jpg',
      'Midnight': '/iphone_air_group.jpg'
    },
    storage: ['256GB', '512GB', '1TB'],
    ram: ['8GB RAM'],
    material: 'Incredibly Thin Aluminum & Glass',
    features: ['Ultra-thin light chassis', 'A19 chip with 5-core GPU', '48MP Fusion Camera', 'Dynamic Island & Always-On display']
  },
  {
    _id: '6a437eb3345ade0885f68a52',
    title: 'iPhone 17',
    name: 'iPhone 17',
    price: 79900,
    brand: 'Apple',
    images: ['/iphone_nav/iphone_17.png', '/iphone17_purple_fb.jpg', '/iphone17_green.jpg'],
    stock: 20,
    colors: ['Lavender', 'Teal Green', 'Deep Blue'],
    colorImages: {
      'Lavender': '/iphone_nav/iphone_17.png',
      'Teal Green': '/iphone17_green.jpg',
      'Deep Blue': '/iphone17_group_v2.jpg'
    },
    storage: ['128GB', '256GB', '512GB'],
    ram: ['8GB RAM'],
    material: 'Aerospace-Grade Aluminum',
    features: ['A19 Bionic chip with Apple Intelligence', '48MP Dual Fusion Camera system', 'Super Retina XDR OLED display', 'All-Day battery backup']
  },
  {
    _id: '6a437eb3345ade0885f68a54',
    title: 'iPhone 16',
    name: 'iPhone 16',
    price: 69900,
    brand: 'Apple',
    images: ['/iphone_nav/iphone_16.png', '/iphone16_blue_fb.jpg', '/iphone16_pink_hand.jpg'],
    stock: 18,
    colors: ['Ultramarine', 'Pink', 'White', 'Black'],
    colorImages: {
      'Ultramarine': '/iphone_nav/iphone_16.png',
      'Pink': '/iphone_nav/iphone_17e.png',
      'White': '/iphone16_group_v2.jpg',
      'Black': '/iphone16_group.jpg'
    },
    storage: ['128GB', '256GB', '512GB'],
    ram: ['8GB RAM'],
    material: 'Aluminum Enclosure with Color-Infused Glass',
    features: ['A18 chip with Camera Control button', '48MP Fusion camera with 2x Telephoto', 'Action button', 'Next-gen Portrait mode']
  }
];

export default function Compare() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') === 'ipad' ? 'ipad' : searchParams.get('category') === 'iphone' ? 'iphone' : 'mac';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const [products, setProducts] = useState([]);
  const [macProducts, setMacProducts] = useState([]);
  const [ipadProducts, setIpadProducts] = useState([]);
  const [iphoneProducts, setIphoneProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(['', '', '']);
  const [selectedColors, setSelectedColors] = useState({});
  const [cartSuccess, setCartSuccess] = useState('');

  useEffect(() => {
    fetchProductsList();
  }, []);

  // Update selection when category changes
  useEffect(() => {
    const activeList = activeCategory === 'ipad' ? ipadProducts : activeCategory === 'iphone' ? iphoneProducts : macProducts;
    if (activeList.length >= 3) {
      setSelectedIds([activeList[0]._id, activeList[1]._id, activeList[2]._id]);
    } else if (activeList.length > 0) {
      const initial = activeList.map(m => m._id);
      while (initial.length < 3) initial.push('');
      setSelectedIds(initial);
    } else {
      setSelectedIds(['', '', '']);
    }
    setSelectedColors({});
  }, [activeCategory, macProducts, ipadProducts, iphoneProducts]);

  const handleCategorySwitch = (cat) => {
    setActiveCategory(cat);
    setSearchParams({ category: cat });
  };

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ limit: 100 });
      const rawList = Array.isArray(data) ? data : (data.products || []);
      setProducts(rawList);

      // Filter specifically for Mac models only
      const dbMacs = rawList.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const catName = (p.category?.name || p.category || '').toLowerCase();
        const catSlug = (p.category?.slug || '').toLowerCase();

        const isMacTitle = title.includes('mac') || title.includes('macbook') || title.includes('imac');
        const isMacCat = catName.includes('laptop') || catName.includes('mac') || catSlug.includes('laptop') || catSlug.includes('mac');
        const isOtherApple = title.includes('iphone') || title.includes('ipad') || title.includes('watch') || title.includes('airpods') || title.includes('pencil');

        return (isMacTitle || isMacCat) && !isOtherApple;
      });

      // Filter specifically for iPad models only
      const dbIpads = rawList.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const catName = (p.category?.name || p.category || '').toLowerCase();
        const catSlug = (p.category?.slug || '').toLowerCase();

        return title.includes('ipad') || catName.includes('ipad') || catSlug.includes('ipad');
      });

      // Filter specifically for iPhone models only
      const dbIphones = rawList.filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const catName = (p.category?.name || p.category || '').toLowerCase();
        const catSlug = (p.category?.slug || '').toLowerCase();

        return title.includes('iphone') || catName.includes('smartphone') || catSlug.includes('smartphone');
      });

      // Merge DB Mac products with mock fallback Mac products
      const combinedMacs = MOCK_MAC_PRODUCTS.map((mockItem) => {
        const dbMatch = dbMacs.find(
          (d) => d._id === mockItem._id || (d.title || d.name || '').toLowerCase().includes((mockItem.title || mockItem.name || '').toLowerCase())
        );
        if (dbMatch) {
          return {
            ...mockItem,
            ...dbMatch,
            colors: (Array.isArray(dbMatch.colors) && dbMatch.colors.length > 0) ? dbMatch.colors : mockItem.colors,
            colorImages: { ...(mockItem.colorImages || {}), ...(dbMatch.colorImages || {}) }
          };
        }
        return mockItem;
      });
      dbMacs.forEach((dbItem) => {
        if (!combinedMacs.some((m) => m._id === dbItem._id)) combinedMacs.push(dbItem);
      });
      setMacProducts(combinedMacs);

      // Merge DB iPad products with mock fallback iPad products
      const combinedIpads = MOCK_IPAD_PRODUCTS.map((mockItem) => {
        const dbMatch = dbIpads.find(
          (d) => d._id === mockItem._id || (d.title || d.name || '').toLowerCase().includes((mockItem.title || mockItem.name || '').toLowerCase())
        );
        if (dbMatch) {
          return {
            ...mockItem,
            ...dbMatch,
            colors: (Array.isArray(dbMatch.colors) && dbMatch.colors.length > 0) ? dbMatch.colors : mockItem.colors,
            colorImages: { ...(mockItem.colorImages || {}), ...(dbMatch.colorImages || {}) }
          };
        }
        return mockItem;
      });
      dbIpads.forEach((dbItem) => {
        if (!combinedIpads.some((m) => m._id === dbItem._id)) combinedIpads.push(dbItem);
      });
      setIpadProducts(combinedIpads);

      // Merge DB iPhone products with mock fallback iPhone products
      const combinedIphones = MOCK_IPHONE_PRODUCTS.map((mockItem) => {
        const dbMatch = dbIphones.find(
          (d) => d._id === mockItem._id || 
                 (d.title || d.name || '').toLowerCase().includes((mockItem.title || mockItem.name || '').toLowerCase()) ||
                 (mockItem.title || mockItem.name || '').toLowerCase().includes((d.title || d.name || '').toLowerCase())
        );
        if (dbMatch) {
          return {
            ...mockItem,
            ...dbMatch,
            colors: (Array.isArray(dbMatch.colors) && dbMatch.colors.length > 0) ? dbMatch.colors : mockItem.colors,
            colorImages: { ...(mockItem.colorImages || {}), ...(dbMatch.colorImages || {}) }
          };
        }
        return mockItem;
      });
      dbIphones.forEach((dbItem) => {
        if (!combinedIphones.some((m) => m._id === dbItem._id)) combinedIphones.push(dbItem);
      });
      setIphoneProducts(combinedIphones);

    } catch (err) {
      console.error('Failed to fetch compare list:', err);
      setMacProducts(MOCK_MAC_PRODUCTS);
      setIpadProducts(MOCK_IPAD_PRODUCTS);
      setIphoneProducts(MOCK_IPHONE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryProducts = activeCategory === 'ipad' ? ipadProducts : activeCategory === 'iphone' ? iphoneProducts : macProducts;

  const handleSelectChange = (index, value) => {
    const next = [...selectedIds];
    next[index] = value;
    setSelectedIds(next);

    // Set default selected color for the newly selected product
    const prod = currentCategoryProducts.find(p => p._id === value);
    if (prod && Array.isArray(prod.colors) && prod.colors.length > 0) {
      const firstColName = typeof prod.colors[0] === 'object' ? prod.colors[0].name : prod.colors[0];
      setSelectedColors(prev => ({ ...prev, [index]: firstColName }));
    }
  };

  const handleColorChange = (slotIdx, colorName) => {
    setSelectedColors((prev) => ({
      ...prev,
      [slotIdx]: colorName
    }));
  };

  const getProductImage = (prod, slotIdx) => {
    const fallbackCategoryImg = activeCategory === 'ipad' ? '/ipad_nav/ipad.png' : activeCategory === 'iphone' ? '/iphone_nav/iphone_17.png' : '/mac_nav/macbook_air.png';
    if (!prod) return fallbackCategoryImg;

    const hasUserSelectedColor = Boolean(selectedColors[slotIdx]);
    
    // When no color is explicitly selected by user interaction, ALWAYS return the primary product image
    if (!hasUserSelectedColor) {
      if (prod.displayImage) return prod.displayImage;
      if (prod.image) return prod.image;
      if (Array.isArray(prod.images) && prod.images[0]) return prod.images[0];
      return fallbackCategoryImg;
    }

    const selCol = selectedColors[slotIdx];
    if (selCol) {
      const targetNorm = selCol.toString().replace(/\s+/g, ' ').trim().toLowerCase();

      // 1. prod.colors array with uploaded images from Admin Panel
      if (Array.isArray(prod.colors)) {
        const foundColorObj = prod.colors.find((c) => {
          const cNorm = (typeof c === 'object' ? (c.name || c.rawName || '') : c).toString().replace(/\s+/g, ' ').trim().toLowerCase();
          return cNorm === targetNorm;
        });
        if (foundColorObj && typeof foundColorObj === 'object') {
          const colImg = Array.isArray(foundColorObj.images) && foundColorObj.images[0] ? foundColorObj.images[0] : (foundColorObj.image || foundColorObj.url);
          if (colImg) return colImg;
        }
      }

      // 2. prod.variants with uploaded images from Admin Panel
      if (Array.isArray(prod.variants)) {
        const foundVariant = prod.variants.find(v => {
          if (!v.color) return false;
          return v.color.toString().replace(/\s+/g, ' ').trim().toLowerCase() === targetNorm;
        });
        if (foundVariant && foundVariant.images && foundVariant.images[0]) {
          return foundVariant.images[0];
        }
      }

      // 3. Direct colorImages mapping object
      if (prod.colorImages && typeof prod.colorImages === 'object') {
        const matchKey = Object.keys(prod.colorImages).find(k => k.toLowerCase() === targetNorm);
        if (matchKey && prod.colorImages[matchKey]) {
          return prod.colorImages[matchKey];
        }
      }

      // 4. Match color index in prod.colors with index in prod.images
      if (Array.isArray(prod.colors)) {
        const colorIdx = prod.colors.findIndex((c) => {
          const cNorm = (typeof c === 'object' ? (c.name || c.rawName || '') : c).toString().replace(/\s+/g, ' ').trim().toLowerCase();
          return cNorm === targetNorm;
        });
        if (colorIdx !== -1 && Array.isArray(prod.images) && prod.images[colorIdx]) {
          return prod.images[colorIdx];
        }
      }
    }

    return prod.displayImage || prod.image || (Array.isArray(prod.images) && prod.images[0]) || fallbackCategoryImg;
  };

  const handleClear = () => {
    setSelectedIds(['', '', '']);
    setSelectedColors({});
  };

  const handleAddToCart = (product, slotIdx) => {
    if (!product || product.stock === 0) return;
    const activeColor = selectedColors[slotIdx] || (Array.isArray(product.colors) ? (typeof product.colors[0] === 'object' ? product.colors[0].name : product.colors[0]) : '');
    const titleWithColor = activeColor ? `${product.title || product.name} (${activeColor})` : (product.title || product.name);
    
    dispatch(addToCart({
      _id: product._id,
      title: titleWithColor,
      price: product.price,
      images: [getProductImage(product, slotIdx)],
      brand: product.brand || 'Apple',
      stock: product.stock,
      quantity: 1
    }));
    setCartSuccess(`${titleWithColor} added to cart!`);
    setTimeout(() => setCartSuccess(''), 3000);
  };

  // Get selected products objects
  const selectedProducts = selectedIds.map(id => currentCategoryProducts.find(p => p._id === id) || null);
  const activeCount = selectedProducts.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-24 pb-16 px-4 font-sans text-left">
      {cartSuccess && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-450" />
          <span className="text-sm font-semibold">{cartSuccess}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Category Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => handleCategorySwitch('mac')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'mac'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Laptop className="h-4 w-4" />
            Mac Models
          </button>
          <button
            onClick={() => handleCategorySwitch('ipad')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'ipad'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Tablet className="h-4 w-4" />
            iPad Models
          </button>
          <button
            onClick={() => handleCategorySwitch('iphone')}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === 'iphone'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            iPhone Models
          </button>
        </div>

        {/* Centered Apple Header */}
        <header className="mb-8 text-center flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
            {activeCategory === 'ipad' ? 'Compare iPad models' : activeCategory === 'iphone' ? 'Compare iPhone models' : 'Compare Mac models'}
          </h1>
          <div className="flex items-center justify-center gap-5 mt-3 text-sm font-semibold text-zinc-900">
            <Link to={activeCategory === 'ipad' ? "/ipad" : activeCategory === 'iphone' ? "/iphone" : "/macbook"} className="hover:underline flex items-center gap-0.5">
              {activeCategory === 'ipad' ? 'Shop iPad' : activeCategory === 'iphone' ? 'Shop iPhone' : 'Shop Mac'} <span className="text-xs">›</span>
            </Link>
            <a href="#specialist" className="hover:underline flex items-center gap-0.5">
              Chat with a Specialist <span className="text-xs">›</span>
            </a>
          </div>
        </header>

        {/* Dropdown selectors row matching image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 max-w-5xl mx-auto">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="relative">
              <select
                value={selectedIds[idx]}
                onChange={(e) => handleSelectChange(idx, e.target.value)}
                className={`w-full bg-white border rounded-xl px-4 py-3.5 text-sm font-bold text-zinc-900 appearance-none focus:outline-none transition-all cursor-pointer pr-10 shadow-xs ${
                  idx === 1 || (selectedIds[idx] && idx === 1)
                    ? 'border-zinc-900 ring-2 ring-zinc-900/10'
                    : 'border-zinc-250 hover:border-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10'
                }`}
              >
                <option value="">Select a {activeCategory === 'ipad' ? 'iPad' : activeCategory === 'iphone' ? 'iPhone' : 'Mac'} model...</option>
                {currentCategoryProducts.map((p) => (
                  <option 
                    key={p._id} 
                    value={p._id}
                    disabled={selectedIds.includes(p._id) && selectedIds[idx] !== p._id}
                  >
                    {p.title || p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-900">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>

        {activeCount > 0 && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer bg-white shadow-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Clear selection
            </button>
          </div>
        )}

        {/* Comparison grid content */}
        {activeCount === 0 ? (
          <div className="bg-white border border-zinc-150 rounded-3xl p-16 text-center shadow-sm space-y-4 max-w-4xl mx-auto">
            {activeCategory === 'ipad' ? (
              <Tablet className="h-12 w-12 text-zinc-350 mx-auto" />
            ) : activeCategory === 'iphone' ? (
              <Smartphone className="h-12 w-12 text-zinc-350 mx-auto" />
            ) : (
              <Laptop className="h-12 w-12 text-zinc-350 mx-auto" />
            )}
            <div>
              <h2 className="text-lg font-bold text-zinc-800">No {activeCategory === 'ipad' ? 'iPad' : activeCategory === 'iphone' ? 'iPhone' : 'Mac'} Models Selected</h2>
              <p className="text-zinc-550 text-xs mt-1">Use the dropdown menus above to compare {activeCategory === 'ipad' ? 'iPad' : activeCategory === 'iphone' ? 'iPhone' : 'Mac'} models side-by-side.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-150 rounded-3xl shadow-sm overflow-hidden divide-y divide-zinc-100 max-w-5xl mx-auto">
            {/* Row: Main Card / Photo */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              {[0, 1, 2].map((idx) => {
                const prod = selectedProducts[idx];
                if (!prod) {
                  return (
                    <div key={idx} className="p-8 text-center text-zinc-400 text-xs italic flex items-center justify-center min-h-64">
                      Empty Slot
                    </div>
                  );
                }
                const activeColor = selectedColors[idx] || (Array.isArray(prod.colors) && prod.colors.length > 0 ? (typeof prod.colors[0] === 'object' ? prod.colors[0].name : prod.colors[0]) : '');

                return (
                  <div key={idx} className="p-8 flex flex-col items-center justify-between min-h-64 space-y-6">
                    <div className="h-44 w-44 rounded-2xl bg-white border border-zinc-100 p-2 flex items-center justify-center overflow-hidden relative group">
                      <img 
                        src={getProductImage(prod, idx)} 
                        alt={prod.title || prod.name} 
                        className="object-contain max-h-full max-w-full hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    
                    <div className="text-center space-y-2 w-full">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{prod.brand || 'Apple'}</span>
                      <h3 className="font-extrabold text-base text-zinc-900 leading-tight">{prod.title || prod.name}</h3>
                      <p className="font-extrabold text-lg text-zinc-900">₹{prod.price?.toLocaleString('en-IN')}</p>

                      {/* Interactive Color Selection Dots directly inside Card */}
                      {Array.isArray(prod.colors) && prod.colors.length > 0 && (
                        <div className="pt-2 flex flex-col items-center gap-1.5">
                          <div className="flex items-center justify-center gap-3 flex-wrap py-1">
                            {prod.colors.map((col, cIdx) => {
                              const colName = typeof col === 'object' ? col.name : col;
                              const isSelected = activeColor === colName;
                              const cNameLower = (colName || '').toLowerCase();
                              const isSpaceBlack = cNameLower.includes('space black');
                              const isPinkBlush = cNameLower.includes('pink') || cNameLower.includes('blush') || cNameLower.includes('rose');
                              const isYellowCitrus = cNameLower.includes('yellow') || cNameLower.includes('citrus') || cNameLower.includes('lime') || cNameLower.includes('gold');
                              const isBlueSlate = cNameLower.includes('sky blue') || cNameLower.includes('blue') || cNameLower.includes('slate') || cNameLower.includes('indigo');
                              const isCloudWhite = cNameLower.includes('cloud white') || cNameLower.includes('silver') || (cNameLower.includes('white') && !cNameLower.includes('titanium'));

                              let swatchBgImage = 'none';
                              if (isSpaceBlack) swatchBgImage = 'url(/space_black_swatch.png)';
                              else if (isPinkBlush) swatchBgImage = 'url(/neo_pink.png)';
                              else if (isYellowCitrus) swatchBgImage = 'url(/neo_yellow.png)';
                              else if (isBlueSlate) swatchBgImage = 'url(/neo_blue.png)';
                              else if (isCloudWhite) swatchBgImage = 'url(/neo_silver.png)';

                              return (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => handleColorChange(idx, colName)}
                                  className={`w-4 h-4 rounded-full border shadow-xs transition-all cursor-pointer ${
                                    isSelected ? 'scale-110 border-zinc-900 ring-2 ring-offset-2 ring-[#0071e3] z-10' : 'border-zinc-300 hover:scale-105'
                                  }`}
                                  style={{
                                    backgroundColor: resolveColorValue(col),
                                    backgroundImage: swatchBgImage,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                                  title={colName}
                                />
                              );
                            })}
                          </div>
                          {activeColor && (
                            <span className="text-[10px] text-zinc-500 font-semibold capitalize">
                              {activeColor}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full space-y-2">
                      {prod.stock === 0 ? (
                        <div className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold tracking-wider uppercase border border-rose-100">
                          <ShieldAlert className="h-4.5 w-4.5" />
                          Out of Stock
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(prod, idx)}
                          className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-0 shadow-xs"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </button>
                      )}
                      <Link
                        to={`/product/${prod._id}`}
                        className="w-full block text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Row: Storage Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              {[0, 1, 2].map((idx) => {
                const prod = selectedProducts[idx];
                if (!prod) return <div key={idx} className="p-6"></div>;
                return (
                  <div key={idx} className="p-6 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider block">Storage Capacity</span>
                    <p className="text-xs font-bold text-zinc-800">
                      {Array.isArray(prod.storage) && prod.storage.length > 0
                        ? prod.storage.join(' / ')
                        : Array.isArray(prod.sizes) && prod.sizes.length > 0
                          ? prod.sizes.join(' / ')
                          : '256GB / 512GB / 1TB'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Row: RAM Option */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              {[0, 1, 2].map((idx) => {
                const prod = selectedProducts[idx];
                if (!prod) return <div key={idx} className="p-6"></div>;
                return (
                  <div key={idx} className="p-6 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider block">RAM Configuration</span>
                    <p className="text-xs font-bold text-zinc-800">
                      {Array.isArray(prod.ram) && prod.ram.length > 0
                        ? prod.ram.join(' / ')
                        : prod.ram || '8GB / 16GB / 24GB Unified Memory'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Row: Material & Specs details */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              {[0, 1, 2].map((idx) => {
                const prod = selectedProducts[idx];
                if (!prod) return <div key={idx} className="p-6"></div>;
                return (
                  <div key={idx} className="p-6 text-center space-y-1.5 max-w-sm mx-auto">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider block">Build / Material</span>
                    <p className="text-xs font-semibold text-zinc-700 italic">
                      {prod.material || 'Recycled Aluminum Enclosure'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Row: Key Features checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              {[0, 1, 2].map((idx) => {
                const prod = selectedProducts[idx];
                if (!prod) return <div key={idx} className="p-6"></div>;
                return (
                  <div key={idx} className="p-6 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider block text-center">Highlighted Features</span>
                    <ul className="space-y-1.5 text-xs text-zinc-650 max-w-xs mx-auto">
                      {Array.isArray(prod.features) && prod.features.length > 0 ? (
                        prod.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#0071e3] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))
                      ) : (
                        <p className="text-center text-zinc-400 italic text-[11px]">Apple Silicon Performance & Retina Display</p>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
