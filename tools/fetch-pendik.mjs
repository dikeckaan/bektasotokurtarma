/**
 * Pendik mahalle sinirlarini ve her mahallenin yerel bilgisini
 * (komsu mahalleler, ana yollar, istasyonlar, referans noktalar)
 * OpenStreetMap'ten ceker ve src/data/pendik-geo.js icine yazar.
 *
 *   node tools/fetch-pendik.mjs
 *
 * Bir kez calistirilir; sonuc depoya girer. Site build'i internete cikmaz.
 * Veri ODbL lisansli — haritada "© OpenStreetMap katkicilari" atifi zorunlu.
 *
 * Mahalle sayfalarindaki her yerel bilgi buradan gelir; elle yazilmis
 * "yerel" cumle yok. Boylece 36 sayfanin hicbirinde uydurma bilgi olmuyor.
 */
import { writeFile } from "node:fs/promises";

const UA = "bektas-oto-kurtarma-site/1.0 (https://cekici.online)";
const OVERPASS = "https://overpass-api.de/api/interpreter";
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
const ALAN = 'area["name"="Pendik"]["admin_level"="6"]->.p;';

async function overpass(q, deneme = 4) {
  const r = await fetch(OVERPASS, {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: `[out:json][timeout:180];${ALAN}${q}` }),
  });
  // Ortak sunucu yogunlukta 429/502/504 donebiliyor; bekleyip tekrar dene
  if (!r.ok && deneme > 1) { await bekle(15000); return overpass(q, deneme - 1); }
  if (!r.ok) throw new Error(`Overpass HTTP ${r.status}`);
  return (await r.json()).elements;
}

/** "Kurtköy Mahallesi" -> "kurtkoy" */
const slugla = (s) => s.toLocaleLowerCase("tr")
  .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o")
  .replace(/ş/g, "s").replace(/ü/g, "u").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------------------------------------------------------- geometri */

function icinde(lon, lat, halka) {
  let v = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i], [xj, yj] = halka[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) v = !v;
  }
  return v;
}
const icindeMi = (m, lon, lat) => m.halkalar.some((h) => icinde(lon, lat, h));

const KX = Math.cos((40.9 * Math.PI) / 180);
/** Iki nokta arasi km (bu olcekte duz yaklasim yeterli). */
const km = ([a, b], [c, d]) => Math.hypot((a - c) * KX, b - d) * 111.32;

/** Halkanin alani (km2) ve agirlik merkezi. */
function alanVeMerkez(halka) {
  let A = 0, cx = 0, cy = 0;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [x0, y0] = halka[j], [x1, y1] = halka[i];
    const f = x0 * y1 - x1 * y0;
    A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  A /= 2;
  return { km2: Math.abs(A) * KX * 111.32 * 111.32, merkez: [cx / (6 * A), cy / (6 * A)] };
}

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

/* ------------------------------------------------- 1. mahalle sinirlari */

console.log("  mahalleler...");
const rels = await overpass('rel(area.p)["boundary"="administrative"]["admin_level"="8"];out tags;');
await bekle(1500);

const lookup = "https://nominatim.openstreetmap.org/lookup?" + new URLSearchParams({
  osm_ids: rels.map((r) => "R" + r.id).join(","), format: "json", polygon_geojson: "1",
});
const nom = await (await fetch(lookup, { headers: { "User-Agent": UA, "Accept-Language": "tr" } })).json();

const mahalleler = nom.map((n) => {
  const g = n.geojson;
  const halkalar = g.type === "Polygon" ? [g.coordinates[0]]
    : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [];
  const ad = n.name.replace(/ Mahallesi$/, "");
  const parcalar = halkalar.map(alanVeMerkez);
  const km2 = parcalar.reduce((a, p) => a + p.km2, 0);
  // Etiket noktasi: Nominatim'in verdigi nokta mahalle icindeyse o, degilse agirlik merkezi
  const nomNokta = [+n.lon, +n.lat];
  const enBuyuk = parcalar.reduce((a, p) => (p.km2 > a.km2 ? p : a));
  return {
    slug: slugla(ad), ad, osm: `relation/${n.osm_id}`,
    km2, halkalar,
    nokta: halkalar.some((h) => icinde(nomNokta[0], nomNokta[1], h)) ? nomNokta : enBuyuk.merkez,
  };
}).sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

if (mahalleler.length !== rels.length) throw new Error("Bazi mahallelerin siniri gelmedi");
console.log(`    ${mahalleler.length} mahalle`);

/* -------------------------------------------- 2. komsuluk (ortak sinir) */

const anahtar = ([lo, la]) => `${lo.toFixed(5)},${la.toFixed(5)}`;
const noktaKumesi = new Map(mahalleler.map((m) => [m.slug, new Set(m.halkalar.flat().map(anahtar))]));
for (const m of mahalleler) {
  const benim = noktaKumesi.get(m.slug);
  m.komsular = mahalleler
    .filter((o) => o.slug !== m.slug)
    .map((o) => {
      let ortak = 0;
      for (const k of noktaKumesi.get(o.slug)) if (benim.has(k)) ortak++;
      return { slug: o.slug, ortak };
    })
    .filter((x) => x.ortak >= 3) // tek kosede degmek komsuluk sayilmaz
    .sort((a, b) => b.ortak - a.ortak)
    .map((x) => x.slug);
}

/* ---------------------------------------------------- 3. ana yollar */

console.log("  yollar...");
const yollar = await overpass('way(area.p)["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]["name"];out tags geom;');
await bekle(1500);

/** Yol adlarini insanlarin kullandigi bicime getir. */
function yolAdi(t) {
  const ad = t.name.trim();
  if (/^O-4\b|Anadolu Otoyolu/i.test(ad) || t.ref === "O-4") return "TEM (Anadolu Otoyolu)";
  if (/^D-?100\b/i.test(ad) || t.ref === "D 100" || t.ref === "D100") return "D-100 (E-5)";
  if (/Kuzey Marmara/i.test(ad) || t.ref === "O-7") return "Kuzey Marmara Otoyolu";
  if (/D-?100.*Yanyol/i.test(ad)) return "D-100 (E-5)";
  return ad.replace(/Aydınlıyolu/, "Aydınlı Yolu");
}
const ANA = /^(motorway|trunk|primary|secondary)$/;

for (const m of mahalleler) {
  const uzunluk = new Map();
  // Once ana yollar; mahallede iki ana yol yoksa ara caddeler de sayilir
  const ana = yollar.filter((w) => ANA.test(w.tags.highway));
  const ara = yollar.filter((w) => !ANA.test(w.tags.highway) && !/sokak|sokağı/i.test(w.tags.name));
  const say = (liste) => { for (const w of liste) {
    if (!w.geometry) continue;
    const ad = yolAdi(w.tags);
    let L = 0;
    for (let i = 1; i < w.geometry.length; i++) {
      const a = w.geometry[i - 1], b = w.geometry[i];
      const orta = [(a.lon + b.lon) / 2, (a.lat + b.lat) / 2];
      if (icindeMi(m, orta[0], orta[1])) L += km([a.lon, a.lat], [b.lon, b.lat]);
    }
    if (L > 0) uzunluk.set(ad, (uzunluk.get(ad) || 0) + L);
  } };
  say(ana.filter((w) => !/sokak|sokağı/i.test(w.tags.name)));
  if ([...uzunluk.values()].filter((L) => L >= 0.25).length < 2) say(ara);
  m.yollar = [...uzunluk.entries()]
    .filter(([, L]) => L >= 0.25) // sinirdan sadece degip gecenler sayilmasin
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ad]) => ad);
}

/* ------------------------------------------- 4. referans noktalar */

console.log("  referans noktalar...");
const poi = await overpass(`(
  nwr(area.p)["aeroway"="aerodrome"];
  nwr(area.p)["railway"="station"]["name"];
  nwr(area.p)["amenity"="hospital"]["name"];
  nwr(area.p)["shop"="mall"]["name"];
  nwr(area.p)["amenity"="university"]["name"];
  nwr(area.p)["leisure"="marina"]["name"];
  nwr(area.p)["amenity"="ferry_terminal"]["name"];
  nwr(area.p)["landuse"="industrial"]["name"];
  nwr(area.p)["natural"="water"]["name"];
);out center tags;`);

/** Sadece konum tarif ederken gercekten kullanilan noktalar kalsin. */
function tur(t) {
  const ad = t.name || "";
  if (t.aeroway === "aerodrome") return "havalimani";
  if (t.railway === "station") return "istasyon";
  if (t.amenity === "hospital") {
    // Poliklinik, dis ve goz merkezleri cekici tarifi icin referans degil
    if (/poliklini|diş|göz|ağız/i.test(ad)) return null;
    return /hastane|hospital/i.test(ad) ? "hastane" : null;
  }
  if (t.shop === "mall") return /mobilya|store/i.test(ad) ? null : "avm";
  if (t.amenity === "university") return "universite";
  if (t.leisure === "marina" || t.amenity === "ferry_terminal") return "iskele";
  if (t.landuse === "industrial") return /sanayi sitesi|liman|port|tersane/i.test(ad) ? "sanayi" : null;
  if (t.natural === "water") return /baraj/i.test(ad) ? "baraj" : null;
  return null;
}

const ONCELIK = { havalimani: 0, istasyon: 1, sanayi: 2, avm: 3, hastane: 4, iskele: 5, universite: 6, baraj: 7 };
for (const m of mahalleler) m.noktalar = [];
const gorulen = new Set();
for (const e of poi) {
  const t = tur(e.tags);
  if (!t) continue;
  const lon = e.lon ?? e.center?.lon, lat = e.lat ?? e.center?.lat;
  if (lon == null) continue;
  const ad = e.tags.name.replace(/\s*\(SAW\)$/, "").trim();
  const m = mahalleler.find((x) => icindeMi(x, lon, lat));
  if (!m) continue;
  const k = m.slug + "|" + t + "|" + ad;
  if (gorulen.has(k)) continue;
  gorulen.add(k);
  m.noktalar.push({ tur: t, ad, nokta: [+lon.toFixed(5), +lat.toFixed(5)] });
}
for (const m of mahalleler) m.noktalar.sort((a, b) => ONCELIK[a.tur] - ONCELIK[b.tur] || a.ad.localeCompare(b.ad, "tr"));

/* ------------------------------------- 5. SVG projeksiyonu ve cikti */

const tum = mahalleler.flatMap((m) => m.halkalar.flat());
const lons = tum.map((p) => p[0]), lats = tum.map((p) => p[1]);
const minLon = Math.min(...lons), maxLon = Math.max(...lons);
const minLat = Math.min(...lats), maxLat = Math.max(...lats);
const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const W = 1000;
const olcek = W / ((maxLon - minLon) * kx);
const H = Math.round((maxLat - minLat) * olcek);
const proj = ([lon, lat]) => [+((lon - minLon) * kx * olcek).toFixed(1), +((maxLat - lat) * olcek).toFixed(1)];

const cikti = mahalleler.map((m) => ({
  slug: m.slug,
  ad: m.ad,
  osm: m.osm,
  km2: +m.km2.toFixed(2),
  nokta: m.nokta.map((v) => +v.toFixed(5)),
  merkez: proj(m.nokta),
  komsular: m.komsular,
  yollar: m.yollar,
  noktalar: m.noktalar,
  d: m.halkalar
    .map((h) => sadelestir(h.map(proj), 0.9))
    .filter((h) => h.length > 3)
    .map((h) => "M" + h.map((p) => p.join(",")).join("L") + "Z").join(""),
  // tarayicida konum -> mahalle testi icin sadelestirilmis halkalar
  halkalar: m.halkalar.map((h) => sadelestir(h, 0.0005).map(([lo, la]) => [+lo.toFixed(4), +la.toFixed(4)])),
}));

const js = `/**
 * Pendik mahalle sinirlari ve yerel bilgiler.
 *
 * Kaynak: OpenStreetMap (Overpass + Nominatim), ODbL lisansi — haritada
 * "© OpenStreetMap katkicilari" atifi zorunludur.
 * tools/fetch-pendik.mjs ile uretildi, elle duzenlemeyin.
 *
 * km2      : mahalle yuzolcumu
 * nokta    : [boylam, enlem] — mahallenin temsil noktasi (varis suresi buradan)
 * merkez   : SVG icindeki etiket noktasi (viewBox ${W}x${H})
 * komsular : ortak siniri olan mahalleler, en uzun sinirdan kisaya
 * yollar   : mahalleden gecen ana yollar, en uzundan kisaya
 * noktalar : konum tarifinde kullanilan referans noktalar
 * halkalar : [boylam, enlem] halkalari — nokta-icinde-poligon testi icin
 */
export const pendikMapSize = { w: ${W}, h: ${H} };
export const pendikBounds = { minLon: ${minLon.toFixed(5)}, maxLon: ${maxLon.toFixed(5)}, minLat: ${minLat.toFixed(5)}, maxLat: ${maxLat.toFixed(5)} };

export const pendikGeo = ${JSON.stringify(cikti, null, 1)};
`;
await writeFile("src/data/pendik-geo.js", js);

for (const m of cikti) {
  console.log(`  ${m.ad.padEnd(15)} ${String(m.km2).padStart(6)} km2 · ${m.komsular.length} komsu · ${m.yollar.length} yol · ${m.noktalar.length} nokta`);
}
const bayt = JSON.stringify(cikti.map((m) => m.halkalar)).length;
console.log(`\n  viewBox ${W}x${H} · halka verisi ${(bayt / 1024).toFixed(1)} KB · src/data/pendik-geo.js yazildi`);
