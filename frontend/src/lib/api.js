// Thin fetch wrapper around the StayPoint backend REST API.
//
// In dev, VITE_API_BASE_URL is "/api" and Vite proxies /api -> http://localhost:1004
// (see vite.config.js), so the browser stays same-origin and CORS never comes up.
// For a deployed build, set VITE_API_BASE_URL to the backend's full URL.

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// localStorage key holding the AuthResponseDTO: { token, userId, email, role }
export const AUTH_KEY = "staypoint.auth";

/** Error thrown for any non-2xx response. Carries the backend ErrorResponse shape. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || null; // per-field validation map on 400, else null
  }
}

function getToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.message, data?.errors);
  }
  return data;
}

export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
};

export const uploadApi = {
  // Returns a backend-signed payload for a direct-to-Cloudinary upload.
  signature: () => request("/uploads/signature", { method: "POST" }),
};

export const pgApi = {
  list: () => request("/pgs"),
  get: (id) => request(`/pgs/${id}`),
  mine: () => request("/pgs/mine"),
  search: (location) => request(`/pgs/search?location=${encodeURIComponent(location)}`),
  searchByCollege: (college) => request(`/pgs/search?college=${encodeURIComponent(college)}`),
  filter: (minRent, maxRent) =>
    request(`/pgs/filter?minRent=${encodeURIComponent(minRent)}&maxRent=${encodeURIComponent(maxRent)}`),
  recommend: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.budget != null) qs.set("budget", params.budget);
    if (params.gender) qs.set("gender", params.gender);
    if (params.college) qs.set("college", params.college);
    if (params.minRating != null) qs.set("minRating", params.minRating);
    if (params.limit != null) qs.set("limit", params.limit);
    (params.amenities || []).forEach((a) => qs.append("amenities", a));
    return request(`/pgs/recommend?${qs.toString()}`);
  },
  create: (payload) => request("/pgs", { method: "POST", body: payload }),
  update: (id, payload) => request(`/pgs/${id}`, { method: "PUT", body: payload }),
  remove: (id) => request(`/pgs/${id}`, { method: "DELETE" }),
};

export const reviewApi = {
  list: (pgId) => request(`/pgs/${pgId}/reviews`),
  create: (pgId, payload) => request(`/pgs/${pgId}/reviews`, { method: "POST", body: payload }),
};

export const adminApi = {
  listPGs: () => request("/admin/pgs"),
  verify: (id, value) => request(`/admin/pgs/${id}/verify?value=${value}`, { method: "PUT" }),
  remove: (id) => request(`/admin/pgs/${id}`, { method: "DELETE" }),
};

export const chatApi = {
  send: (message) => request("/chat", { method: "POST", body: { message } }),
};
