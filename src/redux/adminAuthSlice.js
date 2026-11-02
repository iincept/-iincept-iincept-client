import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../services/axiosClient';

// Async Thunk for Admin Login
export const adminLoginUser = createAsyncThunk(
  'adminAuth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axiosClient.post(
        '/auth/login',
        { email, password },
        { useAdminAuth: true }
      );
      const data = response.data;

      // Validate administrator privileges
      if (!data || data.role !== 'admin') {
        return thunkAPI.rejectWithValue('Access denied. Only administrators are allowed to enter.');
      }

      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Retrieve initial admin session from localStorage
const initialAdminUser = (() => {
  try {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

const initialAdminToken = (() => {
  try {
    return localStorage.getItem('admin_token') || null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: initialAdminUser,
  token: initialAdminToken,
  isAuthenticated: !!initialAdminToken && initialAdminUser?.role === 'admin',
  loading: false,
  error: null
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    adminLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Remove strictly only admin keys from storage
      try {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } catch (err) {
        // Ignore storage errors
      }
    },
    clearAdminAuthError: (state) => {
      state.error = null;
    },
    updateAdminUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
      try {
        localStorage.setItem('admin_user', JSON.stringify(state.user));
      } catch (err) {
        // Ignore storage errors
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role
        };
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // Save strictly to admin localStorage keys
        try {
          localStorage.setItem('admin_token', action.payload.token);
          localStorage.setItem('admin_user', JSON.stringify(state.user));
        } catch (err) {
          // Ignore storage errors
        }
      })
      .addCase(adminLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        // Clear strictly only admin keys on rejection
        try {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } catch (err) {
          // Ignore storage errors
        }
      });
  }
});

export const { adminLogout, clearAdminAuthError, updateAdminUser } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
