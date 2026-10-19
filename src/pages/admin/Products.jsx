import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  GripVertical,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Star,
  Eye,
  Smartphone,
  Monitor,
  Search,
  History
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productApi';
import { getCategories } from '../../services/categoryApi';
import axiosClient from '../../services/axiosClient';
import VariantTagInput from '../../components/VariantTagInput';
import { notifyAdminChange } from '../../services/liveSyncService';
import { resolveColorHex, resolveColorValue, isValidHex, normalizeHex } from '../../utils/colorResolver';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock logs modal states
  const [showStockLogsModal, setShowStockLogsModal] = useState(false);
  const [stockLogs, setStockLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchStockLogs = async () => {
    setLoadingLogs(true);
    setShowStockLogsModal(true);
    try {
      const response = await axiosClient.get('/products/admin/stock-history');
      setStockLogs(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleToggleStock = async (prod) => {
    const targetStock = prod.stock === 0 ? 10 : 0;
    try {
      await updateProduct(prod._id, { stock: targetStock });
      setSuccess('Product stock status toggled successfully!');
      // Update local state
      setProducts(products.map(p => p._id === prod._id ? { ...p, stock: targetStock } : p));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update stock status.');
    }
  };

  const filteredProducts = products.filter(prod => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    
    const title = (prod.title || prod.name || '').toString().toLowerCase();
    const category = (prod.category?.name || prod.category?.slug || prod.category || '').toString().toLowerCase();
    const brand = (prod.brand || '').toString().toLowerCase();
    const sku = (prod.sku || prod.partNumber || prod.modelNumber || '').toString().toLowerCase();

    if (title.includes(query) || category.includes(query) || brand.includes(query) || sku.includes(query)) {
      return true;
    }

    const normTitle = title.replace(/^i(?=[a-z])/i, '');
    const normQuery = query.replace(/^i(?=[a-z])/i, '');
    if (normTitle.includes(normQuery)) {
      return true;
    }

    if (prod.variants && Array.isArray(prod.variants)) {
      const matchVariant = prod.variants.some(v => {
        const vText = `${v.title || ''} ${v.displayTitle || ''} ${v.sku || ''} ${v.partNumber || ''} ${v.modelNumber || ''} ${v.color || ''} ${v.storage || ''}`.toLowerCase();
        return vText.includes(query) || vText.includes(normQuery);
      });
      if (matchVariant) return true;
    }

    return false;
  });

  // Forms states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop or mobile
  const [selectedPreviewColor, setSelectedPreviewColor] = useState('');
  const [selectedPreviewStorage, setSelectedPreviewStorage] = useState('');
  const [selectedPreviewRam, setSelectedPreviewRam] = useState('');
  const [activePreviewMainImage, setActivePreviewMainImage] = useState('');

  // Product form data
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: 0,
    stock: '',
    brand: 'Apple',
    category: '',
    sizes: [],
    colors: [],
    storage: [],
    ram: [],
    glasses: [],
    processors: [],
    material: [],
    features: [],
    specifications: [],
    images: [],
    variants: [],
    partNumber: '',
    modelNumber: '',
    seoTitle: '',
    seoDescription: '',
    tags: []
  });

  const [newTagInput, setNewTagInput] = useState('');

  // Uploading status
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        getProducts({ limit: 100 }),
        getCategories()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : (prodData.products || []));
      setCategories(catData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const uploadedUrls = response.data.map(item => item.url);
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      showSuccessMessage('Images uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVariantImageUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingColorIndex(variantIndex);
    setError(null);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const uploadedUrls = response.data.map(item => item.url);

      // Update variant's image list
      setProductForm(prev => {
        const updatedVariants = [...prev.variants];
        const targetVariant = updatedVariants[variantIndex];
        const existingImages = targetVariant.images || [];

        updatedVariants[variantIndex] = {
          ...targetVariant,
          images: [...existingImages, ...uploadedUrls]
        };

        return {
          ...prev,
          variants: updatedVariants
        };
      });
      showSuccessMessage('Variant images uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Variant image upload failed');
    } finally {
      setUploadingColorIndex(null);
    }
  };

  const handleAutoGenerateColorVariants = () => {
    const currentColors = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c);
    if (currentColors.length === 0) {
      setError("Please add at least one color in 'Colors Config Options' first!");
      return;
    }

    const newVariants = [...(productForm.variants || [])];
    let countAdded = 0;

    currentColors.forEach(colorName => {
      const exists = newVariants.find(v => (v.color || '').toString().toLowerCase() === colorName.toLowerCase());
      if (!exists) {
        newVariants.push({
          color: colorName,
          colorHex: resolveColorHex(colorName),
          price: productForm.price || '',
          discountPrice: productForm.discountPrice || '',
          stock: productForm.stock || 10,
          sku: `${productForm.brand ? productForm.brand.slice(0,3).toUpperCase() : 'APP'}-${colorName.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
          partNumber: '',
          images: []
        });
        countAdded++;
      }
    });

    setProductForm({
      ...productForm,
      variants: newVariants
    });
    showSuccessMessage(`Generated ${countAdded} Color Part Number blocks! Scroll to 'Variants' below to enter MPNs.`);
  };

  const handleAutoGenerateFullMatrixVariants = () => {
    const currentColors = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(Boolean);
    const currentStorages = (productForm.storages || []).filter(Boolean);
    const currentRams = (productForm.rams || []).filter(Boolean);

    if (currentColors.length === 0 && currentStorages.length === 0 && currentRams.length === 0) {
      setError("Please enter Colors, Storage, or RAM options in Config Options first!");
      return;
    }

    const colorList = currentColors.length > 0 ? currentColors : [''];
    const storageList = currentStorages.length > 0 ? currentStorages : [''];
    const ramList = currentRams.length > 0 ? currentRams : [''];

    const newVariants = [...(productForm.variants || [])];
    let countAdded = 0;

    colorList.forEach(cName => {
      storageList.forEach(sName => {
        ramList.forEach(rName => {
          const exists = newVariants.find(v => 
            (v.color || '').toString().toLowerCase() === (cName || '').toLowerCase() &&
            (v.storage || '').toString().toLowerCase() === (sName || '').toLowerCase() &&
            (v.ram || '').toString().toLowerCase() === (rName || '').toLowerCase()
          );

          if (!exists) {
            newVariants.push({
              color: cName,
              colorHex: resolveColorHex(cName),
              storage: sName,
              ram: rName,
              price: productForm.price || '',
              discountPrice: productForm.discountPrice || '',
              stock: productForm.stock || 10,
              sku: `MPN-${cName ? cName.slice(0,2).toUpperCase() : 'XX'}-${sName ? sName.replace(/[^0-9]/g, '') : '0'}-${rName ? rName.replace(/[^0-9]/g, '') : '0'}-${Date.now().toString().slice(-3)}`,
              partNumber: '',
              images: []
            });
            countAdded++;
          }
        });
      });
    });

    setProductForm({
      ...productForm,
      variants: newVariants
    });
    showSuccessMessage(`Generated ${countAdded} (Color + Storage + RAM) Combination Variant Blocks! Scroll down to enter individual MPNs & Prices.`);
  };

  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!productForm.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    // Ensure we have at least one variant if none are specified
    let finalVariants = [...(productForm.variants || [])];
    if (finalVariants.length === 0) {
      const fallbackColor = productForm.colors?.[0]?.name || productForm.colors?.[0] || 'Standard';
      finalVariants = [{
        size: productForm.sizes?.[0] || 'Standard',
        color: fallbackColor,
        colorHex: resolveColorHex(fallbackColor),
        price: Number(productForm.price || 0),
        discountPrice: Number(productForm.discountPrice || 0),
        stock: Number(productForm.stock || 0),
        sku: `PRO-${Date.now().toString().slice(-4)}`,
        images: productForm.images || []
      }];
    }

    finalVariants = finalVariants.map(v => ({
      ...v,
      colorHex: (v.colorHex && isValidHex(v.colorHex)) ? normalizeHex(v.colorHex) : resolveColorHex(v.color || '')
    }));

    const variantColors = [];
    const variantSizes = [];
    const variantStorage = [];
    const variantRam = [];
    const variantProcessors = [];

    finalVariants.forEach(v => {
      if (v.color && !variantColors.find(c => (c.name || c) === v.color)) {
        const hex = v.colorHex || resolveColorHex(v.color);
        variantColors.push({ name: v.color, value: hex, colorHex: hex, images: v.images || [] });
      }
      if (v.size && !variantSizes.includes(v.size)) {
        variantSizes.push(v.size);
      }
      if (v.storage && !variantStorage.includes(v.storage)) {
        variantStorage.push(v.storage);
      }
      if (v.ram && !variantRam.includes(v.ram)) {
        variantRam.push(v.ram);
      }
      if ((v.processor || v.chip) && !variantProcessors.includes(v.processor || v.chip)) {
        variantProcessors.push(v.processor || v.chip);
      }
    });

    // Combine manual tag inputs and variant-extracted configurations
    const finalColors = [...(productForm.colors || [])];
    variantColors.forEach(vc => {
      const vcName = typeof vc === 'object' ? vc.name : vc;
      if (!finalColors.find(c => (c.name || c) === vcName)) {
        finalColors.push(vc);
      }
    });

    const finalSizes = [...(productForm.sizes || [])];
    variantSizes.forEach(vs => {
      if (!finalSizes.includes(vs)) finalSizes.push(vs);
    });

    const finalStorage = [...(productForm.storage || [])];
    variantStorage.forEach(vt => {
      if (!finalStorage.includes(vt)) finalStorage.push(vt);
    });

    const finalRam = [...(productForm.ram || [])];
    variantRam.forEach(vr => {
      if (!finalRam.includes(vr)) finalRam.push(vr);
    });

    const finalProcessors = [...(productForm.processors || [])];
    variantProcessors.forEach(vp => {
      if (!finalProcessors.includes(vp)) finalProcessors.push(vp);
    });

    const finalVariantsWithPrice = finalVariants.map(v => ({
      ...v,
      price: Number(v.price || productForm.price || 0),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : (productForm.discountPrice ? Number(productForm.discountPrice) : 0),
      stock: Number(v.stock || 0)
    }));

    const formattedProduct = {
      ...productForm,
      price: Number(productForm.price || finalVariantsWithPrice[0]?.price || 0),
      discountPrice: Number(productForm.discountPrice || finalVariantsWithPrice[0]?.discountPrice || 0),
      stock: finalVariantsWithPrice.reduce((acc, v) => acc + Number(v.stock || 0), 0),
      sizes: finalSizes,
      colors: finalColors,
      storage: finalStorage,
      ram: finalRam,
      processors: finalProcessors,
      variants: finalVariantsWithPrice,
      specifications: (productForm.specifications || []).filter(s => s && (s.name?.trim() || s.value?.trim()))
    };

    // Auto-populate top-level images from all variant images
    const allImages = [];
    if (productForm.images && productForm.images.length > 0) {
      productForm.images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
      });
    }
    finalVariants.forEach(v => {
      if (v.images) {
        v.images.forEach(img => {
          if (!allImages.includes(img)) allImages.push(img);
        });
      }
    });
    formattedProduct.images = allImages;

    if (formattedProduct.images.length === 0) {
      setError('Please upload at least one product image or variant image');
      setLoading(false);
      return;
    }

    try {
      if (editProductId) {
        await updateProduct(editProductId, formattedProduct);
        showSuccessMessage('Product updated successfully!');
        notifyAdminChange('products', { action: 'update', id: editProductId });
      } else {
        await createProduct(formattedProduct);
        showSuccessMessage('Product created successfully!');
        notifyAdminChange('products', { action: 'create' });
      }
      resetProductForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Product operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProductEditClick = (prod) => {
    setEditProductId(prod._id);

    let prodVariants = prod.variants || [];
    if (prodVariants.length === 0 && (prod.price || prod.stock)) {
      prodVariants = [{
        color: prod.colors && prod.colors[0] ? (prod.colors[0].name || prod.colors[0]) : '',
        price: prod.price,
        discountPrice: prod.discountPrice || 0,
        stock: prod.stock,
        sku: `${prod.brand ? prod.brand.slice(0, 3).toUpperCase() : 'PRO'}-${Date.now().toString().slice(-4)}`,
        images: prod.images || []
      }];
    }

    const mappedVariants = prodVariants.map((v, idx) => {
      let discVal = (v.discountInput !== undefined && v.discountInput !== null && v.discountInput !== '')
        ? v.discountInput
        : (v.discountPercent !== undefined && v.discountPercent !== null && v.discountPercent !== '' 
            ? v.discountPercent 
            : (v.discount !== undefined && v.discount !== null && v.discount !== '' ? v.discount : ''));

      if (discVal === '' || discVal === undefined) {
        if (v.discountPrice !== undefined && v.discountPrice !== null && Number(v.discountPrice) > 0 && v.price && Number(v.price) > Number(v.discountPrice)) {
          const pct = Math.round(((Number(v.price) - Number(v.discountPrice)) / Number(v.price)) * 100);
          discVal = pct;
        }
      }

      const numDisc = (discVal !== '' && discVal !== undefined && discVal !== null) ? Number(discVal) : null;

      return {
        ...v,
        id: v.id || (v._id ? String(v._id) : `var-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`),
        discount: numDisc !== null ? numDisc : (v.discount ?? 0),
        discountPercent: numDisc !== null ? numDisc : (v.discountPercent ?? 0),
        discountInput: (numDisc !== null && numDisc !== 0) ? numDisc : '',
        discountPrice: (v.discountPrice !== undefined && v.discountPrice !== null) ? v.discountPrice : (v.price || '')
      };
    });

    setProductForm({
      title: prod.title || '',
      description: prod.description || '',
      price: prod.price || '',
      discountPrice: prod.discountPrice || 0,
      stock: prod.stock || '',
      brand: prod.brand || 'Apple',
      category: prod.category?._id || prod.category || '',
      sizes: Array.isArray(prod.sizes) ? prod.sizes : (prod.sizes ? [prod.sizes] : []),
      colors: Array.isArray(prod.colors) ? prod.colors : (prod.colors ? [prod.colors] : []),
      storage: Array.isArray(prod.storage) ? prod.storage : (prod.storage ? [prod.storage] : []),
      ram: Array.isArray(prod.ram) ? prod.ram : (prod.ram ? [prod.ram] : []),
      glasses: Array.isArray(prod.glasses) ? prod.glasses : (prod.glasses ? [prod.glasses] : []),
      processors: Array.isArray(prod.processors) ? prod.processors : (prod.processor ? [prod.processor] : []),
      material: prod.material || [],
      features: prod.features || [],
      specifications: Array.isArray(prod.specifications) ? prod.specifications : [],
      images: prod.images || [],
      variants: mappedVariants,
      partNumber: prod.partNumber || '',
      modelNumber: prod.modelNumber || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
      tags: prod.tags || (prod.title ? prod.title.split(' ') : [])
    });
    setShowProductForm(true);

    // Set initial preview selections
    if (prod.colors && prod.colors.length > 0) {
      setSelectedPreviewColor(prod.colors[0]?.name || prod.colors[0]);
    }
    if (prod.storage && prod.storage.length > 0) {
      setSelectedPreviewStorage(prod.storage[0]);
    }
    if (prod.ram && prod.ram.length > 0) {
      setSelectedPreviewRam(prod.ram[0]);
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setProducts(prev => prev.filter(p => p._id !== id));
    try {
      await deleteProduct(id);
      showSuccessMessage('Product deleted successfully!');
      notifyAdminChange('products', { action: 'delete', id });
      fetchData();
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete product');
      fetchData();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      discountPrice: 0,
      stock: '',
      brand: 'Apple',
      category: '',
      sizes: [],
      colors: [],
      storage: [],
      ram: [],
      glasses: [],
      material: [],
      features: [],
      specifications: [],
      images: [],
      variants: [],
      partNumber: '',
      modelNumber: '',
      seoTitle: '',
      seoDescription: '',
      tags: []
    });
    setEditProductId(null);
    setShowProductForm(false);
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const addTag = () => {
    if (newTagInput.trim() && !productForm.tags?.includes(newTagInput.trim())) {
      setProductForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTagInput.trim()]
      }));
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleAddVariant = () => {
    setProductForm(prev => {
      const cName = prev.colors?.[0]?.name || prev.colors?.[0] || '';
      const cHex = prev.colors?.[0]?.colorHex || prev.colors?.[0]?.value || resolveColorHex(cName);
      const newVariant = {
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        color: cName,
        colorHex: cHex,
        price: prev.price || '',
        discountPrice: '',
        discountPercent: 0,
        discount: 0,
        discountInput: '',
        stock: prev.stock !== undefined && prev.stock !== '' ? prev.stock : 10,
        sku: `PRO-${Date.now().toString().slice(-4)}`,
        partNumber: '',
        modelNumber: '',
        storage: prev.storage?.[0] || '',
        ram: prev.ram?.[0] || '',
        size: prev.sizes?.[0] || '',
        images: []
      };
      return {
        ...prev,
        variants: [...(prev.variants || []), newVariant]
      };
    });
  };

  const handleUpdateVariant = (index, updates) => {
    setProductForm(prev => {
      const variants = [...(prev.variants || [])];
      if (index < 0 || index >= variants.length) return prev;
      variants[index] = {
        ...variants[index],
        ...(typeof updates === 'function' ? updates(variants[index]) : updates)
      };
      return { ...prev, variants };
    });
  };

  const handleDeleteVariant = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
  };

  const handleMoveVariant = (index, direction) => {
    setProductForm(prev => {
      const list = [...(prev.variants || [])];
      if (index < 0 || index >= list.length) return prev;
      const [target] = list.splice(index, 1);
      let newIdx = index;
      if (direction === 'first') newIdx = 0;
      else if (direction === 'up') newIdx = Math.max(0, index - 1);
      else if (direction === 'down') newIdx = Math.min(list.length, index + 1);
      else if (direction === 'last') newIdx = list.length;
      list.splice(newIdx, 0, target);
      return { ...prev, variants: list };
    });
  };

  // Find dynamic price to display in the live preview
  const getPreviewPrice = () => {
    if (productForm.variants && productForm.variants.length > 0) {
      const match = productForm.variants.find(v =>
        (selectedPreviewColor ? v.color === selectedPreviewColor : true) &&
        (selectedPreviewStorage ? v.storage === selectedPreviewStorage : true) &&
        (selectedPreviewRam ? v.ram === selectedPreviewRam : true)
      );
      if (match && match.price) return Number(match.price);
      return Number(productForm.variants[0].price || 0);
    }
    return Number(productForm.price || 0);
  };

  const getPreviewImages = () => {
    // Collect all images matching selected color variant or fallback
    if (productForm.variants && productForm.variants.length > 0) {
      const match = productForm.variants.find(v => v.color === selectedPreviewColor);
      if (match && match.images && match.images.length > 0) return match.images;

      const anyVarWithImg = productForm.variants.find(v => v.images && v.images.length > 0);
      if (anyVarWithImg) return anyVarWithImg.images;
    }
    if (productForm.images && productForm.images.length > 0) return productForm.images;
    return ['/iphone_category_v2.jpg'];
  };

  // Sync active main image with selected preview color's images
  useEffect(() => {
    const imgs = getPreviewImages();
    if (imgs && imgs.length > 0) {
      setActivePreviewMainImage(imgs[0]);
    } else {
      setActivePreviewMainImage('/iphone_category_v2.jpg');
    }
  }, [selectedPreviewColor, productForm.variants, productForm.images]);

  return (
    <div className="w-full text-left font-sans">
      {/* Alert toast notification */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-zinc-900 text-white py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <Check className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Global error banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm text-left">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Operation Error</p>
            <p className="text-rose-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-450 hover:text-rose-650 cursor-pointer border-0 bg-transparent">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!showProductForm ? (
        <div>
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 text-left">
            <div>
              <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-900">Products Inventory</h1>
              <p className="text-zinc-500 mt-1 text-sm">Add product models, modify specifications, and manage galleries.</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={fetchStockLogs}
                className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-4.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-zinc-250"
              >
                <History className="h-4 w-4 text-zinc-500" />
                STOCK LOGS
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-3 rounded-2xl text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer border-0"
              >
                <Plus className="h-4.5 w-4.5" />
                Add Product
              </button>
            </div>
          </header>

          {/* Search Input Bar */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>

          {/* Products Table List */}
          <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm overflow-hidden text-left">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mb-3" />
                <span className="text-sm">Fetching catalog list...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Package className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <span className="text-sm">No products found in the database. Click "Add Product" to create one.</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">
                <Package className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <span className="text-sm">No products match your search query. Try another term.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500 uppercase text-[10px] tracking-widest font-extrabold border-b border-zinc-100">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod._id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white border border-zinc-150 p-1 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={prod.images?.[0] || '/iphone_category_v2.jpg'}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 block font-sans text-sm">
                              {(() => {
                                const cleanTitle = (t) => (t || '').replace(/\s*[A-Z0-9]{5,9}\/[A-Z]$/i, '').trim();
                                return cleanTitle(prod.title);
                              })()}
                            </span>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {/* Variants Count badge */}
                              {prod.variants && prod.variants.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-[#0071e3] border border-blue-200/80">
                                  {prod.variants.length} Variants
                                </span>
                              )}

                              {/* Storage badge */}
                              {prod.storage && prod.storage.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  💾 {Array.isArray(prod.storage) ? prod.storage.join(', ') : prod.storage}
                                </span>
                              )}

                              {/* RAM badge */}
                              {prod.ram && prod.ram.length > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                  ⚡ {Array.isArray(prod.ram) ? prod.ram.join(', ') : prod.ram}
                                </span>
                              )}

                              {/* Part Number / SKU badge */}
                              {(() => {
                                const skus = Array.from(new Set([
                                  prod.partNumber,
                                  ...(prod.variants || []).map(v => v.partNumber || v.sku)
                                ].filter(Boolean)));

                                if (skus.length === 0) return null;

                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-50 text-amber-900 border border-amber-200/80" title={skus.join(', ')}>
                                    <span className="text-amber-700 uppercase font-sans">SKU{skus.length > 1 ? `s (${skus.length})` : ''}:</span>
                                    <span>{skus.slice(0, 3).join(', ')}{skus.length > 3 ? ` +${skus.length - 3} more` : ''}</span>
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-zinc-500 font-medium font-sans">
                          {prod.category?.name || 'Unassigned'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-zinc-800 font-sans">
                          ₹{prod.price?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div>
                              {prod.stock === 0 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                  OUT OF STOCK
                                </span>
                              ) : prod.stock <= 5 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                  LOW STOCK ({prod.stock})
                                </span>
                              ) : (
                                <span className="text-zinc-650 font-bold text-xs bg-zinc-100 px-2 py-1 rounded-md">{prod.stock} units</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleToggleStock(prod)}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase transition-all border cursor-pointer ${
                                prod.stock === 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-750 border-rose-250 hover:bg-rose-100'
                              }`}
                              title={prod.stock === 0 ? "Mark In-Stock (10 units)" : "Mark Out-of-Stock (0 units)"}
                            >
                              {prod.stock === 0 ? 'Restock' : 'OOS'}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleProductEditClick(prod)}
                            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-[#0071e3] transition-all cursor-pointer inline-block border-0 bg-transparent"
                            title="Edit specs"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod._id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-zinc-500 hover:text-rose-600 transition-all cursor-pointer inline-block border-0 bg-transparent"
                            title="Delete model"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Add / Edit Product Form UI matching screenshot layout
        <div className="bg-[#f8fafc] min-h-screen -m-6 sm:-m-8 md:-m-10 p-6 sm:p-8 font-sans">

          {/* Header Row */}
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left border-b border-zinc-200 pb-5">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={resetProductForm}
                className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 cursor-pointer transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Products</span>
                  <span className="text-zinc-300 text-sm">/</span>
                  <span className="text-xs text-zinc-650 font-bold uppercase tracking-wider">{editProductId ? 'Edit Product' : 'Add Product'}</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 mt-1">
                  {productForm.title || (editProductId ? 'Edit Product' : 'New Product')}
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </h1>
              </div>
            </div>

            {/* Top controls: Desktop/Mobile toggles & action buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white border border-zinc-200 rounded-xl p-1 flex items-center shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-0 ${previewMode === 'desktop' ? 'bg-[#0071e3] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-850 bg-transparent'}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-0 ${previewMode === 'mobile' ? 'bg-[#0071e3] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-850 bg-transparent'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleProductSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer border-0 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                  Publish Product
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Form on left, live preview on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column (Col Span 8) - Editor Form */}
            <div className="lg:col-span-8 space-y-6">

              {/* Tabs indicator */}
              <div className="flex border-b border-zinc-200 gap-6 text-xs font-bold text-zinc-500 pb-2 overflow-x-auto select-none">
                <span onClick={() => document.getElementById('basic-info-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0071e3] cursor-pointer pb-2">Basic Information</span>
                <span onClick={() => document.getElementById('variants-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0071e3] cursor-pointer pb-2">Variants</span>
                <span onClick={() => document.getElementById('specifications-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0071e3] cursor-pointer pb-2">Specifications</span>
                <span onClick={() => document.getElementById('seo-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#0071e3] cursor-pointer pb-2">SEO</span>
              </div>

              {/* Basic Information Card */}
              <div id="basic-info-section" className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm text-left scroll-mt-24">

                {/* Title */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MacBook Air (M3 Chip)"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:border-[#0071e3]"
                  />
                </div>

                {/* Description with editor toolbar */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <div className="flex items-center gap-1.5 border border-zinc-200 border-b-0 rounded-t-xl px-3 py-2.5 bg-zinc-50/50">
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Bold className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Italic className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Underline className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-4 bg-zinc-200"></span>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><List className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><ListOrdered className="h-3.5 w-3.5" /></button>
                    <span className="w-px h-4 bg-zinc-200"></span>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><Quote className="h-3.5 w-3.5" /></button>
                    <button type="button" className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer bg-transparent border-0"><LinkIcon className="h-3.5 w-3.5" /></button>
                  </div>
                  <textarea
                    rows="5"
                    placeholder="Introduce key specs, chipset details, camera lens, etc."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-b-xl border border-zinc-200 border-t-0 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] outline-none text-sm transition-all resize-none text-zinc-800 leading-relaxed"
                  />
                </div>

                {/* Category & Brand side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white cursor-pointer"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Brand *
                    </label>
                    <select
                      required
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white cursor-pointer"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Belkin">Belkin</option>
                      <option value="Sony">Sony</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Model Number & Part Number / MPN side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Base Model Number (e.g. A3113 / A2681)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A3113"
                      value={productForm.modelNumber || ''}
                      onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                      Base Part Number / MPN (e.g. MW2U3HN/A)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MW2U3HN/A"
                      value={productForm.partNumber || ''}
                      onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm bg-white font-mono text-zinc-800"
                    />
                  </div>
                </div>

                {/* Tags section matching design */}
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2 border border-zinc-200 rounded-xl min-h-[48px] bg-white">
                    {productForm.tags && productForm.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-zinc-800 bg-transparent border-0 cursor-pointer p-0"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 outline-none text-xs px-2 py-1 min-w-[80px]"
                    />
                  </div>
                </div>

                {/* General Product Image Upload (Used if no variants exist) */}
                <div className="border-t border-zinc-150 pt-4">
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
                    Base Product Images (For non-variant items)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="base-product-upload"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />

                    {productForm.images && productForm.images.map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative h-16 w-16 rounded-xl border border-zinc-200 bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== imgIdx)
                            }));
                          }}
                          className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => document.getElementById('base-product-upload').click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#0071e3] hover:bg-zinc-50 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent transition-all shadow-sm"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                      ) : (
                        <Upload className="h-4 w-4 text-zinc-400" />
                      )}
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Upload</span>
                    </button>
                  </div>
                </div>

                {/* Base price & stock input if no variants */}
                {(!productForm.variants || productForm.variants.length === 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-zinc-150 pt-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        MRP Price (₹)
                      </label>
                      <div className="text-[9px] text-[#0071e3] font-semibold mb-1.5">(EDITABLE)</div>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={productForm.price || ''}
                        onChange={(e) => {
                          const newMrp = e.target.value;
                          const mrpNum = Number(newMrp || 0);
                          const currentDisc = productForm.discountPercent !== undefined
                            ? productForm.discountPercent
                            : (productForm.discountPrice && productForm.price ? Math.round(((productForm.price - productForm.discountPrice) / productForm.price) * 100) : 0);
                          const disc = Math.min(100, Math.max(0, parseFloat(currentDisc) || 0));
                          const finalP = Math.round(mrpNum - (mrpNum * disc / 100));
                          setProductForm({
                            ...productForm,
                            price: newMrp,
                            discountPrice: finalP
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-bold text-zinc-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        Discount (%)
                      </label>
                      <div className="text-[9px] text-blue-600 font-semibold mb-1.5">(EDITABLE)</div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={productForm.discountPercent !== undefined ? productForm.discountPercent : (productForm.discountPrice && productForm.price ? Math.round(((productForm.price - productForm.discountPrice) / productForm.price) * 100) : '')}
                        onChange={(e) => {
                          const discVal = e.target.value;
                          const disc = Math.min(100, Math.max(0, parseFloat(discVal) || 0));
                          const mrp = Number(productForm.price || 0);
                          const finalP = Math.round(mrp - (mrp * disc / 100));
                          setProductForm({
                            ...productForm,
                            discountPercent: discVal,
                            discountPrice: finalP
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-300 focus:border-[#0071e3] outline-none text-xs font-bold text-blue-700 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        Final Price (₹)
                      </label>
                      <div className="text-[9px] text-emerald-600 font-semibold mb-1.5">(AUTOMATICALLY CALCULATED)</div>
                      <input
                        type="number"
                        readOnly
                        disabled
                        value={
                          productForm.price
                            ? Math.round(Number(productForm.price) - (Number(productForm.price) * (Number(productForm.discountPercent !== undefined ? productForm.discountPercent : (productForm.discountPrice ? ((productForm.price - productForm.discountPrice)/productForm.price)*100 : 0)) / 100)))
                            : ''
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-xs font-extrabold text-emerald-700 bg-emerald-50/50 cursor-not-allowed select-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                        Stock *
                      </label>
                      <div className="text-[9px] text-zinc-400 mb-1.5">&nbsp;</div>
                      <input
                        type="number"
                        placeholder="10"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 outline-none text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Spec Option Config tags */}
                <div className="border-t border-zinc-150 pt-4 space-y-4">
                  <VariantTagInput
                    label="Sizes Config Options"
                    placeholder="e.g. 14-inch, 16-inch"
                    tags={productForm.sizes || []}
                    onChange={(tags) => {
                      const removed = (productForm.sizes || []).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.size)) {
                            return { ...v, size: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({ ...productForm, sizes: tags, variants: updatedVariants });
                    }}
                  />

                  <VariantTagInput
                    label="Colors Config Options"
                    placeholder="e.g. Silver, Space Gray"
                    tags={(productForm.colors || []).map(c => typeof c === 'object' ? c.name : c)}
                    onChange={(tags) => {
                      const removed = (productForm.colors || []).map(c => typeof c === 'object' ? c.name : c).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.color)) {
                            return { ...v, color: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({
                        ...productForm,
                        colors: tags.map(t => {
                          const existing = (productForm.colors || []).find(c => (c?.name || c) === t);
                          return existing || { name: t, value: t, images: [] };
                        }),
                        variants: updatedVariants
                      });
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={handleAutoGenerateColorVariants}
                      className="text-xs font-bold text-[#0071e3] hover:text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Generate Color-only MPN Fields
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoGenerateFullMatrixVariants}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Generate All (Color + Storage + RAM) Combination MPN & Price Fields
                    </button>
                  </div>

                  <VariantTagInput
                    label="Storage Options"
                    placeholder="e.g. 256GB SSD, 512GB SSD, 1TB SSD"
                    tags={productForm.storage || []}
                    onChange={(tags) => {
                      const removed = (productForm.storage || []).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.storage)) {
                            return { ...v, storage: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({ ...productForm, storage: tags, variants: updatedVariants });
                    }}
                  />

                  <VariantTagInput
                    label="RAM Options"
                    placeholder="e.g. 8GB, 16GB, 24GB, 32GB"
                    tags={productForm.ram || []}
                    onChange={(tags) => {
                      const removed = (productForm.ram || []).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.ram)) {
                            return { ...v, ram: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({ ...productForm, ram: tags, variants: updatedVariants });
                    }}
                  />

                  <VariantTagInput
                    label="Chip & Processor Options (Laptops & PCs / Mac)"
                    placeholder="e.g. Apple M4 chip with 8‑core CPU and 8‑core GPU, Apple M4 chip with 10-core CPU and 10-core GPU"
                    tags={productForm.processors || []}
                    onChange={(tags) => {
                      const removed = (productForm.processors || []).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.processor)) {
                            return { ...v, processor: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({ ...productForm, processors: tags, variants: updatedVariants });
                    }}
                  />

                  <VariantTagInput
                    label="Glass Finish Config Options"
                    placeholder="e.g. Standard glass, Nano-texture glass"
                    tags={productForm.glasses || []}
                    onChange={(tags) => {
                      const removed = (productForm.glasses || []).filter(t => !tags.includes(t));
                      let updatedVariants = [...(productForm.variants || [])];
                      if (removed.length > 0) {
                        updatedVariants = updatedVariants.map(v => {
                          if (removed.includes(v.glass)) {
                            return { ...v, glass: '' };
                          }
                          return v;
                        });
                      }
                      setProductForm({ ...productForm, glasses: tags, variants: updatedVariants });
                    }}
                  />
                </div>

              </div>

              {/* Variants Section Card */}
              <div id="variants-section" className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-sm text-left scroll-mt-24">
                <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                      Variants
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Configure color, price, storage, and custom image galleries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </button>
                </div>

                {/* Variants List */}
                {(!productForm.variants || productForm.variants.length === 0) ? (
                  <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
                    No variants added. The product will be created using basic price and stock settings.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {productForm.variants.map((v, vIdx) => {
                      const sizeOptionsList = productForm.sizes.length > 0 ? productForm.sizes : ["14-inch", "16-inch"];
                      const colorOptionsList = productForm.colors.length > 0 ? productForm.colors.map(c => typeof c === 'object' ? c.name : c) : ["Silver", "Space Gray", "Midnight"];
                      const storageOptionsList = productForm.storage.length > 0 ? productForm.storage : ["256GB SSD", "512GB SSD", "1TB SSD"];
                      const ramOptionsList = productForm.ram.length > 0 ? productForm.ram : ["8GB", "16GB", "24GB"];

                      return (
                        <div key={v.id || v._id || `variant-${vIdx}`} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-zinc-300 transition-all text-left">

                          {/* Variant header row with Excel-style specs summary */}
                          <div className="flex justify-between items-center border-b border-zinc-150 pb-3 bg-zinc-100/70 -mx-5 -mt-5 px-5 py-2.5 rounded-t-xl">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab" />
                              <span className="text-[11px] font-extrabold text-zinc-800 uppercase tracking-wide flex items-center gap-2 font-mono">
                                <span className="inline-block w-3.5 h-3.5 rounded-full border border-zinc-300 shrink-0 shadow-2xs" style={{ backgroundColor: resolveColorValue(v.colorHex || v.color) }} />
                                <span>#{vIdx + 1}: {v.color || 'Color'} {v.colorHex ? `(${v.colorHex})` : ''} {v.ram ? `| ${v.ram}` : ''} {v.storage ? `| ${v.storage}` : ''} {v.partNumber ? `| MPN: ${v.partNumber}` : ''} {v.price ? `| ₹${Number(v.price).toLocaleString('en-IN')}` : ''}</span>
                                {vIdx === 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-sans">Default</span>}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Reorder Buttons: First, Up, Down, Last */}
                              <div className="flex items-center gap-0.5 mr-2 bg-white/80 border border-zinc-200 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'first')}
                                  disabled={vIdx === 0}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move to First (Top)"
                                >
                                  <ArrowUpToLine className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'up')}
                                  disabled={vIdx === 0}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'down')}
                                  disabled={vIdx === productForm.variants.length - 1}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVariant(vIdx, 'last')}
                                  disabled={vIdx === productForm.variants.length - 1}
                                  className="p-1 hover:bg-zinc-100 text-zinc-600 rounded disabled:opacity-30 cursor-pointer border-0"
                                  title="Move to Last (Bottom)"
                                >
                                  <ArrowDownToLine className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteVariant(vIdx)}
                                className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Grid row: Color, Storage, RAM, Price, Discount Price, Stock, Part No. / MPN */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Color & Shade</label>
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">{v.colorHex || resolveColorHex(v.color) || '#------'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="relative shrink-0 group/color" title="Click swatch to pick custom shade">
                                  <input
                                    type="color"
                                    value={isValidHex(v.colorHex || resolveColorHex(v.color)) ? normalizeHex(v.colorHex || resolveColorHex(v.color)) : '#808080'}
                                    onChange={(e) => handleUpdateVariant(vIdx, { colorHex: e.target.value.toUpperCase() })}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                                  />
                                  <div
                                    className="w-9 h-9 rounded-xl border border-zinc-300 shadow-xs flex items-center justify-center transition-transform group-hover/color:scale-105 cursor-pointer overflow-hidden"
                                    style={{ backgroundColor: resolveColorValue(v.colorHex || v.color) }}
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="e.g. Chalk Pink"
                                  value={v.color || ''}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    const autoHex = resolveColorHex(newName);
                                    handleUpdateVariant(vIdx, curr => {
                                      const wasAuto = !curr.colorHex || curr.colorHex === resolveColorHex(curr.color || '');
                                      return {
                                        color: newName,
                                        colorHex: wasAuto ? autoHex : curr.colorHex
                                      };
                                    });
                                    if (vIdx === 0) setSelectedPreviewColor(newName);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Storage</label>
                              <input
                                type="text"
                                placeholder="e.g. 512GB SSD"
                                value={v.storage || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { storage: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">RAM</label>
                              <input
                                type="text"
                                placeholder="e.g. 16GB"
                                value={v.ram || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { ram: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Glass Finish</label>
                              <input
                                type="text"
                                placeholder="e.g. Standard glass / Nano-texture glass"
                                value={v.glass || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { glass: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Chip & Processor</label>
                              <input
                                type="text"
                                placeholder="e.g. Apple M5 chip with 10-core CPU"
                                value={v.processor || v.chip || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { processor: e.target.value, chip: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium text-zinc-900 font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Part No. / MPN *</label>
                              <input
                                type="text"
                                placeholder="e.g. MDHE4HN/A"
                                value={v.partNumber || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { partNumber: e.target.value, sku: v.sku || e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-mono font-bold text-black bg-amber-50/50"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Variant Title (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. 11-inch iPad Pro Wi‑Fi 1TB with nano-texture glass"
                                value={v.displayTitle || v.title || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { displayTitle: e.target.value, title: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">MRP Price (₹)</label>
                              <div className="text-[9px] text-[#0071e3] font-semibold mb-1">(EDITABLE)</div>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={v.price || ''}
                                onChange={(e) => {
                                  const newMrp = e.target.value;
                                  const mrpNum = Number(newMrp || 0);
                                  const currentDisc = v.discountPercent !== undefined
                                    ? v.discountPercent
                                    : (v.discountPrice && v.price ? Math.round(((v.price - v.discountPrice) / v.price) * 100) : 0);
                                  const disc = Math.min(100, Math.max(0, parseFloat(currentDisc) || 0));
                                  const finalP = Math.round(mrpNum - (mrpNum * disc / 100));
                                  handleUpdateVariant(vIdx, {
                                    price: newMrp,
                                    discountPrice: finalP
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs font-bold text-zinc-900 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">Discount (%)</label>
                              <div className="text-[9px] text-blue-600 font-semibold mb-1">(EDITABLE)</div>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={v.discountPercent !== undefined ? v.discountPercent : (v.discountPrice && v.price ? Math.round(((v.price - v.discountPrice) / v.price) * 100) : '')}
                                onChange={(e) => {
                                  const discVal = e.target.value;
                                  const disc = Math.min(100, Math.max(0, parseFloat(discVal) || 0));
                                  const mrp = Number(v.price || 0);
                                  const finalP = Math.round(mrp - (mrp * disc / 100));
                                  handleUpdateVariant(vIdx, {
                                    discountPercent: discVal,
                                    discountPrice: finalP
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-blue-300 focus:border-[#0071e3] outline-none text-xs font-bold text-blue-700 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">Final Price (₹)</label>
                              <div className="text-[9px] text-emerald-600 font-semibold mb-1">(CALCULATED)</div>
                              <input
                                type="number"
                                readOnly
                                disabled
                                value={
                                  v.price
                                    ? Math.round(Number(v.price) - (Number(v.price) * (Number(v.discountPercent !== undefined ? v.discountPercent : (v.discountPrice ? ((v.price - v.discountPrice)/v.price)*100 : 0)) / 100)))
                                    : ''
                                }
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-extrabold text-emerald-700 bg-emerald-50/50 cursor-not-allowed select-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">Stock *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                placeholder="10"
                                value={v.stock || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { stock: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs"
                              />
                            </div>
                          </div>

                          {/* Images Horizontal List */}
                          <div className="space-y-1.5 text-left pt-1">
                            <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                              Images (Max 8)
                            </span>

                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                id={`variant-upload-${vIdx}`}
                                onChange={(e) => handleVariantImageUpload(e, vIdx)}
                                className="hidden"
                              />

                              {v.images && v.images.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative h-16 w-16 rounded-xl border border-zinc-200 bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-sm">
                                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateVariant(vIdx, curr => ({
                                      images: (curr.images || []).filter((_, i) => i !== imgIdx)
                                    }))}
                                    className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white font-bold text-[10px] rounded-full flex items-center justify-center cursor-pointer border-0 shadow-sm"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              <button
                                type="button"
                                disabled={uploadingColorIndex === vIdx}
                                onClick={() => document.getElementById(`variant-upload-${vIdx}`).click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 flex flex-col items-center justify-center gap-0.5 cursor-pointer bg-transparent transition-all shadow-sm"
                              >
                                {uploadingColorIndex === vIdx ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                ) : (
                                  <Upload className="h-4 w-4 text-zinc-400" />
                                )}
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Upload</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                    >
                      <Plus className="h-4 w-4 text-zinc-400" />
                      <span>Add Another Variant</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Specifications Section */}
              <div id="specifications-section" className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm text-left scroll-mt-24">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                    Specifications
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    {(productForm.specifications || []).length} items
                  </span>
                </div>

                <div className="space-y-3">
                  {(productForm.specifications || []).map((spec, sIdx) => (
                    <div key={sIdx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 transition-all">
                      <div className="flex-1">
                        <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                          Specification Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Storage"
                          value={spec.name || ''}
                          onChange={(e) => {
                            const updated = [...(productForm.specifications || [])];
                            updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                            setProductForm({ ...productForm, specifications: updated });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium text-zinc-900"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1">
                          Specification Value
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 256 GB storage"
                          value={spec.value || ''}
                          onChange={(e) => {
                            const updated = [...(productForm.specifications || [])];
                            updated[sIdx] = { ...updated[sIdx], value: e.target.value };
                            setProductForm({ ...productForm, specifications: updated });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-[#0071e3] outline-none text-xs bg-white font-medium text-zinc-900"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center pt-1 sm:pt-4 shrink-0">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => {
                            const updated = [...(productForm.specifications || [])];
                            const [item] = updated.splice(sIdx, 1);
                            updated.splice(sIdx - 1, 0, item);
                            setProductForm({ ...productForm, specifications: updated });
                          }}
                          title="Move Up"
                          className="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 rounded-xl bg-white transition-colors cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === (productForm.specifications || []).length - 1}
                          onClick={() => {
                            const updated = [...(productForm.specifications || [])];
                            const [item] = updated.splice(sIdx, 1);
                            updated.splice(sIdx + 1, 0, item);
                            setProductForm({ ...productForm, specifications: updated });
                          }}
                          title="Move Down"
                          className="p-2 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed border border-zinc-200 rounded-xl bg-white transition-colors cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (productForm.specifications || []).filter((_, i) => i !== sIdx);
                            setProductForm({ ...productForm, specifications: updated });
                          }}
                          className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer bg-white flex items-center gap-1.5 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProductForm(prev => ({
                      ...prev,
                      specifications: [
                        ...(prev.specifications || []),
                        { name: '', value: '' }
                      ]
                    }));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
                >
                  <Plus className="h-4 w-4 text-zinc-400" />
                  <span>Add Specification</span>
                </button>
              </div>

              {/* SEO Information */}
              <div id="seo-section" className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm text-left scroll-mt-24">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">
                  SEO Information
                </h3>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MacBook Air - Supercharged by M3..."
                    value={productForm.seoTitle || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Buy MacBook Air M3 at wholesale bulk rates..."
                    value={productForm.seoDescription || ''}
                    onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm transition-all resize-none text-zinc-800"
                  />
                </div>
              </div>

            </div>

            {/* Right Column (Col Span 4) - Live Preview */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4.5 w-4.5 text-[#0071e3]" />
                  Live Preview
                </h3>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Dynamic Sandbox</span>
              </div>
              <p className="text-[11px] text-zinc-400 text-left -mt-2 leading-relaxed">
                This is a live, interactive preview showing how your product details and configurations will appear on the customer-facing storefront.
              </p>

              {/* Outer preview frame styled by toggle */}
              <div className={`bg-white border border-zinc-200 rounded-3xl shadow-md overflow-hidden transition-all duration-300 mx-auto ${previewMode === 'mobile' ? 'max-w-[370px] border-8 border-zinc-950 rounded-[40px]' : 'w-full'}`}>

                {/* Visual Header of Card */}
                <div className="h-48 bg-zinc-50 relative overflow-hidden flex items-center justify-center p-4 border-b border-zinc-100">
                  <img
                    src={activePreviewMainImage || getPreviewImages()[0] || '/iphone_category_v2.jpg'}
                    alt="Preview Visual"
                    className="max-h-full max-w-full w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Gallery Thumbnails inside Live Preview */}
                {getPreviewImages().length > 1 && (
                  <div className="flex gap-2 px-6 pt-3 justify-center overflow-x-auto">
                    {getPreviewImages().map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePreviewMainImage(imgUrl)}
                        className={`w-10 h-10 rounded border p-0.5 bg-white flex items-center justify-center overflow-hidden cursor-pointer shrink-0 ${activePreviewMainImage === imgUrl ? 'border-zinc-800 border-2' : 'border-zinc-200 hover:border-zinc-400'}`}
                      >
                        <img src={imgUrl} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Content area */}
                <div className="p-6 space-y-4 text-left">
                  {/* Title & Rating */}
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 leading-tight">
                      <span>{productForm.title || "MacBook Air (M3 Chip)"}</span>
                      {(productForm.partNumber || productForm.variants?.[0]?.partNumber) && (
                        <span className="font-mono font-extrabold text-zinc-900 ml-2 inline-block">
                          {productForm.partNumber || productForm.variants?.[0]?.partNumber}
                        </span>
                      )}
                    </h2>

                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold font-sans mt-0.5">4.8 (256 reviews)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-2xl font-black text-zinc-900 font-sans">
                      ₹{getPreviewPrice().toLocaleString()}
                    </span>
                    <p className="text-[9px] text-zinc-400 font-medium font-sans mt-0.5">(Incl. of all taxes)</p>
                  </div>

                  {/* Dynamic Color swatch circles */}
                  {productForm.colors && productForm.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Color: <span className="text-zinc-800 capitalize font-extrabold">{selectedPreviewColor || (productForm.colors[0]?.name || productForm.colors[0])}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {productForm.colors.map((c) => {
                          const cName = typeof c === 'object' ? c.name : c;
                          const isSelected = selectedPreviewColor === cName || (!selectedPreviewColor && productForm.colors[0]?.name === cName);
                          return (
                            <button
                              key={cName}
                              type="button"
                              onClick={() => setSelectedPreviewColor(cName)}
                              style={{ backgroundColor: resolveColorValue(c) }}
                              className={`w-5 h-5 rounded-full cursor-pointer border transition-all ${isSelected ? 'scale-125 border-zinc-900 ring-2 ring-zinc-300' : 'border-zinc-300 hover:scale-110'}`}
                              title={cName}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Storage selections */}
                  {productForm.storage && productForm.storage.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storage</span>
                      <div className="flex flex-wrap gap-2">
                        {productForm.storage.map((st) => {
                          const isSelected = selectedPreviewStorage === st || (!selectedPreviewStorage && productForm.storage[0] === st);
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setSelectedPreviewStorage(st)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${isSelected ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dynamic RAM selections */}
                  {productForm.ram && productForm.ram.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">RAM</span>
                      <div className="flex flex-wrap gap-2">
                        {productForm.ram.map((rm) => {
                          const isSelected = selectedPreviewRam === rm || (!selectedPreviewRam && productForm.ram[0] === rm);
                          return (
                            <button
                              key={rm}
                              type="button"
                              onClick={() => setSelectedPreviewRam(rm)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${isSelected ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'}`}
                            >
                              {rm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <button
                      type="button"
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition-all cursor-pointer border-0"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="w-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                    >
                      Add to Wishlist
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Stock History Logs Modal */}
      {showStockLogsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-250 text-left">
            <header className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Inventory Auditing</span>
                <h3 className="font-bold text-zinc-900 text-lg">Stock Update History</h3>
              </div>
              <button 
                onClick={() => setShowStockLogsModal(false)}
                className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-955 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingLogs ? (
                <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0071e3] mb-3" />
                  <span>Loading audit logs...</span>
                </div>
              ) : stockLogs.length === 0 ? (
                <p className="text-zinc-550 text-center py-8">No stock updates recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {stockLogs.map((log) => (
                    <div key={log._id} className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{log.product?.title || 'Unknown Product'}</span>
                          <span className="text-[10px] text-zinc-450">({log.product?.brand})</span>
                        </div>
                        <p className="text-zinc-550 mt-1 text-xs">{log.changeReason}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Logged at {new Date(log.createdAt).toLocaleString()} by {log.updatedBy?.name || 'System/API'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-sans">
                        <span className="text-zinc-450 line-through text-xs font-medium">{log.oldStock}</span>
                        <span className="text-zinc-450 font-medium">→</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          log.newStock > log.oldStock 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {log.newStock}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStockLogsModal(false)}
                className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
