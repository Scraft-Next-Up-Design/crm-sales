/**
 * Authentication middleware for handling token refresh and secure requests
 */
import { Middleware } from '@reduxjs/toolkit';
import { refreshTokens } from '../store/slices/authSlice';
import tokenManager from './tokenManager';

/**
 * Redux middleware to handle auth token refresh
 */
export const authMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  // Process the action first
  const result = next(action);
  
  // Check if we need to refresh the token after state changes
  const state = getState();
  const { tokenExpiresAt, refreshToken, token } = state.auth;
  
  // Skip if not authenticated or already refreshing
  if (!token || !refreshToken || !tokenExpiresAt || state.auth.status === 'loading') {
    return result;
  }
  
  // Calculate time until token expires
  const now = Date.now();
  const timeToExpiry = tokenExpiresAt - now;
  const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  // If token is about to expire, refresh it
  if (timeToExpiry <= REFRESH_THRESHOLD) {
    dispatch(refreshTokens(refreshToken));
  }
  
  return result;
};

/**
 * Setup token refresh interval and auth initialization
 */
export function setupAuthRefresh(store: any) {
  // Initialize auth from stored tokens
  store.dispatch({ type: 'auth/initialize/pending' });
  
  tokenManager.initializeAuth()
    .then(user => {
      if (user) {
        const tokens = tokenManager.getStoredTokens();
        store.dispatch({
          type: 'auth/initialize/fulfilled',
          payload: { user, tokens }
        });
      } else {
        store.dispatch({
          type: 'auth/initialize/rejected',
          payload: 'No valid session found'
        });
      }
    })
    .catch(error => {
      store.dispatch({
        type: 'auth/initialize/rejected',
        payload: error.message || 'Failed to initialize auth'
      });
    });
  
  // Set up regular token refresh check
  const cleanup = tokenManager.setupTokenRefresh();
  
  // Return cleanup function
  return cleanup;
}

/**
 * Add auth headers to fetch requests
 */
export async function withAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    // Get current valid access token
    const token = await tokenManager.getValidAccessToken();
    
    // Create headers with auth token if available
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Create new request init with auth headers
    const authInit: RequestInit = {
      ...init,
      headers
    };
    
    // Make the request
    return fetch(input, authInit);
  } catch (error) {
    console.error('Error in withAuth:', error);
    throw error;
  }
}

/**
 * Helper to create a secure fetch wrapper for API functions
 */
export function createSecureFetch(baseUrl: string) {
  return async (endpoint: string, options: RequestInit = {}) => {
    const url = `${baseUrl}${endpoint}`;
    return withAuth(url, options);
  };
}

export default {
  authMiddleware,
  setupAuthRefresh,
  withAuth,
  createSecureFetch
};
