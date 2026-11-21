import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '../services/cartApi';

const safeGetLocalStorage = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : fallback;
  } catch (err) {
    return fallback;
  }
};

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Ignore quota or write errors
  }
};

// Helper to check authentication status
const isAuthenticated = () => {
  try {
    return !!localStorage.getItem('token');
  } catch (err) {
    return false;
  }
};

// Helper to format backend database cart items for client consumption
const transformCartItem = (dbItem) => {
  const p = dbItem.product || {};
  const compoundId = dbItem.variantId || p._id || dbItem._id;
  return {
    id: compoundId,
    productId: p._id || dbItem.product,
    variantId: dbItem.variantId || '',
    name: dbItem.name || p.title || p.name || 'Apple Product',
    price: typeof dbItem.price === 'number' && dbItem.price > 0 
      ? dbItem.price 
      : (typeof p.price === 'number' ? p.price : Number(p.price || 0)),
    image: dbItem.image || (p.images && p.images[0]) || p.image || '/avatar.png',
    quantity: dbItem.quantity || 1,
    stock: p.stock || 10,
    color: dbItem.color || '',
    size: dbItem.size || '',
    caseSize: dbItem.caseSize || '',
    strapSize: dbItem.strapSize || dbItem.accessoriesSize || '',
    accessoriesSize: dbItem.accessoriesSize || dbItem.strapSize || '',
    bandSize: dbItem.bandSize || '',
    connectivity: dbItem.connectivity || '',
    storage: dbItem.storage || '',
    ram: dbItem.ram || '',
    glass: dbItem.glass || '',
    processor: dbItem.processor || '',
    partNumber: dbItem.partNumber || p.partNumber || '',
    appleCare: Boolean(dbItem.appleCare),
    appleCarePlan: dbItem.appleCarePlan || '',
    appleCareCost: Number(dbItem.appleCareCost || 0),
    appleCareSku: dbItem.appleCareSku || '',
  };
};

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    const localItems = safeGetLocalStorage('cartItems', []);

    if (!isAuthenticated()) {
      return localItems;
    }
    try {
      const serverItems = await cartApi.getCart();
      const transformed = serverItems.map(transformCartItem);

      // Merge server items with any existing local variant/AppleCare data to ensure 100% fidelity
      const merged = transformed.map(t => {
        const local = localItems.find(l => l.id === t.id || l.variantId === t.id);
        if (local) {
          return {
            ...local,
            ...t,
            appleCare: t.appleCare || local.appleCare || false,
            appleCarePlan: t.appleCarePlan || local.appleCarePlan || '',
            appleCareCost: t.appleCareCost || local.appleCareCost || 0,
            appleCareSku: t.appleCareSku || local.appleCareSku || '',
            name: t.name || local.name,
            price: t.price || local.price,
          };
        }
        return t;
      });

      // Merge local non-mongo items (e.g. AppleCare) with server cart items
      const customItems = localItems.filter(x => x.isAppleCare || (x.id && String(x.id).startsWith('ac-')));
      const combined = [...merged];
      for (const item of customItems) {
        if (!combined.some(c => c.id === item.id)) {
          combined.push(item);
        }
      }

      localStorage.setItem('cartItems', JSON.stringify(combined));
      return combined;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item, thunkAPI) => {
    const state = thunkAPI.getState().cart;
    const rawId = item.id || item.productId || item._id;
    const isCustomItem = item.isAppleCare || (rawId && String(rawId).startsWith('ac-')) || !/^[0-9a-fA-F]{24}$/.test(String(rawId).split('-')[0]);

    if (!isAuthenticated() || isCustomItem) {
      const updatedItems = [...state.cartItems];
      const existIndex = updatedItems.findIndex(x => x.id === item.id);
      if (existIndex > -1) {
        updatedItems[existIndex] = {
          ...updatedItems[existIndex],
          quantity: (updatedItems[existIndex].quantity || 1) + (item.quantity || 1)
        };
      } else {
        updatedItems.push({ ...item, quantity: item.quantity || 1 });
      }
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return { cartItems: updatedItems, openCart: true };
    }

    try {
      const productId = item.productId || (item.id && item.id.split('-')[0]) || item.id;
      const quantity = item.quantity || 1;

      // Pass full variant details to backend so it is preserved in DB
      await cartApi.addToCart(productId, quantity, {
        variantId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        size: item.size,
        caseSize: item.caseSize,
        strapSize: item.strapSize,
        accessoriesSize: item.accessoriesSize,
        bandSize: item.bandSize,
        connectivity: item.connectivity,
        storage: item.storage,
        ram: item.ram,
        glass: item.glass,
        processor: item.processor,
        partNumber: item.partNumber,
        appleCare: item.appleCare,
        appleCarePlan: item.appleCarePlan,
        appleCareCost: item.appleCareCost,
        appleCareSku: item.appleCareSku,
      });

      const serverItems = await cartApi.getCart();
      const transformed = serverItems.map(transformCartItem);

      // Merge server items with existing client-side cartItems so EVERY product retains its AppleCare and variant data!
      const merged = transformed.map(t => {
        // If this is the newly added item, ensure item's complete payload is active
        if (t.id === item.id || t.variantId === item.id) {
          return { ...t, ...item };
        }
        // If this is an existing product (e.g. Product A), preserve its existing AppleCare and details
        const existing = state.cartItems.find(c => c.id === t.id || c.variantId === t.id || c.id === t.productId);
        if (existing) {
          return {
            ...t,
            ...existing,
            quantity: t.quantity, // use latest server quantity
          };
        }
        return t;
      });

      // Also preserve any items in state.cartItems not yet in serverItems
      for (const oldItem of state.cartItems) {
        if (!merged.some(m => m.id === oldItem.id)) {
          merged.push(oldItem);
        }
      }

      localStorage.setItem('cartItems', JSON.stringify(merged));
      return { cartItems: merged, openCart: true };
    } catch (err) {
      const status = err.response?.status;
      // On auth failure (expired/invalid token): clear stale token and fall back to local cart.
      if (status === 401 || status === 403) {
        try { localStorage.removeItem('token'); } catch (_) { /* ignore */ }
        const updatedItems = [...state.cartItems];
        const existIndex = updatedItems.findIndex(x => x.id === item.id);
        if (existIndex > -1) {
          updatedItems[existIndex] = {
            ...updatedItems[existIndex],
            quantity: (updatedItems[existIndex].quantity || 1) + (item.quantity || 1)
          };
        } else {
          updatedItems.push({ ...item, quantity: item.quantity || 1 });
        }
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        return { cartItems: updatedItems, openCart: true };
      }
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id, thunkAPI) => {
    const state = thunkAPI.getState().cart;
    const isCustomItem = String(id).startsWith('ac-') || !/^[0-9a-fA-F]{24}$/.test(String(id).split('-')[0]);

    // Optimistically calculate updated items
    const updatedItems = state.cartItems.filter(x => x.id !== id && x.variantId !== id);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));

    if (isAuthenticated() && !isCustomItem) {
      try {
        await cartApi.removeFromCart(id);
      } catch (err) {
        console.warn('Backend cart item removal warning:', err.message);
      }
    }

    return updatedItems;
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }, thunkAPI) => {
    const state = thunkAPI.getState().cart;
    const targetQty = Math.max(1, quantity);
    const isCustomItem = String(id).startsWith('ac-') || !/^[0-9a-fA-F]{24}$/.test(String(id).split('-')[0]);

    // Optimistically update quantity in state & localStorage
    const updatedItems = state.cartItems.map(x =>
      (x.id === id || x.variantId === id) ? { ...x, quantity: targetQty } : x
    );
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));

    if (isAuthenticated() && !isCustomItem) {
      try {
        await cartApi.updateCartQuantity(id, targetQty);
      } catch (err) {
        console.warn('Backend cart quantity update warning:', err.message);
      }
    }

    return updatedItems;
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    if (!isAuthenticated()) {
      localStorage.removeItem('cartItems');
      return [];
    }

    try {
      await cartApi.clearCart();
      localStorage.removeItem('cartItems');
      return [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const mergeGuestCart = createAsyncThunk(
  'cart/mergeGuestCart',
  async (guestItems, thunkAPI) => {
    try {
      const serverItems = await cartApi.mergeCart(guestItems);
      const transformed = serverItems.map(transformCartItem);
      localStorage.setItem('cartItems', JSON.stringify(transformed));
      return transformed;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialCartItems = safeGetLocalStorage('cartItems', []);

const initialState = {
  cartItems: initialCartItems,
  isCartOpen: false,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        if (action.payload.openCart) {
          state.isCartOpen = true;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // removeFromCart
      .addCase(removeFromCart.pending, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.meta?.arg) {
          const id = action.meta.arg;
          state.cartItems = state.cartItems.filter(x => x.id !== id && x.variantId !== id);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateQuantity
      .addCase(updateQuantity.pending, (state, action) => {
        state.error = null;
        if (action.meta?.arg) {
          const { id, quantity } = action.meta.arg;
          state.cartItems = state.cartItems.map(x =>
            (x.id === id || x.variantId === id) ? { ...x, quantity: Math.max(1, quantity) } : x
          );
        }
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // mergeGuestCart
      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
