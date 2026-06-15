"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useAuth } from "../src/lib/auth.jsx"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, isOwner, isAdmin, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate("/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#191919] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group no-underline">
            <img src="/logo.svg" alt="StayPoint Logo" className="w-40" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-[#87E64B] transition no-underline">
              Home
            </Link>
            <Link to="/explore" className="text-white hover:text-[#87E64B] transition no-underline">
              Explore PGs
            </Link>
            {isOwner && (
              <Link to="/add-pg" className="text-white hover:text-[#87E64B] transition no-underline">
                Add Your PG
              </Link>
            )}
            {isOwner && (
              <Link to="/my-listings" className="text-white hover:text-[#87E64B] transition no-underline">
                My Listings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-white hover:text-[#87E64B] transition no-underline">
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-gray-400 text-sm max-w-[180px] truncate">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#87E64B] text-black rounded-md transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white bg-[#383838] rounded-md hover:border-green-500 transition no-underline"
                >
                  Signup
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-[#87E64B] text-black rounded-md hover:bg-[#87E64B] transition font-medium no-underline"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800">
            <Link to="/" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
              Home
            </Link>
            <Link to="/explore" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
              Explore PGs
            </Link>
            {isOwner && (
              <Link to="/add-pg" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
                Add Your PG
              </Link>
            )}
            {isOwner && (
              <Link to="/my-listings" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
                My Listings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="block px-4 py-2 text-white hover:text-green-500 no-underline">
                Admin
              </Link>
            )}
            <div className="flex gap-2 px-4 py-2 mt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex-1 px-3 py-2 text-center bg-[#87E64B] text-black rounded-md text-sm font-medium"
                >
                  Logout ({user?.email})
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 px-3 py-2 text-center bg-black text-[#87E64B] border-2 rounded-md text-sm no-underline"
                  >
                    Signup
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 px-3 py-2 text-center bg-[#87E64B] text-black rounded-md text-sm font-medium no-underline"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
