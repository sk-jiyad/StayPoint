"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, UserCircle } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { ApiError } from "../src/lib/api.js";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ROLE_USER");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        await register(email, password, role);
      } else {
        await login(email, password);
      }
      navigate("/explore");
    } catch (err) {
      // Backend sends { message, errors }. Prefer the first field error if present.
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0] : null;
        setError(firstFieldError || err.message);
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex items-center justify-center">
          <img
            src="../public/signuplogin.svg"
            alt="Students"
            className="w-full max-w-sm rounded-2xl"
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-400 mb-8">
              {isSignup
                ? "Join thousands of students finding their perfect stay"
                : "Login to find your perfect PG"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={isSignup ? 8 : undefined}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Role selector (signup only) */}
              {isSignup && (
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="ROLE_USER">I'm looking for a PG (User)</option>
                    <option value="ROLE_OWNER">I want to list a PG (Owner)</option>
                  </select>
                </div>
              )}

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between">
                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-400">
                    Remember Me
                  </label>
                </div>
                {!isSignup && (
                  <p className="text-center">
                    <a href="#" className="text-sm text-gray-400">
                      Forgot Password?
                    </a>
                  </p>
                )}
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-[#87E64B] text-black rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Please wait…" : isSignup ? "Sign Up" : "Login"}
              </button>

              {/* Google Login (not wired — out of scope) */}
              <button
                type="button"
                disabled
                title="Google sign-in is not available yet"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-700 rounded-lg text-black transition font-semibold opacity-60 cursor-not-allowed"
              >
                <Chrome size={18} />
                Google
              </button>
            </form>

            {/* Toggle Signup/Login */}
            <p className="text-center text-gray-400 mt-6">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
                className="text-black font-semibold"
              >
                {isSignup ? "Login" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
