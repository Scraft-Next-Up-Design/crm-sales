
// import React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { supabase } from "@/lib/supabaseClient";

// // Schema for login form
// const loginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

// // Schema for password reset request
// const resetRequestSchema = z.object({
//   email: z.string().email(),
// });

// // Schema for new password setup
// const newPasswordSchema = z.object({
//   password: z.string().min(6),
//   confirmPassword: z.string().min(6),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

// export default function LoginPage() {
//   const router = useRouter();
//   const [isResetMode, setIsResetMode] = React.useState(false);
//   const [isNewPasswordMode, setIsNewPasswordMode] = React.useState(false);

//   // Login form
//   const {
//     register: registerLogin,
//     handleSubmit: handleLoginSubmit,
//     formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
//   } = useForm<z.infer<typeof loginSchema>>({
//     resolver: zodResolver(loginSchema),
//   });

//   // Reset request form
//   const {
//     register: registerReset,
//     handleSubmit: handleResetSubmit,
//     formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
//   } = useForm<z.infer<typeof resetRequestSchema>>({
//     resolver: zodResolver(resetRequestSchema),
//   });

//   // New password form
//   const {
//     register: registerNewPassword,
//     handleSubmit: handleNewPasswordSubmit,
//     formState: { errors: newPasswordErrors, isSubmitting: isNewPasswordSubmitting },
//   } = useForm<z.infer<typeof newPasswordSchema>>({
//     resolver: zodResolver(newPasswordSchema),
//   });

//   // Handle normal login
//   const onLogin = async (data: z.infer<typeof loginSchema>) => {
//     try {
//       const { error } = await supabase.auth.signInWithPassword({
//         email: data.email,
//         password: data.password,
//       });
//       if (error) throw error;
//       router.push("/dashboard");
//       toast.success("Logged in successfully!");
//     } catch (error: any) {
//       toast.error(error.message || "Failed to login");
//     }
//   };

//   // Handle password reset request
//   const onResetRequest = async (data: z.infer<typeof resetRequestSchema>) => {
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
//         redirectTo: `${window.location.origin}/login?reset=true`,
//       });
//       if (error) throw error;
//       toast.success("Password reset instructions sent to your email");
//       setIsResetMode(false);
//     } catch (error: any) {
//       toast.error(error.message || "Failed to send reset instructions");
//     }
//   };

//   // Handle setting new password
//   const onNewPasswordSubmit = async (data: z.infer<typeof newPasswordSchema>) => {
//     try {
//       const { error } = await supabase.auth.updateUser({
//         password: data.password,
//       });
//       if (error) throw error;
//       toast.success("Password updated successfully");
//       setIsNewPasswordMode(false);
//     } catch (error: any) {
//       toast.error(error.message || "Failed to update password");
//     }
//   };

//   // Check for active session and reset token
//   React.useEffect(() => {
//     const checkUserAndToken = async () => {
//       // Check for active session
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session) {
//         router.push("/dashboard");
//         return;
//       }

//       // Check for password reset mode
//       const params = new URLSearchParams(window.location.search);
//       if (params.get("reset")) {
//         setIsNewPasswordMode(true);
//       }
//     };
//     checkUserAndToken();
//   }, [router]);

//   // Render password reset request form
//   if (isResetMode) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="w-[400px]">
//           <CardHeader>
//             <CardTitle>Reset Password</CardTitle>
//             <CardDescription>
//               Enter your email to receive password reset instructions
//             </CardDescription>
//           </CardHeader>
//           <form onSubmit={handleResetSubmit(onResetRequest)}>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="reset-email">Email</Label>
//                 <Input
//                   id="reset-email"
//                   type="email"
//                   {...registerReset("email")}
//                   placeholder="john@example.com"
//                 />
//                 {resetErrors.email && (
//                   <p className="text-sm text-red-500">{resetErrors.email.message}</p>
//                 )}
//               </div>
//             </CardContent>
//             <CardFooter className="flex flex-col space-y-4">
//               <Button type="submit" className="w-full" disabled={isResetSubmitting}>
//                 {isResetSubmitting ? "Sending..." : "Send Reset Instructions"}
//               </Button>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 onClick={() => setIsResetMode(false)}
//               >
//                 Back to Login
//               </Button>
//             </CardFooter>
//           </form>
//         </Card>
//       </div>
//     );
//   }

//   // Render new password setup form
//   if (isNewPasswordMode) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="w-[400px]">
//           <CardHeader>
//             <CardTitle>Set New Password</CardTitle>
//             <CardDescription>
//               Please enter your new password
//             </CardDescription>
//           </CardHeader>
//           <form onSubmit={handleNewPasswordSubmit(onNewPasswordSubmit)}>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="new-password">New Password</Label>
//                 <Input
//                   id="new-password"
//                   type="password"
//                   {...registerNewPassword("password")}
//                   placeholder="••••••••"
//                 />
//                 {newPasswordErrors.password && (
//                   <p className="text-sm text-red-500">{newPasswordErrors.password.message}</p>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="confirm-password">Confirm Password</Label>
//                 <Input
//                   id="confirm-password"
//                   type="password"
//                   {...registerNewPassword("confirmPassword")}
//                   placeholder="••••••••"
//                 />
//                 {newPasswordErrors.confirmPassword && (
//                   <p className="text-sm text-red-500">{newPasswordErrors.confirmPassword.message}</p>
//                 )}
//               </div>
//             </CardContent>
//             <CardFooter>
//               <Button type="submit" className="w-full" disabled={isNewPasswordSubmitting}>
//                 {isNewPasswordSubmitting ? "Updating..." : "Update Password"}
//               </Button>
//             </CardFooter>
//           </form>
//         </Card>
//       </div>
//     );
//   }

//   // Render main login form
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <Card className="w-[400px]">
//         <CardHeader>
//           <CardTitle>Login</CardTitle>
//           <CardDescription>
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <form onSubmit={handleLoginSubmit(onLogin)}>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 {...registerLogin("email")}
//                 placeholder="john@example.com"
//               />
//               {loginErrors.email && (
//                 <p className="text-sm text-red-500">{loginErrors.email.message}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 {...registerLogin("password")}
//                 placeholder="••••••••"
//               />
//               {loginErrors.password && (
//                 <p className="text-sm text-red-500">{loginErrors.password.message}</p>
//               )}
//             </div>
//             <Button
//               type="button"
//               variant="link"
//               className="px-0 text-sm"
//               onClick={() => setIsResetMode(true)}
//             >
//               Forgot your password?
//             </Button>
//           </CardContent>
//           <CardFooter className="flex flex-col space-y-4">
//             <Button type="submit" className="w-full" disabled={isLoginSubmitting}>
//               {isLoginSubmitting ? "Logging in..." : "Login"}
//             </Button>
//             <p className="text-sm text-center text-muted-foreground">
//               Don&apos;t have an account?{" "}
//               <Link href="/signup" className="text-primary hover:underline">
//                 Sign up
//               </Link>
//             </p>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// }
'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface LoginFormState {
  email: string;
  password: string;
}

interface ResetFormState {
  email: string;
}

interface NewPasswordFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [isNewPasswordMode, setIsNewPasswordMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  
  const [resetForm, setResetForm] = useState<ResetFormState>({
    email: "",
  });
  
  const [newPasswordForm, setNewPasswordForm] = useState<NewPasswordFormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    return Boolean(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Handle login form submission
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!validateEmail(loginForm.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!validatePassword(loginForm.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
      router.push("/dashboard");
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset request
  const handleResetRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!validateEmail(resetForm.email)) {
      newErrors.email = "Please enter a valid email";
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetForm.email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent to your email");
      setIsResetMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset instructions");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle new password submission
  const handleNewPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!validateEmail(newPasswordForm.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!validatePassword(newPasswordForm.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (newPasswordForm.password !== newPasswordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (user && user.email !== newPasswordForm.email) {
        throw new Error("Email verification failed. Please use the email associated with your account.");
      }

      const { error } = await supabase.auth.updateUser({
        email: newPasswordForm.email,
        password: newPasswordForm.password,
      });
      if (error) throw error;
      
      toast.success("Password updated successfully");
      setIsNewPasswordMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleResetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  };

  useEffect(() => {
    const checkUserAndToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("reset")) {
        setIsNewPasswordMode(true);
      }
    };
    checkUserAndToken();
  }, [router]);

  // Render password reset request form
  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive password reset instructions
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleResetRequest}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  name="email"
                  value={resetForm.email}
                  onChange={handleResetChange}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsResetMode(false)}
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Render new password setup form
  if (isNewPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Please verify your email and enter your new password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleNewPasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verify-email">Verify Email</Label>
                <Input
                  id="verify-email"
                  type="email"
                  name="email"
                  value={newPasswordForm.email}
                  onChange={handleNewPasswordChange}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  name="password"
                  value={newPasswordForm.password}
                  onChange={handleNewPasswordChange}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={newPasswordForm.confirmPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Render main login form
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <Button
              type="button"
              variant="link"
              className="px-0 text-sm"
              onClick={() => setIsResetMode(true)}
            >
              Forgot your password?
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}