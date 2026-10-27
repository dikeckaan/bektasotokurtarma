/**
 * Tahmini varis suresi.
 *
 * DURUSTLUK NOTU: canli arac takibi ya da cagri kaydi yok. Sure, garaj
 * konumundan (site.geo) hedef noktaya olan kus ucusu mesafenin yol
 * katsayisiyla buyutulmesinden hesaplaniyor. Sitede bu yuzden her yerde
 * "tahmini" yaziyor; kesin sure telefonda soyleniyor.
 *
 * Garaj konumu degisirse site.js'teki geo alanini guncellemek yeterli:
 * tum ilce ve mahalle sureleri bir sonraki build'de yeniden hesaplanir.
 */
import { site } from "../data/site.js";

const KX = Math.cos((40.9 * Math.PI) / 180); // boylam derecesi bu enlemde daralir

/** Iki [boylam, enlem] noktasi arasi kus ucusu km. */
export const kusUcusuKm = ([a, b], [c, d]) => Math.hypot((a - c) * KX, b - d) * 111.32;

const YOL_KATSAYISI = 1.35; // Istanbul'da yol mesafesi kus ucusunun ~1,35 kati
const HAZIRLIK_DK = 5;      // cagri alinip aracin yola cikmasi
const SEHIR_ICI_KM = 3;     // ilk km'ler mahalle arasi: yavas
const SEHIR_ICI_HIZ = 25;   // km/s
const ANA_YOL_HIZ = 50;     // km/s — D-100 / TEM ortalamasi, trafik payi dahil

export const garaj = () => [site.geo.lng, site.geo.lat];

/** Garajdan yol mesafesi (km, tahmini). */
export const yolKm = (nokta) => kusUcusuKm(garaj(), nokta) * YOL_KATSAYISI;

/** Garajdan tahmini varis suresi (dakika). */
export function varisDk(nokta) {
  const r = yolKm(nokta);
  return Math.round(
    HAZIRLIK_DK +
    (Math.min(r, SEHIR_ICI_KM) / SEHIR_ICI_HIZ) * 60 +
    (Math.max(0, r - SEHIR_ICI_KM) / ANA_YOL_HIZ) * 60
  );
}

/** Halkalar listesinin en buyuk parcasinin agirlik merkezi. */
export function agirlikMerkezi(halkalar) {
  let iyi = null;
  for (const h of halkalar) {
    let A = 0, cx = 0, cy = 0;
    for (let i = 0, j = h.length - 1; i < h.length; j = i++) {
      const [x0, y0] = h[j], [x1, y1] = h[i];
      const f = x0 * y1 - x1 * y0;
      A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    if (!iyi || Math.abs(A) > iyi.A) iyi = { A: Math.abs(A), c: [cx / (3 * A), cy / (3 * A)] };
  }
  return iyi.c;
}

export const medyan = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};
