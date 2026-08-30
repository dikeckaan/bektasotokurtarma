/**
 * IndexNow bildirimi — yeni/degismis sayfalari arama motorlarina duyurur.
 *
 *   npm run duyur            sitemap'teki tum URL'leri bildirir
 *   npm run duyur -- /a/ /b/ sadece verilen yollari bildirir
 *
 * IndexNow'u Bing, Yandex, Seznam ve Naver ortak kullaniyor; birine
 * bildirmek hepsine bildirmek demek. Google IndexNow kullanmaz —
 * oraya bildirim Search Console'dan yapilir.
 *
 * Bildirim oncesi anahtar dosyasinin canlida oldugu dogrulanir; yoksa
 * arama motoru istegi sessizce reddeder.
 */
import { readFile } from "node:fs/promises";
import { site } from "../src/data/site.js";
import { indexNowKey } from "../src/data/indexnow.js";

const host = site.domain;
const keyUrl = `${site.origin}/${indexNowKey}.txt`;

const args = process.argv.slice(2).filter((a) => a !== "--");
let urls;

if (args.length) {
  urls = args.map((a) => (a.startsWith("http") ? a : site.origin + (a.startsWith("/") ? a : "/" + a)));
} else {
  const xml = await readFile("dist/sitemap.xml", "utf8");
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

if (!urls.length) {
  console.error("Bildirilecek URL yok. Once `npm run build` calistirin.");
  process.exit(1);
}

console.log(`\n  IndexNow — ${host}`);
console.log(`  Anahtar dosyasi: ${keyUrl}`);

// 1) Anahtar dosyasi canlida mi?
const key = await fetch(keyUrl).then((r) => (r.ok ? r.text() : null)).catch(() => null);
if (key?.trim() !== indexNowKey) {
  console.error(`\n  ✗ Anahtar dosyasi canlida bulunamadi veya icerigi farkli.`);
  console.error(`    Once siteyi yayina alin (npm run deploy), sonra tekrar deneyin.\n`);
  process.exit(1);
}
console.log(`  ✓ Anahtar dogrulandi`);

// 2) Ornek bir sayfa gercekten yayinda mi?
const ornek = await fetch(urls[0], { redirect: "follow" }).catch(() => null);
if (!ornek?.ok) {
  console.error(`\n  ✗ ${urls[0]} yayinda degil (HTTP ${ornek?.status ?? "yanit yok"}). Bildirim iptal.\n`);
  process.exit(1);
}
console.log(`  ✓ Site yayinda (${urls.length} URL bildirilecek)\n`);

// 3) Bildir — tek istekte en fazla 10.000 URL
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: indexNowKey, keyLocation: keyUrl, urlList: urls.slice(0, 10000) }),
});

const govde = await res.text().catch(() => "");
if (res.status === 200 || res.status === 202) {
  console.log(`  ✓ ${urls.length} URL bildirildi (HTTP ${res.status})`);
  console.log(`    Bing, Yandex, Seznam ve Naver bu bildirimi paylasir.\n`);
  console.log(`  Google icin: Search Console > Site Haritalari > ${site.origin}/sitemap.xml ekleyin.\n`);
} else {
  console.error(`  ✗ Bildirim reddedildi (HTTP ${res.status}) ${govde.slice(0, 200)}\n`);
  process.exitCode = 1;
}
