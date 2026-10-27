import { site, steps } from "../data/site.js";
import { districts } from "../data/districts.js";
import { mahalleler } from "../data/mahalleler.js";
import { sortedServices } from "../data/services.js";
import { generalFaq } from "../data/faq.js";
import { page, ctaBand, faqBlock, districtGrid, links } from "../lib/layout.js";
import { esc, mkTitle } from "../lib/util.js";
import { faqSchema, serviceSchema } from "../lib/schema.js";

export function servicePages() {
  return sortedServices.map((s) => {
    const path = `/hizmetler/${s.slug}/`;
    const others = sortedServices.filter((x) => x.slug !== s.slug).slice(0, 6);
    const faq = [...s.faq, ...generalFaq.slice(0, 3)];

    const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">Hizmet · Pendik ve Anadolu Yakası</span>
      <h1>${esc(s.h1)}<br><em>7/24 Pendik</em></h1>
      <p class="lede">${esc(s.short)} Pendik'te tahminen ${site.claims.avgEta} dakikada yanınızdayız, fiyatı yola çıkmadan söylüyoruz.</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note"><span>${esc(s.price)}</span><span>Gece ve bayram farkı yok</span><span>Sigortalı taşıma</span></p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>${esc(s.h1)} nedir, ne zaman gerekir?</h2>
        <p>${esc(s.intro)}</p>
        <h3>Şu durumlarda arayın</h3>
        <ul class="ticks">${s.when.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
      </div>
      <div class="local">
        <h3>Hizmete dahil olanlar</h3>
        <ul class="ticks">${s.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <p style="margin-top:20px"><span class="badge">${esc(s.price)}</span></p>
        <p class="muted" style="margin-top:12px;font-size:14.5px">Kesin tutar aracın türüne ve mesafeye göre belirlenir, telefonda net olarak söylenir.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Nasıl işliyor</span><h2>Üç adımda ${esc(s.name.toLowerCase())}</h2></div>
    <div class="steps">${steps.map((st) => `<div class="step"><h3>${esc(st.title)}</h3><p>${esc(st.body)}</p></div>`).join("")}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Hizmet bölgeleri</span>
      <h2>${esc(s.name)} verdiğimiz ilçeler</h2>
      <p class="lede">Garajımız Pendik'te; Pendik'in ${mahalleler.length} mahallesine ve Anadolu Yakası'nın ${site.claims.districtCount} ilçesinin tamamına aynı fiyat politikasıyla çıkıyoruz.</p>
    </div>
    ${districtGrid(districts.slice(0, 7))}
    <p style="margin-top:18px"><a href="/bolgeler/">Tüm bölgeler ve tahmini varış süreleri →</a></p>
    ${s.combo ? `<p style="margin-top:24px"><a href="/pendik-${s.slug}/"><b>Pendik ${esc(s.comboLabel.toLowerCase())}</b></a> — garajımızın bulunduğu ilçede mahalle mahalle hizmet</p>` : ""}
    ${s.combo ? `<p style="margin-top:24px" class="muted">İlçeye özel sayfalar: ${districts.map((d) => `<a href="/${d.slug}-${s.slug}/">${esc(d.name)} ${esc(s.comboLabel.toLowerCase())}</a>`).join(" · ")}</p>` : ""}
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><h2>Diğer hizmetlerimiz</h2></div>
    <div class="grid grid--3">
      ${others.map((o) => `<a class="card" href="/hizmetler/${o.slug}/"><h3>${esc(o.name)}</h3><p>${esc(o.short)}</p><span class="more">Detaylar →</span></a>`).join("")}
    </div>
  </div>
</section>

${faqBlock(faq, `${s.name} hakkında sık sorulanlar`)}
${ctaBand(`${s.name} mi gerekiyor?`, "Arayın, size en yakın aracı belirleyip süreyi ve net fiyatı hemen söyleyelim.")}`;

    return {
      path,
      html: page({
        path,
        current: "/hizmetler/",
        title: mkTitle(`${s.h1} – Pendik ve Anadolu Yakası`),
        description: `${s.short} Pendik merkezli, Anadolu Yakası'nın ${site.claims.districtCount} ilçesinde 7/24. ${s.price} fiyatla, sabit fiyat garantisiyle. Pendik'te tahminen ${site.claims.avgEta} dakikada.`,
        breadcrumbs: [
          { label: "Ana sayfa", href: "/" },
          { label: "Hizmetler", href: "/hizmetler/" },
          { label: s.h1 },
        ],
        schema: [
          faqSchema(faq),
          serviceSchema({
            name: s.h1,
            description: s.intro,
            url: path,
            areaNames: districts.map((d) => d.name),
            price: s.price,
          }),
        ],
        body,
      }),
    };
  });
}
