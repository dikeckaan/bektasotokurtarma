import { site, nav } from "../data/site.js";
import { districts } from "../data/districts.js";
import { sortedServices, comboServices } from "../data/services.js";
import { esc, meta as metaText, etaText } from "./util.js";
import { icon } from "./media.js";
import { graph, organizationSchema, websiteSchema, breadcrumbSchema } from "./schema.js";

const telHref = `tel:${site.phoneHref}`;
const waMsg = encodeURIComponent("Merhaba, aracım yolda kaldı. Konumumu gönderiyorum.");
const waHref = `https://wa.me/${site.whatsapp}?text=${waMsg}`;

export const links = { tel: telHref, wa: waHref };

/* ---------------------------------------------------------------- parcalar */

export function header(current = "") {
  const item = (n) =>
    `<a href="${n.href}"${current.startsWith(n.href) && n.href !== "/" ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`;
  return `
<div class="announce">
  <div class="wrap">
    <span class="live"><span class="beacon" aria-hidden="true"></span> <b>7/24 açık</b> — bayram ve resmî tatiller dahil</span>
    <span>Anadolu Yakası'nın ${site.claims.districtCount} ilçesinde ortalama <b>${site.claims.avgEta} dakikada</b> yanınızdayız</span>
  </div>
</div>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">Bektaş Oto Kurtarma<span>İSTANBUL ANADOLU YAKASI</span></span>
    </a>
    <nav class="site-nav" aria-label="Ana menü">${nav.map(item).join("")}</nav>
    <a class="head-tel" href="${telHref}" data-track="tel-header">${esc(site.phoneDisplay)}</a>
  </div>
</header>
<nav class="mobile-nav" aria-label="Menü (mobil)">
  <ul>${nav.map((n) => `<li>${item(n)}</li>`).join("")}</ul>
</nav>`;
}

export function callbar() {
  return `
<div class="callbar">
  <a href="${telHref}" data-track="tel-sticky">Hemen ara</a>
  <a class="wa" href="${waHref}" rel="noopener" data-track="wa-sticky">WhatsApp</a>
</div>`;
}

export function ctaBand(title = "Aracınız yolda mı kaldı?", body = "Telefonu açtığımız anda size en yakın aracı belirliyor, süreyi ve net fiyatı hemen söylüyoruz.") {
  return `
<section class="cta">
  <div class="wrap">
    <div>
      <h2>${esc(title)}</h2>
      <p>${esc(body)}</p>
    </div>
    <div class="btn-row">
      <a class="btn" href="${telHref}" data-track="tel-cta">${esc(site.phoneDisplay)}</a>
      <a class="btn btn--ghost" href="${waHref}" rel="noopener" data-track="wa-cta">WhatsApp'tan konum gönder</a>
    </div>
  </div>
</section>`;
}

export function crumbs(items) {
  return `
<div class="crumbs">
  <div class="wrap">
    <nav aria-label="Site haritası">
      <ol>${items.map((c) => `<li>${c.href ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`}</li>`).join("")}</ol>
    </nav>
  </div>
</div>`;
}

export function districtGrid(items = districts) {
  return `<div class="districts">${items.map((d) => `
    <a class="dist" href="/${d.slug}-oto-kurtarma/">
      <b>${esc(d.name)}</b>
      <span class="eta${!d.eta || d.eta > 20 ? " far" : ""}">${esc(etaText(d))}</span>
      <small>${esc(d.mahalleler.slice(0, 3).join(", "))}…</small>
    </a>`).join("")}</div>`;
}

export function serviceCards(items = sortedServices, districtName = "") {
  return `<div class="grid grid--3">${items.map((s) => `
    <a class="card" href="/hizmetler/${s.slug}/">
      ${icon(s.slug)}
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.short)}</p>
      <span class="price">${esc(s.price)}</span>
      <span class="more">${districtName ? esc(districtName) + " için detay" : "Detaylar"} →</span>
    </a>`).join("")}</div>`;
}

export function faqBlock(pairs, heading = "Sık sorulan sorular") {
  if (!pairs.length) return "";
  return `
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Merak edilenler</span><h2>${esc(heading)}</h2></div>
    <div class="faq">
      ${pairs.map(([q, a], i) => `
      <details${i === 0 ? " open" : ""}>
        <summary>${esc(q)}</summary>
        <div class="answer">${esc(a)}</div>
      </details>`).join("")}
    </div>
  </div>
</section>`;
}

/** Footer'daki ic link agi: 14 ilce x oncelikli hizmetler. Crawl derinligini 2'de tutar. */
function linkMesh() {
  const rows = districts.map((d) => {
    const inner = comboServices.slice(0, 4)
      .map((s) => `<a href="/${d.slug}-${s.slug}/">${esc(d.name)} ${esc(s.comboLabel.toLowerCase())}</a>`)
      .join(" · ");
    return `<a href="/${d.slug}-oto-kurtarma/"><b>${esc(d.name)} oto kurtarma</b></a> · ${inner}`;
  });
  return `<div class="foot-mesh">${rows.join("<br>")}</div>`;
}

export function footer() {
  const social = Object.entries(site.profiles).filter(([, v]) => v);
  return `
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <h2>${esc(site.name)}</h2>
        <p>${site.addressVerified ? `${esc(site.address.street)}, ${esc(site.address.district)} / ${esc(site.address.city)}` : "İstanbul Anadolu Yakası geneli · hizmet alanı işletmesi"}</p>
        <p>Anadolu Yakası'nın tamamında 7/24 oto çekici, yol yardım ve kaza kurtarma.</p>
        <a class="foot-tel" href="${telHref}" data-track="tel-footer">${esc(site.phoneDisplay)}</a>
        ${social.length ? `<p>${social.map(([k, v]) => `<a href="${esc(v)}" rel="noopener">${esc(k)}</a>`).join(" · ")}</p>` : ""}
      </div>
      <div>
        <h2>Hizmetler</h2>
        <ul>${sortedServices.map((s) => `<li><a href="/hizmetler/${s.slug}/">${esc(s.name)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h2>Bölgeler</h2>
        <ul>${districts.slice(0, 7).map((d) => `<li><a href="/${d.slug}-oto-kurtarma/">${esc(d.name)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h2 class="sr-only">Bölgeler, devamı</h2>
        <ul>${districts.slice(7).map((d) => `<li><a href="/${d.slug}-oto-kurtarma/">${esc(d.name)}</a></li>`).join("")}
          <li><a href="/bolgeler/">Tüm bölgeler</a></li>
        </ul>
      </div>
    </div>
    ${linkMesh()}
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} ${esc(site.name)}. Tüm hakları saklıdır.</span>
      <span>${esc(site.address.city)} · ${site.foundedYear}'den beri</span>
    </div>
  </div>
</footer>`;
}

/* ---------------------------------------------------------------- iskelet */

/**
 * Tum sayfalarin kabugu.
 * @param {{title,description,path,body,breadcrumbs?,schema?,current?,ogType?,
 *          noindex?:boolean,extraHead?:string,bare?:boolean}} o
 */
export function page(o) {
  const canonical = site.origin + o.path;
  const bc = o.breadcrumbs || [];
  const nodes = [
    organizationSchema(),
    websiteSchema(),
    bc.length > 1 ? breadcrumbSchema(bc) : null,
    ...(o.schema || []),
  ];

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<meta name="description" content="${metaText(o.description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${o.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<meta name="theme-color" content="#0C0E11">
<meta name="geo.region" content="TR-34">
<meta name="geo.placename" content="İstanbul Anadolu Yakası">

<meta property="og:type" content="${o.ogType || "website"}">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${metaText(o.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.origin}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — 7/24 Anadolu Yakası oto kurtarma">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${site.origin}/og.png">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/styles.css?v=__CSSV__">
${o.noindex ? "" : graph(nodes)}
${o.extraHead || ""}
</head>
<body>
<a class="sr-only" href="#icerik">İçeriğe geç</a>
${header(o.current || o.path)}
${bc.length > 1 ? crumbs(bc) : ""}
<main id="icerik">
${o.body}
</main>
${o.bare ? "" : footer()}
${o.bare ? "" : callbar()}
</body>
</html>`;
}
