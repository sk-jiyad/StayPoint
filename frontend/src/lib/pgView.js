// Adapters: map the backend PGResponseDTO into the shapes the redesigned UI renders.

export function statusFor(availableRooms) {
  if (availableRooms == null) return null;
  if (availableRooms <= 0) return "full";
  if (availableRooms <= 2) return "few";
  return "vacant";
}

export const STATUS_LABEL = {
  vacant: "Vacant",
  few: "Few left",
  full: "House full",
};

// Amenities present on a PG, as [{ key, label }] (key matches a lucide icon picker in the page).
export function amenityList(pg) {
  const all = [
    ["wifi", "WiFi", pg.wifiAvailable],
    ["food", "Food", pg.foodProvided],
    ["ac", "AC", pg.acAvailable],
    ["laundry", "Laundry", pg.laundryAvailable],
    ["parking", "Parking", pg.parkingAvailable],
    ["bath", "Attached bath", pg.attachedBathroom],
  ];
  return all.filter(([, , on]) => on).map(([key, label]) => ({ key, label }));
}

// Rent tiers for the details page.
export function rentTiers(pg) {
  return [
    { type: "Single", rent: pg.rentSingle },
    { type: "Double", rent: pg.rentDouble },
    { type: "Triple", rent: pg.rentTriple },
  ].filter((t) => t.rent != null);
}

// A compact card view used by Explore / recommendation strips / owner dashboard.
export function toCard(pg) {
  return {
    id: pg.id,
    name: pg.name,
    address: pg.address,
    city: pg.city || null,
    college: pg.nearbyCollege || null,
    landmark: pg.landmark || null,
    rent: pg.rentSingle,
    gender: pg.gender || null,
    totalRooms: pg.totalRooms ?? null,
    availableRooms: pg.availableRooms ?? null,
    status: statusFor(pg.availableRooms ?? null),
    amenities: amenityList(pg),
    image: pg.imageUrls && pg.imageUrls.length > 0 ? pg.imageUrls[0] : null,
    verified: Boolean(pg.verified),
    rating: pg.avgRating ?? null,
    reviewCount: pg.reviewCount ?? 0,
  };
}
