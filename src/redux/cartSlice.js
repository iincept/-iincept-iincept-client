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
  return {
    id: p._id || dbItem._id,
    name: p.title || p.name || 'Apple Product',
    price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
    image: (p.images && p.images[0]) || p.image || '/avatar.png',
    quantity: dbItem.quantity || 1,
    stock: p.stock || 10,
    color: dbItem.color || '',
    size: dbItem.size || '',
    caseSize: dbItem.caseSize || '',
    strapSize: dbItem.strapSize || dbItem.accessoriesSize || '',
    accessoriesSize: dbItem.accessoriesSize || dbItem.strapSize || '',
    partNumber: dbItem.partNumber || p.partNumber || '',
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

      // Merge local non-mongo items (e.g. AppleCare) with server cart items
      const customItems = localItems.filter(x => x.isAppleCare || (x.id && String(x.id).startsWith('ac-')));
      const combined = [...transformed];
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

      await cartApi.addToCart(productId, quantity);
      const serverItems = await cartApi.getCart();
      const transformed = serverItems.map(transformCartItem);

      // Overlay variant-specific data (price, name, image, color, size, etc.) back onto
      // the matching item. The server Cart model only stores {user, product, quantity},
      // so selling price and variant details must be re-applied from the dispatched item.
      const enriched = transformed.map(t => {
        const matchesNewItem = t.id === productId || t.id === item.id?.split('-')[0];
        if (matchesNewItem && item.price != null) {
          return {
            ...t,
            id: item.id,            // use compound variant id for uniqueness
            name: item.name || t.name,
            price: item.price,
            image: item.image || t.image,
            color: item.color || t.color || '',
            size: item.size || t.size || '',
            caseSize: item.caseSize || t.caseSize || '',
            strapSize: item.strapSize || t.strapSize || item.accessoriesSize || t.accessoriesSize || '',
            accessoriesSize: item.accessoriesSize || t.accessoriesSize || item.strapSize || t.strapSize || '',
            bandSize: item.bandSize || '',
            connectivity: item.connectivity || '',
            storage: item.storage || '',
            ram: item.ram || '',
            glass: item.glass || '',
            processor: item.processor || '',
            partNumber: item.partNumber || t.partNumber || '',
            appleCare: item.appleCare || false,
          };
        }
        return t;
      });

      // Preserve existing custom items (AppleCare, ac-* ids)
      const customItems = state.cartItems.filter(x => x.isAppleCare || (x.id && String(x.id).startsWith('ac-')));
      const combined = [...enriched];
      for (const custom of customItems) {
        if (!combined.some(c => c.id === custom.id)) {
          combined.push(custom);
        }
      }

      localStorage.setItem('cartItems', JSON.stringify(combined));
      return { cartItems: combined, openCart: true };
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

    if (!isAuthenticated() || isCustomItem) {
      const updatedItems = state.cartItems.filter(x => x.id !== id);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return updatedItems;
    }

    try {
      const productId = id.split('-')[0];
      await cartApi.removeFromCart(productId);
      // Filter out the removed item from local enriched cart (which has variant data)
      // rather than replacing everything with server data that lacks variant details.
      const updatedItems = state.cartItems.filter(x => x.id !== id);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return updatedItems;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }, thunkAPI) => {
    const state = thunkAPI.getState().cart;
    const targetQty = Math.max(1, quantity);
    const isCustomItem = String(id).startsWith('ac-') || !/^[0-9a-fA-F]{24}$/.test(String(id).split('-')[0]);

    if (!isAuthenticated() || isCustomItem) {
      const updatedItems = state.cartItems.map(x =>
        x.id === id ? { ...x, quantity: targetQty } : x
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return updatedItems;
    }

    try {
      const productId = id.split('-')[0];
      await cartApi.updateCartQuantity(productId, targetQty);
      // Update quantity in the existing local cart (which has enriched variant data)
      // rather than replacing with raw server data that lacks variant details.
      const updatedItems = state.cartItems.map(x =>
        x.id === id ? { ...x, quantity: targetQty } : x
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      return updatedItems;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
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
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
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
