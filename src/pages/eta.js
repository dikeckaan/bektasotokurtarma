/**
 * /varis-suresi/ — konumdan bolge tespiti ve ortalama varis suresi.
 *
 * DURUSTLUK NOTU: canli arac takibi yok. Yapilan sey, konumun hangi ilce
 * sinirlari icinde kaldigini bulup o ilcenin ortalama varis suresini
 * gostermek. Sayfa bunu acikca yaziyor — "canli" gibi sunmak, dogru sureyi
 * gostermemekten daha zararli olur.
 *
 * JS yalnizca bu sayfada; diger 115 sayfa sifir JS kaliyor.
 */
import { site } from "../data/site.js";
import { districts } from "../data/districts.js";
import { geo } from "../data/geo.js";
import { comboServices } from "../data/services.js";
import { page, ctaBand, faqBlock, links } from "../lib/layout.js";
import { mapSvg } from "../lib/map.js";
import { esc, etaText, mkTitle } from "../lib/util.js";
import { faqSchema } from "../lib/schema.js";

const hizli = districts.filter((d) => d.eta).sort((a, b) => a.eta - b.eta);

export function etaPage() {
  const path = "/varis-suresi/";

  // Tarayiciya gidecek veri: ilce sinirlari (nokta-icinde-poligon icin) ve sureler
  const veri = geo.map((g) => {
    const d = districts.find((x) => x.slug === g.slug);
    return { s: g.slug, n: d.name, e: d.eta || 0, t: etaText(d), r: g.halkalar };
  });

  const faq = [
    ["Çekici kaç dakikada gelir?",
     `Anadolu Yakası genelinde ortalama ${site.claims.avgEta} dakika. İlçeye göre 12 ile 41 dakika arasında değişiyor: Kadıköy, Ataşehir ve Ümraniye'de 12-15 dakika, Pendik ve Tuzla'da 23-26 dakika, Şile'de 41 dakika. Adalar'a taşıma feribot seferine bağlı planlanıyor.`],
    ["Bu süreler garanti mi?",
     "Hayır, ortalama. Son üç ayda o ilçeye giden çağrıların ortalaması. Sizin bulunduğunuz nokta, saat ve trafik durumu bu ortalamayı birkaç dakika değiştirebilir. Çağrıyı aldığımızda size en yakın aracın gerçek konumuna bakıp kesin süreyi söylüyoruz."],
    ["Konumumu paylaşmak zorunda mıyım?",
     "Hayır. Haritadan ilçenizi seçerek de aynı sonucu görebilirsiniz. Konum izni verirseniz tarayıcınız koordinatı yalnızca bu sayfada, kendi cihazınızda kullanır — bize veya başka bir yere gönderilmez."],
    ["Gece daha mı geç geliyorsunuz?",
     "Tam tersi. Gece trafiği olmadığı için ulaşım süresi kısalıyor. Ekiplerimiz 24 saat vardiyalı çalışıyor ve gece için ek ücret alınmıyor."],
    ["Şile ve Adalar neden bu kadar uzun?",
     "Şile mesafenin kendisi uzun olduğu için — Çekmeköy'den Şile merkeze yol tek başına yarım saati aşıyor. Adalar'da ise motorlu taşıt kısıtlı olduğundan taşıma feribot seferine göre planlanıyor; çağrıda ilk uygun sefer saatini birlikte belirliyoruz."],
  ];

  const body = `
<section class="hero">
  <div class="wrap">
    <div class="hero-in">
      <span class="eyebrow">Varış süresi</span>
      <h1>Çekici size<br><em>kaç dakikada</em> ulaşır?</h1>
      <p class="lede">Konumunuzu paylaşın ya da haritadan ilçenizi seçin; o bölgedeki ortalama varış süremizi gösterelim. Kesin süreyi telefonda, size en yakın aracın gerçek konumuna bakarak söylüyoruz.</p>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="eta-tool">
      <div class="eta-map">
        ${mapSvg({ id: "eta-harita", secilebilir: true })}
      </div>
      <div class="eta-panel">
        <div class="eta-actions">
          <button type="button" class="btn" id="konum-btn">Konumumu kullan</button>
          <label class="sr-only" for="ilce-sec">İlçe seçin</label>
          <select id="ilce-sec">
            <option value="">Ya da ilçe seçin…</option>
            ${districts.map((d) => `<option value="${d.slug}">${esc(d.name)}</option>`).join("")}
          </select>
        </div>

        <div class="eta-sonuc" id="sonuc" aria-live="polite">
          <p class="eta-bos">Henüz bir bölge seçilmedi. Haritadan ilçenize dokunun ya da konumunuzu paylaşın.</p>
        </div>

        <p class="eta-not">Konumunuz cihazınızdan çıkmaz — hesap bu sayfada, tarayıcınızda yapılır. Sunucumuza hiçbir koordinat gönderilmez.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Şeffaflık</span>
      <h2>Bu süre neye göre hesaplanıyor?</h2>
      <p class="lede">Sayfada gördüğünüz dakika, canlı bir araç takibinden değil; son üç ayda o ilçeye giden çağrıların ortalamasından geliyor. Bunu açıkça yazıyoruz çünkü "canlı" görünen ama gerçek olmayan bir sayı, hiç sayı vermemekten daha kötüdür.</p>
    </div>
    <div class="grid grid--3">
      <div class="prose">
        <h3>Süreyi uzatan şeyler</h3>
        <ul class="ticks">
          <li>Akşam 17:00–20:00 arası D-100 ve TEM yoğunluğu</li>
          <li>Kapalı otopark, site içi geçiş izni beklemek</li>
          <li>Konumun tarif edilememesi — en büyük gecikme sebebi</li>
          <li>Şile, Riva ve Ağva gibi mesafenin kendisinin uzun olduğu noktalar</li>
        </ul>
      </div>
      <div class="prose">
        <h3>Süreyi kısaltan şeyler</h3>
        <ul class="ticks">
          <li>Gece ve hafta sonu sabahları — trafik yok</li>
          <li>Ana arter üzerinde olmak (D-100, TEM, Şile Otoyolu)</li>
          <li>WhatsApp'tan konum göndermek: adres tarifi hiç konuşulmuyor</li>
          <li>Araç ve arıza bilgisini ilk aramada söylemek</li>
        </ul>
      </div>
      <div class="prose">
        <h3>Neyi ölçmüyoruz</h3>
        <p>Aracın kaç dakikada yükleneceğini bu süreye katmıyoruz. Varış süresi, çekicinin yanınıza gelmesine kadar geçen zamandır; yükleme normal şartlarda 10 dakikayı geçmez ve ayrıca söylenir.</p>
        <p class="muted">Kaza sonrası kurtarmalarda tutanak süreci beklendiği için toplam süre uzayabilir; bu bekleme için ücret almıyoruz.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Tüm bölgeler</span>
      <h2>İlçe ilçe ortalama varış süresi</h2>
      <p class="lede">En hızlıdan en yavaşa. Her satır o ilçenin kendi sayfasına gider; orada mahalle listesi ve saha notlarımız var.</p>
    </div>
    <div class="table-scroll">
      <table>
        <caption>Son üç ayın ortalaması · gece ve gündüz dahil</caption>
        <thead><tr><th scope="col">İlçe</th><th scope="col">Ortalama varış</th><th scope="col">Ana arter</th></tr></thead>
        <tbody>
          ${hizli.map((d) => `<tr>
            <td><a href="/${d.slug}-oto-kurtarma/">${esc(d.name)}</a></td>
            <td>${d.eta} dk</td>
            <td class="muted">${esc(d.arterler[0])}</td>
          </tr>`).join("")}
          <tr><td><a href="/adalar-oto-kurtarma/">Adalar</a></td><td>Randevulu</td><td class="muted">Feribot seferine bağlı</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

${faqBlock(faq, "Varış süresi hakkında sık sorulanlar")}
${ctaBand("Beklemeyin, arayın", "Size en yakın aracın gerçek konumuna bakıp kesin süreyi ve net fiyatı telefonda söylüyoruz.")}

<script>
(function () {
  "use strict";
  var VERI = __VERI__;
  var TEL = ${JSON.stringify(links.tel)};
  var WA = ${JSON.stringify(links.wa)};
  var TELYAZI = ${JSON.stringify(site.phoneDisplay)};

  var sonuc = document.getElementById("sonuc");
  var secim = document.getElementById("ilce-sec");
  var btn = document.getElementById("konum-btn");
  var svg = document.getElementById("eta-harita");

  /** Isin atma yontemi: nokta poligonun icinde mi? */
  function icinde(lon, lat, halka) {
    var v = false;
    for (var i = 0, j = halka.length - 1; i < halka.length; j = i++) {
      var xi = halka[i][0], yi = halka[i][1], xj = halka[j][0], yj = halka[j][1];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) v = !v;
    }
    return v;
  }

  function bolgeBul(lon, lat) {
    for (var i = 0; i < VERI.length; i++) {
      for (var j = 0; j < VERI[i].r.length; j++) {
        if (icinde(lon, lat, VERI[i].r[j])) return VERI[i];
      }
    }
    return null;
  }

  /** Sinirlarin disindaysa en yakin ilce merkezini bul (kaba mesafe). */
  function enYakin(lon, lat) {
    var iyi = null, enAz = Infinity;
    VERI.forEach(function (b) {
      b.r.forEach(function (halka) {
        halka.forEach(function (p) {
          var dx = (p[0] - lon) * 0.75, dy = p[1] - lat;
          var d = dx * dx + dy * dy;
          if (d < enAz) { enAz = d; iyi = b; }
        });
      });
    });
    return { bolge: iyi, km: Math.sqrt(enAz) * 111 };
  }

  function vurgula(slug) {
    svg.querySelectorAll(".mp-g").forEach(function (g) {
      g.classList.toggle("secili", g.getAttribute("data-ilce") === slug);
    });
  }

  function goster(b, uzakKm) {
    vurgula(b.s);
    if (secim.value !== b.s) secim.value = b.s;
    var disarda = uzakKm != null;
    sonuc.innerHTML =
      (disarda
        ? '<p class="eta-uyari">Konumunuz hizmet bölgemizin dışında görünüyor — en yakın bölgemiz ' +
          b.n + ", yaklaşık " + Math.round(uzakKm) + ' km. Yine de arayın, şehirlerarası çekici veriyoruz.</p>'
        : "") +
      '<span class="eta-etiket">' + b.n + " · ortalama varış</span>" +
      '<span class="eta-sure">' + b.t + "</span>" +
      '<div class="btn-row eta-btns">' +
      '<a class="btn" href="' + TEL + '" data-track="tel-eta">Ara: ' + TELYAZI + "</a>" +
      '<a class="btn btn--wa" href="' + WA + '" rel="noopener" data-track="wa-eta">Konum gönder</a>' +
      "</div>" +
      '<p class="eta-alt"><a href="/' + b.s + '-oto-kurtarma/">' + b.n + " oto kurtarma sayfası</a> — mahalle listesi ve saha notları</p>";
  }

  secim.addEventListener("change", function () {
    var b = VERI.filter(function (x) { return x.s === secim.value; })[0];
    if (b) goster(b);
  });

  function haritaSec(el) {
    var slug = el.getAttribute("data-ilce");
    var b = VERI.filter(function (x) { return x.s === slug; })[0];
    if (b) goster(b);
  }
  svg.addEventListener("click", function (e) {
    var g = e.target.closest("[data-ilce]");
    if (g) haritaSec(g);
  });
  svg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var g = e.target.closest("[data-ilce]");
    if (g) { e.preventDefault(); haritaSec(g); }
  });

  btn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      sonuc.innerHTML = '<p class="eta-uyari">Tarayıcınız konum desteklemiyor. Haritadan ilçenizi seçebilirsiniz.</p>';
      return;
    }
    btn.disabled = true;
    btn.textContent = "Konum alınıyor…";
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        btn.disabled = false;
        btn.textContent = "Konumumu kullan";
        var lon = pos.coords.longitude, lat = pos.coords.latitude;
        var b = bolgeBul(lon, lat);
        if (b) goster(b);
        else { var y = enYakin(lon, lat); goster(y.bolge, y.km); }
      },
      function (err) {
        btn.disabled = false;
        btn.textContent = "Konumumu kullan";
        sonuc.innerHTML = '<p class="eta-uyari">' +
          (err.code === 1
            ? "Konum izni verilmedi. Haritadan ilçenizi seçebilirsiniz — sonuç aynı."
            : "Konum alınamadı. Haritadan ilçenizi seçebilirsiniz.") + "</p>";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
})();
</script>`;

  const inlined = body.replace("__VERI__", JSON.stringify(veri));

  return {
    path,
    html: page({
      path,
      current: "/bolgeler/",
      title: mkTitle("Çekici Kaç Dakikada Gelir?"),
      description: `Konumunuza göre çekicinin kaç dakikada ulaşacağını öğrenin. Anadolu Yakası'nın 14 ilçesinde ortalama varış süresi haritası: Kadıköy 12 dk, Ataşehir 14 dk, Pendik 23 dk.`,
      breadcrumbs: [
        { label: "Ana sayfa", href: "/" },
        { label: "Bölgeler", href: "/bolgeler/" },
        { label: "Varış süresi" },
      ],
      schema: [faqSchema(faq)],
      body: inlined,
    }),
  };
}
