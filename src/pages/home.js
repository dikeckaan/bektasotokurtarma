import { site, trustPoints, steps } from "../data/site.js";
import { districts } from "../data/districts.js";
import { sortedServices } from "../data/services.js";
import { generalFaq } from "../data/faq.js";
import { rehber, kategoriler } from "../data/rehber.js";
import { page, ctaBand, districtGrid, serviceCards, faqBlock, links } from "../lib/layout.js";
import { esc, mkTitle } from "../lib/util.js";
import { photo, truckIllus } from "../lib/media.js";
import { faqSchema } from "../lib/schema.js";

export function homePage() {
  const body = `
<section class="hero hero--split">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">7/24 · İstanbul Anadolu Yakası</span>
      <h1>Anadolu Yakası'nda<br><em>${site.claims.avgEta} dakikada</em> yanınızdayız</h1>
      <p class="lede">Kadıköy'den Şile'ye kadar ${site.claims.districtCount} ilçede oto çekici, yol yardım, akü takviye ve kaza kurtarma. Aracınız nerede kaldıysa oraya geliyoruz — otopark, alt geçit, otoyol fark etmez.</p>
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
  <div><b>${site.claims.avgEta} dk</b><span>Ortalama varış süresi</span></div>
  <div><b>${site.claims.districtCount}</b><span>Anadolu Yakası ilçesi</span></div>
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
      <span class="eyebrow">Hizmet bölgeleri</span>
      <h2>Anadolu Yakası'nın ${site.claims.districtCount} ilçesi</h2>
      <p class="lede">Her ilçeye sabit araç konumlandırdık. Yandaki süreler son üç ayın ortalama varış süreleridir; çağrı anında size özel süreyi ayrıca teyit ediyoruz.</p>
    </div>
    ${districtGrid(districts)}
    <p style="margin-top:22px"><a href="/varis-suresi/"><b>Çekici size kaç dakikada ulaşır?</b></a> — konumunuzu paylaşın ya da haritadan ilçenizi seçin.</p>
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
      ${photo({ key: "saha1", label: "Kayar kasa yükleme — Kadıköy", alt: "Kayar kasa çekiciye araç yüklenirken", w: 1200, h: 800 })}
      ${photo({ key: "saha2", label: "Gece müdahalesi — TEM Ümraniye", alt: "Gece otoyolda çekici müdahalesi", w: 1200, h: 800 })}
      ${photo({ key: "saha3", label: "Akü takviyesi — Ataşehir", alt: "Yolda akü takviyesi yapılırken", w: 1200, h: 800 })}
      ${photo({ key: "saha4", label: "Kapalı otoparktan çıkarma — Bağdat Caddesi", alt: "Alçak tavanlı otoparktan kızakla araç çıkarma", w: 1200, h: 800 })}
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

${faqBlock(generalFaq.slice(0, 6))}
${ctaBand()}`;

  return page({
    path: "/",
    current: "/",
    title: mkTitle("Anadolu Yakası Oto Kurtarma – 7/24 Çekici"),
    description: `İstanbul Anadolu Yakası'nda 7/24 oto çekici ve yol yardım. Kadıköy, Ataşehir, Ümraniye, Maltepe, Kartal, Pendik ve tüm ilçelerde ortalama ${site.claims.avgEta} dakikada. Sabit fiyat, sigortalı taşıma.`,
    schema: [faqSchema(generalFaq.slice(0, 6))],
    body,
  });
}
