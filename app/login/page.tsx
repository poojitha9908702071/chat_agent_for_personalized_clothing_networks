"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Simulate login (in real app, call API)
    try {
      // Store user info in localStorage for demo
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          name: email.split("@")[0],
          loggedIn: true,
        })
      );

      // Redirect to home page
      router.push("/home");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left branding column with image */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/fashiopulse-logo.jpg.png"
            alt="FashioPulse - Feel The Beat Of Fashion"
            className="w-full h-full max-h-[600px] object-contain"
          />
        </div>

        {/* Right form column */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-pink-50 to-white">
          {/* Logo and Branding for small screens */}
          <div className="mb-6 flex md:hidden flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/fashiopulse-logo.jpg.png"
              alt="FashioPulse"
              className="w-48 h-auto mb-4"
            />
          </div>

          {/* Heading */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">Welcome Back</h2>
            <p className="mt-2 text-gray-700 font-medium">Sign in to continue shopping</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-2 border-pink-200 bg-white pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-pink-200 bg-white pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgot(true);
                }}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-pink-600 hover:to-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center md:text-left">
            <p className="text-gray-700 font-medium">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-pink-600 hover:text-pink-700 transition-colors underline decoration-2 underline-offset-2"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border-2 border-pink-200">
              <div className="text-center mb-4">
                <span className="text-5xl">📧</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">Verification Email Sent</h3>
              <p className="text-gray-700 mb-6 text-center">
                A verification email has been sent to <span className="font-bold text-pink-600">{email || "(no email entered)"}</span>. Follow the link in the email to reset your password.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowForgot(false)}
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 font-bold hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
