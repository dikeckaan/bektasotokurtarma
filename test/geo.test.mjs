/**
 * Konum -> ilce tespiti.
 *
 * /varis-suresi/ sayfasindaki nokta-icinde-poligon algoritmasinin aynisi,
 * bilinen koordinatlarla dogrulaniyor. Sinirlar sadelestirildigi icin
 * ilce sinirina cok yakin noktalar test edilmiyor; merkezi noktalar
 * dogru cikmali.
 */
import { strictEqual, ok } from "node:assert/strict";
import { geo } from "../src/data/geo.js";
import { districts } from "../src/data/districts.js";

function icinde(lon, lat, halka) {
  let v = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i], [xj, yj] = halka[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) v = !v;
  }
  return v;
}
const bolgeBul = (lon, lat) =>
  geo.find((g) => g.halkalar.some((h) => icinde(lon, lat, h)))?.slug ?? null;

let passed = 0, total = 0;
const test = (ad, fn) => {
  total++;
  try { fn(); passed++; console.log("  ✓ " + ad); }
  catch (e) { console.error("  ✗ " + ad + "\n    " + e.message); process.exitCode = 1; }
};

console.log("\n  konum -> ilce\n");

// [ad, boylam, enlem, beklenen ilce]
const NOKTALAR = [
  ["Kadıköy İskelesi", 29.0234, 40.9906, "kadikoy"],
  ["Bağdat Caddesi, Suadiye", 29.0810, 40.9605, "kadikoy"],
  ["Ataşehir Finans Merkezi", 29.1272, 40.9903, "atasehir"],
  ["Üsküdar Meydanı", 29.0156, 41.0256, "uskudar"],
  ["Ümraniye Meydanı", 29.1010, 41.0165, "umraniye"],
  ["Maltepe Sahil", 29.1315, 40.9226, "maltepe"],
  ["Kartal Meydanı", 29.1878, 40.8886, "kartal"],
  ["Sabiha Gökçen Havalimanı", 29.3092, 40.8986, "pendik"],
  ["Tuzla merkez", 29.3003, 40.8210, "tuzla"],
  ["Sabancı Üniversitesi, Tuzla", 29.3789, 40.8917, "tuzla"],
  ["Sultanbeyli merkez", 29.2680, 40.9640, "sultanbeyli"],
  ["Sancaktepe Sarıgazi", 29.2280, 41.0010, "sancaktepe"],
  ["Çekmeköy Taşdelen", 29.2130, 41.0230, "cekmekoy"],
  ["Kavacık, Beykoz", 29.0880, 41.0900, "beykoz"],
  ["Şile merkez", 29.6128, 41.1756, "sile"],
  ["Büyükada", 29.1230, 40.8580, "adalar"],
];

for (const [ad, lon, lat, beklenen] of NOKTALAR) {
  test(`${ad} → ${beklenen}`, () => strictEqual(bolgeBul(lon, lat), beklenen));
}

test("Avrupa Yakası (Taksim) hizmet alanı dışında", () => {
  strictEqual(bolgeBul(28.9857, 41.0370), null);
});

test("Ankara hizmet alanı dışında", () => {
  strictEqual(bolgeBul(32.8597, 39.9334), null);
});

test("her ilçenin sınır verisi var ve kapalı halka", () => {
  strictEqual(geo.length, districts.length);
  for (const g of geo) {
    ok(g.halkalar.length > 0, g.slug + " halkasiz");
    for (const h of g.halkalar) ok(h.length >= 4, g.slug + " halkasi cok kisa");
    ok(g.d.startsWith("M") && g.d.endsWith("Z"), g.slug + " path bozuk");
  }
});

test("sınır verisi makul boyutta (sayfa ağırlığı)", () => {
  const bayt = JSON.stringify(geo.map((g) => g.halkalar)).length;
  ok(bayt < 20000, `poligon verisi ${(bayt / 1024).toFixed(1)} KB — 20 KB'i asmamali`);
});

console.log(`\n  ${passed}/${total} gecti\n`);
