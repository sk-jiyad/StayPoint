"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../src/lib/auth.jsx";
import { pgApi, ApiError } from "../src/lib/api.js";
import { uploadImage } from "../src/lib/cloudinary.js";
import CollegeField from "../components/CollegeField.jsx";

const AMENITIES = [
  { key: "wifiAvailable", label: "WiFi" },
  { key: "foodProvided", label: "Food" },
  { key: "acAvailable", label: "AC" },
  { key: "laundryAvailable", label: "Laundry" },
  { key: "parkingAvailable", label: "Parking" },
  { key: "attachedBathroom", label: "Attached Bath" },
];

const emptyForm = {
  name: "",
  ownerName: "",
  contactNumber: "",
  alternateContact: "",
  address: "",
  landmark: "",
  rentSingle: "",
  rentDouble: "",
  rentTriple: "",
  foodProvided: false,
  wifiAvailable: false,
  acAvailable: false,
  laundryAvailable: false,
  parkingAvailable: false,
  attachedBathroom: false,
  imageUrls: [],
  gender: "boys",
  nearbyCollege: "",
  totalRooms: "",
  availableRooms: "",
};

export default function EditPG() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isOwner } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!isOwner) return;
    let active = true;
    setLoading(true);
    pgApi
      .get(id)
      .then((pg) => {
        if (!active) return;
        setForm({
          name: pg.name ?? "",
          ownerName: pg.ownerName ?? "",
          contactNumber: pg.contactNumber ?? "",
          alternateContact: pg.alternateContact ?? "",
          address: pg.address ?? "",
          landmark: pg.landmark ?? "",
          rentSingle: pg.rentSingle ?? "",
          rentDouble: pg.rentDouble ?? "",
          rentTriple: pg.rentTriple ?? "",
          foodProvided: Boolean(pg.foodProvided),
          wifiAvailable: Boolean(pg.wifiAvailable),
          acAvailable: Boolean(pg.acAvailable),
          laundryAvailable: Boolean(pg.laundryAvailable),
          parkingAvailable: Boolean(pg.parkingAvailable),
          attachedBathroom: Boolean(pg.attachedBathroom),
          imageUrls: pg.imageUrls ?? [],
          gender: pg.gender ?? "boys",
          nearbyCollege: pg.nearbyCollege ?? "",
          totalRooms: pg.totalRooms ?? "",
          availableRooms: pg.availableRooms ?? "",
        });
        setLoadError("");
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? "PG not found"
            : "Could not load this PG."
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isOwner]);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) =>
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((u) => u !== url) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      ownerName: form.ownerName,
      contactNumber: form.contactNumber.trim(),
      address: form.address,
      rentSingle: Number(form.rentSingle),
      rentDouble: Number(form.rentDouble),
      foodProvided: form.foodProvided,
      wifiAvailable: form.wifiAvailable,
      acAvailable: form.acAvailable,
      laundryAvailable: form.laundryAvailable,
      parkingAvailable: form.parkingAvailable,
      attachedBathroom: form.attachedBathroom,
      landmark: form.landmark,
    };
    if (form.alternateContact.trim() !== "") payload.alternateContact = form.alternateContact.trim();
    if (String(form.rentTriple).trim() !== "") payload.rentTriple = Number(form.rentTriple);
    payload.imageUrls = form.imageUrls;
    payload.gender = form.gender;
    payload.nearbyCollege = form.nearbyCollege;
    if (String(form.totalRooms).trim() !== "") payload.totalRooms = Number(form.totalRooms);
    if (String(form.availableRooms).trim() !== "") payload.availableRooms = Number(form.availableRooms);

    try {
      await pgApi.update(id, payload);
      navigate(`/pg/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) setError("You can only edit your own listings.");
        else {
          const firstFieldError = err.errors ? Object.values(err.errors)[0] : null;
          setError(firstFieldError || err.message);
        }
      } else {
        setError("Could not reach the server. Is the backend running?");
      }
    } finally {
      setSaving(false);
    }
  };

  // Auth gate
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">Owners only</h2>
          <p className="text-gray-400 mb-6">Please log in as a PG Owner to edit listings.</p>
          <Link to="/login" className="px-6 py-2 bg-green-500 text-black rounded-lg font-semibold">
            Login / Sign up
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-gray-400 text-center mt-20 text-xl">Loading…</div>;
  }
  if (loadError) {
    return <div className="text-gray-300 text-center mt-20 text-xl">{loadError}</div>;
  }

  const input =
    "w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none";

  return (
    <div className="w-screen min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl p-8 md:p-10 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Listing</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className={input} placeholder="PG Name *" value={form.name} onChange={set("name")} />
          <input className={input} placeholder="Owner Name *" value={form.ownerName} onChange={set("ownerName")} />
          <div className="grid md:grid-cols-2 gap-4">
            <input className={input} placeholder="Contact Number (10 digits) *" value={form.contactNumber} onChange={set("contactNumber")} />
            <input className={input} placeholder="Alternate Contact (optional)" value={form.alternateContact} onChange={set("alternateContact")} />
          </div>
          <input className={input} placeholder="Address (10-500 chars) *" value={form.address} onChange={set("address")} />
          <input className={input} placeholder="Landmark (optional)" value={form.landmark} onChange={set("landmark")} />
          <div className="grid md:grid-cols-3 gap-4">
            <input type="number" className={input} placeholder="Single rent *" value={form.rentSingle} onChange={set("rentSingle")} />
            <input type="number" className={input} placeholder="Double rent *" value={form.rentDouble} onChange={set("rentDouble")} />
            <input type="number" className={input} placeholder="Triple rent (optional)" value={form.rentTriple} onChange={set("rentTriple")} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <select className={input} value={form.gender} onChange={set("gender")}>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="coed">Co-ed</option>
            </select>
            <input type="number" className={input} placeholder="Total rooms (optional)" value={form.totalRooms} onChange={set("totalRooms")} />
            <input type="number" className={input} placeholder="Available rooms (optional)" value={form.availableRooms} onChange={set("availableRooms")} />
          </div>
          <CollegeField
            value={form.nearbyCollege}
            onChange={(v) => setForm((f) => ({ ...f, nearbyCollege: v }))}
            placeholder="Nearby college — search or type your own (optional)"
            className={input}
          />

          <div className="flex flex-wrap gap-6 pt-2">
            {AMENITIES.map((a) => (
              <label key={a.key} className="flex items-center gap-2 cursor-pointer text-gray-300">
                <input
                  type="checkbox"
                  checked={form[a.key]}
                  onChange={set(a.key)}
                  className="w-5 h-5 rounded border-gray-700 text-green-500"
                />
                {a.label}
              </label>
            ))}
          </div>

          {/* Photos */}
          <div className="pt-2">
            <label className="block text-sm text-gray-400 mb-2">Photos</label>
            <div className="flex flex-wrap gap-3">
              {form.imageUrls.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 text-sm">
                {uploading ? "…" : "+ Add"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
              </label>
            </div>
            {uploadError && <p className="text-sm text-red-400 mt-1">{uploadError}</p>}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/my-listings")}
              className="flex-1 px-6 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-500 text-black rounded-lg hover:bg-green-600 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
