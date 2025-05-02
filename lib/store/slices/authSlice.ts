import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabaseClient";
import tokenManager, { AuthTokens } from "../../auth/tokenManager";

interface User {
  id: string;
  email: string;
  role: "admin" | "sales_agent" | "manager";
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  tokenExpiresAt: null,
  user: null,
  status: 'idle',
  error: null,
  isInitialized: false
};

// Async thunks for authentication actions
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check for stored token and initialize auth
      const user = await tokenManager.initializeAuth();
      
      if (!user) {
        return rejectWithValue('No valid session found');
      }
      
      const tokens = tokenManager.getStoredTokens();
      return {
        user,
        tokens
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error || !data.session) {
        return rejectWithValue(error?.message || 'Login failed');
      }
      
      // Store tokens
      const tokens: AuthTokens = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: Date.now() + (3600 * 1000) // 1 hour expiry
      };
      
      await tokenManager.storeTokens(tokens);
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: (data.user.user_metadata?.role as User['role']) || 'sales_agent'
        },
        tokens
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return rejectWithValue(error.message || 'Logout failed');
      }
      
      // Clear stored tokens
      tokenManager.clearTokens();
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const newTokens = await tokenManager.refreshTokens(refreshToken);
      
      if (!newTokens) {
        return rejectWithValue('Failed to refresh tokens');
      }
      
      // Get user data with the new access token
      const user = await tokenManager.getUserFromToken(newTokens.accessToken);
      
      if (!user) {
        return rejectWithValue('Failed to get user data');
      }
      
      return {
        user,
        tokens: newTokens
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Legacy reducers kept for compatibility
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    signup(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signin(
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        refreshToken: string;
        expiresAt: number;
      }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.refreshToken = action.payload.refreshToken;
      state.tokenExpiresAt = action.payload.expiresAt;
    },
    verify(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
    },
    // Clear errors
    clearErrors(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.token = tokens?.accessToken || null;
      state.refreshToken = tokens?.refreshToken || null;
      state.tokenExpiresAt = tokens?.expiresAt || null;
      state.status = 'succeeded';
      state.isInitialized = true;
    });
    builder.addCase(initializeAuth.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Initialization failed';
      state.isInitialized = true;
    });
    
    // Login user
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.tokenExpiresAt = tokens.expiresAt;
      state.status = 'succeeded';
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Login failed';
    });
    
    // Logout user
    builder.addCase(logoutUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.user = null;
      state.status = 'idle';
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Logout failed';
    });
    
    // Refresh tokens
    builder.addCase(refreshTokens.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(refreshTokens.fulfilled, (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.tokenExpiresAt = tokens.expiresAt;
      state.status = 'succeeded';
    });
    builder.addCase(refreshTokens.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string || 'Token refresh failed';
      // Clear auth state on refresh failure
      state.token = null;
      state.refreshToken = null;
      state.tokenExpiresAt = null;
      state.user = null;
    });
  },
});

export const { setCredentials, logout, signup, signin, verify, clearErrors } =
  authSlice.actions;
export default authSlice.reducer;
