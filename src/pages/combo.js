import { site } from "../data/site.js";
import { districts, neighbours } from "../data/districts.js";
import { comboServices } from "../data/services.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { esc, list, pick, etaText, mkTitle } from "../lib/util.js";
import { faqSchema, serviceSchema } from "../lib/schema.js";

/* Kesisim sayfalari ince icerikle dolmasin diye metin ilce + hizmet
   verisinden kuruluyor; her sayfada en az iki ilceye ozel cumle var. */
const OPENERS = [
  (d, s) => `${d.loc} ${s.comboLabel.toLowerCase()} hizmetine ihtiyacınız varsa doğru yerdesiniz. ${d.name} sınırları içindeki çağrılara ortalama ${etaText(d)} içinde ulaşıyor, işlemi yerinde tamamlıyoruz.`,
  (d, s) => `${d.name} ${s.comboLabel.toLowerCase()} çağrılarını 7 gün 24 saat karşılıyoruz. ${list(d.mahalleler.slice(0, 4))} ve ${d.gen} diğer tüm mahallelerinde aynı fiyat, aynı süre geçerli.`,
  (d, s) => `${s.comboLabel} için ${d.loc} beklemeniz gereken süre ortalama ${etaText(d)}. Çağrıyı aldığımızda size en yakın aracı belirleyip plakasını ve sürücü adını bildiriyoruz.`,
];

export function comboPages() {
  const out = [];
  for (const d of districts) {
    for (const s of comboServices) {
      const path = `/${d.slug}-${s.slug}/`;
      const title = `${d.name} ${s.comboLabel}`;
      const nb = neighbours(d.slug);

      const faq = [
        [`${title} ne kadar sürede geliyor?`,
         d.eta
           ? `${d.name} içindeki ${s.comboLabel.toLowerCase()} çağrılarına ortalama ${d.eta} dakikada ulaşıyoruz. ${d.landmark} ve ${d.arterler[0]} çevresinde bu süre daha kısa oluyor.`
           : `${d.loc} taşıma feribot seferine bağlı planlanır; çağrıda ilk uygun sefer saatini birlikte belirliyoruz.`],
        [`${title} ücreti ne kadar?`,
         `${s.price} tutarından başlıyor. Kesin fiyatı aracınızın türünü ve konumunuzu öğrendikten sonra telefonda net olarak söylüyoruz; yola çıktıktan sonra değişmiyor.`],
        [`${d.loc} gece de ${s.comboLabel.toLowerCase()} yapıyor musunuz?`,
         `Evet. ${d.name} dahil Anadolu Yakası'nın tamamında 24 saat vardiyalı çalışıyoruz ve gece için ek ücret almıyoruz.`],
        ...s.faq.slice(0, 2),
      ];

      const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">${esc(d.name)} · İstanbul Anadolu Yakası</span>
      <h1>${esc(title)}<br><em>7/24 hizmet</em></h1>
      <p class="lede">${esc(pick(OPENERS, d.slug + s.slug)(d, s))}</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note"><span>${esc(d.name)}: ${esc(etaText(d))}</span><span>${esc(s.price)}</span><span>Sabit fiyat</span></p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>${esc(d.loc)} ${esc(s.name.toLowerCase())} nasıl yapılıyor?</h2>
        <p>${esc(s.intro)}</p>
        <p>${esc(d.note)}</p>
        <h3>Şu durumlarda arayın</h3>
        <ul class="ticks">${s.when.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
      </div>
      <div class="local">
        <h3>${esc(d.name)} için özet</h3>
        <dl>
          <dt>Ortalama varış</dt><dd>${esc(etaText(d))}</dd>
          <dt>Başlangıç fiyatı</dt><dd>${esc(s.price)}</dd>
          <dt>Çalışma saatleri</dt><dd>7 gün 24 saat</dd>
          <dt>Ana arterler</dt><dd>${esc(list(d.arterler.slice(0, 3)))}</dd>
        </dl>
        <h3 style="margin-top:22px">Hizmete dahil</h3>
        <ul class="ticks">${s.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">${esc(d.name)} kapsama</span>
      <h2>${esc(title)} verdiğimiz mahalleler</h2>
      <p class="lede">${esc(d.note2)}</p>
    </div>
    <div class="chips">${d.mahalleler.map((m) => `<span class="chip">${esc(m)}</span>`).join("")}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>${esc(d.loc)} diğer hizmetlerimiz</h2></div>
    <div class="chips">
      ${comboServices.filter((x) => x.slug !== s.slug).map((x) => `<a class="chip" href="/${d.slug}-${x.slug}/">${esc(d.name)} ${esc(x.comboLabel.toLowerCase())}</a>`).join("")}
      <a class="chip" href="/${d.slug}-oto-kurtarma/">${esc(d.name)} oto kurtarma</a>
    </div>
    <div class="sec-head" style="margin-top:44px"><h2>Yakın ilçelerde ${esc(s.comboLabel.toLowerCase())}</h2></div>
    <div class="chips">
      ${nb.map((n) => `<a class="chip" href="/${n.slug}-${s.slug}/">${esc(n.name)} ${esc(s.comboLabel.toLowerCase())}</a>`).join("")}
      <a class="chip" href="/hizmetler/${s.slug}/">Tüm bölgelerde ${esc(s.name.toLowerCase())}</a>
    </div>
  </div>
</section>

${faqBlock(faq, `${title} hakkında sık sorulanlar`)}
${ctaBand(`${title} için hemen arayın`, `${d.loc} ortalama ${etaText(d)} içinde yanınızdayız. Süreyi ve net fiyatı telefonda söylüyoruz.`)}`;

      out.push({
        path,
        html: page({
          path,
          current: "/bolgeler/",
          title: mkTitle(`${title} – 7/24`),
          description: `${d.loc} 7/24 ${s.name.toLowerCase()}. Ortalama ${etaText(d)} varış, ${s.price} fiyat. ${d.mahalleler.slice(0, 3).join(", ")} ve tüm ${d.name} mahalleleri.`,
          breadcrumbs: [
            { label: "Ana sayfa", href: "/" },
            { label: `${d.name} Oto Kurtarma`, href: `/${d.slug}-oto-kurtarma/` },
            { label: title },
          ],
          schema: [
            faqSchema(faq),
            serviceSchema({
              name: title,
              description: `${d.loc} ${s.name.toLowerCase()} hizmeti. ${s.short}`,
              url: path,
              areaNames: [d.name],
              price: s.price,
            }),
          ],
          body,
        }),
      });
    }
  }
  return out;
}
