/**
 * Gorsel varliklar.
 *
 * Gercek fotograflar gelene kadar sayfa bos gorunmesin diye markanin kendi
 * dilinde cizimler kullaniyoruz. `site.photos` icine gercek dosya yolu
 * yazildigi anda ilgili yerde <img> devreye giriyor, cizim dusuyor.
 */
import { site } from "../data/site.js";
import { esc } from "./util.js";

/** Kayar kasa cekici silueti — hero ve fotograf yer tutucularinda kullanilir. */
export function truckIllus(cls = "illus") {
  return `<svg class="${cls}" viewBox="0 0 460 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kayar kasa oto çekici üzerinde araç">
  <line x1="0" y1="171" x2="460" y2="171" stroke="#252B33" stroke-width="2"/>
  <g transform="rotate(11 168 112)">
    <rect x="168" y="112" width="252" height="11" rx="2" fill="#39424E"/>
    <rect x="168" y="105" width="252" height="7" fill="#2C333C"/>
    <path d="M196 105 L201 87 L226 85 L246 67 L308 67 L331 85 L352 88 L354 105 Z" fill="#20262E"/>
    <path d="M250 71 L305 71 L322 85 L233 85 Z" fill="#12161B"/>
    <circle cx="226" cy="105" r="12" fill="#0C0E11"/><circle cx="226" cy="105" r="5" fill="#39424E"/>
    <circle cx="330" cy="105" r="12" fill="#0C0E11"/><circle cx="330" cy="105" r="5" fill="#39424E"/>
  </g>
  <rect x="118" y="140" width="156" height="13" fill="#2C333C"/>
  <path d="M40 159 L40 120 L53 115 L75 73 L137 73 L137 159 Z" fill="#39424E"/>
  <path d="M79 79 L131 79 L131 112 L60 112 Z" fill="#12161B"/>
  <circle cx="103" cy="68" r="27" fill="#FFB020" opacity=".14"/>
  <rect x="86" y="63" width="35" height="10" rx="2" fill="#FFB020"/>
  <circle cx="76" cy="159" r="17" fill="#12161B"/><circle cx="76" cy="159" r="7" fill="#39424E"/>
  <circle cx="196" cy="159" r="17" fill="#12161B"/><circle cx="196" cy="159" r="7" fill="#39424E"/>
  <circle cx="237" cy="159" r="17" fill="#12161B"/><circle cx="237" cy="159" r="7" fill="#39424E"/>
</svg>`;
}

/* --------------------------------------------------------------- ikonlar */

const P = (d) => `<path d="${d}"/>`;
const ICONS = {
  "oto-cekici": P("M2 17h3m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm4 0h5v-4l-3-4h-4m0 8H9m7-8V6H3v11h2m11-8h-3") ,
  "yol-yardim": P("M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"),
  "aku-takviye": P("M4 9h11v9H4zM15 12h2v3h-2M7 6h2m4 0h2M6.5 13.5h3m-1.5-1.5v3m3.5 0h3"),
  "lastik-degisimi": P("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm0-5.2v5.2m6.4 3.8H15.8m-.5 5.8-2.6-3.6M8.7 20.6l2.6-3.6M5.6 12h2.6"),
  "yakit-ikmali": P("M4 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M3 20h11M6 8h5m2 1h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0v-6l-2.5-3"),
  "kapi-acma": P("M15 3a5 5 0 0 0-4.6 7L3 17.4V21h3.6l1-1v-2h2v-2h2l1.4-1.4A5 5 0 1 0 15 3Zm1.6 3.4a1.2 1.2 0 1 1-1.7 1.7 1.2 1.2 0 0 1 1.7-1.7Z"),
  "kaza-kurtarma": P("M12 3 2 20h20L12 3Zm0 6v6m0 3v.5"),
  "motosiklet-cekici": P("M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-14-3h6l4-6h3M9 9h4M16 6h3"),
  "kapali-kasa-cekici": P("M2 8h14v9H2zM16 11h4l2 3v3h-6M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm11 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM6 5h6"),
  "sehirlerarasi-cekici": P("M4 6h9m-9 6h5m-5 6h9M17 4l3 3-3 3m-3 4 3 3-3 3"),
};

export function icon(slug) {
  const d = ICONS[slug];
  if (!d) return "";
  return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

/* ------------------------------------------------------- fotograf alani */

/**
 * Gercek fotograf varsa <img>, yoksa markali yer tutucu.
 * @param {{key:string,label:string,alt:string,w:number,h:number,priority?:boolean}} o
 */
export function photo(o) {
  const src = site.photos?.[o.key];
  if (src) {
    return `<figure class="photo">
  <img src="${esc(src)}" width="${o.w}" height="${o.h}" alt="${esc(o.alt)}"
       ${o.priority ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
  <figcaption>${esc(o.label)}</figcaption>
</figure>`;
  }
  return `<figure class="photo photo--empty" style="--ar:${o.w}/${o.h}">
  <div class="photo-in">
    ${truckIllus("photo-illus")}
    <span class="photo-label">${esc(o.label)}</span>
    <span class="photo-spec">Fotoğraf alanı · ${o.w}×${o.h}</span>
  </div>
</figure>`;
}
