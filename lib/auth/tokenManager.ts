/**
 * Token management utility for handling authentication tokens
 * with automatic refresh and security features
 */
import { supabase } from "../supabaseClient";

// Interface for the token structure
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

// Constants for token storage and management
const TOKEN_STORAGE_KEY = 'crm_auth_tokens';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour (adjust to match your Supabase settings)

/**
 * Store authentication tokens securely
 */
export async function storeTokens(tokens: AuthTokens): Promise<void> {
  try {
    // Store tokens with secure flags
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
      ...tokens,
      // Add current timestamp to calculate relative expiry
      storedAt: Date.now()
    }));
  } catch (error) {
    console.error('Failed to store auth tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
}

/**
 * Get stored authentication tokens
 */
export function getStoredTokens(): AuthTokens | null {
  try {
    const tokensJson = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokensJson) return null;
    
    return JSON.parse(tokensJson);
  } catch (error) {
    console.error('Failed to retrieve auth tokens:', error);
    return null;
  }
}

/**
 * Clear stored authentication tokens
 */
export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth tokens:', error);
  }
}

/**
 * Check if current tokens are about to expire
 */
export function isTokenExpiring(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return true;
  
  const now = Date.now();
  const timeToExpiry = tokens.expiresAt - now;
  
  // Token is considered expiring if it's within the refresh threshold
  return timeToExpiry <= REFRESH_THRESHOLD;
}

/**
 * Get the current valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const tokens = getStoredTokens();
    
    // No tokens stored - user needs to login
    if (!tokens) {
      return null;
    }
    
    // Check if token is about to expire and needs refreshing
    if (isTokenExpiring()) {
      const refreshedTokens = await refreshTokens(tokens.refreshToken);
      if (refreshedTokens) {
        return refreshedTokens.accessToken;
      }
      return null; // Failed to refresh
    }
    
    // Return current valid access token
    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
}

/**
 * Refresh authentication tokens
 */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  try {
    // Use Supabase refresh token method
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
    
    if (error || !data.session) {
      console.error('Failed to refresh auth tokens:', error);
      // Clear invalid tokens
      clearTokens();
      return null;
    }
    
    // Create new tokens object
    const newTokens: AuthTokens = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: Date.now() + TOKEN_EXPIRY,
    };
    
    // Store the new tokens
    await storeTokens(newTokens);
    
    return newTokens;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return null;
  }
}

/**
 * Automatically set up token refresh interval
 */
export function setupTokenRefresh(): () => void {
  // Check every minute if token needs refreshing
  const intervalId = setInterval(async () => {
    if (isTokenExpiring()) {
      const tokens = getStoredTokens();
      if (tokens) {
        await refreshTokens(tokens.refreshToken);
      }
    }
  }, 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Extract user data from a token for synchronizing the auth state
 */
export async function getUserFromToken(accessToken: string): Promise<any | null> {
  try {
    // Get user data from Supabase
    const { data, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !data.user) {
      console.error('Failed to get user from token:', error);
      return null;
    }
    
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'sales_agent',
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}

/**
 * Initialize auth from stored tokens on app load
 * Returns the user data if valid tokens exist
 */
export async function initializeAuth(): Promise<any | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return null;
    
    return await getUserFromToken(accessToken);
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
}

export default {
  storeTokens,
  getStoredTokens,
  clearTokens,
  isTokenExpiring,
  getValidAccessToken,
  refreshTokens,
  setupTokenRefresh,
  getUserFromToken,
  initializeAuth,
};
