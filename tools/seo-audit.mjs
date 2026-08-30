/**
 * SEO denetimi — dist/ icindeki uretilmis siteyi tarar.
 *
 *   npm run audit
 *
 * Tarayici gerektirmez; HTML'i dogrudan okur. Amac "yesil tik" toplamak degil,
 * gercekten sirayi etkileyen seyleri olcmek: benzersizlik, ince icerik,
 * kopya icerik, tiklama derinligi, schema butunlugu, sayfa agirligi.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST = "dist";
const ORIGIN = "https://cekici.online";

/* ------------------------------------------------------------- yardimcilar */

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const urlOf = (f) => "/" + f.replace(/^dist\//, "").replace(/index\.html$/, "");
const attr = (html, re) => (re.exec(html) || [])[1] || "";

/** Sayfanin kendine ozgu metni: ortak kabuk (header/footer/CTA) haric. */
function contentText(html) {
  let s = html.slice(html.indexOf("<main"), html.lastIndexOf("</main>"));
  if (s.length < 50) s = html;
  s = s
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<section class="cta"[\s\S]*?<\/section>/g, " ")  // her sayfada ayni
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return s;
}

const words = (t) => t.split(/[^\wçğıöşüâîû]+/i).filter((w) => w.length > 2);

/** 5-kelimelik parcalarla Jaccard benzerligi. */
function shingles(t, n = 5) {
  const w = words(t);
  const set = new Set();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(" "));
  return set;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/* ----------------------------------------------------------------- toplama */

const files = await walk(DIST);
const pages = [];

for (const f of files) {
  const html = await readFile(f, "utf8");
  const url = urlOf(f);
  const text = contentText(html);
  // Baslik hiyerarsisi yalnizca <main> icinde anlamli; header/footer belge
  // anahatinin parcasi degil ve oradaki seviyeler yanlis pozitif uretiyor.
  const mainHtml = html.slice(html.indexOf("<main"), html.lastIndexOf("</main>")) || html;
  const headings = [...mainHtml.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map((m) => ({ level: +m[1], text: m[2].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() }));
  const bosBaslik = [...html.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g)]
    .filter((m) => !m[2].replace(/<[^>]+>/g, "").replace(/&nbsp;|\s/g, "")).length;

  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });

  pages.push({
    url, file: f,
    bytes: Buffer.byteLength(html),
    title: attr(html, /<title>([^<]*)<\/title>/),
    desc: attr(html, /<meta name="description" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/),
    lang: attr(html, /<html lang="([^"]*)"/),
    ogTitle: attr(html, /<meta property="og:title" content="([^"]*)"/),
    ogImage: attr(html, /<meta property="og:image" content="([^"]*)"/),
    viewport: /name="viewport"/.test(html),
    headings, bosBaslik,
    h1: headings.filter((h) => h.level === 1),
    text,
    wordCount: words(text).length,
    links: [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]),
    anchors: [...html.matchAll(/<a[^>]+href="(\/[^"#?]*)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map((m) => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() })),
    imgs: [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]),
    ld: ld.filter(Boolean),
    ldBroken: ld.filter((x) => x === null).length,
    noindex: /noindex/.test(attr(html, /<meta name="robots" content="([^"]*)"/)),
  });
}

const indexable = pages.filter((p) => !p.noindex && !p.url.endsWith(".html"));

/* ------------------------------------------------------------------ rapor */

const R = [];
const bulgu = [];
const say = (lvl, msg, detay) => bulgu.push({ lvl, msg, detay });
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0) + "%";

R.push(`\n${"=".repeat(66)}`);
R.push(`  SEO DENETIMI — ${indexable.length} indekslenebilir sayfa`);
R.push(`${"=".repeat(66)}\n`);

/* 1. Temel etiketler */
const eksikTitle = indexable.filter((p) => !p.title);
const uzunTitle = indexable.filter((p) => p.title.length > 65);
const kisaTitle = indexable.filter((p) => p.title.length < 25);
const titleSay = new Map();
indexable.forEach((p) => titleSay.set(p.title, (titleSay.get(p.title) || 0) + 1));
const tekrarTitle = [...titleSay].filter(([, n]) => n > 1);

const descSay = new Map();
indexable.forEach((p) => descSay.set(p.desc, (descSay.get(p.desc) || 0) + 1));
const tekrarDesc = [...descSay].filter(([, n]) => n > 1);
const uzunDesc = indexable.filter((p) => p.desc.length > 160);
const kisaDesc = indexable.filter((p) => p.desc.length < 70);

R.push("1. BASLIK VE ACIKLAMA");
R.push(`   Benzersiz title            ${titleSay.size}/${indexable.length}  ${pct(titleSay.size, indexable.length)}`);
R.push(`   Benzersiz description      ${descSay.size}/${indexable.length}  ${pct(descSay.size, indexable.length)}`);
R.push(`   Title uzunlugu             ort ${Math.round(indexable.reduce((a, p) => a + p.title.length, 0) / indexable.length)} · max ${Math.max(...indexable.map((p) => p.title.length))}`);
R.push(`   Description uzunlugu       ort ${Math.round(indexable.reduce((a, p) => a + p.desc.length, 0) / indexable.length)} · max ${Math.max(...indexable.map((p) => p.desc.length))}`);
if (eksikTitle.length) say("KRITIK", `${eksikTitle.length} sayfada title yok`);
if (tekrarTitle.length) say("KRITIK", `${tekrarTitle.length} title birden fazla sayfada tekrarliyor`, tekrarTitle.slice(0, 3).map((t) => t[0]));
if (tekrarDesc.length) say("KRITIK", `${tekrarDesc.length} description tekrarliyor`, tekrarDesc.slice(0, 3).map((t) => t[0].slice(0, 60)));
if (uzunTitle.length) say("UYARI", `${uzunTitle.length} title 65 karakteri asiyor`);
if (kisaTitle.length) say("UYARI", `${kisaTitle.length} title 25 karakterden kisa`);
if (uzunDesc.length) say("UYARI", `${uzunDesc.length} description 160 karakteri asiyor`);
if (kisaDesc.length) say("UYARI", `${kisaDesc.length} description 70 karakterden kisa`);

/* 2. Basliklar */
R.push("\n2. BASLIK YAPISI");
const cokH1 = indexable.filter((p) => p.h1.length !== 1);
let atlanan = 0;
for (const p of indexable) {
  let onceki = 0;
  for (const h of p.headings) {
    if (onceki && h.level > onceki + 1) atlanan++;
    onceki = h.level;
  }
}
R.push(`   Tam bir H1 olan sayfa      ${indexable.length - cokH1.length}/${indexable.length}`);
R.push(`   Sayfa basina ort. baslik   ${(indexable.reduce((a, p) => a + p.headings.length, 0) / indexable.length).toFixed(1)}`);
if (cokH1.length) say("KRITIK", `${cokH1.length} sayfada H1 sayisi 1 degil`);
if (atlanan) say("UYARI", `${atlanan} yerde baslik seviyesi atlanmis (orn. H2'den H4'e)`);
const bosB = indexable.filter((p) => p.bosBaslik);
if (bosB.length) say("UYARI", `${bosB.length} sayfada icerigi bos baslik etiketi var`);

/* 3. Icerik hacmi */
R.push("\n3. ICERIK HACMI");
const wc = indexable.map((p) => p.wordCount).sort((a, b) => a - b);
const ince = indexable.filter((p) => p.wordCount < 300);
const cokInce = indexable.filter((p) => p.wordCount < 200);
R.push(`   Kelime sayisi              min ${wc[0]} · medyan ${wc[Math.floor(wc.length / 2)]} · max ${wc[wc.length - 1]}`);
R.push(`   300 kelimenin altinda      ${ince.length} sayfa`);
if (cokInce.length) say("KRITIK", `${cokInce.length} sayfa 200 kelimenin altinda — ince icerik`, cokInce.slice(0, 3).map((p) => p.url));
else if (ince.length) say("UYARI", `${ince.length} sayfa 300 kelimenin altinda`, ince.slice(0, 3).map((p) => `${p.url} (${p.wordCount})`));

/* 4. Kopya icerik — asil risk */
R.push("\n4. KOPYA ICERIK (5-kelime parca benzerligi)");
const sh = new Map(indexable.map((p) => [p.url, shingles(p.text)]));
const ciftler = [];
for (let i = 0; i < indexable.length; i++) {
  for (let j = i + 1; j < indexable.length; j++) {
    const s = jaccard(sh.get(indexable[i].url), sh.get(indexable[j].url));
    if (s > 0.4) ciftler.push({ a: indexable[i].url, b: indexable[j].url, s });
  }
}
ciftler.sort((x, y) => y.s - x.s);
const cokYuksek = ciftler.filter((c) => c.s > 0.7);
const yuksek = ciftler.filter((c) => c.s > 0.5 && c.s <= 0.7);
R.push(`   %70 uzeri benzer cift      ${cokYuksek.length}`);
R.push(`   %50-70 arasi cift          ${yuksek.length}`);
R.push(`   %40-50 arasi cift          ${ciftler.length - cokYuksek.length - yuksek.length}`);
if (ciftler.length) {
  R.push(`   En benzer 5:`);
  ciftler.slice(0, 5).forEach((c) => R.push(`     ${(c.s * 100).toFixed(0)}%  ${c.a}  ~  ${c.b}`));
}
if (cokYuksek.length) say("KRITIK", `${cokYuksek.length} sayfa cifti %70'ten fazla ayni — Google bunlari tek sayfa sayar`);
else if (yuksek.length) say("UYARI", `${yuksek.length} sayfa cifti %50-70 benzer`);

/* 5. Ic linkler ve derinlik */
R.push("\n5. IC LINK YAPISI");
const set = new Set(indexable.map((p) => p.url));
const gelen = new Map([...set].map((u) => [u, 0]));
for (const p of indexable) {
  for (const l of new Set(p.links)) if (set.has(l) && l !== p.url) gelen.set(l, gelen.get(l) + 1);
}
// tiklama derinligi (BFS, ana sayfadan)
const derinlik = new Map([["/", 0]]);
let kuyruk = ["/"];
while (kuyruk.length) {
  const sonraki = [];
  for (const u of kuyruk) {
    const p = indexable.find((x) => x.url === u);
    if (!p) continue;
    for (const l of new Set(p.links)) {
      if (set.has(l) && !derinlik.has(l)) { derinlik.set(l, derinlik.get(u) + 1); sonraki.push(l); }
    }
  }
  kuyruk = sonraki;
}
const derinDagilim = {};
for (const [, d] of derinlik) derinDagilim[d] = (derinDagilim[d] || 0) + 1;
const ulasilmaz = [...set].filter((u) => !derinlik.has(u));
const azLink = [...gelen].filter(([u, n]) => n < 3 && u !== "/");
R.push(`   Tiklama derinligi          ${Object.entries(derinDagilim).map(([d, n]) => `${d}:${n} sayfa`).join(" · ")}`);
R.push(`   Sayfa basina gelen link    min ${Math.min(...gelen.values())} · ort ${Math.round([...gelen.values()].reduce((a, b) => a + b, 0) / gelen.size)}`);
if (ulasilmaz.length) say("KRITIK", `${ulasilmaz.length} sayfaya ana sayfadan link izleyerek ulasilamiyor`, ulasilmaz.slice(0, 5));
if (azLink.length) say("UYARI", `${azLink.length} sayfa 3'ten az ic link aliyor`, azLink.slice(0, 3).map(([u, n]) => `${u} (${n})`));

/* 6. Capa metni cesitliligi */
const capa = new Map();
for (const p of indexable) for (const a of p.anchors) {
  if (!set.has(a.href)) continue;
  if (!capa.has(a.href)) capa.set(a.href, new Set());
  capa.get(a.href).add(a.text.toLowerCase());
}
const tekCapa = [...capa].filter(([, s]) => s.size === 1).length;
R.push(`   Tek tip capa metni alan    ${tekCapa}/${capa.size} sayfa`);

/* 7. Schema */
R.push("\n6. SCHEMA.ORG");
const bozuk = indexable.filter((p) => p.ldBroken);
const schemasiz = indexable.filter((p) => !p.ld.length);
const tipSay = {};
for (const p of indexable) for (const g of p.ld) for (const n of (g["@graph"] || [g])) {
  const t = Array.isArray(n["@type"]) ? n["@type"].join("+") : n["@type"];
  tipSay[t] = (tipSay[t] || 0) + 1;
}
R.push(`   ` + Object.entries(tipSay).map(([t, n]) => `${t}: ${n}`).join(" · "));
if (bozuk.length) say("KRITIK", `${bozuk.length} sayfada JSON-LD gecersiz`);
if (schemasiz.length) say("KRITIK", `${schemasiz.length} sayfada schema yok`);
// FAQ sorulari sayfa icinde tekrarliyor mu
let tekrarSoru = 0;
for (const p of indexable) {
  for (const g of p.ld) for (const n of (g["@graph"] || [])) {
    if (n["@type"] === "FAQPage") {
      const q = n.mainEntity.map((x) => x.name);
      if (new Set(q).size !== q.length) tekrarSoru++;
    }
  }
}
if (tekrarSoru) say("UYARI", `${tekrarSoru} sayfada ayni S.S.S. sorusu iki kez geciyor`);

/* 8. Teknik */
R.push("\n7. TEKNIK");
const boyut = indexable.map((p) => p.bytes).sort((a, b) => a - b);
R.push(`   HTML boyutu                medyan ${(boyut[Math.floor(boyut.length / 2)] / 1024).toFixed(1)} KB · max ${(boyut[boyut.length - 1] / 1024).toFixed(1)} KB`);
R.push(`   lang="tr"                  ${indexable.filter((p) => p.lang === "tr").length}/${indexable.length}`);
R.push(`   viewport                   ${indexable.filter((p) => p.viewport).length}/${indexable.length}`);
R.push(`   canonical                  ${indexable.filter((p) => p.canonical.startsWith(ORIGIN)).length}/${indexable.length}`);
R.push(`   og:image                   ${indexable.filter((p) => p.ogImage).length}/${indexable.length}`);
const kendiCanonical = indexable.filter((p) => p.canonical !== ORIGIN + p.url);
if (kendiCanonical.length) say("KRITIK", `${kendiCanonical.length} sayfanin canonical'i kendisini gostermiyor`, kendiCanonical.slice(0, 3).map((p) => p.url));
const altsiz = indexable.flatMap((p) => p.imgs.filter((i) => !/alt="/.test(i)).map(() => p.url));
if (altsiz.length) say("UYARI", `${altsiz.length} gorselde alt metni yok`);
const buyuk = indexable.filter((p) => p.bytes > 60000);
if (buyuk.length) say("UYARI", `${buyuk.length} sayfa 60 KB'i asiyor`);

/* 9. Sitemap tutarliligi */
const smap = await readFile(path.join(DIST, "sitemap.xml"), "utf8");
const smUrls = [...smap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ""));
const eksikSm = indexable.filter((p) => !smUrls.includes(p.url));
const fazlaSm = smUrls.filter((u) => !set.has(u));
R.push(`   sitemap.xml                ${smUrls.length} URL`);
if (eksikSm.length) say("KRITIK", `${eksikSm.length} indekslenebilir sayfa sitemap'te yok`, eksikSm.slice(0, 3).map((p) => p.url));
if (fazlaSm.length) say("KRITIK", `${fazlaSm.length} sitemap URL'si diye bir sayfa yok`, fazlaSm.slice(0, 3));

/* ------------------------------------------------------------------ sonuc */

R.push(`\n${"=".repeat(66)}`);
const kritik = bulgu.filter((b) => b.lvl === "KRITIK");
const uyari = bulgu.filter((b) => b.lvl === "UYARI");
if (!bulgu.length) R.push("  Hicbir bulgu yok.");
for (const b of [...kritik, ...uyari]) {
  R.push(`  ${b.lvl === "KRITIK" ? "✗" : "!"} ${b.lvl}  ${b.msg}`);
  if (b.detay) b.detay.forEach((d) => R.push(`         ${d}`));
}
R.push(`\n  ${kritik.length} kritik · ${uyari.length} uyari`);
R.push(`${"=".repeat(66)}\n`);

console.log(R.join("\n"));
process.exitCode = kritik.length ? 1 : 0;
