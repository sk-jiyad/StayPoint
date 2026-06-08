"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Upload } from "lucide-react"
import { useAuth } from "../src/lib/auth.jsx"
import { pgApi, ApiError } from "../src/lib/api.js"
import { uploadImage } from "../src/lib/cloudinary.js"

export default function AddPG() {
  const navigate = useNavigate()
  const { isAuthenticated, isOwner } = useAuth()

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [formData, setFormData] = useState({
    pgName: "",
    address: "",
    city: "",
    college: "",
    rentSingle: "",
    rentDouble: "",
    rentTriple: "",
    gender: "boys",
    totalRooms: "",
    availableRooms: "",
    amenities: [],
    ownerName: "",
    phone: "",
    email: "",
    imageUrls: [],
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploadError("")
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        urls.push(await uploadImage(file))
      }
      setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }))
    } catch (err) {
      setUploadError(err.message || "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (url) => {
    setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }))
  }

  const submitPG = async () => {
    setError("")
    setSubmitting(true)
    // Map the wizard fields onto the backend PGCreateDTO. Fields the backend
    // doesn't model (city, college, gender, room counts, photos, email) are
    // intentionally not sent.
    const payload = {
      name: formData.pgName,
      ownerName: formData.ownerName,
      contactNumber: formData.phone.trim(),
      address: formData.address,
      rentSingle: Number(formData.rentSingle),
      rentDouble: Number(formData.rentDouble),
      foodProvided: formData.amenities.includes("Food"),
      wifiAvailable: formData.amenities.includes("WiFi"),
      acAvailable: formData.amenities.includes("AC"),
    }
    if (formData.rentTriple !== "") payload.rentTriple = Number(formData.rentTriple)
    if (formData.imageUrls.length > 0) payload.imageUrls = formData.imageUrls
    payload.gender = formData.gender
    if (formData.totalRooms !== "") payload.totalRooms = Number(formData.totalRooms)
    if (formData.availableRooms !== "") payload.availableRooms = Number(formData.availableRooms)

    try {
      const created = await pgApi.create(payload)
      setCreatedId(created.id)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.errors ? Object.values(err.errors)[0] : null
        setError(firstFieldError || err.message)
      } else {
        setError("Could not reach the server. Is the backend running?")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step < 5) {
      setStep(step + 1)
    } else {
      submitPG()
    }
  }

  const amenities = ["WiFi", "Food", "AC", "Laundry", "Parking", "Attached Bath"]

  // --- Auth gate: only logged-in PG owners may create a listing ---
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Owners only</h2>
          <p className="text-gray-400 mb-6">
            {isAuthenticated
              ? "Your account isn't a PG Owner account, so you can't list a PG."
              : "Please log in as a PG Owner to list a PG."}
          </p>
          <Link
            to="/login"
            className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition font-semibold"
          >
            {isAuthenticated ? "Switch account" : "Login / Sign up"}
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Listing Created!</h2>
          <p className="text-gray-400 mb-6">Your PG is now live on StayPoint.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/pg/${createdId}`)}
              className="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition font-semibold"
            >
              View Listing
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="px-6 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              Explore PGs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen min-h-screen bg-background py-12 px-6 overflow-x-hidden">
      <div className="w-full">
        {/* Progress Bar */}
        <div className="mb-10 px-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1 flex-1 mx-1 rounded ${i <= step ? "bg-green-500" : "bg-gray-700"}`} />
            ))}
          </div>
          <p className="text-gray-400 text-sm">Step {step} of 5</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-10 shadow-lg mx-8">
          <form onSubmit={handleSubmit} className="w-full">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white mb-6">Basic Information</h2>
                <input
                  type="text"
                  name="pgName"
                  placeholder="PG Name"
                  value={formData.pgName}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address (at least 10 characters)"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City (optional)"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select Nearby College (optional)</option>
                  <option value="Delhi University">Delhi University</option>
                  <option value="Jamia Millia">Jamia Millia</option>
                  <option value="IP University">IP University</option>
                </select>
              </div>
            )}

            {/* Step 2: Room Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white mb-6">Room Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="number"
                    name="rentSingle"
                    placeholder="Single room rent (₹) *"
                    value={formData.rentSingle}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="rentDouble"
                    placeholder="Double room rent (₹) *"
                    value={formData.rentDouble}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="rentTriple"
                    placeholder="Triple room rent (₹, optional)"
                    value={formData.rentTriple}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="coed">Co-ed</option>
                  </select>
                  <input
                    type="number"
                    name="totalRooms"
                    placeholder="Total Rooms (optional)"
                    value={formData.totalRooms}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    name="availableRooms"
                    placeholder="Available Rooms (optional)"
                    value={formData.availableRooms}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Amenities */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white mb-6">Amenities</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="w-5 h-5 rounded border-gray-700 text-green-500"
                      />
                      <span className="text-gray-300">{amenity}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: WiFi, Food and AC are saved to your listing; the rest are coming soon.
                </p>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white mb-6">Upload Photos</h2>
                <label className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center w-full block cursor-pointer hover:border-green-500 transition">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    {uploading ? "Uploading…" : "Click to add photos"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                    disabled={uploading}
                  />
                </label>
                {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.imageUrls.map((url) => (
                      <div key={url} className="relative">
                        <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Owner Info */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white mb-6">Owner Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Your Name *"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Contact Number (10 digits) *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (optional, not saved yet)"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="md:col-span-2 w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="mt-6 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {step === 5 ? (submitting ? "Listing…" : "List My PG") : "Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
