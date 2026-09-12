const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const TOKEN_KEY = "wastelytics-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    throw new Error(data?.detail || res.statusText || "Request failed");
  }
  return data;
}

// A "HH:MM" time picker value doesn't carry a date; the backend field is a full
// timestamp, so anchor it to today before sending.
export function timeToIso(hhmm) {
  if (!hhmm) return undefined;
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export const api = {
  auth: {
    signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
    login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
    me: () => request("/api/auth/me"),
  },
  logs: {
    create: (payload) => request("/api/logs", { method: "POST", body: payload }),
    list: () => request("/api/logs"),
    uploadPhoto: (logId, file) => {
      const form = new FormData();
      form.append("file", file);
      return request(`/api/logs/${logId}/photo`, { method: "POST", body: form, isForm: true });
    },
  },
  marketplace: {
    createListing: (payload) => request("/api/marketplace/listings", { method: "POST", body: payload }),
    listListings: () => request("/api/marketplace/listings"),
  },
  claims: {
    create: (listingId) => request("/api/claims", { method: "POST", body: { listing_id: listingId } }),
    list: () => request("/api/claims"),
    updateStatus: (claimId, status) => request(`/api/claims/${claimId}`, { method: "PATCH", body: { status } }),
  },
  admin: {
    verificationQueue: () => request("/api/admin/verification-queue"),
    decideVerification: (profileId, approve) =>
      request(`/api/admin/verification-queue/${profileId}`, { method: "POST", body: { approve } }),
    subscribers: () => request("/api/admin/subscribers"),
    rescues: () => request("/api/admin/rescues"),
  },
  billing: {
    plans: () => request("/api/billing/plans"),
    me: () => request("/api/billing/me"),
    submit: (plan, referenceNote) =>
      request("/api/billing/submit", { method: "POST", body: { plan, reference_note: referenceNote } }),
    pending: () => request("/api/billing/pending"),
    decide: (subscriptionId, approve) =>
      request(`/api/billing/${subscriptionId}/decision`, { method: "POST", body: { approve } }),
  },
};
