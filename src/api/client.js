const DEFAULT_BASE_URL = "https://localhost:7148";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Set by AuthProvider so any request that comes back 401 can force a logout,
// even when the call site doesn't know about auth state.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function readErrorDetail(response) {
  try {
    const data = await response.json();
    if (Array.isArray(data?.errors)) return data.errors.join(" ");
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;
  } catch {
    // non-JSON or empty body
  }
  return null;
}

async function requestWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new ApiError("The request timed out — the server may still be starting up.");
    }
    throw new ApiError("Network error — could not reach the server.");
  } finally {
    clearTimeout(timer);
  }
}

async function request(path, { method = "GET", token, body, timeoutMs = 60000 } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await requestWithTimeout(
    `${API_BASE_URL}${path}`,
    { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined },
    timeoutMs
  );

  if (response.status === 401) {
    unauthorizedHandler?.();
    throw new ApiError("Your session has expired — please sign in again.", { status: 401 });
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new ApiError(detail || `Request failed (${response.status}).`, { status: response.status });
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function login(email, password) {
  const response = await requestWithTimeout(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    90000 // generous — accounts for API cold start
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError("Sign-in failed — invalid email or password.", { status: 401 });
    }
    const detail = await readErrorDetail(response);
    throw new ApiError(detail || `Sign-in failed (${response.status}).`, { status: response.status });
  }
  return response.json(); // { accessToken, expiresAtUtc }
}

export const listResource = (path, token) => request(path, { token });
export const getResource = (path, token) => request(path, { token });
export const createResource = (path, body, token) => request(path, { method: "POST", body, token });
export const updateResource = (path, body, token) => request(path, { method: "PUT", body, token });
export const deleteResource = (path, token) => request(path, { method: "DELETE", token, timeoutMs: 30000 });
