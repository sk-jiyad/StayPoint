"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Upload, ArrowRight, ArrowLeft, Check, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../src/lib/auth.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";
import { uploadImage } from "../src/lib/cloudinary.js";
import CollegeCombobox from "../components/CollegeCombobox.jsx";

/* Brand constants matching UI theme */
const INK = "#15170F";
const PAPER = "#F4F1EA";
const PANEL = "#FBFAF5";
const GREEN = "#4F7B1E";
const LINE = "rgba(21,23,15,0.12)";

const EMPTY = {
  pgName: "",
  address: "",
  city: "",
  college: "",
  gender: "boys",
  sharingOptions: [{ type: "Single", rent: "" }, { type: "Double", rent: "" }],
  totalRooms: "",
  availableRooms: "",
  amenities: [],
  ownerName: "",
  phone: "",
  email: "",
  imageUrls: [],
};

const amenitiesList = ["WiFi", "Food", "AC", "Laundry", "Parking", "Attached Bath"];

export default function AddPG() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { isAuthenticated, isOwner } = useAuth();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  const [formData, setFormData] = useState(EMPTY);

  // Prefill when editing
  useEffect(() => {
    if (!isEdit || !isOwner) return;
    let active = true;
    setLoadingEdit(true);
    pgApi
      .get(id)
      .then((pg) => {
        if (!active) return;
        const so = [];
        if (pg.rentSingle != null) so.push({ type: "Single", rent: String(pg.rentSingle) });
        if (pg.rentDouble != null) so.push({ type: "Double", rent: String(pg.rentDouble) });
        if (pg.rentTriple != null) so.push({ type: "Triple", rent: String(pg.rentTriple) });
        const amen = [];
        if (pg.wifiAvailable) amen.push("WiFi");
        if (pg.foodProvided) amen.push("Food");
        if (pg.acAvailable) amen.push("AC");
        if (pg.laundryAvailable) amen.push("Laundry");
        if (pg.parkingAvailable) amen.push("Parking");
        if (pg.attachedBathroom) amen.push("Attached Bath");
        setFormData({
          pgName: pg.name ?? "",
          address: pg.address ?? "",
          city: pg.city ?? "",
          college: pg.nearbyCollege ?? "",
          gender: pg.gender ?? "boys",
          sharingOptions: so.length ? so : [{ type: "Single", rent: "" }],
          totalRooms: pg.totalRooms ?? "",
          availableRooms: pg.availableRooms ?? "",
          amenities: amen,
          ownerName: pg.ownerName ?? "",
          phone: pg.contactNumber ?? "",
          email: "",
          imageUrls: pg.imageUrls ?? [],
        });
      })
      .catch(() => setError("Could not load this listing."))
      .finally(() => active && setLoadingEdit(false));
    return () => { active = false; };
  }, [id, isEdit, isOwner]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addSharingOption = () => {
    setFormData((prev) => ({ ...prev, sharingOptions: [...prev.sharingOptions, { type: "Single", rent: "" }] }));
  };
  const updateSharingOption = (index, field, value) => {
    const newOptions = [...formData.sharingOptions];
    newOptions[index][field] = value;
    setFormData({ ...formData, sharingOptions: newOptions });
  };
  const removeSharingOption = (index) => {
    setFormData({ ...formData, sharingOptions: formData.sharingOptions.filter((_, i) => i !== index) });
  };

  // --- Cloudinary ---
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const removeImage = (url) => setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }));

  const getRent = (type) => {
    const opt = formData.sharingOptions.find((o) => o.type === type);
    return opt && opt.rent ? Number(opt.rent) : 0;
  };

  // --- Submit ---
  const submitPG = async () => {
    setError("");

    // Validation
    if (formData.city.trim() === "") { setError("City is required."); setStep(1); return; }
    if (getRent("Single") <= 0 || getRent("Double") <= 0) { setError("Single and Double room rents are required."); setStep(2); return; }
    if (formData.totalRooms === "" || formData.availableRooms === "") { setError("Total rooms and available rooms are required."); setStep(2); return; }
    if (Number(formData.availableRooms) > Number(formData.totalRooms)) { setError("Available rooms can't exceed total rooms."); setStep(2); return; }

    setSubmitting(true);
    const payload = {
      name: formData.pgName,
      ownerName: formData.ownerName,
      contactNumber: formData.phone.trim(),
      address: formData.address,
      city: formData.city.trim(),
      gender: formData.gender,
      rentSingle: getRent("Single"),
      rentDouble: getRent("Double"),
      totalRooms: Number(formData.totalRooms),
      availableRooms: Number(formData.availableRooms),
      foodProvided: formData.amenities.includes("Food"),
      wifiAvailable: formData.amenities.includes("WiFi"),
      acAvailable: formData.amenities.includes("AC"),
      laundryAvailable: formData.amenities.includes("Laundry"),
      parkingAvailable: formData.amenities.includes("Parking"),
      attachedBathroom: formData.amenities.includes("Attached Bath"),
    };
    const tripleRent = getRent("Triple");
    if (tripleRent > 0) payload.rentTriple = tripleRent;
    if (formData.college.trim() !== "") payload.nearbyCollege = formData.college.trim();
    if (formData.imageUrls.length > 0) payload.imageUrls = formData.imageUrls;

    try {
      if (isEdit) {
        await pgApi.update(id, payload);
        navigate(`/pg/${id}`);
      } else {
        const created = await pgApi.create(payload);
        setCreatedId(created.id);
        setSubmitted(true);
      }
    } catch (err) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 5) setStep(step + 1);
    else submitPG();
  };

  // --- Auth gate ---
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 grain" style={{ background: PAPER, color: INK }}>
        <div className="text-center max-w-sm p-10" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
          <h2 className="ff-display text-3xl mb-4">Owners Only</h2>
          <p className="ff-mono text-sm mb-8" style={{ color: "#6B6A5C", lineHeight: 1.6 }}>
            {isAuthenticated ? "Your account isn't a PG Owner account." : "Please log in as a PG Owner to list a PG on StayPoint."}
          </p>
          <Link to="/login" className="inline-block w-full py-4 ff-mono uppercase tracking-[0.15em] text-xs" style={{ background: INK, color: PAPER }}>
            {isAuthenticated ? "Switch Account" : "Login / Sign up"}
          </Link>
        </div>
      </div>
    );
  }

  if (loadingEdit) {
    return <div className="min-h-screen grid place-content-center ff-mono uppercase tracking-[0.1em] text-[0.75rem]" style={{ background: PAPER, color: "#6B6A5C" }}>Loading listing…</div>;
  }

  // --- Success (create only) ---
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 grain" style={{ background: PAPER, color: INK }}>
        <div className="text-center max-w-md p-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: GREEN }}>
            <Check className="w-8 h-8" style={{ color: PAPER }} />
          </div>
          <h2 className="ff-display text-4xl mb-3">Listing Created!</h2>
          <p className="ff-mono text-sm mb-10" style={{ color: "#6B6A5C" }}>Your PG is now live on StayPoint.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate(`/pg/${createdId}`)} className="px-8 py-4 ff-mono uppercase tracking-[0.15em] text-xs" style={{ background: GREEN, color: PAPER }}>View Listing</button>
            <button onClick={() => navigate("/explore")} className="px-8 py-4 ff-mono uppercase tracking-[0.15em] text-xs border" style={{ borderColor: LINE, color: INK }}>Explore PGs</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 grain" style={{ background: PAPER, color: INK }}>
      <style>{`
        .ff-display { font-family: var(--font-display); }
        .ff-mono { font-family: var(--font-mono); }
        .grain { background-image: radial-gradient(${GREEN}14 0.5px, transparent 0.5px); background-size: 18px 18px; }
      `}</style>

      <div className="max-w-[700px] mx-auto">
        <h1 className="ff-display text-3xl mb-6">{isEdit ? "Edit listing" : "List your PG"}</h1>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1 flex-1 mx-1 ${i <= step ? "opacity-100" : "opacity-20"}`} style={{ background: GREEN }} />
            ))}
          </div>
          <p className="ff-mono uppercase tracking-[0.2em]" style={{ fontSize: "0.65rem", color: "#6B6A5C" }}>Step {step} of 5</p>
        </div>

        <div className="p-8 md:p-12" style={{ background: PANEL, border: `1px solid ${LINE}` }}>
          <form onSubmit={handleSubmit}>
            <div className="min-h-[350px]">
              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="ff-display text-4xl mb-8">Basic Information</h2>
                  <input type="text" name="pgName" placeholder="PG Name *" required value={formData.pgName} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  <input type="text" name="address" placeholder="Full Address *" required value={formData.address} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  <input type="text" name="city" placeholder="City *" required value={formData.city} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  <CollegeCombobox value={formData.college} onChange={(v) => setFormData((f) => ({ ...f, college: v }))} />
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="ff-display text-4xl mb-6">Room Sharing & Rent</h2>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-4 outline-none mb-4" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                    <option value="boys">Boys PG</option>
                    <option value="girls">Girls PG</option>
                    <option value="coed">Co-ed PG</option>
                  </select>

                  <div className="space-y-4">
                    {formData.sharingOptions.map((option, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <select className="p-4 outline-none w-1/3" style={{ background: PAPER, border: `1px solid ${LINE}` }} value={option.type} onChange={(e) => updateSharingOption(index, "type", e.target.value)}>
                          <option>Single</option><option>Double</option><option>Triple</option>
                        </select>
                        <input type="number" placeholder="Rent (₹) *" className="p-4 outline-none flex-1" style={{ background: PAPER, border: `1px solid ${LINE}` }} value={option.rent} onChange={(e) => updateSharingOption(index, "rent", e.target.value)} />
                        {formData.sharingOptions.length > 1 && (
                          <button type="button" onClick={() => removeSharingOption(index)} className="p-4 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="ff-mono text-[0.65rem] opacity-60 uppercase tracking-[0.1em]">Single &amp; Double rents are required; Triple is optional.</p>

                  <button type="button" onClick={addSharingOption} className="ff-mono text-xs underline flex items-center gap-2 mt-2" style={{ color: GREEN }}>
                    <Plus size={14} /> Add another sharing type
                  </button>

                  <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t" style={{ borderColor: LINE }}>
                    <input type="number" min="0" name="totalRooms" placeholder="Total Rooms *" required value={formData.totalRooms} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                    <input type="number" min="0" name="availableRooms" placeholder="Rooms Free Now *" required value={formData.availableRooms} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="ff-display text-4xl mb-8">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {amenitiesList.map((a) => (
                      <label key={a} className="flex items-center gap-3 p-4 cursor-pointer transition-colors" style={{ border: `1px solid ${formData.amenities.includes(a) ? GREEN : LINE}`, background: formData.amenities.includes(a) ? `${GREEN}10` : PAPER }}>
                        <input type="checkbox" checked={formData.amenities.includes(a)} onChange={() => handleAmenityChange(a)} className="w-4 h-4" style={{ accentColor: GREEN }} />
                        <span className="ff-mono text-sm">{a}</span>
                      </label>
                    ))}
                  </div>
                  <p className="ff-mono text-[0.65rem] opacity-60 mt-4 uppercase tracking-[0.1em]">All amenities you tick are saved and used by search &amp; recommendations.</p>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="ff-display text-4xl mb-8">Upload Photos</h2>
                  <label className="border-2 border-dashed p-12 text-center w-full block cursor-pointer transition-colors" style={{ borderColor: LINE, background: PAPER }}>
                    <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: GREEN }} />
                    <p className="ff-mono text-sm mb-2" style={{ color: INK }}>{uploading ? "Uploading..." : "Click or drag images here"}</p>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
                  </label>
                  {uploadError && <p className="text-xs text-red-500 ff-mono">{uploadError}</p>}
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-6">
                      {formData.imageUrls.map((url) => (
                        <div key={url} className="relative aspect-square">
                          <img src={url} alt="Uploaded" className="w-full h-full object-cover" style={{ border: `1px solid ${LINE}` }} />
                          <button type="button" onClick={() => removeImage(url)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="ff-display text-4xl mb-8">Owner Information</h2>
                  <input type="text" name="ownerName" placeholder="Owner Name *" required value={formData.ownerName} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  <input type="tel" name="phone" placeholder="Contact Number *" required value={formData.phone} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                  <input type="email" name="email" placeholder="Email Address (optional, not saved)" value={formData.email} onChange={handleInputChange} className="w-full p-4 outline-none" style={{ background: PAPER, border: `1px solid ${LINE}` }} />
                </div>
              )}

              {error && (
                <div className="mt-8 p-4 flex items-center gap-2 ff-mono text-[0.75rem]" style={{ background: "rgba(217,64,64,0.1)", border: "1px solid rgba(217,64,64,0.3)", color: "#D94040" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D94040]" />
                  {error}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} disabled={submitting} className="flex items-center gap-2 px-8 py-4 ff-mono uppercase tracking-[0.15em] border disabled:opacity-50" style={{ borderColor: LINE, fontSize: "0.75rem" }}>
                  <ArrowLeft size={15} /> Prev
                </button>
              )}
              <button type="submit" disabled={submitting || uploading} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 ff-mono uppercase tracking-[0.15em] transition-opacity disabled:opacity-50" style={{ background: INK, color: PAPER, fontSize: "0.75rem" }}>
                {step === 5 ? (submitting ? "Saving..." : isEdit ? "Save changes" : "Submit Listing") : "Next"}
                {step < 5 && <ArrowRight size={15} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
