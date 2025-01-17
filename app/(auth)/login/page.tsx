// "use"
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



"use client"
import React from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

// Schema for login form
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema for password reset request
const resetSchema = z.object({
  email: z.string().email(),
});

export default function LoginPage() {
  const router = useRouter();
  const [isResetMode, setIsResetMode] = React.useState(false);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  // Reset form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting },
  } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  });

  // Handle normal login
  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      router.push("/dashboard");
      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    }
  };

  // Handle password reset request
  const onReset = async (data: z.infer<typeof resetSchema>) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/resetPassword`,
      });
      if (error) throw error;
      toast.success("Password reset instructions sent to your email");
      setIsResetMode(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset instructions");
    }
  };

  // Render password reset form
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
          <form onSubmit={handleResetSubmit(onReset)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  {...registerReset("email")}
                  placeholder="john@example.com"
                />
                {resetErrors.email && (
                  <p className="text-sm text-red-500">{resetErrors.email.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isResetSubmitting}>
                {isResetSubmitting ? "Sending..." : "Send Reset Instructions"}
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
        <form onSubmit={handleLoginSubmit(onLogin)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...registerLogin("email")}
                placeholder="john@example.com"
              />
              {loginErrors.email && (
                <p className="text-sm text-red-500">{loginErrors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...registerLogin("password")}
                placeholder="••••••••"
              />
              {loginErrors.password && (
                <p className="text-sm text-red-500">{loginErrors.password.message}</p>
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
            <Button type="submit" className="w-full" disabled={isLoginSubmitting}>
              {isLoginSubmitting ? "Logging in..." : "Login"}
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