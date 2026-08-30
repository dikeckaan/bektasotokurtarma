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

/* 7. Bulunmayan sayfa */
const yok = await fetch(base + "/boyle-bir-sayfa-yok/");
kontrol("bilinmeyen yol 404 dönüyor", yok.status === 404, `HTTP ${yok.status}`);

console.log(`\n  ${gecti} geçti, ${hata} hata\n`);
process.exitCode = hata ? 1 : 0;
