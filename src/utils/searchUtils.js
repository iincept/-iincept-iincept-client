/**
 * Safely normalizes target paths and URLs configured from the Admin Panel.
 * Handles spaces and query parameters correctly (e.g. /airpods?search=AirPods 5 -> /airpods?search=AirPods%205)
 */
export const normalizeTargetPath = (pathStr) => {
  if (!pathStr || typeof pathStr !== 'string' || !pathStr.trim()) return '';
  let clean = pathStr.trim();
  
  if (!clean.startsWith('/') && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = '/' + clean;
  }
  
  const qIndex = clean.indexOf('?');
  if (qIndex !== -1) {
    const basePath = clean.substring(0, qIndex);
    const queryString = clean.substring(qIndex + 1);
    
    try {
      const searchParams = new URLSearchParams(queryString);
      const normalizedQuery = searchParams.toString().replace(/\+/g, '%20');
      return normalizedQuery ? `${basePath}?${normalizedQuery}` : basePath;
    } catch (e) {
      return clean.replace(/\s+/g, '%20');
    }
  }
  
  return clean;
};

/**
 * Utility function to test whether a product matches a given search query string.
 * Matches against:
 * - Product title / name
 * - Product description
 * - Product brand
 * - Category name
 * - Top-level sku, partNumber, modelNumber
 * - Variant sku, partNumber, modelNumber, title, displayTitle, size, color, storage, ram, glass
 */
export const matchesProductSearch = (prod, query) => {
  if (!prod) return false;
  if (!query || typeof query !== 'string' || !query.trim()) return true;

  const q = query.trim().toLowerCase();
  const qNoSpace = q.replace(/[\s\-_]+/g, '');

  const title = (prod.title || prod.name || '').toLowerCase();
  const titleNoSpace = title.replace(/[\s\-_]+/g, '');
  const description = (prod.description || '').toLowerCase();
  const descriptionNoSpace = description.replace(/[\s\-_]+/g, '');
  const brand = (prod.brand || '').toLowerCase();
  const categoryName = (prod.category?.name || prod.category || '').toLowerCase();
  const sku = (prod.sku || '').toLowerCase();
  const partNumber = (prod.partNumber || '').toLowerCase();
  const modelNumber = (prod.modelNumber || '').toLowerCase();

  if (
    title.includes(q) ||
    (qNoSpace && titleNoSpace.includes(qNoSpace)) ||
    description.includes(q) ||
    (qNoSpace && descriptionNoSpace.includes(qNoSpace)) ||
    brand.includes(q) ||
    categoryName.includes(q) ||
    sku.includes(q) ||
    partNumber.includes(q) ||
    modelNumber.includes(q)
  ) {
    return true;
  }

  // Check variants array if present
  if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    return prod.variants.some((v) => {
      if (!v) return false;
      const vSku = (v.sku || '').toLowerCase();
      const vPartNumber = (v.partNumber || '').toLowerCase();
      const vModelNumber = (v.modelNumber || '').toLowerCase();
      const vTitle = (v.title || v.displayTitle || '').toLowerCase();
      const vTitleNoSpace = vTitle.replace(/[\s\-_]+/g, '');
      const vSize = (v.size || '').toLowerCase();
      const vColor = (v.color || '').toLowerCase();
      const vStorage = (v.storage || '').toLowerCase();

      return (
        vSku.includes(q) ||
        vPartNumber.includes(q) ||
        vModelNumber.includes(q) ||
        vTitle.includes(q) ||
        (qNoSpace && vTitleNoSpace.includes(qNoSpace)) ||
        vSize.includes(q) ||
        vColor.includes(q) ||
        vStorage.includes(q)
      );
    });
  }

  return false;
};

/**
 * Returns the matching SKU / Part Number / Model Number string for display badge if present
 */
export const getMatchingSku = (prod, query) => {
  if (!prod) return null;
  const q = (query || '').trim().toLowerCase();

  const sku = prod.sku || '';
  if (q && sku.toLowerCase().includes(q)) return sku;

  const partNumber = prod.partNumber || '';
  if (q && partNumber.toLowerCase().includes(q)) return partNumber;

  const modelNumber = prod.modelNumber || '';
  if (q && modelNumber.toLowerCase().includes(q)) return modelNumber;

  if (Array.isArray(prod.variants)) {
    for (const v of prod.variants) {
      if (!v) continue;
      if (q && v.sku && v.sku.toLowerCase().includes(q)) return v.sku;
      if (q && v.partNumber && v.partNumber.toLowerCase().includes(q)) return v.partNumber;
      if (q && v.modelNumber && v.modelNumber.toLowerCase().includes(q)) return v.modelNumber;
    }
  }

  return prod.sku || prod.partNumber || prod.modelNumber || prod.variants?.[0]?.partNumber || prod.variants?.[0]?.sku || null;
};

/**
 * Finds the specific variant matching the search query (by SKU, partNumber, modelNumber, or attributes)
 */
export const findMatchingVariant = (prod, query) => {
  if (!prod) return null;
  const q = (query || '').trim().toLowerCase();
  if (!q) return null;

  if (Array.isArray(prod.variants) && prod.variants.length > 0) {
    // 1. Exact match by SKU, partNumber, or modelNumber
    for (const v of prod.variants) {
      if (!v) continue;
      const vSku = (v.sku || '').trim().toLowerCase();
      const vPartNumber = (v.partNumber || '').trim().toLowerCase();
      const vModelNumber = (v.modelNumber || '').trim().toLowerCase();

      if ((vSku && vSku === q) || (vPartNumber && vPartNumber === q) || (vModelNumber && vModelNumber === q)) {
        return v;
      }
    }

    // 2. Partial match by SKU, partNumber, or modelNumber
    for (const v of prod.variants) {
      if (!v) continue;
      const vSku = (v.sku || '').trim().toLowerCase();
      const vPartNumber = (v.partNumber || '').trim().toLowerCase();
      const vModelNumber = (v.modelNumber || '').trim().toLowerCase();

      if ((vSku && vSku.includes(q)) || (vPartNumber && vPartNumber.includes(q)) || (vModelNumber && vModelNumber.includes(q))) {
        return v;
      }
    }

    // 3. Match by variant attributes / titles
    for (const v of prod.variants) {
      if (!v) continue;
      const vTitle = (v.title || v.displayTitle || '').trim().toLowerCase();
      const vSize = (v.size || '').trim().toLowerCase();
      const vColor = (v.color || '').trim().toLowerCase();
      const vStorage = (v.storage || '').trim().toLowerCase();
      const vRam = (v.ram || '').trim().toLowerCase();

      if (
        (vTitle && vTitle.includes(q)) ||
        (vSize && vSize === q) ||
        (vColor && vColor === q) ||
        (vStorage && vStorage === q) ||
        (vRam && vRam === q)
      ) {
        return v;
      }
    }
  }

  return null;
};

/**
 * Calculates exact MRP, Selling Price, Discount Percent, and Savings for a matched variant or product
 */
export const getVariantPricing = (variant, prod) => {
  let vPrice = variant && Number(variant.price) > 0 ? Number(variant.price) : 0;
  let vDiscVal = variant && Number(variant.discountPercent || variant.discount) > 0
    ? Number(variant.discountPercent || variant.discount)
    : (variant && Number(variant.discountPrice) > 0 && Number(variant.discountPrice) < Number(variant.price || Infinity)
        ? Number(variant.discountPrice)
        : 0);
  let vMrp = variant && Number(variant.mrp || variant.originalPrice) > 0 ? Number(variant.mrp || variant.originalPrice) : 0;

  let pPrice = Number(prod?.price || 0);
  let pDiscVal = Number(prod?.discountPrice || prod?.discountPercent || prod?.discount || 0);
  let pMrp = Number(prod?.mrp || prod?.originalPrice || 0);

  let rawBasePrice = vPrice > 0 ? vPrice : pPrice;
  let rawDiscVal = vDiscVal > 0 ? vDiscVal : pDiscVal;
  let rawMrp = vMrp > 0 ? vMrp : pMrp;

  if (rawBasePrice <= 0) {
    return { sellingPrice: 0, originalMrp: 0, discountPercent: 0, youSave: 0, hasDiscount: false };
  }

  let sellingPrice = rawBasePrice;
  let originalMrp = rawMrp > rawBasePrice ? rawMrp : 0;

  if (rawDiscVal > 0) {
    if (rawDiscVal <= 99) {
      originalMrp = rawBasePrice;
      sellingPrice = Math.round(rawBasePrice - (rawBasePrice * rawDiscVal / 100));
    } else if (rawDiscVal < rawBasePrice) {
      if (rawDiscVal < (rawBasePrice / 2)) {
        originalMrp = rawBasePrice;
        sellingPrice = rawBasePrice - rawDiscVal;
      } else {
        originalMrp = rawBasePrice;
        sellingPrice = rawDiscVal;
      }
    } else if (rawDiscVal > rawBasePrice) {
      originalMrp = rawDiscVal;
      sellingPrice = rawBasePrice;
    }
  } else if (originalMrp > rawBasePrice) {
    sellingPrice = rawBasePrice;
  }

  if (originalMrp <= sellingPrice) {
    originalMrp = 0;
  }

  const youSave = originalMrp > sellingPrice ? originalMrp - sellingPrice : 0;
  const discountPercent = originalMrp > sellingPrice 
    ? Math.round((youSave / originalMrp) * 100) 
    : (rawDiscVal > 0 && rawDiscVal <= 99 ? rawDiscVal : 0);

  return {
    sellingPrice,
    originalMrp,
    discountPercent,
    youSave,
    hasDiscount: originalMrp > sellingPrice || discountPercent > 0
  };
};
