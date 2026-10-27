/**
 * Haritalar — kendi SVG'imiz.
 *
 * Ucuncu taraf harita gomulmuyor: iframe hem render'i geciktirir hem
 * ziyaretcinin IP'sini baska bir sirkete gonderir. Sinirlar OpenStreetMap'ten
 * (ODbL) alinip sadelestirildi; atif zorunlu ve haritanin altinda duruyor.
 *
 * Iki harita var: Anadolu Yakasi ilceleri (mapSvg) ve Pendik mahalleleri
 * (pendikMapSvg). Ikisi de bir ic link agi: her bolge kendi sayfasina baglanir.
 * Garaj konumu (site.geo) iki haritada da isaretli; sureler oradan hesaplanir.
 */
import { site } from "../data/site.js";
import { geo, mapSize, mapBounds } from "../data/geo.js";
import { pendikGeo, pendikMapSize, pendikBounds } from "../data/pendik-geo.js";
import { districtBySlug } from "../data/districts.js";
import { mahalleBySlug } from "../data/mahalleler.js";
import { esc, etaText } from "./util.js";

/** Varis suresine gore 4 bant. Adalar (eta yok) ayri gosterilir. */
const ILCE_ESIK = [20, 30, 45];
const MAHALLE_ESIK = [10, 15, 20];

function bant(eta, esik) {
  if (!eta) return "ada";
  if (eta <= esik[0]) return "b1";
  if (eta <= esik[1]) return "b2";
  if (eta <= esik[2]) return "b3";
  return "b4";
}
export const etaBand = (eta) => bant(eta, ILCE_ESIK);

const bantlar = (esik, ada) => [
  { key: "b1", label: `${esik[0]} dk'ya kadar` },
  { key: "b2", label: `${esik[0] + 1}–${esik[1]} dk` },
  { key: "b3", label: `${esik[1] + 1}–${esik[2]} dk` },
  { key: "b4", label: `${esik[2] + 1} dk+` },
  ...(ada ? [{ key: "ada", label: "Feribotla, randevulu" }] : []),
];
export const BANDS = bantlar(ILCE_ESIK, true);

/** Koyu zeminli bantlarda etiket acik renk olmali. */
const acikEtiket = (b) => b === "b3" || b === "b4" || b === "ada";

/** [boylam, enlem] -> SVG koordinati; fetch araclarindaki projeksiyonun aynisi. */
function projeksiyon(bounds, size) {
  const kx = Math.cos((((bounds.minLat + bounds.maxLat) / 2) * Math.PI) / 180);
  const olcek = size.w / ((bounds.maxLon - bounds.minLon) * kx);
  return ([lon, lat]) => [(lon - bounds.minLon) * kx * olcek, (bounds.maxLat - lat) * olcek];
}

/** Garaj isareti: koyu halka icinde kehribar nokta + etiket. */
function garajIsareti(xy, r = 7, yazi = true) {
  const [x, y] = xy.map((v) => +v.toFixed(1));
  return `<g class="mp-garaj" aria-hidden="true">
    <circle cx="${x}" cy="${y}" r="${+(r * 1.7).toFixed(1)}" class="mp-garaj-hale"/>
    <circle cx="${x}" cy="${y}" r="${r}" class="mp-garaj-nokta"/>
    ${yazi ? `<text x="${+(x + r * 2.3).toFixed(1)}" y="${+(y + r * 0.7).toFixed(1)}" class="mp-garaj-yazi">Garaj</text>` : ""}
  </g>`;
}

const atif = (not) => `<p class="map-attr">Sınırlar © <a href="https://www.openstreetmap.org/copyright" rel="noopener nofollow">OpenStreetMap</a> katkıcıları. ${not}</p>`;

/**
 * Etiket yerlesimi elle ayarlandi: Kadikoy ve Uskudar cok kucuk ve haritanin
 * sol kenarinda kaliyor, merkezlerine yazilan etiket hem tasiyor hem komsusuyla
 * cakisiyordu. Bu ikisi sol bosluga alinip kilavuz cizgisiyle baglandi.
 * Deger yoksa ilcenin kendi merkezi kullanilir.
 * anchor: start | middle · kilavuz: [x1,y1,x2,y2]
 */
const LABELS = {
  uskudar:     { x: -152, y: 266, anchor: "start", kilavuz: [-14, 270, 38, 279] },
  kadikoy:     { x: -152, y: 330, anchor: "start", kilavuz: [-14, 334, 48, 328] },
  umraniye:    { x: 132, y: 272 },
  atasehir:    { x: 146, y: 322 },
  cekmekoy:    { x: 214, y: 256 },
  sancaktepe:  { x: 268, y: 336 },
  sultanbeyli: { x: 306, y: 372 },
  maltepe:     { x: 166, y: 406 },
  kartal:      { x: 226, y: 460 },
  pendik:      { x: 382, y: 474 }, // garaj isaretinin sagi
  tuzla:       { x: 352, y: 546 },
  adalar:      { x: 148, y: 502 },
  beykoz:      { x: 124, y: 132 },
  sile:        { x: 650, y: 82 },
};

// Sol tarafta etiket icin bosluk birakiyoruz; ilceler x=0'dan basliyor.
const PAD_SOL = 168, PAD_UST = 14, PAD_ALT = 24;

/**
 * @param {{linkli?:boolean, id?:string, secilebilir?:boolean}} o
 *   linkli: ilceler kendi sayfasina baglansin (statik kullanim)
 *   secilebilir: buton gibi davransin (varis suresi hesaplayicisi)
 */
export function mapSvg(o = {}) {
  const id = o.id || "harita";
  const etiketlenecek = new Set(geo.map((g) => g.slug));

  const sekil = (g) => {
    const d = districtBySlug[g.slug];
    const band = etaBand(d.eta);
    const baslik = `${d.name} — tahmini varış ${etaText(d)}`;
    const govde = `<path class="mp mp--${band}" d="${g.d}"><title>${esc(baslik)}</title></path>`;
    if (o.secilebilir) {
      return `<g class="mp-g" data-ilce="${g.slug}" role="button" tabindex="0" aria-label="${esc(baslik)}">${govde}</g>`;
    }
    if (o.linkli === false) return `<g class="mp-g">${govde}</g>`;
    return `<a class="mp-g" href="/${g.slug}-oto-kurtarma/" aria-label="${esc(baslik)}">${govde}</a>`;
  };

  const etiket = (g) => {
    if (!etiketlenecek.has(g.slug)) return "";
    const d = districtBySlug[g.slug];
    const L = LABELS[g.slug] || {};
    const x = L.x ?? g.merkez[0];
    const y = L.y ?? g.merkez[1];
    const anchor = L.anchor || "middle";
    const kilavuz = L.kilavuz
      ? `<line class="mp-kilavuz" x1="${L.kilavuz[0]}" y1="${L.kilavuz[1]}" x2="${L.kilavuz[2]}" y2="${L.kilavuz[3]}"/>`
      : "";
    const acik = acikEtiket(etaBand(d.eta)) || L.kilavuz;
    return `<g class="mp-lbl${acik ? " mp-lbl--acik" : ""}" data-ilce="${g.slug}" aria-hidden="true">
      ${kilavuz}
      <text class="mp-ad" x="${x}" y="${y}" text-anchor="${anchor}">${esc(d.name)}</text>
      <text class="mp-eta" x="${x}" y="${y + 15}" text-anchor="${anchor}">${esc(etaText(d))}</text>
    </g>`;
  };

  return `<div class="mapwrap">
  <svg id="${id}" class="map" viewBox="${-PAD_SOL} ${-PAD_UST} ${mapSize.w + PAD_SOL} ${mapSize.h + PAD_UST + PAD_ALT}" role="img"
       aria-label="İstanbul Anadolu Yakası ilçe haritası ve Pendik'teki garajdan tahmini çekici varış süreleri">
    <g class="mp-sekiller">${geo.map(sekil).join("")}</g>
    <g class="mp-etiketler">${geo.map(etiket).join("")}</g>
    ${garajIsareti(projeksiyon(mapBounds, mapSize)([site.geo.lng, site.geo.lat]), 6, false)}
  </svg>
  <div class="map-legend">
    ${BANDS.map((b) => `<span class="lg"><i class="sw sw--${b.key}"></i>${esc(b.label)}</span>`).join("")}
  </div>
  ${atif("Süreler Pendik'teki garajımızdan yol mesafesine göre tahminidir.")}
</div>`;
}

/**
 * Pendik mahalle haritasi.
 * @param {{id?:string, vurgu?:string, secilebilir?:boolean, linkli?:boolean, yakin?:boolean}} o
 *   vurgu: bu mahalle secili gosterilir (mahalle sayfalari)
 *   secilebilir: buton gibi davransin (varis suresi hesaplayicisi)
 *   yakin: yalnizca yogun guney seridi (merkez, sahil, Kurtkoy) — tum mahalleler etiketli
 */
export function pendikMapSvg(o = {}) {
  const id = o.id || "pendik-harita";
  const proj = projeksiyon(pendikBounds, pendikMapSize);
  const { w, h } = pendikMapSize;
  const kutu = o.yakin ? YAKIN_KUTU : [-10, -10, w + 20, h + 20];
  const icerde = ([x, y]) => x > kutu[0] && x < kutu[0] + kutu[2] && y > kutu[1] && y < kutu[1] + kutu[3];

  const sekil = (g) => {
    const m = mahalleBySlug[g.slug];
    const b = bant(m.eta, MAHALLE_ESIK);
    const baslik = `${m.tam} — tahmini varış ${m.eta} dk`;
    const govde = `<path class="mp mp--${b}" d="${g.d}"><title>${esc(baslik)}</title></path>`;
    const secili = o.vurgu === g.slug ? " secili" : "";
    if (o.secilebilir) {
      return `<g class="mp-g" data-mahalle="${g.slug}" role="button" tabindex="0" aria-label="${esc(baslik)}">${govde}</g>`;
    }
    if (o.linkli === false || o.vurgu === g.slug) return `<g class="mp-g${secili}">${govde}</g>`;
    return `<a class="mp-g" href="${m.path}" aria-label="${esc(baslik)}">${govde}</a>`;
  };

  // Genel gorunumde kucuk mahallelere etiket sigmiyor; adlari baslik (title),
  // yakin gorunum ve listede var. Vurgulanan mahalle her zaman etiketlenir.
  const etiket = (g) => {
    const m = mahalleBySlug[g.slug];
    const vurgu = o.vurgu === g.slug;
    if (!icerde(g.merkez)) return "";
    if (!o.yakin && m.km2 < 2.4 && !vurgu) return "";
    const [x, y] = g.merkez;
    const acik = acikEtiket(bant(m.eta, MAHALLE_ESIK)) && !vurgu;
    const sureli = vurgu || (o.yakin ? m.km2 >= 1.2 : true);
    return `<g class="mp-lbl mp-lbl--mah${acik ? " mp-lbl--acik" : ""}" aria-hidden="true">
      <text class="mp-ad" x="${x}" y="${y}" text-anchor="middle">${esc(m.ad)}</text>
      ${sureli ? `<text class="mp-eta" x="${x}" y="${y + (o.yakin ? 7 : 14)}" text-anchor="middle">${m.eta} dk</text>` : ""}
    </g>`;
  };

  return `<div class="mapwrap">
  <svg id="${id}" class="map map--pendik${o.yakin ? " map--yakin" : ""}" viewBox="${kutu.join(" ")}" role="img"
       aria-label="${o.yakin ? "Pendik merkez ve sahil mahalleleri" : "Pendik mahalle haritası"}: garajdan tahmini çekici varış süreleri">
    <g class="mp-sekiller">${pendikGeo.map(sekil).join("")}</g>
    <g class="mp-etiketler">${pendikGeo.map(etiket).join("")}</g>
    ${garajIsareti(proj([site.geo.lng, site.geo.lat]), o.yakin ? 3.5 : 7)}
  </svg>
  <div class="map-legend">
    ${bantlar(MAHALLE_ESIK, false).map((b) => `<span class="lg"><i class="sw sw--${b.key}"></i>${esc(b.label)}</span>`).join("")}
    <span class="lg"><i class="sw sw--garaj"></i>Garaj</span>
  </div>
  ${atif("Süreler garajımızdan yol mesafesine göre tahminidir; kesin süreyi telefonda söylüyoruz.")}
</div>`;
}

/** Yakin gorunum kutusu: kirsal kuzey haric tum mahallelerin sinirlari. */
const YAKIN_KUTU = (() => {
  const xs = [], ys = [];
  for (const g of pendikGeo) {
    if (mahalleBySlug[g.slug].tip === "kirsal" || mahalleBySlug[g.slug].km2 > 10) continue;
    for (const [x, y] of g.d.match(/-?[\d.]+,-?[\d.]+/g).map((p) => p.split(",").map(Number))) { xs.push(x); ys.push(y); }
  }
  const pad = 8;
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + 2 * pad, Math.max(...ys) - Math.min(...ys) + 2 * pad]
    .map((v) => Math.round(v));
})();

/** Bir mahalle yakin gorunumde rahat secilebiliyor mu (kirsal degilse evet). */
export const yakinGorunumde = (slug) => mahalleBySlug[slug].tip !== "kirsal" && mahalleBySlug[slug].km2 <= 10;
