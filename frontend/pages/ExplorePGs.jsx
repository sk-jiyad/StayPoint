"use client";

import { useEffect, useMemo, useState } from "react";
import { Wifi, UtensilsCrossed, Snowflake, Home, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { pgApi, ApiError } from "../src/lib/api.js";

const amenityIcons = {
  wifi: <Wifi size={16} />,
  food: <UtensilsCrossed size={16} />,
  ac: <Snowflake size={16} />,
};

const statusStyles = {
  vacant: { cls: "bg-green-100 text-green-800", text: "Vacant" },
  few: { cls: "bg-yellow-100 text-yellow-800", text: "Few left" },
  full: { cls: "bg-red-100 text-red-800", text: "Full" },
};

function statusFor(availableRooms) {
  if (availableRooms == null) return null;
  if (availableRooms <= 0) return "full";
  if (availableRooms <= 2) return "few";
  return "vacant";
}

// Map a backend PGResponseDTO to the shape the cards render.
function toCard(pg) {
  const amenities = [];
  if (pg.wifiAvailable) amenities.push("wifi");
  if (pg.foodProvided) amenities.push("food");
  if (pg.acAvailable) amenities.push("ac");
  return {
    id: pg.id,
    name: pg.name,
    address: pg.address,
    landmark: pg.landmark,
    rent: pg.rentSingle,
    amenities,
    image: pg.imageUrls && pg.imageUrls.length > 0 ? pg.imageUrls[0] : null,
    gender: pg.gender || null,
    availableRooms: pg.availableRooms ?? null,
    status: statusFor(pg.availableRooms ?? null),
  };
}

export default function ExplorePGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Rent (Low→High)");
  const [rentMax, setRentMax] = useState(50000);
  const [gender, setGender] = useState("all");
  const [vacancyOnly, setVacancyOnly] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    pgApi
      .list()
      .then((data) => {
        if (active) {
          setPgs(data.map(toCard));
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not reach the server. Is the backend running?"
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Filter + sort client-side over the fetched listings.
  const filteredPGs = useMemo(() => {
    let data = [...pgs];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (pg) =>
          pg.name.toLowerCase().includes(term) ||
          pg.address.toLowerCase().includes(term)
      );
    }

    data = data.filter((pg) => Number(pg.rent) <= rentMax);

    if (gender !== "all") {
      data = data.filter((pg) => pg.gender === gender);
    }

    if (vacancyOnly) {
      data = data.filter((pg) => pg.status === "vacant" || pg.status === "few");
    }

    switch (sortBy) {
      case "Rent (Low→High)":
        data.sort((a, b) => a.rent - b.rent);
        break;
      case "Rent (High→Low)":
        data.sort((a, b) => b.rent - a.rent);
        break;
      case "Newest":
        data.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return data;
  }, [pgs, searchTerm, rentMax, gender, vacancyOnly, sortBy]);

  return (
    <div className="min-h-screen w-screen bg-[#FFFEF9] py-12 px-4 md:px-10 lg:px-16">
      <div className="w-full space-y-10">
        {/* Search Bar */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search PG by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 bg-[#191919] border border-gray-700 rounded-lg text-white placeholder-white focus:border-green-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Filter Section */}
        <div className="bg-[#191919] rounded-xl p-6 shadow-lg border border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Rent */}
            <div className="min-w-0">
              <label className="block text-white text-sm font-medium mb-2">
                Max rent (single): ₹{(rentMax / 1000).toFixed(0)}k
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={rentMax}
                onChange={(e) => setRentMax(parseInt(e.target.value))}
                className="w-full accent-[#87E64B]"
              />
            </div>

            {/* Gender */}
            <div className="min-w-0">
              <label className="block text-white text-sm font-medium mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-[#383838] rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="coed">Co-ed</option>
              </select>
            </div>

            {/* Vacancy */}
            <div className="flex flex-col justify-center min-w-0">
              <label className="text-white text-sm font-medium mb-2">Vacancy</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vacancyOnly}
                  onChange={(e) => setVacancyOnly(e.target.checked)}
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-gray-300 text-sm">Show only available</span>
              </label>
            </div>

            {/* Sort By */}
            <div className="min-w-0">
              <label className="block text-white text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#383838] rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option>Rent (Low→High)</option>
                <option>Rent (High→Low)</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* States */}
        {loading && (
          <p className="text-center text-gray-500 text-lg mt-16">Loading PGs…</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 text-lg mt-16">{error}</p>
        )}

        {/* PG Listings */}
        {!loading && !error && filteredPGs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPGs.map((pg) => (
              <div
                key={pg.id}
                className="bg-[#191919] rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-transform duration-200 border border-gray-800"
              >
                {pg.image ? (
                  <img src={pg.image} alt={pg.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white">{pg.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin size={14} /> {pg.address}
                      </p>
                    </div>
                    {pg.status && (
                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[pg.status].cls}`}
                      >
                        {statusStyles[pg.status].text}
                      </span>
                    )}
                  </div>

                  <p className="text-xl font-bold text-[#87E64B] mb-3">
                    ₹{pg.rent}/month
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pg.amenities.length > 0 ? (
                      pg.amenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="p-1 bg-gray-800 rounded text-gray-300"
                        >
                          {amenityIcons[amenity]}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No listed amenities</span>
                    )}
                  </div>

                  {(pg.gender || pg.availableRooms != null) && (
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                      {pg.gender && <span className="capitalize">{pg.gender}</span>}
                      {pg.availableRooms != null && <span>{pg.availableRooms} rooms left</span>}
                    </div>
                  )}

                  {pg.landmark && (
                    <p className="text-sm text-gray-400 mb-4">Near {pg.landmark}</p>
                  )}

                  <Link
                    to={`/pg/${pg.id}`}
                    className="inline-block w-full text-center px-4 py-2 bg-[#87E64B] text-black rounded-lg hover:transition font-semibold cursor-pointer"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredPGs.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-400 text-lg">
              {pgs.length === 0
                ? "No PGs listed yet. Be the first to add one!"
                : "No PGs match your filters. Try adjusting them."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
