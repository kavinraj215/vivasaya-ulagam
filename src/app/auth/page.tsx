"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Logo from "@/components/ui/Logo";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("otp"); // Default to OTP for modern passwordless entry
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((providers) => {
        if (isMounted) {
          setGoogleAvailable(Boolean(providers?.google));
        }
      })
      .catch(() => {
        if (isMounted) setGoogleAvailable(false);
      })
      .finally(() => {
        if (isMounted) setProvidersLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setSuccessMsg("Verification code sent to your email!");
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch {
      setError("Failed to connect to verification service");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        if (authMethod === "password") {
          // Standard Credentials password flow
          const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });

          if (res?.error) {
            setError(res.error);
            setLoading(false);
          } else {
            router.push("/");
            router.refresh();
          }
        } else {
          // OTP flow verify & login
          if (!otp) {
            setError("Please enter the verification code");
            setLoading(false);
            return;
          }
          const res = await signIn("otp", {
            redirect: false,
            email,
            otp: otp.trim(),
          });

          if (res?.error) {
            setError(res.error);
            setLoading(false);
          } else {
            router.push("/");
            router.refresh();
          }
        }
      } else {
        // Register password flow
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Registration failed");
          setLoading(false);
        } else {
          // Auto login after register
          const loginRes = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });

          if (!loginRes?.error) {
            router.push("/");
            router.refresh();
          } else {
            setError(loginRes.error);
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!googleAvailable) {
      setError("Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local, then restart the server.");
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <Navbar />
      <main className="pt-[calc(var(--navbar-height)+1.25rem)] pb-24 bg-cream min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-cream-dark p-8 m-4">
          
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-0.5 mb-3">
              <Logo className="h-12" textClassName="text-xl" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-text-dark">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-text-muted text-sm font-body mt-1 text-center">
              {isLogin 
                ? "Sign in to access your orders and wishlist" 
                : "Join Vivasaya Ulagam for premium organic foods"
              }
            </p>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => { setIsLogin(true); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors border-0 cursor-pointer ${isLogin ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black bg-transparent'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors border-0 cursor-pointer ${!isLogin ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black bg-transparent'}`}
            >
              Register
            </button>
          </div>

          {isLogin && (
            <div className="flex justify-center gap-4 mb-6 border-b border-gray-100 pb-4">
              <button
                type="button"
                onClick={() => { setAuthMethod("otp"); setError(""); setSuccessMsg(""); }}
                className={`text-xs font-bold pb-2 border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${authMethod === "otp" ? "border-[#1F6B3B] text-[#1F6B3B]" : "border-transparent text-gray-500"}`}
              >
                OTP Verification Code
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod("password"); setError(""); setSuccessMsg(""); }}
                className={`text-xs font-bold pb-2 border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${authMethod === "password" ? "border-[#1F6B3B] text-[#1F6B3B]" : "border-transparent text-gray-500"}`}
              >
                Password Login
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-body">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md font-body">
              {successMsg}
            </div>
          )}

          <form className="space-y-4 font-body" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-dark">Full Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary" 
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-dark">Email Address *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary" 
              />
            </div>

            {isLogin && authMethod === "otp" ? (
              <div className="space-y-3">
                {otpSent && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-dark">Verification Code *</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-center font-bold tracking-widest outline-none focus:border-primary" 
                    />
                  </div>
                )}
                
                {!otpSent ? (
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-[#1F6B3B] hover:bg-[#154b29] text-white py-3 rounded-lg font-bold tracking-wider text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer border-0 mt-2"
                  >
                    {loading ? "SENDING CODE..." : "SEND VERIFICATION CODE"}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white py-3 rounded-lg font-bold tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer border-0"
                    >
                      {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs font-semibold text-[#1F6B3B] hover:underline bg-transparent border-0 cursor-pointer mt-1"
                    >
                      Resend Code
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-text-dark">Password *</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setError("Password reset is not available yet. Please use OTP login or contact support.")}
                        className="text-xs font-semibold text-primary hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-3 rounded-lg font-bold tracking-wider text-sm hover:bg-gray-800 transition-colors shadow-sm mt-6 disabled:opacity-50 cursor-pointer border-0"
                >
                  {loading ? "PROCESSING..." : (isLogin ? "SIGN IN" : "CREATE ACCOUNT")}
                </button>
              </>
            )}
          </form>

          {/* Social login divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or Continue With</span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={!providersLoaded || !googleAvailable}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-200 py-3 rounded-lg text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Google Icon */}
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{googleAvailable ? "Sign in with Google" : "Google sign-in unavailable"}</span>
          </button>
          {providersLoaded && !googleAvailable && (
            <p className="mt-2 text-center text-[11px] font-semibold text-gray-500">
              Google OAuth keys are missing in this environment.
            </p>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
