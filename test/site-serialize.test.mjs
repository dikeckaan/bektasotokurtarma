/**
 * /duzenle/ sayfasinin urettigi site.js gercekten calisir mi?
 *
 * Test, sayfanin kullandigi AYNI fonksiyonu cagirir (sayfa bu modulun
 * kaynagini toString ile gomuyor). Uretilen metin diske yazilip ES modulu
 * olarak import edilir ve mevcut site.js ile alan alan karsilastirilir.
 */
import { writeFile, mkdir, rm } from "node:fs/promises";
import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import path from "node:path";

import { serializeSite, phoneForms } from "../src/lib/site-serialize.js";
import { site, nav, trustPoints, steps } from "../src/data/site.js";

const TMP = path.join(process.cwd(), ".tmp-test");
let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log("  ✓ " + name); }
  catch (e) { console.error("  ✗ " + name + "\n    " + e.message); process.exitCode = 1; }
};

console.log("\n  site-serialize\n");

await test("telefon: bosluklu yerel bicim", () => {
  deepStrictEqual(phoneForms("0530 951 25 69"), {
    display: "0530 951 25 69", href: "+905309512569",
    schema: "+90-530-951-25-69", wa: "905309512569",
  });
});

await test("telefon: +90'li, parantezli ve bitisik yazimlar ayni sonucu verir", () => {
  const beklenen = phoneForms("0530 951 25 69");
  for (const giris of ["+90 530 951 25 69", "(0530) 951-25-69", "905309512569", "5309512569"]) {
    deepStrictEqual(phoneForms(giris), beklenen, giris + " farkli sonuc verdi");
  }
});

await test("telefon: eksik/fazla haneli girisler reddedilir", () => {
  for (const giris of ["", "530 951", "0530 951 25 6", "0530 951 25 699", "abc"]) {
    strictEqual(phoneForms(giris), null, giris + " kabul edildi");
  }
});

await test("uretilen dosya calisan bir ES modulu ve mevcut veriyle birebir ayni", async () => {
  await mkdir(TMP, { recursive: true });
  const text = serializeSite({ site, nav, trustPoints, steps, date: "2026-01-01" });
  const file = path.join(TMP, "site.js");
  await writeFile(file, text);

  const m = await import(file + "?v=" + Date.now());
  deepStrictEqual(m.site, site);
  deepStrictEqual(m.nav, nav);
  deepStrictEqual(m.trustPoints, trustPoints);
  deepStrictEqual(m.steps, steps);
});

await test("null degerler null kalir, kacis gerektiren metinler bozulmaz", async () => {
  const zorlu = {
    ...site,
    name: 'Bektaş "Oto" Kurtarma \\ test',
    tagline: "Tırnak ' ve satır\nsonu",
    photos: { ...site.photos, hero: "/img/a.webp", saha1: null },
    claims: { ...site.claims, reviewRating: 4.9, reviewCount: 187 },
  };
  const text = serializeSite({ site: zorlu, nav, trustPoints, steps });
  const file = path.join(TMP, "site-zorlu.js");
  await writeFile(file, text);
  const m = await import(file + "?v=" + Date.now());

  strictEqual(m.site.name, zorlu.name);
  strictEqual(m.site.tagline, zorlu.tagline);
  strictEqual(m.site.photos.saha1, null);
  strictEqual(m.site.photos.hero, "/img/a.webp");
  strictEqual(m.site.claims.reviewRating, 4.9);
  ok(text.includes("reviewCount: 187"));
});

await test("gomulen kaynak disariya bagimli degil (toString ile calisir)", () => {
  const src = serializeSite.toString() + phoneForms.toString();
  for (const yasak of ["import ", "require(", "esc(", "site."]) {
    ok(!src.includes("\n" + yasak), "fonksiyon govdesinde disa bagimlilik: " + yasak);
  }
  ok(new Function("return " + serializeSite.toString())() instanceof Function);
});

await rm(TMP, { recursive: true, force: true });
console.log("\n  " + passed + "/6 gecti\n");
