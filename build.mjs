/**
 * Statik site uretici.
 * Tum HTML dist/ icine yazilir; Cloudflare Workers bu klasoru servis eder.
 *   npm run build   -> dist/
 *   npm run deploy  -> build + wrangler deploy
 */
import { mkdir, writeFile, readFile, rm, cp, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import path from "node:path";

import { site } from "./src/data/site.js";
import { homePage } from "./src/pages/home.js";
import { districtPages } from "./src/pages/district.js";
import { servicePages } from "./src/pages/service.js";
import { comboPages } from "./src/pages/combo.js";
import { staticPages } from "./src/pages/static.js";
import { editPage } from "./src/pages/edit.js";

const OUT = "dist";
const t0 = Date.now();

/**
 * Ortam degiskenleri — asil yayin (cekici.online) icin hicbiri gerekmez.
 *
 *   BASE_PATH    Alt dizine yayin. GitHub Pages "/kullanici/depo/" altinda
 *                servis ettigi icin tum kok-goreli baglar bununla onekleniyor.
 *   SITE_ORIGIN  canonical / og:url / sitemap icin alan adi
 *   NOINDEX      "1" ise sayfalara noindex konur (onizleme yayinlari icin)
 */
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
const NOINDEX = process.env.NOINDEX === "1";
if (process.env.SITE_ORIGIN) {
  // configure-pages bazen http:// donuyor; canonical her zaman https olmali
  site.origin = process.env.SITE_ORIGIN.replace(/\/$/, "").replace(/^http:\/\//, "https://");
}

/* ------------------------------------------------------------ yardimcilar */

async function write(rel, content) {
  const file = path.join(OUT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  return Buffer.byteLength(content);
}

/** /kadikoy-oto-kurtarma/ -> kadikoy-oto-kurtarma/index.html */
const fileFor = (p) => (p.endsWith(".html") ? p.slice(1) : path.join(p.slice(1), "index.html"));

/* --------------------------------------------------------------- icerik */

const pages = [
  { path: "/", html: homePage() },
  ...staticPages(),
  ...servicePages(),
  ...districtPages(),
  ...comboPages(),
  editPage(),
];

/* ------------------------------------------------------------ dogrulama */

const problems = [];
const seen = new Map();

for (const p of pages) {
  if (seen.has(p.path)) problems.push(`Cift URL: ${p.path}`);
  seen.set(p.path, true);

  const title = /<title>([^<]*)<\/title>/.exec(p.html)?.[1] ?? "";
  const desc = /<meta name="description" content="([^"]*)"/.exec(p.html)?.[1] ?? "";
  if (!title) problems.push(`Title yok: ${p.path}`);
  if (title.length > 65) problems.push(`Title ${title.length} karakter (>65): ${p.path}`);
  if (!desc) problems.push(`Description yok: ${p.path}`);
  if (desc.length < 70) problems.push(`Description kisa (${desc.length}): ${p.path}`);
  if ((p.html.match(/<h1[ >]/g) || []).length !== 1) problems.push(`H1 sayisi 1 degil: ${p.path}`);
  if (!p.html.includes('<link rel="canonical"')) problems.push(`Canonical yok: ${p.path}`);
}

/* --------------------------------------------------------------- yazma */

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

// CSS + surum damgasi (uzun cache icin)
const css = await readFile("assets/styles.css", "utf8");
const cssv = createHash("sha256").update(css).digest("hex").slice(0, 8);
await write("styles.css", css);

// Gercek fotograflar: assets/img -> dist/img
let photoCount = 0;
try {
  await access("assets/img");
  await cp("assets/img", path.join(OUT, "img"), { recursive: true });
  const { readdir } = await import("node:fs/promises");
  photoCount = (await readdir("assets/img")).filter((f) => /\.(webp|avif|jpg|jpeg|png)$/i.test(f)).length;
} catch {}

let bytes = 0;
let largest = { path: "", size: 0 };
/** Kok-goreli baglari alt dizine tasi ve gerekiyorsa noindex ekle. */
function finalize(html) {
  let out = html.replaceAll("__CSSV__", cssv);
  if (NOINDEX) {
    out = out.replace(
      /<meta name="robots" content="[^"]*">/,
      '<meta name="robots" content="noindex, nofollow">'
    );
  }
  if (BASE) {
    out = out
      .replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}/`)
      .replace(new RegExp(`(href|src)="${BASE}/${BASE.slice(1)}/`, "g"), `$1="${BASE}/`);
  }
  return out;
}

for (const p of pages) {
  const html = finalize(p.html);
  // Doldurulmamis sablon yer tutucusu kalmasin (ornek: __SERIALIZE_FN__)
  const leftover = html.match(/__[A-Z][A-Z0-9_]*__/);
  if (leftover) problems.push(`Doldurulmamis yer tutucu ${leftover[0]}: ${p.path}`);
  const size = await write(fileFor(p.path), html);
  bytes += size;
  if (size > largest.size) largest = { path: p.path, size };
}

/* ---------------------------------------------------- sitemap / robots */

const today = new Date().toISOString().slice(0, 10);
const priorityFor = (p) => {
  if (p === "/") return "1.0";
  if (p.endsWith("-oto-kurtarma/")) return "0.9";
  if (p.startsWith("/hizmetler/")) return "0.8";
  if (/^\/[a-z-]+-[a-z-]+\/$/.test(p)) return "0.7";
  return "0.6";
};

const urls = pages
  .filter((p) => !p.path.endsWith(".html") && !p.noindex)
  .map((p) => `  <url>
    <loc>${site.origin}${BASE}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${priorityFor(p.path)}</priority>
  </url>`).join("\n");

await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

const disallow = pages.filter((p) => p.noindex && !p.path.endsWith(".html"))
  .map((p) => `Disallow: ${BASE}${p.path}`).join("\n");
await write("robots.txt", NOINDEX
  ? `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n${disallow ? disallow + "\n" : ""}\nSitemap: ${site.origin}${BASE}/sitemap.xml\n`);

/* --------------------------------------------------------------- ikon */

await write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0C0E11"/>
  <path d="M4 8h14l6 8-6 8H4l6-8z" fill="#FFB020"/>
</svg>
`);

/** apple-touch-icon: SVG desteklenmedigi icin PNG'yi elle uretiyoruz. */
function chevronPng(size) {
  const bg = [0x0c, 0x0e, 0x11], fg = [0xff, 0xb0, 0x20];
  const s = size / 32;
  // favicon.svg ile ayni sekil: M4 8 h14 l6 8 -6 8 H4 l6 -8 z
  const poly = [[4, 8], [18, 8], [24, 16], [18, 24], [4, 24], [10, 16]].map(([x, y]) => [x * s, y * s]);
  const inside = (px, py) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };

  const raw = Buffer.alloc(size * (size * 3 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const c = inside(x + 0.5, y + 0.5) ? fg : bg;
      raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2];
    }
  }

  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit, truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

await write("apple-touch-icon.png", chevronPng(180));

/* ---------------------------------------------------- paylasim gorseli */

/**
 * Paylasim gorseli: otoyol degisken mesaj panosu (VMS) dili.
 * Yazi 5x7 nokta matrisiyle ciziliyor — cekici/otoyol dunyasinin kendi tipografisi.
 */
const FONT = {
  "A": ".###.#...##...#######...##...##...#",
  "B": "####.#...##...#####.#...##...#####.",
  "C": ".#####....#....#....#....#.....####",
  "D": "####.#...##...##...##...##...#####.",
  "E": "######....#....####.#....#....#####",
  "G": ".###.#....#....#..###...##...#.###.",
  "H": "#...##...##...#######...##...##...#",
  "I": "#####..#....#....#....#....#..#####",
  "K": "#...##..#.#.#..##...#.#..#..#.#...#",
  "L": "#....#....#....#....#....#....#####",
  "M": "#...###.###.#.##.#.##...##...##...#",
  "N": "#...###..##.#.##..###...##...##...#",
  "O": ".###.#...##...##...##...##...#.###.",
  "P": "####.#...##...#####.#....#....#....",
  "R": "####.#...##...#####.#.#..#..#.#...#",
  "S": ".#####....#.....###.....#....#####.",
  "T": "#####..#....#....#....#....#....#..",
  "U": "#...##...##...##...##...##...#.###.",
  "V": "#...##...##...##...##...#.#.#...#..",
  "Y": "#...##...#.#.#...#....#....#....#..",
  "Z": "#####....#...#...#...#...#....#####",
  "0": ".###.#...##..###.#.###..##...#.###.",
  "1": "..#...##....#....#....#....#...###.",
  "2": ".###.#...#....#...#...#...#...#####",
  "3": "####.....#....#.###.....#....#####.",
  "4": "#..#.#..#.#..#.#####...#....#....#.",
  "5": "######....####.....#....##...#.###.",
  "6": ".###.#....#....####.#...##...#.###.",
  "7": "#####....#...#...#....#...#....#...",
  "8": ".###.#...##...#.###.#...##...#.###.",
  "9": ".###.#...##...#.####....#....#.###.",
  "/": "....#...#....#...#...#....#...#....",
  ".": "                           ##   ## ",
  "-": "                ####               ",
  " ": "                                   ",
};
const CEDILLA = { "Ş": "S", "Ç": "C", "Ğ": "G" };
const DOT_ON = 1, DOT_OFF = 0;

function fillRect(px, W, x, y, w, h, [r, g, b]) {
  for (let yy = Math.max(0, Math.round(y)); yy < Math.round(y + h); yy++) {
    for (let xx = Math.max(0, Math.round(x)); xx < Math.round(x + w); xx++) {
      const i = (yy * W + xx) * 3;
      if (i >= 0 && i + 2 < px.length) { px[i] = r; px[i + 1] = g; px[i + 2] = b; }
    }
  }
}

function dot(px, W, cx, cy, r, [cr, cg, cb]) {
  const r2 = r * r;
  for (let y = Math.floor(cy - r); y <= cy + r; y++) {
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5;
      if (dx * dx + dy * dy > r2) continue;
      const i = (y * W + x) * 3;
      if (i >= 0 && i + 2 < px.length) { px[i] = cr; px[i + 1] = cg; px[i + 2] = cb; }
    }
  }
}

/** Nokta matrisli yazi. pitch: nokta araligi, on/off: yanan ve sonuk nokta rengi. */
function dotText(px, W, text, x0, y0, pitch, on, off) {
  let x = x0;
  for (const ch of text.toUpperCase()) {
    const base = CEDILLA[ch] || ch;
    const g = FONT[base] || FONT[" "];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        const lit = g[r * 5 + c] === "#";
        if (!lit && !off) continue;
        dot(px, W, x + c * pitch + pitch / 2, y0 + r * pitch + pitch / 2, pitch * 0.38, lit ? on : off);
      }
    }
    // Turkce kuyruk (Ş, Ç): tek nokta, satir araligina tasmayacak sekilde
    if (CEDILLA[ch] && FONT[base]) {
      dot(px, W, x + 2 * pitch + pitch / 2, y0 + 7 * pitch + pitch * 0.3, pitch * 0.34, on);
    }
    x += 6 * pitch;
  }
  return x;
}

const dotWidth = (t, pitch) => t.length * 6 * pitch - pitch;

function ogPng() {
  const W = 1200, H = 630;
  const BG = [0x0c, 0x0e, 0x11];
  const SIGN = [0x08, 0x09, 0x0b];
  const AMBER = [0xff, 0xb0, 0x20];
  const DIM = [0x2a, 0x22, 0x11];
  const INK = [0x14, 0x10, 0x07];

  const px = Buffer.alloc(W * H * 3);
  fillRect(px, W, 0, 0, W, H, BG);

  // Pano govdesi
  fillRect(px, W, 56, 56, W - 112, 396, [0x1a, 0x1e, 0x24]);
  fillRect(px, W, 62, 62, W - 124, 384, SIGN);

  // Sol ust marka isareti (favicon chevron)
  const poly = [[96, 92], [150, 92], [174, 124], [150, 156], [96, 156], [120, 124]];
  for (let y = 88; y < 160; y++) {
    for (let x = 90; x < 180; x++) {
      let hit = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      if (hit) fillRect(px, W, x, y, 1, 1, AMBER);
    }
  }

  dotText(px, W, "7/24 AÇIK", 196, 98, 8, AMBER, DIM);
  const area = "ANADOLU YAKASI";
  dotText(px, W, area, 1112 - dotWidth(area, 6), 105, 6, AMBER, DIM);
  dotText(px, W, "BEKTAŞ OTO", 96, 176, 15, AMBER, DIM);
  dotText(px, W, "KURTARMA", 96, 318, 15, AMBER, DIM);

  // Telefon seridi
  fillRect(px, W, 0, 488, W, 142, AMBER);
  fillRect(px, W, 0, 484, W, 4, [0x1a, 0x1e, 0x24]);
  const tel = "0530 951 25 69";
  dotText(px, W, tel, (W - dotWidth(tel, 12)) / 2, 530, 12, INK, null);

  return encodePng(px, W, H);
}

function encodePng(px, W, H) {
  const raw = Buffer.alloc(H * (W * 3 + 1));
  let o = 0;
  for (let y = 0; y < H; y++) {
    raw[o++] = 0;
    px.copy(raw, o, y * W * 3, (y + 1) * W * 3);
    o += W * 3;
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0)),
  ]);
}

await write("og.png", ogPng());


/* ------------------------------------------------------- ic link kontrolu */

const known = new Set(pages.map((p) => p.path));
["/styles.css", "/favicon.svg", "/apple-touch-icon.png", "/sitemap.xml", "/robots.txt"].forEach((f) => known.add(f));
const linkedTo = new Set();
let linkTotal = 0;

for (const p of pages) {
  for (const m of p.html.matchAll(/href="(\/[^"#?]*)(?:\?[^"]*)?"/g)) {
    linkTotal++;
    if (!known.has(m[1])) problems.push(`Kirik ic link ${m[1]} (${p.path})`);
    else linkedTo.add(m[1]);
  }
}
for (const p of pages) {
  if (p.path !== "/" && !p.path.endsWith(".html") && !p.noindex && !linkedTo.has(p.path)) {
    problems.push(`Hicbir sayfadan link almiyor: ${p.path}`);
  }
}

/* --------------------------------------------------------------- rapor */

const kb = (n) => (n / 1024).toFixed(1) + " KB";
console.log(`\n  ${site.name} — build tamam (${Date.now() - t0} ms)\n`);
console.log(`  Sayfa           ${pages.length}`);
console.log(`    ana sayfa     1`);
console.log(`    kurumsal      ${staticPages().length}`);
console.log(`    hizmet        ${servicePages().length}`);
console.log(`    ilce          ${districtPages().length}`);
console.log(`    ilce+hizmet   ${comboPages().length}`);
console.log(`  HTML toplam     ${kb(bytes)}  (ort. ${kb(bytes / pages.length)}/sayfa)`);
console.log(`  En buyuk sayfa  ${largest.path} — ${kb(largest.size)}`);
console.log(`  CSS             ${kb(css.length)}  (surum ${cssv})`);
console.log(`  Ic link         ${linkTotal} bagi, ${known.size} hedef`);
console.log(`  Fotograf        ${photoCount} dosya${photoCount ? "" : " (cizim yer tutucular devrede)"}`);
if (BASE) console.log(`  Taban yol       ${BASE}`);
if (NOINDEX) console.log(`  Robots          noindex (onizleme yayini)`);
console.log(`  Cikti           ${OUT}/\n`);

if (problems.length) {
  console.log(`  ! ${problems.length} SEO uyarisi:`);
  for (const p of problems.slice(0, 25)) console.log(`    - ${p}`);
  if (problems.length > 25) console.log(`    ... ve ${problems.length - 25} tane daha`);
  console.log("");
  process.exitCode = 1;
} else {
  console.log("  Tum SEO kontrolleri gecti.\n");
}
