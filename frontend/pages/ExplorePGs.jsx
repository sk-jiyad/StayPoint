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
  };
}

export default function ExplorePGs() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Rent (Low→High)");
  const [rentMax, setRentMax] = useState(50000);

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
  }, [pgs, searchTerm, rentMax, sortBy]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
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

            {/* Sort By */}
            <div className="min-w-0">
              <label className="block text-white text-sm font-medium mb-2">
                Sort By
              </label>
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
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-white">{pg.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <MapPin size={14} /> {pg.address}
                    </p>
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
                : "No PGs match your filters. Try widening the rent range."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
