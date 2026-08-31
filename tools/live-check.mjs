/**
 * Yayin sonrasi duman testi — canli sitede temel sozlesmeleri dogrular.
 *
 *   npm run canli
 *
 * build ve audit dosyalari uretilmis halde denetler; bu dosya yayindaki
 * gercek cevaplari kontrol eder. Karakter seti, yonlendirme ve cache gibi
 * hatalar yalnizca sunucu cevabinda gorunur, uretilen dosyada gorunmez.
 */
import { site } from "../src/data/site.js";

const base = process.argv[2] || site.origin;
let hata = 0, gecti = 0;

const kontrol = (ad, kosul, detay = "") => {
  if (kosul) { gecti++; console.log("  ✓ " + ad); }
  else { hata++; console.error("  ✗ " + ad + (detay ? "\n      " + detay : "")); }
};

console.log(`\n  Canlı kontrol — ${base}\n`);

/* 1. Sayfalar aciliyor mu */
for (const yol of ["/", "/kadikoy-oto-kurtarma/", "/hizmetler/oto-cekici/", "/kadikoy-aku-takviye/", "/varis-suresi/", "/fiyatlar/"]) {
  const r = await fetch(base + yol);
  kontrol(`${yol} → 200`, r.status === 200, `HTTP ${r.status}`);
}

/* 2. Karakter seti — Turkce karakterlerin bozuk gorunmesinin sebebi budur */
for (const yol of ["/", "/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap.xml"]) {
  const r = await fetch(base + yol);
  const ct = r.headers.get("content-type") || "";
  kontrol(`${yol} charset=utf-8 bildiriyor`, /charset=utf-8/i.test(ct), `content-type: ${ct}`);
}

/* 3. Turkce karakterler gercekten dogru mu */
const llms = await (await fetch(base + "/llms.txt")).text();
kontrol("llms.txt Türkçe karakterleri doğru", llms.includes("Kadıköy") && llms.includes("Şile") && llms.includes("Ümraniye"));

/* 4. Cache basliklari */
const css = await fetch(base + "/styles.css");
kontrol("styles.css uzun süreli cache'leniyor", /immutable/.test(css.headers.get("cache-control") || ""), css.headers.get("cache-control"));
const html = await fetch(base + "/");
kontrol("HTML kenar cache'i tanımlı", !!html.headers.get("cdn-cache-control"), String(html.headers.get("cdn-cache-control")));

/* 5. Guvenlik basliklari */
for (const h of ["x-content-type-options", "referrer-policy", "strict-transport-security"]) {
  kontrol(`${h} gönderiliyor`, !!html.headers.get(h));
}

/* 6. Arama motoru sozlesmeleri */
const robots = await (await fetch(base + "/robots.txt")).text();
kontrol("robots.txt sitemap gösteriyor", robots.includes("/sitemap.xml"));
kontrol("robots.txt /duzenle/ engelliyor", robots.includes("Disallow: /duzenle/"));
kontrol("robots.txt yapay zekâ botlarını karşılıyor", robots.includes("GPTBot") && robots.includes("ClaudeBot"));

const duzenle = await (await fetch(base + "/duzenle/")).text();
kontrol("/duzenle/ noindex", /content="noindex/.test(duzenle));

const anaSayfa = await (await fetch(base + "/")).text();
kontrol("ana sayfa canonical doğru", anaSayfa.includes(`<link rel="canonical" href="${site.origin}/">`));
kontrol("ana sayfa telefonu doğru", anaSayfa.includes(`tel:${site.phoneHref}`));

/* 7. PWA — ana ekrana eklenebilirlik ve cevrimdisi */
const man = await fetch(base + "/manifest.webmanifest");
kontrol("manifest.webmanifest erişilebilir", man.status === 200, `HTTP ${man.status}`);
if (man.status === 200) {
  const m = await man.json().catch(() => null);
  kontrol("manifest geçerli JSON ve zorunlu alanları var",
    !!(m && m.name && m.start_url && m.display && m.icons?.length >= 2));
}
const sw = await fetch(base + "/sw.js");
kontrol("sw.js erişilebilir", sw.status === 200, `HTTP ${sw.status}`);
// Servis calisani uzun sureli cache'lenirse guncelleme ziyaretciye hic ulasmaz
kontrol("sw.js uzun süreli cache'lenmiyor",
  !/immutable|max-age=(?!0)\d{3,}/.test(sw.headers.get("cache-control") || ""),
  sw.headers.get("cache-control"));
for (const ikon of ["/icon-192.png", "/icon-512.png"]) {
  const r = await fetch(base + ikon);
  kontrol(`${ikon} erişilebilir`, r.status === 200, `HTTP ${r.status}`);
}
const cev = await fetch(base + "/cevrimdisi/");
kontrol("/cevrimdisi/ hazır", cev.status === 200, `HTTP ${cev.status}`);

/* 8. Arama motoru dogrulama dosyalari — silinirse panel erisimi duser */
const { readdir, readFile } = await import("node:fs/promises");
let dogrulama = [];
try { dogrulama = (await readdir("assets/root")).filter((f) => f !== "README.md"); } catch {}
for (const f of dogrulama) {
  const beklenen = (await readFile("assets/root/" + f, "utf8")).trim();
  // Dogrulayicilarin bir kismi yonlendirme izlemiyor: tam URL'de 200 sart
  const r = await fetch(`${base}/${f}`, { redirect: "manual" });
  const gelen = r.status === 200 ? (await r.text()).trim() : "";
  kontrol(`/${f} tam URL'de 200 dönüyor`, r.status === 200,
    r.status === 307 || r.status === 301 ? `HTTP ${r.status} — yönlendiriyor, doğrulama başarısız olabilir` : `HTTP ${r.status}`);
  kontrol(`/${f} içeriği doğru`, gelen === beklenen);
}

/* 9. Bulunmayan sayfa */
const yok = await fetch(base + "/boyle-bir-sayfa-yok/");
kontrol("bilinmeyen yol 404 dönüyor", yok.status === 404, `HTTP ${yok.status}`);

console.log(`\n  ${gecti} geçti, ${hata} hata\n`);
process.exitCode = hata ? 1 : 0;
