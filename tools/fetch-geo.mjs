/**
 * Ilce sinirlarini OpenStreetMap'ten (Nominatim) ceker, sadelestirir ve
 * src/data/geo.js icine SVG path olarak yazar.
 *
 *   node tools/fetch-geo.mjs
 *
 * Bir kez calistirilir; sonuc depoya girer. Site build'i internete cikmaz.
 * Veri ODbL lisansli — haritada "© OpenStreetMap katkicilari" atifi zorunlu.
 */
import { writeFile } from "node:fs/promises";
import { districts } from "../src/data/districts.js";

const UA = "bektas-oto-kurtarma-site/1.0 (https://cekici.online)";
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

const SORGU = {
  kadikoy: "Kadıköy, İstanbul", uskudar: "Üsküdar, İstanbul", atasehir: "Ataşehir, İstanbul",
  umraniye: "Ümraniye, İstanbul", maltepe: "Maltepe, İstanbul", kartal: "Kartal, İstanbul",
  pendik: "Pendik, İstanbul", tuzla: "Tuzla, İstanbul", sancaktepe: "Sancaktepe, İstanbul",
  sultanbeyli: "Sultanbeyli, İstanbul", cekmekoy: "Çekmeköy, İstanbul", beykoz: "Beykoz, İstanbul",
  sile: "Şile, İstanbul", adalar: "Adalar, İstanbul",
};

/** Douglas-Peucker sadelestirme. */
function sadelestir(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const dx = bx - ax, dy = by - ay;
    const uzunluk2 = dx * dx + dy * dy;
    const t = uzunluk2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / uzunluk2)) : 0;
    const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [...sadelestir(pts.slice(0, idx + 1), tol).slice(0, -1), ...sadelestir(pts.slice(idx), tol)];
}

const sonuc = [];
for (const d of districts) {
  const url = "https://nominatim.openstreetmap.org/search?" + new URLSearchParams({
    q: SORGU[d.slug], format: "json", polygon_geojson: "1", limit: "1", countrycodes: "tr",
  });
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "tr" } });
  const j = await r.json();
  const hit = j[0];
  if (!hit?.geojson) { console.error("BULUNAMADI:", d.slug); process.exit(1); }

  const g = hit.geojson;
  const halkalar = g.type === "Polygon" ? [g.coordinates[0]]
    : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0])
    : [];
  sonuc.push({
    slug: d.slug, name: d.name,
    osm: `${hit.osm_type}/${hit.osm_id}`,
    merkez: [+hit.lon, +hit.lat],
    halkalar,
  });
  console.log(`  ${d.name.padEnd(12)} ${halkalar.length} halka · ${halkalar.reduce((a, h) => a + h.length, 0)} nokta`);
  await bekle(1100); // Nominatim: saniyede 1 istek
}

/* ---- projeksiyon: enlem/boylam -> SVG kordinati ---- */
const tumNoktalar = sonuc.flatMap((s) => s.halkalar.flat());
const lons = tumNoktalar.map((p) => p[0]), lats = tumNoktalar.map((p) => p[1]);
const minLon = Math.min(...lons), maxLon = Math.max(...lons);
const minLat = Math.min(...lats), maxLat = Math.max(...lats);
const ortLat = (minLat + maxLat) / 2;
const kx = Math.cos((ortLat * Math.PI) / 180); // boylam derecesi enlemde daralir

const W = 1000;
const olcek = W / ((maxLon - minLon) * kx);
const H = Math.round((maxLat - minLat) * olcek);
const proj = ([lon, lat]) => [
  +(((lon - minLon) * kx * olcek)).toFixed(1),
  +((maxLat - lat) * olcek).toFixed(1),
];

const TOL = 1.1; // SVG birimi cinsinden sadelestirme toleransi
let toplamNokta = 0;
const cikti = sonuc.map((s) => {
  const paths = s.halkalar
    .map((h) => sadelestir(h.map(proj), TOL))
    .filter((h) => h.length > 3)
    .map((h) => "M" + h.map((p) => p.join(",")).join("L") + "Z");
  toplamNokta += paths.join("").split(",").length;
  return {
    slug: s.slug, name: s.name, osm: s.osm,
    merkez: proj(s.merkez),
    d: paths.join(""),
    // nokta-icinde-poligon testi icin ham (sadelestirilmis) enlem/boylam halkalari
    halkalar: s.halkalar.map((h) => sadelestir(h, 0.0016).map(([lo, la]) => [+lo.toFixed(4), +la.toFixed(4)])),
  };
});

const js = `/**
 * Anadolu Yakasi ilce sinirlari.
 *
 * Kaynak: OpenStreetMap (Nominatim), ODbL lisansi — haritada
 * "© OpenStreetMap katkicilari" atifi zorunludur.
 * tools/fetch-geo.mjs ile uretildi, elle duzenlemeyin.
 *
 * d          : SVG path (viewBox ${W}x${H})
 * merkez     : SVG icindeki etiket noktasi
 * halkalar   : [boylam, enlem] halkalari — tarayicida nokta-icinde-poligon testi icin
 */
export const mapSize = { w: ${W}, h: ${H} };
export const mapBounds = { minLon: ${minLon.toFixed(5)}, maxLon: ${maxLon.toFixed(5)}, minLat: ${minLat.toFixed(5)}, maxLat: ${maxLat.toFixed(5)} };

export const geo = ${JSON.stringify(cikti, null, 2)};
`;
await writeFile("src/data/geo.js", js);
console.log(`\n  viewBox ${W}x${H} · ${toplamNokta} nokta · src/data/geo.js yazildi`);
