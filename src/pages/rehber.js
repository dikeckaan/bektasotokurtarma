/**
 * Ariza rehberi sayfalari.
 *
 * Her sayfa tek bir soruyu cevaplar ve cevabi ilk ekranda verir. Bu yalnizca
 * okuyucu icin degil: hem Google'in one cikan snippet'i hem yapay zeka
 * asistanlari, cevabi basta ve net veren sayfalari tercih ediyor.
 *
 * Sayfa duzeni bilincli olarak hep ayni: kisa cevap -> surebilir miyim ->
 * muhtemel sebepler -> yapilacaklar -> ne zaman cekici -> S.S.S.
 */
import { site } from "../data/site.js";
import { rehber, kategoriler } from "../data/rehber.js";
import { districts } from "../data/districts.js";
import { serviceBySlug } from "../data/services.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { esc, mkTitle, list } from "../lib/util.js";
import { faqSchema, ORG_ID } from "../lib/schema.js";

const kategoriBySlug = Object.fromEntries(kategoriler.map((k) => [k.slug, k]));
const rehberBySlug = Object.fromEntries(rehber.map((r) => [r.slug, r]));

const CIDDIYET = {
  dur: { etiket: "Durun", sinif: "dur", aciklama: "Aracı güvenli yere çekip motoru durdurun" },
  dikkat: { etiket: "Dikkat", sinif: "dikkat", aciklama: "Kısa mesafe gidilebilir, en kısa sürede servis" },
  planla: { etiket: "Planlayın", sinif: "planla", aciklama: "Yola devam edilir, randevu alın" },
};

const COZUM = {
  yerinde: { etiket: "Yerinde çözülür", sinif: "ok" },
  servis: { etiket: "Servis işi", sinif: "warn" },
  cekici: { etiket: "Çekici gerekir", sinif: "bad" },
};

/* ------------------------------------------------------------- parcalar */

function cevapKutusu(r) {
  const c = CIDDIYET[r.ciddiyet];
  return `
<div class="cevap cevap--${c.sinif}">
  <div class="cevap-ust">
    <span class="cevap-rozet">${esc(c.etiket)}</span>
    <span class="cevap-ust-not">${esc(c.aciklama)}</span>
  </div>
  <p class="cevap-ozet">${esc(r.ozet)}</p>
  <dl class="cevap-dl">
    <dt>Araç sürülebilir mi?</dt>
    <dd><b>${esc(r.surulebilir.karar)}</b> — ${esc(r.surulebilir.aciklama)}</dd>
  </dl>
</div>`;
}

function sebepTablosu(r) {
  return `
<div class="table-scroll">
  <table>
    <caption>Belirtiye göre muhtemel sebepler ve nerede çözüldüğü</caption>
    <thead><tr><th scope="col">Muhtemel sebep</th><th scope="col">Nasıl anlaşılır</th><th scope="col">Nerede çözülür</th></tr></thead>
    <tbody>
      ${r.sebepler.map((s) => {
        const c = COZUM[s.cozum];
        return `<tr>
          <td><b>${esc(s.ad)}</b>${s.not ? `<br><small class="muted">${esc(s.not)}</small>` : ""}</td>
          <td class="muted">${esc(s.isaret)}</td>
          <td><span class="pill pill--${c.sinif}">${esc(c.etiket)}</span></td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>
</div>`;
}

/** Yerel baglanti: rehber sayfasindan ilcelere ve hizmete kopru. */
function yerelBlok(r) {
  const s = serviceBySlug[r.hizmet];
  const secili = districts.filter((d) => d.eta).slice(0, 6);
  return `
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Yardım gerekirse</span>
      <h2>${esc(s.name)} — Anadolu Yakası'nda 7/24</h2>
      <p class="lede">${esc(s.short)} Ortalama ${site.claims.avgEta} dakikada yanınızdayız, fiyatı yola çıkmadan söylüyoruz.</p>
    </div>
    <div class="btn-row" style="margin-bottom:26px">
      <a class="btn" href="${links.tel}" data-track="tel-rehber">Ara: ${esc(site.phoneDisplay)}</a>
      <a class="btn btn--wa" href="${links.wa}" rel="noopener" data-track="wa-rehber">WhatsApp'tan konum gönder</a>
    </div>
    <div class="chips">
      <a class="chip" href="/hizmetler/${s.slug}/">${esc(s.name)} detayları</a>
      <a class="chip" href="/varis-suresi/">Varış süresi hesapla</a>
      ${secili.map((d) => `<a class="chip" href="/${d.slug}-oto-kurtarma/">${esc(d.name)} ${d.eta} dk</a>`).join("")}
      <a class="chip" href="/bolgeler/">Tüm bölgeler</a>
    </div>
  </div>
</section>`;
}

/* -------------------------------------------------------------- sayfalar */

export function rehberPages() {
  const bugun = new Date().toISOString().slice(0, 10);
  const out = [];

  /* --- ana hub --- */
  out.push({
    path: "/rehber/",
    html: page({
      path: "/rehber/",
      current: "/rehber/",
      title: mkTitle("Araç Arıza Rehberi"),
      description: `Araç arızalarını belirtiden tanıyın: uyarı lambaları, sesler, sıvı kaçakları ve yolda karşılaşılan durumlar. ${rehber.length} konuda net cevap: araç sürülebilir mi, çekici gerekir mi?`,
      breadcrumbs: [{ label: "Ana sayfa", href: "/" }, { label: "Arıza Rehberi" }],
      body: `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">${rehber.length} konu · ${rehber.reduce((a, r) => a + r.faq.length, 0)} soru</span>
    <h1>Araç Arıza<br><em>Rehberi</em></h1>
    <p class="lede">Panelde yanan lambadan, duyduğunuz sesten ya da altınızdaki lekeden yola çıkıp ne olduğunu bulun. Her sayfa tek bir soruya cevap veriyor ve en çok merak edileni baştan söylüyor: araç sürülebilir mi, çekici gerekir mi?</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">Acil durumda ara: ${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Nereden başlamalı?</h2><p class="lede">Elinizdeki ipucuna göre seçin.</p></div>
    <div class="grid grid--3">
      ${kategoriler.map((k) => `
      <a class="card" href="/rehber/${k.slug}/">
        <h3>${esc(k.ad)}</h3>
        <p>${esc(k.ozet)}</p>
        <span class="price">${rehber.filter((r) => r.kategori === k.slug).length} konu</span>
        <span class="more">Listeye git →</span>
      </a>`).join("")}
    </div>
  </div>
</section>

${kategoriler.map((k) => `
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">${esc(k.ad)}</span><h2>${esc(k.h1)}</h2><p class="lede">${esc(k.aciklama)}</p></div>
    <ul class="rehber-liste">
      ${rehber.filter((r) => r.kategori === k.slug).map((r) => `
      <li><a href="/rehber/${r.slug}/">
        <span class="rl-ad">${esc(r.h1)}</span>
        <span class="rl-soru">${esc(r.soru)}</span>
        <span class="rl-rozet rl-rozet--${CIDDIYET[r.ciddiyet].sinif}">${esc(CIDDIYET[r.ciddiyet].etiket)}</span>
      </a></li>`).join("")}
    </ul>
  </div>
</section>`).join("")}

${ctaBand("Emin değilseniz arayın", "Belirtiyi anlatın; yol yardım mı çekici mi gerektiğini telefonda söyleyelim.")}`,
    }),
  });

  /* --- kategori hublari --- */
  for (const k of kategoriler) {
    const liste = rehber.filter((r) => r.kategori === k.slug);
    const path = `/rehber/${k.slug}/`;
    out.push({
      path,
      html: page({
        path,
        current: "/rehber/",
        title: mkTitle(k.h1),
        description: `${k.ozet} ${liste.length} konu: ${liste.slice(0, 4).map((r) => r.h1).join(", ")} ve diğerleri.`,
        breadcrumbs: [
          { label: "Ana sayfa", href: "/" },
          { label: "Arıza Rehberi", href: "/rehber/" },
          { label: k.ad },
        ],
        body: `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Arıza Rehberi</span>
    <h1>${esc(k.h1)}</h1>
    <p class="lede">${esc(k.aciklama)}</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>

<section class="sec">
  <div class="wrap">
    <ul class="rehber-liste">
      ${liste.map((r) => `
      <li><a href="/rehber/${r.slug}/">
        <span class="rl-ad">${esc(r.h1)}</span>
        <span class="rl-soru">${esc(r.soru)}</span>
        <span class="rl-rozet rl-rozet--${CIDDIYET[r.ciddiyet].sinif}">${esc(CIDDIYET[r.ciddiyet].etiket)}</span>
      </a></li>`).join("")}
    </ul>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="prose">
      ${(k.bolumler || []).map((b) => `<h2>${esc(b.h)}</h2>${b.p.map((x) => `<p>${esc(x)}</p>`).join("")}`).join("")}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Diğer kategoriler</h2></div>
    <div class="grid grid--3">
      ${kategoriler.filter((x) => x.slug !== k.slug).map((x) => `
      <a class="card" href="/rehber/${x.slug}/">
        <h3>${esc(x.ad)}</h3>
        <p>${esc(x.ozet)}</p>
        <span class="more">${rehber.filter((r) => r.kategori === x.slug).length} konu →</span>
      </a>`).join("")}
    </div>
  </div>
</section>

${ctaBand()}`,
      }),
    });
  }

  /* --- konu sayfalari --- */
  for (const r of rehber) {
    const k = kategoriBySlug[r.kategori];
    const path = `/rehber/${r.slug}/`;
    const s = serviceBySlug[r.hizmet];
    const ilgili = r.ilgili.map((x) => rehberBySlug[x]).filter(Boolean);

    // Ayni kategorideki komsulardan kayan bir pencere. Her sayfa hem link verir
    // hem link alir; boylece kategori icinde hicbir sayfa oksuz kalmaz.
    const kardesler = rehber.filter((x) => x.kategori === r.kategori);
    const bas = kardesler.findIndex((x) => x.slug === r.slug);
    const komsular = Array.from({ length: Math.min(6, kardesler.length - 1) },
      (_, i) => kardesler[(bas + 1 + i) % kardesler.length])
      .filter((x) => x.slug !== r.slug && !r.ilgili.includes(x.slug));

    const makale = {
      "@type": "TechArticle",
      "@id": site.origin + path + "#makale",
      headline: r.h1,
      name: r.h1,
      description: r.ozet,
      about: r.soru,
      inLanguage: "tr-TR",
      dateModified: bugun,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      mainEntityOfPage: site.origin + path,
      articleSection: k.ad,
    };

    // Adim adim anlatilan sayfalarda HowTo
    const nasil = r.kategori === "yol-durumlari" ? {
      "@type": "HowTo",
      name: r.h1,
      description: r.ozet,
      inLanguage: "tr-TR",
      step: r.yapilacaklar.map((y, i) => ({
        "@type": "HowToStep", position: i + 1, name: y.slice(0, 70), text: y,
      })),
    } : null;

    const body = `
<section class="hero hero--rehber">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow"><a href="/rehber/${k.slug}/">${esc(k.ad)}</a></span>
    <h1>${esc(r.h1)}</h1>
    <p class="lede">${esc(r.soru)}</p>
  </div></div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="rehber-govde">
      <div class="prose">
        ${cevapKutusu(r)}
        <h2>Ne anlama geliyor?</h2>
        ${r.aciklama.map((p) => `<p>${esc(p)}</p>`).join("")}

        <h2>Muhtemel sebepler</h2>
        ${sebepTablosu(r)}

        <h2>Ne yapmalısınız</h2>
        <ul class="ticks">${r.yapilacaklar.map((y) => `<li>${esc(y)}</li>`).join("")}</ul>

        <h2>Ne yapmamalısınız</h2>
        <ul class="crosses">${r.yapilmayacaklar.map((y) => `<li>${esc(y)}</li>`).join("")}</ul>

        <h2>Ne zaman çekici gerekir?</h2>
        <p>${esc(r.cekiciNe)}</p>
      </div>

      <aside class="rehber-yan">
        <div class="card">
          <h3>Hemen yardım</h3>
          <p class="muted">${esc(s.short)}</p>
          <a class="btn" href="${links.tel}" data-track="tel-rehber-yan">${esc(site.phoneDisplay)}</a>
          <a class="btn btn--wa" href="${links.wa}" rel="noopener">WhatsApp</a>
          <p class="muted" style="font-size:13.5px">7/24 açık · ortalama ${site.claims.avgEta} dk · sabit fiyat</p>
        </div>
        ${ilgili.length ? `<div class="card">
          <h3>İlgili konular</h3>
          <ul class="yan-liste">${ilgili.map((x) => `<li><a href="/rehber/${x.slug}/">${esc(x.h1)}</a></li>`).join("")}</ul>
        </div>` : ""}
        <div class="card">
          <h3>Bu sayfa hakkında</h3>
          <p class="muted" style="font-size:14px">Genel bilgilendirme amaçlıdır ve yerinde yapılacak bir arıza tespitinin yerine geçmez. Emin olmadığınız durumda aracı sürmeyin ve bize danışın.</p>
        </div>
      </aside>
    </div>
  </div>
</section>

${yerelBlok(r)}
${faqBlock(r.faq, `${r.h1} — sık sorulanlar`)}

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Rehberde gezinin</h2></div>
    <div class="chips">
      ${ilgili.map((x) => `<a class="chip" href="/rehber/${x.slug}/">${esc(x.h1)}</a>`).join("")}
      ${komsular.map((x) => `<a class="chip" href="/rehber/${x.slug}/">${esc(x.h1)}</a>`).join("")}
      <a class="chip" href="/rehber/${k.slug}/">Tüm ${esc(k.ad.toLowerCase())}</a>
      <a class="chip" href="/rehber/">Arıza rehberi ana sayfa</a>
    </div>
  </div>
</section>

${ctaBand("Bu arıza için yardım gerekiyorsa", `Arayın, ${s.name.toLowerCase()} için size en yakın aracı yönlendirelim.`)}`;

    out.push({
      path,
      html: page({
        path,
        current: "/rehber/",
        title: mkTitle(r.h1),
        description: `${r.soru} ${r.ozet} Muhtemel sebepler, ne yapmalı, ne zaman çekici gerekir.`,
        breadcrumbs: [
          { label: "Ana sayfa", href: "/" },
          { label: "Arıza Rehberi", href: "/rehber/" },
          { label: k.ad, href: `/rehber/${k.slug}/` },
          { label: r.h1 },
        ],
        schema: [makale, nasil, faqSchema(r.faq)],
        ogType: "article",
        body,
      }),
    });
  }

  return out;
}
