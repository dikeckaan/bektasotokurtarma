/**
 * Pendik mahalle sayfalari — /pendik/<mahalle>-cekici/
 *
 * 36 sayfa ayni sablonu paylasiyor; ince/kopya icerige dusmemek icin her
 * paragraf mahallenin kendi verisinden kuruluyor: icinden gecen yollar,
 * sinirindaki mahalleler, icindeki istasyon/hastane/AVM/sanayi sitesi,
 * yuzolcumu ve garaja uzakligi. Veri OpenStreetMap'ten (pendik-geo.js);
 * metinde gecen her yer adi haritada gercekten o mahallenin icinde.
 */
import { site } from "../data/site.js";
import { districtBySlug } from "../data/districts.js";
import { mahalleler, komsular, yakindanUzaga } from "../data/mahalleler.js";
import { comboServices, sortedServices } from "../data/services.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { pendikMapSvg, yakinGorunumde } from "../lib/map.js";
import { esc, list, pick, mkTitle } from "../lib/util.js";
import { faqSchema, serviceSchema } from "../lib/schema.js";

const pendik = districtBySlug.pendik;
const km2Yazi = (v) => (v < 1 ? v.toFixed(2) : v.toFixed(1)).replace(".", ",");
const sira = (m) => yakindanUzaga.indexOf(m) + 1;

/* ------------------------------------------------------- acilislar */

const ACILIS = [
  (m) => `${m.loc} aracınız yolda kaldıysa Pendik'teki garajımızdan tahminen ${m.eta} dakikada yanınızdayız. Oto çekici, akü takviye, lastik değişimi ve kaza sonrası kurtarma — 7 gün 24 saat, gece ve bayram farkı olmadan.`,
  (m) => `${m.tam} için 7/24 çekici ve yol yardım. Garajımız ${m.km} km uzakta; çağrıyı aldığımız an en yakın aracı yönlendiriyor, tahmini ${m.eta} dakikalık varış süresini ve net fiyatı telefonda söylüyoruz.`,
  (m) => `Bektaş Oto Kurtarma, ${m.gen} de dahil olduğu Pendik'in 36 mahallesine 7 gün 24 saat çıkıyor. ${m.dat} tahmini varışımız ${m.eta} dakika; fiyatı yola çıkmadan söylüyor, sonradan değiştirmiyoruz.`,
  (m) => `${m.loc} akü bitti, lastik patladı ya da araç hiç çalışmıyor — hangisi olursa olsun tek telefonla çözüyoruz. Pendik'teki garajımızdan ${m.dat} tahmini varış ${m.eta} dakika.`,
];

/* ------------------------------------------- mahalle karakteri (tip) */

const TIP = {
  kent: [
    (m) => `${m.tam} yerleşimi sık, sokakları dar bir mahalle (${km2Yazi(m.km2)} km²). Dar sokakta büyük kasa çekici manevra yapamadığı için gerekirse kompakt aracımızı yönlendiriyor, apartman ve site otoparklarındaki alçak tavanlar için kızaklı sistemle çalışıyoruz.`,
    (m) => `${km2Yazi(m.km2)} km²'lik ${m.tam} çoğunlukla konut alanı; böyle mahallelerde en sık karşılaşılan durum, park halindeyken çalışmayan araçlar ve bitmiş akülerdir. Önce yerinde müdahaleyi deniyoruz — araç yerinde çalışırsa çekici ücreti ödemiyorsunuz.`,
  ],
  sahil: [
    (m) => `${m.tam} sahil şeridinde (${km2Yazi(m.km2)} km²). Sahil Bulvarı boyunca park yasağı olan noktalarda kalan araçları trafiği kapatmadan, en yakın güvenli cebe çekip yüklüyoruz.`,
    (m) => `Sahile inen ${m.tam} (${km2Yazi(m.km2)} km²), hafta sonları ve yaz akşamları Pendik'in en kalabalık bölgelerinden biri. Bu saatlerde yükleme noktasını sahil trafiğini kesmeyecek şekilde seçiyor, gerekirse aracı ara sokağa alıp orada yüklüyoruz.`,
  ],
  sanayi: [
    (m) => `${m.tam} (${km2Yazi(m.km2)} km²) konutla iş alanlarının iç içe olduğu bir mahalle. Servis dışı kalan binek araçların yanında panelvan ve 3,5 tona kadar ticari araçları da tek seferde taşıyabiliyoruz.`,
    (m) => `${km2Yazi(m.km2)} km²'lik ${m.tam} Pendik'in iş ve sanayi tarafında. Gün içinde servis ile sanayi sitesi arasında araç transferi, gece ise yolda kalan ticari araçlar için çağrılabiliyoruz.`,
  ],
  kirsal: [
    (m) => `${m.tam} Pendik'in kuzeyinde, Ömerli tarafında geniş bir kırsal mahalle (${km2Yazi(m.km2)} km²). Köy yollarında mesafe uzun olduğu için tahmini süreyi çağrı anında aracın gerçek konumuna bakarak ayrıca teyit ediyoruz.`,
    (m) => `${km2Yazi(m.km2)} km² yüzölçümüyle ${m.tam} Pendik'in en geniş mahallelerinden. Toprak ve stabilize yollarda kalan, çamura ya da kara saplanan araçlar için vinçli kurtarma yapıyoruz; kış aylarında buzlanmaya karşı zincirli çıkıyoruz.`,
  ],
};

/* ------------------------------------------------------ yollar */

function yolParagrafi(m) {
  if (!m.yollar.length) return "";
  const parca = [`${m.tam} sınırları içinden ${list(m.yollar)} geçiyor.`];
  const y = m.yollar.join(" ");
  if (/D-100/.test(y)) {
    parca.push("D-100 (E-5) üzerinde kalan araçlar için emniyet şeridinde reflektörlü yükleme yapıyoruz; yan yola çıkılabilecek en yakın noktayı telefonda birlikte belirliyoruz.");
  } else if (/TEM|Kuzey Marmara/.test(y)) {
    parca.push("Otoyolda arıza yapan araçlar için ilk iş güvenlik: aracınızı emniyet şeridine alıp bariyerin arkasında bekleyin, uyarı üçgenini koyun; yüklemeyi gece görüş ekipmanıyla yapıyoruz.");
  } else if (/Sahil Bulvarı/.test(y)) {
    parca.push("Sahil Bulvarı'nda yükleme için trafiği en az etkileyen noktayı seçiyoruz.");
  } else if (/Kurtköy-Pendik Bağlantısı|Ankara Caddesi/.test(y)) {
    parca.push("Ankara Caddesi ve Kurtköy-Pendik Bağlantısı Pendik'in kuzey-güney ana aksları; bu güzergâhlarda kalan araca, akşam yoğunluğunda dahi en kısa yoldan ulaşıyoruz.");
  } else {
    parca.push(`WhatsApp'tan konum gönderemiyorsanız ${m.yollar[0]} üzerindeki en yakın kavşağı ya da dükkânı söylemeniz yeterli.`);
  }
  return parca.join(" ");
}

/* ----------------------------------------------- referans noktalar */

const NOKTA = {
  havalimani: (n) => `${n.ad} otoparklarında aküsü biten, lastiği inen ya da çalışmayan araçları çıkarıyoruz; uçuşa yetişmesi gereken müşterilere sıra önceliği veriyoruz.`,
  istasyon: (n) => `${n.ad} istasyonu çevresi konum tarifinde en kolay referans; istasyon çıkışının adını söylemeniz yeterli.`,
  sanayi: (n) => `${n.ad} içindeki servis dışı araçları taşıyor, sanayi ile servis ya da ev arasında transfer yapıyoruz.`,
  avm: (n) => `${n.ad} otoparkında kalan araçlar için otopark güvenliğiyle görüşüp kızaklı çekiciyle giriyoruz.`,
  hastane: (n) => `${n.ad} otoparkında kalan araçlara da çıkıyoruz; hasta yakını olarak bekleyemeyecekseniz anahtarı güvenliğe bırakmanız yeterli.`,
  iskele: (n) => `${n.ad} çevresinde kalan araçları alıp istediğiniz servise götürüyoruz.`,
  universite: (n) => `${n.ad} çevresindeki otoparklardan da çağrı alıyoruz.`,
  baraj: (n) => `${n.ad} çevresindeki köy ve orman yollarında kalan araçlara çekişli araçla çıkıyoruz.`,
};

function noktaParagrafi(m) {
  if (!m.noktalar.length) return "";
  // Ayni turden en fazla bir cumle, toplam en fazla uc cumle
  const gorulen = new Set();
  const cumleler = [];
  for (const n of m.noktalar) {
    if (gorulen.has(n.tur) || cumleler.length >= 3) continue;
    gorulen.add(n.tur);
    cumleler.push(NOKTA[n.tur](n));
  }
  return cumleler.join(" ");
}

/* ---------------------------------------------------------- S.S.S. */

function sss(m, kk) {
  const tipSoru = {
    kent: [`${m.loc} kapalı otoparktan araç çıkarabiliyor musunuz?`,
      `Evet. ${m.gen} apartman ve site otoparklarının çoğu alçak tavanlı; bu otoparklara kızaklı sistemle giriyoruz. Site yönetiminden izin gerekiyorsa çağrı sırasında not alıyor, varışta güvenlikle biz görüşüyoruz.`],
    sahil: [`${m.loc} sahilde kalan aracı nereye götürüyorsunuz?`,
      `İstediğiniz yere: yetkili servis, sanayi sitesi, ev ya da otopark. Pendik içindeki taşımalar 1.500 ₺'den başlıyor; Kadıköy, Ataşehir gibi başka ilçelerdeki servislere de aynı gün götürüyoruz.`],
    sanayi: [`${m.loc} ticari araç ve panelvan taşıyor musunuz?`,
      `Evet. 3,5 tona kadar panelvan, kamyonet ve hafif ticari araçları kayar kasa çekiciyle taşıyoruz. Daha ağır araçlar için çağrıda aracın tonajını sorup uygun ekipmanı yönlendiriyoruz.`],
    kirsal: [`${m.loc} köy yollarına da geliyor musunuz?`,
      `Evet. ${m.tam} sınırlarındaki köy ve orman yollarına da çıkıyoruz. Mesafe uzun olduğu için tahmini süreyi telefonda aracın gerçek konumuna göre ayrıca söylüyoruz; uzak nokta diye ek ücret almıyoruz.`],
  }[m.tip];

  return [
    [`${m.dat} çekici kaç dakikada gelir?`,
     `Pendik'teki garajımızdan ${m.dat} yol mesafesi yaklaşık ${m.km} km; tahmini varış süremiz ${m.eta} dakika. Akşam 17:00–20:00 arası D-100 yoğunluğunda bu süre birkaç dakika uzayabilir, gece ise kısalır. Kesin süreyi çağrı anında söylüyoruz.`],
    [`${m.ad} çekici ücreti ne kadar?`,
     `Pendik içi oto çekici 1.500 ₺'den, akü takviye ve yol yardım 750 ₺'den başlıyor. Aracınızın türünü ve gideceği adresi söylediğinizde net tutarı telefonda veriyoruz; yola çıktıktan sonra değişmiyor, gece ve bayram farkı yok.`],
    [`${m.loc} hangi noktalara geliyorsunuz?`,
     `${m.gen} tamamına: ${m.yollar.length ? list(m.yollar.slice(0, 4)) + " dahil tüm cadde ve sokaklara" : "tüm cadde ve sokaklarına"}${m.noktalar.length ? `, ${list(m.noktalar.slice(0, 3).map((n) => n.ad))} çevresine` : ""}. Sınır komşusu ${list(kk.slice(0, 3).map((k) => k.tam))} için de aynı ekip çıkıyor.`],
    tipSoru,
    [`${m.loc} gece de çekici çağırabilir miyim?`,
     `Evet. 24 saat vardiyalı çalışıyoruz ve gece çağrıları için ek ücret almıyoruz. Gece trafiği olmadığı için ${m.dat} genellikle tahmini sürenin de altında ulaşıyoruz.`],
  ];
}

/* ---------------------------------------------------------- sayfa */

export function mahallePages() {
  return mahalleler.map((m) => {
    const kk = komsular(m);
    const faq = sss(m, kk);
    const yakin = yakinGorunumde(m.slug);

    const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">Pendik · ${esc(m.tam)}</span>
      <h1>${esc(m.ad)} Çekici<br><em>7/24 oto kurtarma</em></h1>
      <p class="lede">${esc(pick(ACILIS, m.slug + "acilis")(m))}</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note">
        <span>Tahmini varış: ${m.eta} dk</span>
        <span>Garaja ~${m.km} km</span>
        <span>Sabit fiyat</span>
      </p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>${esc(m.loc)} çekici ve yol yardım</h2>
        <p>${esc(pick(TIP[m.tip], m.slug + "tip")(m))}</p>
        ${yolParagrafi(m) ? `<p>${esc(yolParagrafi(m))}</p>` : ""}
        ${noktaParagrafi(m) ? `<p>${esc(noktaParagrafi(m))}</p>` : ""}
        <p>${esc(`${m.tam}; ${list(kk.map((k) => k.tam))} ile sınır komşusu. Garajımıza yakınlık sıralamasında Pendik'in 36 mahallesi arasında ${sira(m)}. sırada.`)}</p>
      </div>
      <div class="local">
        <h3>${esc(m.ad)} saha bilgisi</h3>
        <dl>
          <dt>Tahmini varış</dt><dd>${m.eta} dakika</dd>
          <dt>Garaja yol mesafesi</dt><dd>~${m.km} km</dd>
          <dt>Yüzölçümü</dt><dd>${km2Yazi(m.km2)} km²</dd>
          ${m.yollar.length ? `<dt>Ana yollar</dt><dd>${esc(list(m.yollar))}</dd>` : ""}
          ${m.noktalar.length ? `<dt>Referans noktalar</dt><dd>${esc(m.noktalar.slice(0, 5).map((n) => n.ad).join(", "))}</dd>` : ""}
          <dt>İlçe</dt><dd><a href="/pendik-oto-kurtarma/">Pendik</a>, İstanbul</dd>
          <dt>Çalışma saatleri</dt><dd>7 gün 24 saat, bayram dahil</dd>
        </dl>
        <p style="margin-top:16px;font-size:14.5px"><a href="/varis-suresi/">Konumunuza göre varış süresi</a></p>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Harita</span>
      <h2>${esc(m.ad)} Pendik haritasında</h2>
      <p class="lede">${esc(m.tam)} açık renkle işaretli. Diğer mahallelere dokunarak o mahallenin sayfasına geçebilirsiniz.</p>
    </div>
    ${pendikMapSvg({ id: "mahalle-harita", vurgu: m.slug, yakin })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Hizmetler</span>
      <h2>${esc(m.loc)} verdiğimiz hizmetler</h2>
    </div>
    <div class="chips">
      ${comboServices.map((s) => `<a class="chip" href="/pendik-${s.slug}/">Pendik ${esc(s.comboLabel.toLowerCase())} · ${esc(s.price.replace(" başlayan", ""))}</a>`).join("")}
    </div>
    <p style="margin-top:24px" class="muted">Diğer hizmetler: ${sortedServices.filter((s) => !s.combo).map((s) => `<a href="/hizmetler/${s.slug}/">${esc(s.name)}</a>`).join(" · ")}</p>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Komşu mahalleler</span>
      <h2>${esc(m.ad)} çevresinde çekici</h2>
    </div>
    <div class="chips">
      ${kk.map((k) => `<a class="chip" href="${k.path}">${esc(k.ad)} çekici · ${k.eta} dk</a>`).join("")}
      <a class="chip" href="/pendik-oto-kurtarma/">Pendik'in tüm mahalleleri</a>
    </div>
  </div>
</section>

${faqBlock(faq, `${m.ad} çekici hakkında sık sorulanlar`)}
${ctaBand(`${m.loc} yolda mı kaldınız?`, `Tahmini ${m.eta} dakikada yanınızdayız. Arayın, süreyi ve net fiyatı hemen söyleyelim.`)}`;

    return {
      path: m.path,
      html: page({
        path: m.path,
        current: "/bolgeler/",
        title: mkTitle(`${m.ad} Çekici – Pendik 7/24 Oto Kurtarma`),
        description: `${m.tam} (Pendik) 7/24 oto çekici ve yol yardım. Tahmini ${m.eta} dakikada yanınızdayız${m.yollar.length ? `; ${m.yollar.slice(0, 2).join(", ")} dahil tüm sokaklar` : ""}. Sabit fiyat, sigortalı taşıma.`,
        breadcrumbs: [
          { label: "Ana sayfa", href: "/" },
          { label: "Pendik Oto Kurtarma", href: "/pendik-oto-kurtarma/" },
          { label: `${m.ad} Çekici` },
        ],
        schema: [
          faqSchema(faq),
          serviceSchema({
            name: `${m.ad} Çekici`,
            description: `${m.loc} (Pendik, İstanbul) 7/24 oto çekici, yol yardım ve kaza kurtarma hizmeti.`,
            url: m.path,
            areaNames: [],
            places: [{ "@type": "Place", name: `${m.tam}, Pendik, İstanbul`,
              geo: { "@type": "GeoCoordinates", latitude: m.nokta[1], longitude: m.nokta[0] },
              containedInPlace: { "@type": "AdministrativeArea", name: `${pendik.name}, İstanbul` } }],
            price: "1.500 ₺'den başlayan",
          }),
        ],
        body,
      }),
    };
  });
}
