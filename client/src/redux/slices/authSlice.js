import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const adminFromStorage = localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : null;

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('admin', JSON.stringify(data.data));
    localStorage.setItem('token', data.data.token);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    return data.message;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: adminFromStorage,
    isAuthenticated: !!adminFromStorage,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateAdminState: (state, action) => {
      state.admin = { ...state.admin, ...action.payload };
      localStorage.setItem('admin', JSON.stringify(state.admin));
    },
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.isAuthenticated = true; state.admin = action.payload; })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.admin = { ...state.admin, ...action.payload };
        localStorage.setItem('admin', JSON.stringify(state.admin));
      })
      .addCase(getMe.rejected, (state) => {
        state.admin = null;
        state.isAuthenticated = false;
        localStorage.removeItem('admin');
        localStorage.removeItem('token');
      })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(forgotPassword.fulfilled, (state, action) => { state.loading = false; state.message = action.payload; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(resetPassword.pending, (state) => { state.loading = true; })
      .addCase(resetPassword.fulfilled, (state, action) => { state.loading = false; state.message = action.payload; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, updateAdminState, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
