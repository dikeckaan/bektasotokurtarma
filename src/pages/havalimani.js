/**
 * /sabiha-gokcen-havalimani-cekici/
 *
 * Pendik'in en belirgin referans noktasi ve kendi basina bir arama terimi.
 * Havalimani Sanayi Mahallesi sinirlarinda (OSM); konum ve sure oradan.
 */
import { site } from "../data/site.js";
import { mahalleler, mahalleBySlug, komsular } from "../data/mahalleler.js";
import { comboServices } from "../data/services.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { varisDk, yolKm } from "../lib/sure.js";
import { esc, list, mkTitle } from "../lib/util.js";
import { faqSchema, serviceSchema } from "../lib/schema.js";

export function havalimaniPage() {
  const path = "/sabiha-gokcen-havalimani-cekici/";
  const evi = mahalleler.find((m) => m.noktalar.some((n) => n.tur === "havalimani")) || mahalleBySlug.sanayi;
  const saw = evi.noktalar.find((n) => n.tur === "havalimani")?.nokta || evi.nokta;
  const eta = varisDk(saw);
  const km = Math.round(yolKm(saw));
  const cevre = [evi, ...komsular(evi)];

  const faq = [
    ["Sabiha Gökçen'e çekici kaç dakikada gelir?",
     `Pendik'teki garajımızdan havalimanına yol mesafesi yaklaşık ${km} km, tahmini varışımız ${eta} dakika. Kurtköy-Pendik Bağlantısı ve TEM'in yoğun olduğu saatlerde birkaç dakika uzayabilir; kesin süreyi çağrı anında söylüyoruz.`],
    ["Otoparkta aküm bitti, çekici mi gerekir?",
     "Çoğu zaman hayır. Uzun süre park edilen araçlarda akü boşalır; önce yerinde akü takviyesi yapıyoruz. Araç çalışırsa çekici ücreti ödemiyorsunuz, akü takviye 750 ₺'den başlıyor."],
    ["Uçuşum var, aracı bırakıp gidebilir miyim?",
     "Açık alandaki araçlar için anahtarı teslim edip gidebilirsiniz; aracı söylediğiniz servise ya da adrese götürüp teslim fotoğrafını WhatsApp'tan gönderiyoruz. Uçuş saatini çağrıda söylerseniz sırayı ona göre ayarlıyoruz."],
    ["Otopark katını ve yerini nasıl tarif edeyim?",
     "Otopark adını, katını ve kolon/bölge numarasını söylemeniz yeterli. Mümkünse WhatsApp'tan bir fotoğraf ve konum gönderin; alçak tavanlı katlar için kızaklı aracı ona göre yönlendiriyoruz."],
    ["Havalimanından başka ilçeye ya da şehre taşıyor musunuz?",
     "Evet. Pendik içindeki servislere 1.500 ₺'den, Anadolu Yakası'nın diğer ilçelerine 2.400 ₺'den başlayan fiyatla taşıyoruz. Şehirlerarası taşımada fiyatı mesafeye göre yola çıkmadan yazılı veriyoruz."],
  ];

  const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">Pendik · ${esc(evi.tam)}</span>
      <h1>Sabiha Gökçen Havalimanı Çekici<br><em>7/24 otopark ve yol</em></h1>
      <p class="lede">Sabiha Gökçen otoparkında aküsü biten, lastiği inen ya da hiç çalışmayan araçlar için 7/24 çekici ve yol yardım. Pendik'teki garajımızdan havalimanına tahmini varış ${eta} dakika.</p>
      <div class="btn-row">
        <a class="btn" href="${links.tel}" data-track="tel-hero">Hemen ara: ${esc(site.phoneDisplay)}</a>
        <a class="btn btn--ghost" href="${links.wa}" rel="noopener" data-track="wa-hero">WhatsApp'tan konum gönder</a>
      </div>
      <p class="hero-note"><span>Tahmini varış: ${eta} dk</span><span>Garaja ~${km} km</span><span>Gece farkı yok</span></p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>Havalimanında en sık karşılaştığımız durumlar</h2>
        <p>Seyahat dönüşü otoparkta günlerce bekleyen araçlarda akü boşalabilir; havalimanında en sık karşılaşılan durum budur. Otopark rampasında ya da terminal yolunda inen lastikler ve hiç çalışmayıp servise taşınması gereken araçlar da sık görülür.</p>
        <p>Önce yerinde müdahaleyi deniyoruz: akü takviyesi ya da stepne takma ile araç yürüyebiliyorsa çekici ücreti çıkmıyor. Yürümüyorsa aracı kayar kasa çekiciyle istediğiniz servise, eve ya da otoparka götürüyoruz.</p>
        <h3>Ararken bunları söyleyin</h3>
        <ul class="ticks">
          <li>Otopark adı, kat ve kolon/bölge numarası</li>
          <li>Aracın markası, modeli ve vites tipi</li>
          <li>Sorun: akü, lastik, çalışmıyor, kaza</li>
          <li>Uçuş saatiniz varsa — sırayı ona göre ayarlıyoruz</li>
        </ul>
      </div>
      <div class="local">
        <h3>Havalimanı saha bilgisi</h3>
        <dl>
          <dt>Tahmini varış</dt><dd>${eta} dakika</dd>
          <dt>Garaja yol mesafesi</dt><dd>~${km} km</dd>
          <dt>Mahalle</dt><dd><a href="${evi.path}">${esc(evi.tam)}</a>, Pendik</dd>
          <dt>Bağlantı yolları</dt><dd>${esc(list(evi.yollar.slice(0, 4)))}</dd>
          <dt>Çalışma saatleri</dt><dd>7 gün 24 saat</dd>
          <dt>Ödeme</dt><dd>${esc(site.payments.join(", "))}</dd>
        </dl>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Hizmetler</span>
      <h2>Havalimanı ve çevresinde verdiğimiz hizmetler</h2>
    </div>
    <div class="chips">
      ${comboServices.map((s) => `<a class="chip" href="/pendik-${s.slug}/">Pendik ${esc(s.comboLabel.toLowerCase())}</a>`).join("")}
    </div>
    <div class="sec-head" style="margin-top:44px"><h2>Havalimanı çevresindeki mahalleler</h2></div>
    <div class="chips">
      ${cevre.map((m) => `<a class="chip" href="${m.path}">${esc(m.ad)} çekici · ${m.eta} dk</a>`).join("")}
    </div>
  </div>
</section>

${faqBlock(faq, "Sabiha Gökçen çekici hakkında sık sorulanlar")}
${ctaBand("Havalimanında mı kaldınız?", `Tahmini ${eta} dakikada otoparktayız. Arayın, süreyi ve net fiyatı hemen söyleyelim.`)}`;

  return {
    path,
    html: page({
      path,
      current: "/bolgeler/",
      title: mkTitle("Sabiha Gökçen Havalimanı Çekici – 7/24"),
      description: `Sabiha Gökçen Havalimanı otoparkında akü takviye, lastik değişimi ve oto çekici. Pendik'teki garajımızdan tahmini ${eta} dakikada yanınızdayız. 7/24, sabit fiyat.`,
      breadcrumbs: [
        { label: "Ana sayfa", href: "/" },
        { label: "Pendik Oto Kurtarma", href: "/pendik-oto-kurtarma/" },
        { label: "Sabiha Gökçen Havalimanı Çekici" },
      ],
      schema: [
        faqSchema(faq),
        serviceSchema({
          name: "Sabiha Gökçen Havalimanı Çekici",
          description: "Sabiha Gökçen Havalimanı otoparkları ve bağlantı yollarında 7/24 oto çekici, akü takviye ve lastik değişimi.",
          url: path,
          areaNames: [],
          places: [{ "@type": "Airport", name: "İstanbul Sabiha Gökçen Uluslararası Havalimanı", iataCode: "SAW",
            geo: { "@type": "GeoCoordinates", latitude: saw[1], longitude: saw[0] } }],
          price: "750 ₺'den başlayan",
        }),
      ],
      body,
    }),
  };
}
