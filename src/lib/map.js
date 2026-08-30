/**
 * Anadolu Yakasi haritasi — kendi SVG'imiz.
 *
 * Ucuncu taraf harita gomulmuyor: iframe hem render'i geciktirir hem
 * ziyaretcinin IP'sini baska bir sirkete gonderir. Sinirlar OpenStreetMap'ten
 * (ODbL) alinip sadelestirildi; atif zorunlu ve haritanin altinda duruyor.
 *
 * Harita ayni zamanda bir ic link agi: her ilce kendi sayfasina baglanir.
 */
import { geo, mapSize } from "../data/geo.js";
import { districtBySlug } from "../data/districts.js";
import { esc, etaText } from "./util.js";

/** Varis suresine gore 4 bant. Adalar (eta yok) ayri gosterilir. */
export function etaBand(eta) {
  if (!eta) return "ada";
  if (eta <= 15) return "b1";
  if (eta <= 20) return "b2";
  if (eta <= 26) return "b3";
  return "b4";
}

export const BANDS = [
  { key: "b1", label: "12–15 dk" },
  { key: "b2", label: "16–20 dk" },
  { key: "b3", label: "21–26 dk" },
  { key: "b4", label: "27 dk+" },
  { key: "ada", label: "Feribotla, randevulu" },
];

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
  pendik:      { x: 300, y: 502 },
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
    const baslik = `${d.name} — ortalama varış ${etaText(d)}`;
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
    return `<g class="mp-lbl" data-ilce="${g.slug}" aria-hidden="true">
      ${kilavuz}
      <text class="mp-ad" x="${x}" y="${y}" text-anchor="${anchor}">${esc(d.name)}</text>
      <text class="mp-eta" x="${x}" y="${y + 15}" text-anchor="${anchor}">${esc(etaText(d))}</text>
    </g>`;
  };

  return `<div class="mapwrap">
  <svg id="${id}" class="map" viewBox="${-PAD_SOL} ${-PAD_UST} ${mapSize.w + PAD_SOL} ${mapSize.h + PAD_UST + PAD_ALT}" role="img"
       aria-label="İstanbul Anadolu Yakası ilçe haritası ve ortalama çekici varış süreleri">
    <g class="mp-sekiller">${geo.map(sekil).join("")}</g>
    <g class="mp-etiketler">${geo.map(etiket).join("")}</g>
  </svg>
  <div class="map-legend">
    ${BANDS.map((b) => `<span class="lg"><i class="sw sw--${b.key}"></i>${esc(b.label)}</span>`).join("")}
  </div>
  <p class="map-attr">Sınırlar © <a href="https://www.openstreetmap.org/copyright" rel="noopener nofollow">OpenStreetMap</a> katkıcıları. Süreler son üç ayın ortalamasıdır.</p>
</div>`;
}
