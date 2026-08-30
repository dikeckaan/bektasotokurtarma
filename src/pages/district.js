import { site } from "../data/site.js";
import { districts, neighbours } from "../data/districts.js";
import { comboServices, sortedServices } from "../data/services.js";
import { generalFaq } from "../data/faq.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { esc, list, pick, etaText, mkTitle } from "../lib/util.js";
import { faqSchema, serviceSchema } from "../lib/schema.js";

/* Ayni cumlenin 14 kez tekrarlanmamasi icin ilceye gore secilen acilislar. */
const OPENERS = [
  (d) => `${d.loc} aracınız yolda kaldığında tek yapmanız gereken telefonu açmak. ${d.name} sınırları içinde ortalama ${etaText(d)} içinde yanınızda oluyor, aracınızı kayar kasa çekiciyle istediğiniz servise ya da adrese götürüyoruz.`,
  (d) => `${d.name} ve çevresindeki çağrılara ${etaText(d)} içinde ulaşacak şekilde araç konumlandırdık. ${d.gen} hangi mahallesinde olursanız olun — ${list(d.mahalleler.slice(0, 3))} dahil — aynı gün, aynı saat farkı olmadan hizmet veriyoruz.`,
  (d) => `${d.loc} 7/24 oto kurtarma ve yol yardım veriyoruz. Akü bitmesi, lastik patlaması ya da kaza sonrası kurtarma fark etmez; ${d.name} içindeki çağrılara ortalama ${etaText(d)} içinde yetişiyoruz.`,
];

const CLOSERS = [
  (d) => `${d.name} çevresindeki çağrılarda fiyatı telefonda söylüyor, yola çıktıktan sonra değiştirmiyoruz. Gece, hafta sonu ve bayram için ek ücret yok.`,
  (d) => `${d.loc} verdiğimiz her hizmette taşıma sigortalıdır ve teslimde imzalı tutanak bırakırız. Aracınızın nasıl teslim alındığı ve nasıl bırakıldığı kayıt altındadır.`,
  (d) => `${d.name} içindeki taşımalarda kullandığımız araçlar K türü yetki belgeli, sürücülerimiz SRC belgelidir. Belgesiz çekici çalıştırmıyoruz.`,
];

export function districtPages() {
  return districts.map((d) => {
    const path = `/${d.slug}-oto-kurtarma/`;
    const nb = neighbours(d.slug);

    const localFaq = [
      [`${d.name} oto kurtarma ne kadar sürede geliyor?`,
       d.eta
         ? `${d.name} içindeki çağrılara son üç ayın ortalamasına göre ${d.eta} dakikada ulaşıyoruz. ${d.landmark} çevresi ve ana arterlerde bu süre daha da kısalıyor. Çağrı anında size özel tahmini süreyi net olarak söylüyoruz.`
         : `${d.loc} taşıma feribot seferlerine bağlı olduğu için sabit bir varış süresi vermiyoruz. Çağrıyı aldığımızda ilk uygun sefer saatini birlikte belirliyoruz.`],
      [`${d.name} çekici ücreti ne kadar?`,
       `${d.name} içi taşımalar 1.500 ₺'den başlıyor. Kesin tutar aracınızın türüne ve gideceği adrese göre değişir; telefonda net rakamı söylüyoruz ve yola çıktıktan sonra değiştirmiyoruz.`],
      [`${d.gen} hangi mahallelerine geliyorsunuz?`,
       `${d.name} sınırları içindeki tüm mahallelere geliyoruz: ${list(d.mahalleler)}. Site ve kapalı otopark girişlerinde izin gerekiyorsa çağrı sırasında bunu da not alıyoruz.`],
      [`${d.loc} gece de hizmet veriyor musunuz?`,
       `Evet, ${d.name} dahil tüm Anadolu Yakası'nda 24 saat vardiyalı çalışıyoruz. Gece çağrıları için ek ücret uygulamıyoruz.`],
    ];

    const faq = [...localFaq, ...generalFaq.slice(0, 3)];

    const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">İstanbul · Anadolu Yakası</span>
      <h1>${esc(d.name)} Oto Kurtarma<br><em>7/24 çekici</em></h1>
      <p class="lede">${esc(pick(OPENERS, d.slug + "a")(d))}</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note">
        <span>${esc(d.name)} ortalama varış: ${esc(etaText(d))}</span>
        <span>Sabit fiyat</span>
        <span>Sigortalı taşıma</span>
      </p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>${esc(d.name)} sınırları içinde ne yapıyoruz</h2>
        <p>${esc(d.note)}</p>
        <p>${esc(d.note2)}</p>
        <p>${esc(pick(CLOSERS, d.slug + "b")(d))}</p>
      </div>
      <div class="local">
        <h3>${esc(d.name)} saha bilgisi</h3>
        <dl>
          <dt>Ortalama varış</dt><dd>${esc(etaText(d))}</dd>
          <dt>Ana arterler</dt><dd>${esc(list(d.arterler))}</dd>
          <dt>Referans nokta</dt><dd>${esc(d.landmark)}</dd>
          <dt>Çalışma saatleri</dt><dd>7 gün 24 saat, bayram dahil</dd>
          <dt>Ödeme</dt><dd>${esc(site.payments.join(", "))}</dd>
        </dl>
        <p style="margin-top:16px;font-size:14.5px"><a href="/varis-suresi/">Varış süresi haritası</a> — konumunuza göre hesaplayın</p>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">${esc(d.name)} hizmetleri</span>
      <h2>${esc(d.loc)} verdiğimiz hizmetler</h2>
    </div>
    <div class="grid grid--3">
      ${comboServices.map((s) => `
      <a class="card" href="/${d.slug}-${s.slug}/">
        <h3>${esc(d.name)} ${esc(s.comboLabel)}</h3>
        <p>${esc(s.short)}</p>
        <span class="price">${esc(s.price)}</span>
        <span class="more">Detaylar →</span>
      </a>`).join("")}
    </div>
    <p style="margin-top:24px" class="muted">Diğer hizmetler: ${sortedServices.filter((s) => !s.combo).map((s) => `<a href="/hizmetler/${s.slug}/">${esc(s.name)}</a>`).join(" · ")}</p>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Kapsama</span>
      <h2>${esc(d.name)} mahalleleri</h2>
      <p class="lede">${esc(d.name)} sınırları içindeki tüm mahallelere aynı fiyat ve aynı sürede geliyoruz.</p>
    </div>
    <div class="chips">${d.mahalleler.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>
    <div class="sec-head" style="margin-top:48px">
      <h2>Yakın ilçeler</h2>
    </div>
    <div class="chips">${nb.map((n) => `<a class="chip" href="/${n.slug}-oto-kurtarma/">${esc(n.name)} oto kurtarma</a>`).join("")}
      <a class="chip" href="/bolgeler/">Tüm bölgeler</a>
    </div>
  </div>
</section>

${faqBlock(faq, `${d.name} oto kurtarma hakkında sık sorulanlar`)}
${ctaBand(`${d.name} için çekici mi lazım?`, `${d.loc} ortalama ${etaText(d)} içinde yanınızdayız. Arayın, süreyi ve net fiyatı hemen söyleyelim.`)}`;

    return {
      path,
      html: page({
        path,
        current: "/bolgeler/",
        title: mkTitle(`${d.name} Oto Kurtarma – 7/24 Çekici`),
        description: `${d.name} oto kurtarma ve çekici hizmeti. ${d.loc} ortalama ${etaText(d)} içinde yanınızdayız. ${d.mahalleler.slice(0, 4).join(", ")} ve tüm mahalleler. Sabit fiyat, sigortalı taşıma, 7/24.`,
        breadcrumbs: [
          { label: "Ana sayfa", href: "/" },
          { label: "Bölgeler", href: "/bolgeler/" },
          { label: `${d.name} Oto Kurtarma` },
        ],
        schema: [
          faqSchema(faq),
          serviceSchema({
            name: `${d.name} Oto Kurtarma`,
            description: `${d.loc} 7/24 oto çekici, yol yardım ve kaza kurtarma hizmeti.`,
            url: path,
            areaNames: [d.name],
            price: "1.500 ₺'den başlayan",
          }),
        ],
        body,
      }),
    };
  });
}
