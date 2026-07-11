// Frontend-only API layer. All requests are handled in-browser by the mock
// server (src/mock/server.js) — no Node backend required.

import { handleRequest, ApiError, getSession } from "@/mock/server";

export const API_BASE = "/api";

let _token = null;

export const getToken = () => _token || getSession();
export const setToken = (token) => { _token = token || null; };

function delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms));
}

async function request(method, path, body, config = {}) {
  await delay();
  const headers = { ...(config.headers || {}) };
  const token = getToken();
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  try {
    return await handleRequest(method, path, body, { ...config, headers });
  } catch (err) {
    if (err instanceof ApiError) {
      const e = new Error(typeof err.detail === "string" ? err.detail : "Request failed");
      e.response = { status: err.status, data: { detail: err.detail } };
      throw e;
    }
    throw err;
  }
}

const api = {
  get: (path, config) => request("GET", path, undefined, config),
  post: (path, body, config) => request("POST", path, body, config),
  put: (path, body, config) => request("PUT", path, body, config),
  patch: (path, body, config) => request("PATCH", path, body, config),
  delete: (path, config) => request("DELETE", path, undefined, config),
};

export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" · ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return JSON.stringify(detail);
}

export default api;
