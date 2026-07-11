// Resolve profile photo / resume / logo URLs for both standalone mock
// (data: URLs) and legacy API-relative paths (/api/files/...).

export function resolveAssetUrl(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = process.env.REACT_APP_BACKEND_URL || "";
  return `${base}${url}`;
}
