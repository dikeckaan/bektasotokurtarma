export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Meta description icin: tirnak/yeni satir temizle, 158 karakteri asma. */
export const meta = (s) => {
  const t = String(s).replace(/\s+/g, " ").trim();
  return esc(t.length > 158 ? t.slice(0, 155).replace(/[\s,.;]+\S*$/, "") + "…" : t);
};

export const list = (arr, conj = "ve") => {
  if (arr.length === 1) return arr[0];
  return arr.slice(0, -1).join(", ") + " " + conj + " " + arr[arr.length - 1];
};

/** Deterministik varyasyon: ayni sayfa her build'de ayni metni alsin. */
export const pick = (arr, seed) => arr[Math.abs(hash(seed)) % arr.length];

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h | 0;
}

export const etaText = (d) => (d.eta ? `${d.eta} dk` : d.etaNote || "randevulu");

/**
 * Baslik + marka eki. Google ~65 karakterden sonrasini kesiyor;
 * uzun sayfalarda marka adini kisaltarak siniri koruyoruz.
 */
export function mkTitle(base) {
  const full = `${base} | Bektaş Oto Kurtarma`;
  if (full.length <= 65) return full;
  const short = `${base} | Bektaş Çekici`;
  if (short.length <= 65) return short;
  return base;
}
