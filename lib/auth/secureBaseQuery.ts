/**
 * Enhanced secure base query for RTK Query
 * Handles token refresh, authentication, and secure headers
 */
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import tokenManager from './tokenManager';
import { refreshTokens, logout } from '../store/slices/authSlice';

/**
 * Create a secure base query with token refresh capabilities
 * @param baseUrl Base URL for API requests
 * @returns Enhanced base query function
 */
export function createSecureBaseQuery(baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> {
  // Create the base query with auth headers
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers, { getState }) => {
      // Get current token from Redux store
      const state = getState() as RootState;
      const { token } = state.auth;
      
      // If token exists and isn't already set, add it to the headers
      if (token && !headers.has('authorization')) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  });
  
  // Create enhanced query with refresh token logic
  return async (args, api, extraOptions) => {
    // Check if token needs refreshing before making the request
    const state = api.getState() as RootState;
    const { tokenExpiresAt, refreshToken } = state.auth;
    
    // If token is expiring soon and we have a refresh token, refresh it
    if (
      tokenExpiresAt && 
      refreshToken && 
      (tokenExpiresAt - Date.now() < 5 * 60 * 1000) // 5 minutes
    ) {
      try {
        // Dispatch refresh token action
        const refreshResult = await api.dispatch(refreshTokens(refreshToken));
        
        // If refresh failed, log it but continue with current token
        if (refreshTokens.rejected.match(refreshResult)) {
          console.error('Token refresh failed before API call');
          // Force logout if refresh fails due to invalid token
          if (refreshResult.payload === 'Invalid refresh token') {
            api.dispatch(logout());
            return {
              error: {
                status: 401,
                data: { message: 'Session expired' }
              } as FetchBaseQueryError,
            };
          }
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    
    // Execute the original query
    let result = await baseQuery(args, api, extraOptions);
    
    // Check for auth errors (401 Unauthorized)
    if (result.error && result.error.status === 401) {
      // Try to refresh the token
      if (refreshToken) {
        try {
          const refreshResult = await api.dispatch(refreshTokens(refreshToken));
          
          // If token refresh was successful, retry the original request
          if (refreshTokens.fulfilled.match(refreshResult)) {
            // Get the new token
            const newState = api.getState() as RootState;
            const newToken = newState.auth.token;
            
            // Update authorization header if needed
            if (typeof args === 'string') {
              args = {
                url: args,
                headers: { authorization: `Bearer ${newToken}` }
              };
            } else if (args.headers) {
              args.headers = {
                ...args.headers,
                authorization: `Bearer ${newToken}`
              };
            } else {
              args.headers = { authorization: `Bearer ${newToken}` };
            }
            
            // Retry the request with new token
            result = await baseQuery(args, api, extraOptions);
          } else {
            // If refresh failed, log out the user
            api.dispatch(logout());
          }
        } catch (error) {
          console.error('Error handling 401 response:', error);
          api.dispatch(logout());
        }
      } else {
        // No refresh token, log out the user
        api.dispatch(logout());
      }
    }
    
    return result;
  };
}

export default createSecureBaseQuery;
