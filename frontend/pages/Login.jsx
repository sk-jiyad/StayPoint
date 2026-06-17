import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, ArrowRight } from "lucide-react"

/* Brand constants matching Landing Page & Signup */
const INK = "#15170F"
const PAPER = "#F4F1EA"
const PANEL = "#FBFAF5"
const GREEN = "#4F7B1E"
const LINE = "rgba(21,23,15,0.12)"

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    // Authenticate user here, then redirect
    navigate("/explore")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 md:px-10 antialiased grain"
      style={{ background: PAPER, color: INK }}
    >
      <style>{`
        ::selection {
          background: ${GREEN};
          color: ${PAPER};
        }

        .ff-display {
          font-family: var(--font-display);
          font-optical-sizing: auto;
        }

        .ff-mono {
          font-family: var(--font-mono);
        }

        .grain {
          background-image: radial-gradient(${GREEN}14 0.5px, transparent 0.5px);
          background-size: 18px 18px;
        }
      `}</style>

      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <img src="/logo sp.svg" alt="StayPoint" className="h-8 w-auto object-contain" />
          </Link>

          <h1
            className="ff-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 500,
            }}
          >
            Welcome{" "}
            <span
              className="italic"
              style={{ color: "#9A9684", fontWeight: 400 }}
            >
              back
            </span>
          </h1>

          <p
            className="mt-3 ff-mono tracking-[0.05em]"
            style={{
              fontSize: "0.8rem",
              color: "#6B6A5C",
            }}
          >
            Enter your details to access your account.
          </p>
        </div>

        {/* Form Card */}
        <div
          className="p-7 md:p-10"
          style={{
            background: PANEL,
            border: `1px solid ${LINE}`,
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="mb-6 p-4 ff-mono flex items-center gap-2"
              style={{
                background: "rgba(217,64,64,0.1)",
                border: "1px solid rgba(217,64,64,0.3)",
                color: "#D94040",
                fontSize: "0.75rem",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D94040]" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block ff-mono uppercase mb-2"
                style={{
                  fontSize: "0.65rem",
                  color: "#6B6A5C",
                }}
              >
                Email Address
              </label>

              <div
                className="flex items-center px-4 py-3 focus-within:border-green-700 transition-colors"
                style={{
                  background: PAPER,
                  border: `1px solid ${LINE}`,
                }}
              >
                <Mail size={16} style={{ color: GREEN }} className="shrink-0" />
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none ml-3 text-sm"
                  style={{ color: INK }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block ff-mono uppercase mb-2"
                style={{
                  fontSize: "0.65rem",
                  color: "#6B6A5C",
                }}
              >
                Password
              </label>

              <div
                className="flex items-center px-4 py-3 focus-within:border-green-700 transition-colors"
                style={{
                  background: PAPER,
                  border: `1px solid ${LINE}`,
                }}
              >
                <Lock size={16} style={{ color: GREEN }} className="shrink-0" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none ml-3 text-sm"
                  style={{ color: INK }}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5"
                  style={{ accentColor: GREEN }}
                />
                <span className="ff-mono tracking-[0.05em]" style={{ fontSize: "0.75rem", color: "#6B6A5C" }}>
                  Remember me
                </span>
              </label>

              <Link to="#" className="ff-mono tracking-[0.05em] hover:text-black transition-colors" style={{ fontSize: "0.75rem", color: GREEN }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 ff-mono uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
              style={{
                background: INK,
                color: PAPER,
                fontSize: "0.74rem",
              }}
            >
              Sign In
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: LINE }}></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 ff-mono uppercase tracking-[0.1em]" style={{ background: PANEL, color: "#9A9684", fontSize: "0.65rem" }}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 transition-colors hover:bg-white"
            style={{ border: `1px solid ${LINE}`, background: PAPER, color: INK, fontSize: "0.85rem", fontWeight: 500 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* Signup Link */}
          <p
            className="text-center mt-8 ff-mono"
            style={{
              fontSize: "0.75rem",
              color: "#6B6A5C",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="underline"
              style={{ color: GREEN }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}