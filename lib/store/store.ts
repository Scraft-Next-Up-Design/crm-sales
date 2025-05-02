import { configureStore, isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./base/authapi";
import { leadsApi } from "./base/leadsapi";
import { membersApi } from "./base/members";
import { statusApi } from "./base/status";
import { TagsApi } from "./base/tags";
import { webhookApi } from "./base/webhooks";
import { workspaceApi } from "./base/workspace";
import authReducer from "./slices/authSlice";
import sidebarReducer from "./slices/sideBar";
import { authMiddleware } from "../auth/authMiddleware";

// Create an array of all API services for cleaner maintenance
const apiServices = [
  api,
  webhookApi,
  workspaceApi,
  leadsApi,
  statusApi,
  TagsApi,
  membersApi
];

// Error handling middleware for RTK Query
const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  // Only log rejected actions with a payload
  if (isRejectedWithValue(action)) {
    console.error('API error:', action.payload);
    // Here you could also add error reporting logic
  }
  return next(action);
};

// Optimize store configuration
export const store = configureStore({
  reducer: {
    // Add all API reducers dynamically
    ...Object.fromEntries(
      apiServices.map(api => [api.reducerPath, api.reducer])
    ),
    auth: authReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) => {
    // Configure default middleware with serializable check settings
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain patterns that might cause false positives
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'auth/initialize/fulfilled'],
        ignoredPaths: [
          'payload.timestamp', 
          'meta.arg.timestamp',
          'auth.tokenExpiresAt',
          'payload.tokens.expiresAt'
        ],
      },
      immutableCheck: { warnAfter: 200 },
    });
    
    // Add all API middleware dynamically
    const apiMiddleware = apiServices.map(api => api.middleware);
    
    return defaultMiddleware
      .concat(apiMiddleware)
      .concat(rtkQueryErrorLogger)
      .concat(authMiddleware); // Add auth middleware for token refresh
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Set up listeners for auto-refetching
setupListeners(store.dispatch);

// Initialize auth from stored tokens
import { setupAuthRefresh } from "../auth/authMiddleware";
let authCleanup: (() => void) | null = null;

// Setup auth refresh only in browser environment
if (typeof window !== 'undefined') {
  authCleanup = setupAuthRefresh(store);
}

// Add cleanup function to window for unmounting
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (authCleanup) {
      authCleanup();
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
