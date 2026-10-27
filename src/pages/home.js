import { site, trustPoints, steps } from "../data/site.js";
import { districts, districtBySlug } from "../data/districts.js";
import { mahalleler, yakindanUzaga } from "../data/mahalleler.js";
import { pendikMapSvg } from "../lib/map.js";
import { sortedServices } from "../data/services.js";
import { generalFaq } from "../data/faq.js";
import { rehber, kategoriler } from "../data/rehber.js";
import { page, ctaBand, districtGrid, serviceCards, faqBlock, links } from "../lib/layout.js";
import { esc, mkTitle } from "../lib/util.js";
import { photo, truckIllus } from "../lib/media.js";
import { faqSchema } from "../lib/schema.js";

/** Mahalle grubunun tahmini sure araligi, ornek "6–12". */
const aralik = (liste) => {
  const e = liste.map((m) => m.eta);
  return Math.min(...e) === Math.max(...e) ? `${e[0]}` : `${Math.min(...e)}–${Math.max(...e)}`;
};
const grup = (...sluglar) => mahalleler.filter((m) => sluglar.includes(m.slug));

/** Ana sayfa S.S.S.: once Pendik'e ozel sorular, sonra genel sorular. */
const homeFaq = [
  ["Pendik'te çekici kaç dakikada gelir?",
   `Garajımız Pendik'te. Merkez, Kaynarca ve sahil mahallelerine tahminen ${aralik(grup("bati", "dogu", "orta", "yeni", "bahcelievler", "kaynarca", "guzelyali"))} dakikada, Kurtköy ve Sabiha Gökçen tarafına ${aralik(grup("kurtkoy", "sanayi", "yenisehir"))} dakikada, Kurna, Emirli ve Ballıca gibi kuzeydeki köy mahallelerine ${aralik(mahalleler.filter((m) => m.tip === "kirsal"))} dakikada ulaşıyoruz. Kesin süreyi çağrı anında söylüyoruz.`],
  ["Pendik içi çekici ücreti ne kadar?",
   "Pendik içi oto çekici 1.500 ₺'den, akü takviye ve yol yardım 750 ₺'den başlıyor. Aracınızın türünü ve gideceği adresi söylediğinizde net tutarı telefonda veriyoruz; yola çıktıktan sonra değişmiyor."],
  ["Sabiha Gökçen Havalimanı otoparkına geliyor musunuz?",
   "Evet. Havalimanı otoparkında aküsü biten, lastiği inen ya da çalışmayan araçlara 7/24 çıkıyoruz. Otopark adını, katını ve bölge numarasını söylemeniz yeterli."],
  ...generalFaq.slice(1, 5),
];

export function homePage() {
  const body = `
<section class="hero hero--split">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">7/24 · Pendik, İstanbul</span>
      <h1>Pendik Oto Kurtarma<br><em>${site.claims.avgEta} dakikada</em> yanınızdayız</h1>
      <p class="lede">Garajımız Pendik'te. Kaynarca'dan Kurtköy'e, Güzelyalı'dan Sabiha Gökçen'e Pendik'in 36 mahallesinde oto çekici, yol yardım, akü takviye ve kaza kurtarma. Aracınız nerede kaldıysa oraya geliyoruz — otopark, D-100, TEM fark etmez.</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note">
        <span>Telefonda söylenen sabit fiyat</span>
        <span>Sigortalı taşıma</span>
        <span>Gece ve bayram farkı yok</span>
      </p>
    </div>
    <div class="hero-media">
      ${site.photos.hero
        ? `<img src="${site.photos.hero}" width="1600" height="900" fetchpriority="high" alt="Bektaş Oto Kurtarma çekicisi iş başında">`
        : truckIllus("hero-illus")}
    </div>
  </div>
</section>

<div class="stats">
  <div><b>7/24</b><span>Bayram dahil kesintisiz</span></div>
  <div><b>${site.claims.avgEta} dk</b><span>Pendik içi tahmini varış</span></div>
  <div><b>${mahalleler.length}</b><span>Pendik mahallesi</span></div>
  <div><b>${new Date().getFullYear() - site.foundedYear} yıl</b><span>Aynı ailenin işlettiği filo</span></div>
</div>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Hizmetler</span>
      <h2>Yolda kalmanın her hâli için bir çözümümüz var</h2>
      <p class="lede">Her arıza çekici gerektirmez. Aracınız yerinde çalıştırılabiliyorsa çekici ücreti ödemenize gerek kalmıyor; ekibimiz önce yerinde müdahale ediyor.</p>
    </div>
    ${serviceCards(sortedServices)}
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Nasıl işliyor</span>
      <h2>Aramanızdan yüklemeye kadar üç adım</h2>
    </div>
    <div class="steps">
      ${steps.map((s) => `<div class="step"><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join("")}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Pendik mahalleleri</span>
      <h2>Pendik'in ${mahalleler.length} mahallesinde çekici</h2>
      <p class="lede">Haritadan mahallenize dokunun: o mahallenin yolları, referans noktaları ve tahmini varış süresi kendi sayfasında. Süreler garajımızdan yol mesafesine göre hesaplanır; kesin süreyi telefonda söylüyoruz.</p>
    </div>
    ${pendikMapSvg({ id: "ana-harita", yakin: true })}
    <div class="districts" style="margin-top:28px">${yakindanUzaga.map((m) => `
      <a class="dist" href="${m.path}">
        <b>${esc(m.ad)}</b>
        <span class="eta${m.eta > 20 ? " far" : ""}">${m.eta} dk</span>
        <small>${esc((m.noktalar[0]?.ad || m.yollar[0] || "Pendik"))}</small>
      </a>`).join("")}</div>
    <p style="margin-top:22px"><a href="/sabiha-gokcen-havalimani-cekici/"><b>Sabiha Gökçen Havalimanı çekici</b></a> — otoparkta akü, lastik ve çekici · <a href="/varis-suresi/"><b>Konumunuza göre varış süresi</b></a></p>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Pendik dışı</span>
      <h2>Anadolu Yakası'nın ${site.claims.districtCount - 1} ilçesine daha</h2>
      <p class="lede">Pendik'ten çıkıp komşu ilçelere de 7/24 hizmet veriyoruz. Kartal, Tuzla, Sultanbeyli ve Maltepe yarım saatin altında; uzak ilçelerde süreyi çağrı anında teyit ediyoruz.</p>
    </div>
    ${districtGrid(districts.filter((d) => d !== districtBySlug.pendik))}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Arıza rehberi</span>
      <h2>Ne olduğunu bilmiyorsanız önce buraya bakın</h2>
      <p class="lede">Panelde yanan lamba, duyduğunuz ses ya da altınızdaki leke ne anlatıyor? ${rehber.length} konuda net cevap: araç sürülebilir mi, çekici mi gerekir?</p>
    </div>
    <div class="grid grid--3">
      ${kategoriler.map((k) => `
      <a class="card" href="/rehber/${k.slug}/">
        <h3>${esc(k.ad)}</h3>
        <p>${esc(k.ozet)}</p>
        <span class="price">${rehber.filter((r) => r.kategori === k.slug).length} konu</span>
        <span class="more">İncele →</span>
      </a>`).join("")}
    </div>
    <p style="margin-top:22px" class="muted">En çok bakılanlar:
      ${["mars-donmuyor-tik-sesi", "hararet-yapiyor", "motor-ariza-lambasi", "otomatik-vites-cekilir-mi", "yanlis-yakit-aldim"]
        .map((sl) => rehber.find((r) => r.slug === sl))
        .filter(Boolean)
        .map((r) => `<a href="/rehber/${r.slug}/">${esc(r.h1)}</a>`).join(" · ")}
    </p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Sahadan</span>
      <h2>İşimizi böyle yapıyoruz</h2>
      <p class="lede">Kendi araçlarımız, kendi ekibimiz. Aşağıdaki kareler gerçek işlerden — stok fotoğraf kullanmıyoruz.</p>
    </div>
    <div class="gallery">
      ${photo({ key: "saha1", label: "Kayar kasa yükleme — Pendik", alt: "Pendik'te kayar kasa çekiciye araç yüklenirken", w: 1200, h: 800 })}
      ${photo({ key: "saha2", label: "Gece müdahalesi — TEM Kurtköy", alt: "Kurtköy'de gece otoyolda çekici müdahalesi", w: 1200, h: 800 })}
      ${photo({ key: "saha3", label: "Akü takviyesi — Sabiha Gökçen otoparkı", alt: "Havalimanı otoparkında akü takviyesi", w: 1200, h: 800 })}
      ${photo({ key: "saha4", label: "D-100 Pendik kesiminde yükleme", alt: "D-100 üzerinde emniyet şeridinde çekici yüklemesi", w: 1200, h: 800 })}
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Neden Bektaş</span>
      <h2>Çekici çağırmak güven işidir</h2>
      <p class="lede">Yolda kaldığınızda en kırılgan olduğunuz an, fiyatın sonradan değiştiği andır. Bu yüzden fiyatı yola çıkmadan söylüyor, aracınızı belgeli araç ve sigortalı taşımayla götürüyoruz.</p>
    </div>
    <div class="trust">
      ${trustPoints.map((t) => `<div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div>`).join("")}
    </div>
  </div>
</section>

${faqBlock(homeFaq)}
${ctaBand("Pendik'te yolda mı kaldınız?", "Telefonu açtığımız anda size en yakın aracı belirliyor, süreyi ve net fiyatı hemen söylüyoruz.")}`;

  return page({
    path: "/",
    current: "/",
    title: mkTitle("Pendik Çekici – 7/24 Oto Kurtarma ve Yol Yardım"),
    description: `Pendik 7/24 oto çekici ve yol yardım. Kurtköy, Kaynarca, Güzelyalı, Sabiha Gökçen ve 36 mahallede tahmini ${site.claims.avgEta} dakikada yanınızdayız. Sabit fiyat, sigortalı taşıma.`,
    schema: [faqSchema(homeFaq)],
    body,
  });
}
