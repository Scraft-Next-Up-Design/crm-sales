import { api } from "../api";

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest extends LoginRequest {
  confirmPassword: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "sales_agent" | "manager";
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (credentials) => ({
        url: "signup",
        method: "POST",
        body: credentials,
      }),
    }),
    getProfile: builder.query<AuthResponse["user"], void>({
      query: () => "auth/profile",
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetProfileQuery,
} = authApi;