/**
 * Pendik'in 36 mahallesi.
 *
 * Sinirlar, komsuluklar, yollar ve referans noktalar pendik-geo.js'ten
 * (OpenStreetMap) gelir; burada yalnizca sayfa uretiminin ihtiyac duydugu
 * hazir alanlar kuruluyor. Elle yazilmis "yerel bilgi" yok — mahalle
 * sayfalarindaki her yer adi haritada gercekten o mahallenin icinde.
 *
 * Ek bicimleri "Mahallesi" uzerinden kuruluyor: "Kurtköy Mahallesi'nde",
 * "Batı Mahallesi'ne". Ozel isimde unlu uyumu hatasi riski boylece yok.
 */
import { pendikGeo } from "./pendik-geo.js";
import { varisDk, yolKm } from "../lib/sure.js";

/** Yuzolcumu ve konuma gore mahalle karakteri — metin secimini belirler. */
function tip(m) {
  if (m.km2 >= 10 && !m.noktalar.some((n) => n.tur === "havalimani")) return "kirsal";
  if (m.noktalar.some((n) => n.tur === "havalimani" || n.tur === "sanayi")) return "sanayi";
  if (m.yollar.includes("Sahil Bulvarı")) return "sahil";
  return "kent";
}

export const mahalleler = pendikGeo.map((g) => ({
  slug: g.slug,
  ad: g.ad,
  tam: `${g.ad} Mahallesi`,
  loc: `${g.ad} Mahallesi'nde`,
  abl: `${g.ad} Mahallesi'nden`,
  dat: `${g.ad} Mahallesi'ne`,
  gen: `${g.ad} Mahallesi'nin`,
  path: `/pendik/${g.slug}-cekici/`,
  eta: varisDk(g.nokta),
  km: Math.max(1, Math.round(yolKm(g.nokta))),
  km2: g.km2,
  nokta: g.nokta,
  komsuSlug: g.komsular,
  yollar: g.yollar,
  noktalar: g.noktalar,
  tip: tip(g),
}));

export const mahalleBySlug = Object.fromEntries(mahalleler.map((m) => [m.slug, m]));

/** Ortak siniri olan mahalleler; hic yoksa en yakin uc mahalle. */
export function komsular(m) {
  const k = m.komsuSlug.map((s) => mahalleBySlug[s]).filter(Boolean);
  if (k.length) return k;
  return mahalleler
    .filter((x) => x.slug !== m.slug)
    .sort((a, b) => Math.hypot(a.nokta[0] - m.nokta[0], a.nokta[1] - m.nokta[1]) - Math.hypot(b.nokta[0] - m.nokta[0], b.nokta[1] - m.nokta[1]))
    .slice(0, 3);
}

/** Varis suresine gore sirali (yakindan uzaga). */
export const yakindanUzaga = [...mahalleler].sort((a, b) => a.eta - b.eta || a.ad.localeCompare(b.ad, "tr"));
