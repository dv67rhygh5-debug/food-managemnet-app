const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const TOKEN_KEY = "fedd-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The backend's free-tier host spins down after inactivity — the first request after that has
// to wait for it to boot, which can take 30-60s and shows up as a connection-level fetch failure
// (not a normal HTTP error response) rather than a slow-but-successful one. Retry a few times
// with increasing delay before giving up, so a cold start looks like "took a moment" instead of
// a broken login.
const WAKE_RETRY_DELAYS_MS = [4000, 8000, 15000];

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res;
  let attempt = 0;
  while (true) {
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      });
      break;
    } catch (err) {
      if (attempt >= WAKE_RETRY_DELAYS_MS.length) {
        throw new Error("Couldn't reach the server — it may be waking up from sleep, try again in a moment.");
      }
      await sleep(WAKE_RETRY_DELAYS_MS[attempt]);
      attempt += 1;
    }
  }

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
    verifyOtp: (email, token) => request("/api/auth/verify-otp", { method: "POST", body: { email, token } }),
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
    restaurants: () => request("/api/admin/restaurants"),
    subscribers: () => request("/api/admin/subscribers"),
    rescues: () => request("/api/admin/rescues"),
  },
  billing: {
    plans: () => request("/api/billing/plans"),
    me: () => request("/api/billing/me"),
    submit: (plan, referenceNote) =>
      request("/api/billing/submit", { method: "POST", body: { plan, reference_note: referenceNote } }),
    uploadProof: (file) => {
      const form = new FormData();
      form.append("file", file);
      return request("/api/billing/proof", { method: "POST", body: form, isForm: true });
    },
    pending: () => request("/api/billing/pending"),
    decide: (subscriptionId, approve) =>
      request(`/api/billing/${subscriptionId}/decision`, { method: "POST", body: { approve } }),
  },
};
