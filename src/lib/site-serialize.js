/**
 * site.js dosyasinin metnini ureten fonksiyonlar.
 *
 * /duzenle/ sayfasi bu fonksiyonlarin kaynagini (toString) sayfaya gomer,
 * boylece tarayicidaki uretici ile Node'daki test AYNI kod olur.
 * Bu yuzden fonksiyonlar disaridan hicbir sey referans etmemeli —
 * ihtiyac duyduklari her sey govdelerinin icinde tanimli.
 */

/** Tek girdiden dort telefon bicimi. Gecersizse null. */
export function phoneForms(raw) {
  var d = String(raw || "").replace(/\D/g, "");
  if (d.indexOf("90") === 0 && d.length === 12) d = d.slice(2);
  if (d.indexOf("0") === 0) d = d.slice(1);
  if (d.length !== 10) return null;
  return {
    display: "0" + d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6, 8) + " " + d.slice(8, 10),
    href: "+90" + d,
    schema: "+90-" + d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6, 8) + "-" + d.slice(8, 10),
    wa: "90" + d,
  };
}

/**
 * @param {{site:object, nav:array, trustPoints:array, steps:array, date?:string}} d
 * @returns {string} src/data/site.js icerigi
 */
export function serializeSite(d) {
  var q = function (v) { return JSON.stringify(v); };
  var s = d.site;
  var L = [];
  L.push("/**");
  L.push(" * TEK DEGISTIRME NOKTASI.");
  L.push(" * Telefon, WhatsApp, adres ve marka bilgileri sadece burada tutulur;");
  L.push(" * 115+ sayfanin tamami bu dosyadan beslenir.");
  L.push(" *");
  L.push(" * Bu dosya /duzenle/ sayfasindan uretildi — " + (d.date || new Date().toISOString().slice(0, 10)));
  L.push(" */");
  L.push("");
  L.push("export const site = {");
  L.push("  name: " + q(s.name) + ",");
  L.push("  shortName: " + q(s.shortName) + ",");
  L.push("  legalName: " + q(s.legalName) + ",");
  L.push("  tagline: " + q(s.tagline) + ",");
  L.push("");
  L.push("  phoneDisplay: " + q(s.phoneDisplay) + ",");
  L.push("  phoneHref: " + q(s.phoneHref) + ",       // tel: linki, ulke koduyla");
  L.push("  phoneSchema: " + q(s.phoneSchema) + ", // schema.org icin");
  L.push("  whatsapp: " + q(s.whatsapp) + ",         // wa.me/<numara>");
  L.push("");
  L.push("  email: " + q(s.email) + ",");
  L.push("");
  L.push("  /**");
  L.push("   * Adres dogrulanana kadar false birakin.");
  L.push("   * false iken schema.org kaydina posta adresi YAZILMAZ — cekici gibi");
  L.push('   * "hizmet alani" isletmelerinde Google zaten adres gizlemeyi onerir ve');
  L.push("   * yanlis adres yayinlamak dogru adres yayinlamamaktan daha zararlidir.");
  L.push("   */");
  L.push("  addressVerified: " + (s.addressVerified ? "true" : "false") + ",");
  L.push("");
  L.push("  address: {");
  L.push("    street: " + q(s.address.street) + ",");
  L.push("    district: " + q(s.address.district) + ",");
  L.push("    city: " + q(s.address.city) + ",");
  L.push("    postalCode: " + q(s.address.postalCode) + ",");
  L.push('    country: "TR",');
  L.push("  },");
  L.push("  geo: { lat: " + s.geo.lat + ", lng: " + s.geo.lng + " },");
  L.push("");
  L.push("  domain: " + q(s.domain) + ",");
  L.push("  origin: " + q(s.origin) + ",");
  L.push("");
  L.push("  foundedYear: " + s.foundedYear + ",");
  L.push("");
  L.push("  // Sosyal / harita profilleri - bos birakilanlar sayfada gosterilmez");
  L.push("  profiles: {");
  L.push("    googleMaps: " + q(s.profiles.googleMaps || "") + ",");
  L.push("    instagram: " + q(s.profiles.instagram || "") + ",");
  L.push("    facebook: " + q(s.profiles.facebook || "") + ",");
  L.push("  },");
  L.push("");
  L.push("  // Sitede gecen sayisal iddialar. Hepsi dogrulanabilir olmali.");
  L.push("  claims: {");
  L.push("    avgEta: " + s.claims.avgEta + ",");
  L.push("    districtCount: " + s.claims.districtCount + ",");
  L.push("    fleetSize: " + s.claims.fleetSize + ",");
  L.push("    reviewRating: " + (s.claims.reviewRating === null ? "null" : s.claims.reviewRating) + ",");
  L.push("    reviewCount: " + (s.claims.reviewCount === null ? "null" : s.claims.reviewCount) + ",");
  L.push("  },");
  L.push("");
  L.push("  priceRange: " + q(s.priceRange) + ",");
  L.push("");
  L.push("  // Odeme yontemleri");
  L.push("  payments: [" + s.payments.map(q).join(", ") + "],");
  L.push("");
  L.push("  /**");
  L.push("   * FOTOGRAFLAR. assets/img/ altina koyup yolunu yazin.");
  L.push("   * null kaldigi surece markali cizim gosterilir.");
  L.push("   *   hero 1600x900 · saha1..saha4 1200x800 · filo 1600x900");
  L.push("   */");
  L.push("  photos: {");
  ["hero", "saha1", "saha2", "saha3", "saha4", "filo"].forEach(function (k) {
    var v = s.photos[k];
    L.push("    " + k + ": " + (v ? q(v) : "null") + ",");
  });
  L.push("  },");
  L.push("};");
  L.push("");
  L.push("export const nav = [");
  d.nav.forEach(function (n) { L.push("  { label: " + q(n.label) + ", href: " + q(n.href) + " },"); });
  L.push("];");
  L.push("");
  L.push("export const trustPoints = [");
  d.trustPoints.forEach(function (t) {
    L.push("  {"); L.push("    title: " + q(t.title) + ","); L.push("    body: " + q(t.body) + ","); L.push("  },");
  });
  L.push("];");
  L.push("");
  L.push("export const steps = [");
  d.steps.forEach(function (t) {
    L.push("  {"); L.push("    title: " + q(t.title) + ","); L.push("    body: " + q(t.body) + ","); L.push("  },");
  });
  L.push("];");
  L.push("");
  return L.join("\n");
}
