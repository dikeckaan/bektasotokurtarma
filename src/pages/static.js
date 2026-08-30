import { site, trustPoints, steps } from "../data/site.js";
import { districts } from "../data/districts.js";
import { sortedServices, comboServices } from "../data/services.js";
import { generalFaq, priceTable } from "../data/faq.js";
import { page, ctaBand, faqBlock, districtGrid, serviceCards, links } from "../lib/layout.js";
import { esc, etaText, mkTitle } from "../lib/util.js";
import { photo } from "../lib/media.js";
import { mapSvg } from "../lib/map.js";
import { faqSchema } from "../lib/schema.js";

const crumb = (label) => [{ label: "Ana sayfa", href: "/" }, { label }];

/* ------------------------------------------------------------ /bolgeler/ */
function bolgeler() {
  const path = "/bolgeler/";
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Hizmet bölgeleri</span>
    <h1>Anadolu Yakası'nın<br><em>${site.claims.districtCount} ilçesi</em></h1>
    <p class="lede">Kadıköy'den Şile'ye kadar tüm Anadolu Yakası'nda 7/24 oto kurtarma. Her ilçeye sabit araç konumlandırdık; aşağıdaki süreler son üç ayın ortalama varış süreleridir.</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">Hemen ara: ${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>
<section class="sec">
  <div class="wrap">
    ${mapSvg({ id: "bolge-harita" })}
    <p style="margin:22px 0 30px"><a href="/varis-suresi/"><b>Konumunuza göre varış süresi hesaplayın</b></a> — haritadan ilçe seçin ya da konumunuzu paylaşın.</p>
    ${districtGrid(districts)}
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Süreler</span>
      <h2>Bu süreler nereden geliyor?</h2>
      <p class="lede">Yukarıdaki dakikalar tahmin değil, son üç ayda o ilçeye giden çağrıların ortalaması. Çağrı anında size özel süreyi ayrıca teyit ediyoruz — çünkü ortalama, sizin bulunduğunuz noktayı bilmez.</p>
    </div>
    <div class="grid grid--3">
      <div class="prose">
        <h3>Neden ilçeye göre değişiyor</h3>
        <p>Anadolu Yakası merkezden doğuya doğru seyrelir. Kadıköy–Ataşehir–Ümraniye üçgeninde araçlarımız birbirine yakın durur; Şile ve Beykoz Riva tarafında mesafe tek başına 30 dakikayı bulabilir.</p>
      </div>
      <div class="prose">
        <h3>Saat de belirleyici</h3>
        <p>D-100 ve TEM'in akşam yoğunluğunda süre uzar, gece yarısı kısalır. Bu yüzden gece çağrılarına gündüzden daha hızlı ulaşırız — ama fiyat aynı kalır.</p>
      </div>
      <div class="prose">
        <h3>Araçları nereye koyduğumuz</h3>
        <p>Filoyu sabit garajda bekletmiyoruz. Vardiya boyunca araçlar çağrı yoğunluğuna göre TEM, D-100 ve Şile Otoyolu bağlantılarına dağıtılır.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>İlçe ve hizmete göre</h2><p class="lede">Aradığınız hizmeti doğrudan bulmak için:</p></div>
    ${districts.map((d) => `<p style="margin-bottom:14px"><a href="/${d.slug}-oto-kurtarma/"><b>${esc(d.name)}</b></a> — ${comboServices.map((s) => `<a href="/${d.slug}-${s.slug}/">${esc(s.comboLabel.toLowerCase())}</a>`).join(" · ")}</p>`).join("")}
  </div>
</section>
${ctaBand()}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle("Hizmet Bölgeleri – Anadolu Yakası"),
    description: `İstanbul Anadolu Yakası'nın 14 ilçesinde 7/24 oto kurtarma: Kadıköy, Üsküdar, Ataşehir, Ümraniye, Maltepe, Kartal, Pendik, Tuzla ve diğerleri. Ortalama ${site.claims.avgEta} dakika.`,
    breadcrumbs: crumb("Bölgeler"), body,
  })};
}

/* ----------------------------------------------------------- /hizmetler/ */
function hizmetler() {
  const path = "/hizmetler/";
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Hizmetler</span>
    <h1>Yolda kalmanın<br><em>her hâli için</em></h1>
    <p class="lede">Çekiciden akü takviyesine, kilitli kapı açmadan şehirlerarası taşımaya kadar tüm hizmetlerimiz Anadolu Yakası'nın 14 ilçesinde 7/24 geçerli.</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">Hemen ara: ${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>
<section class="sec"><div class="wrap">
  <div class="sec-head"><h2>Tüm hizmetlerimiz</h2><p class="lede">Onu da yapıyoruz diye eklenmiş kalem yok; aşağıdaki her hizmet için ayrı ekipman ve ayrı ekip var.</p></div>
  ${serviceCards(sortedServices)}
</div></section>
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Doğru seçim</span>
      <h2>Çekici mi, yol yardım mı?</h2>
      <p class="lede">İkisi arasındaki fark, aracın kendi tekerleği üzerinde yola devam edip edemeyeceğidir. Telefonda belirtiyi anlattığınızda hangisinin gerektiğini biz söylüyoruz.</p>
    </div>
    <div class="grid grid--2">
      <div class="prose">
        <h3>Yol yardım yeterlidir</h3>
        <p>Akü bitmesi, lastik patlaması, yakıt tükenmesi, kilitli kalan anahtar. Bunlar yerinde 15-20 dakikada çözülür ve araç kendi gidişiyle yola devam eder. Bu durumda çekici ücreti ödemezsiniz.</p>
        <p class="muted">Yerinde deneme sonuç vermezse aracı çekiciyle taşırken yalnızca çekici ücretini alıyoruz — iki kez ödeme yok.</p>
      </div>
      <div class="prose">
        <h3>Çekici gerekir</h3>
        <p>Motor çalışmıyor, vites takmıyor, kaza sonrası tekerlek kilitli, yanlış yakıt alınmış ya da araç şarampolde. Bu durumlarda aracı çalıştırmaya zorlamak zararı büyütür; kayar kasa çekici tek doğru yoldur.</p>
        <p class="muted">Otomatik vitesli ve elektrikli araçlar halatla çekilemez; kasalı taşıma zorunludur.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Filo</span>
      <h2>Hangi iş için hangi araç</h2>
      <p class="lede">Anadolu Yakası'nın her yeri aynı araçla çıkılacak yer değil. Çağrıyı alırken adresi sorma sebebimiz bu.</p>
    </div>
    <div class="grid grid--4">
      <div class="card"><h3>Kayar kasa</h3><p>Standart taşımanın tamamı. Tekerlekler yerden tamamen kesilir, şanzımana yük binmez.</p></div>
      <div class="card"><h3>Kızaklı sistem</h3><p>Alçak tavanlı otoparklar ve düşük gövdeli araçlar. Bağdat Caddesi ve plaza otoparkları için.</p></div>
      <div class="card"><h3>Kompakt çekici</h3><p>Moda, Kuzguncuk, Anadoluhisarı gibi dar ve yokuşlu sokaklar. Büyük kasa manevra yapamaz.</p></div>
      <div class="card"><h3>Kapalı kasa</h3><p>Klasik, lüks ve yeni teslim araçlar. Hava koşullarına ve taş sıçramasına kapalı.</p></div>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Nasıl işliyor</span><h2>Üç adım</h2></div>
    <div class="steps">${steps.map((s) => `<div class="step"><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join("")}</div>
  </div>
</section>
${ctaBand()}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle("Hizmetlerimiz – Çekici, Yol Yardım, Akü"),
    description: "Oto çekici, yol yardım, akü takviye, lastik değişimi, yakıt ikmali, kapı açma, kaza kurtarma, motosiklet ve kapalı kasa çekici. Anadolu Yakası'nda 7/24.",
    breadcrumbs: crumb("Hizmetler"), body,
  })};
}

/* ------------------------------------------------------------ /fiyatlar/ */
function fiyatlar() {
  const path = "/fiyatlar/";
  const faq = [
    ["Fiyat neye göre belirleniyor?", "Aracın türü (binek, ticari, motosiklet), bulunduğu yer ve gideceği adres arasındaki mesafe belirleyici. Kapalı otopark, şarampol veya vinç gerektiren durumlar ayrıca değerlendirilir; bunları da telefonda söylüyoruz."],
    ["Yola çıktıktan sonra fiyat değişir mi?", "Değişmez. Telefonda söylediğimiz tutar ödeyeceğiniz tutardır. Tek istisna, çağrıda belirtilmeyen bir durumla karşılaşmamızdır (örneğin araç şarampolde olduğu halde yolda denmişse); bu durumda işlemi başlatmadan önce yeni tutarı size onaylatırız."],
    ["Gece veya bayram farkı var mı?", "Yok. Saat ve güne göre fiyat değiştirmiyoruz."],
    ["Fatura veriyor musunuz?", "Evet, her taşımada fatura düzenliyoruz. Kurumsal ve filo müşterileri için aylık faturalandırma yapabiliyoruz."],
    ...generalFaq.slice(2, 5),
  ];
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Fiyatlandırma</span>
    <h1>Yola çıkmadan<br><em>söylenen fiyat</em></h1>
    <p class="lede">Aşağıdaki tutarlar başlangıç fiyatlarıdır. Net tutarı aracınızın türünü ve konumunuzu öğrendikten sonra telefonda söylüyoruz — ve yola çıktıktan sonra değiştirmiyoruz.</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">Net fiyat için ara: ${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="table-scroll">
      <table>
        <caption>Başlangıç fiyatları · KDV dahil · gece, hafta sonu ve bayram farkı yoktur</caption>
        <thead><tr><th scope="col">Hizmet</th><th scope="col">Kapsam</th><th scope="col">Fiyat</th></tr></thead>
        <tbody>${priceTable.map(([a, b, c]) => `<tr><td>${esc(a)}</td><td class="muted">${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <p class="muted" style="margin-top:18px;max-width:70ch">Şehirlerarası taşımalarda fiyat mesafeye göre hesaplanır ve yola çıkmadan yazılı olarak bildirilir. Köprü ve otoyol geçiş ücretleri fiyata dahildir.</p>
  </div>
</section>
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><h2>Fiyatın içinde ne var?</h2></div>
    <div class="trust">${trustPoints.map((t) => `<div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div>`).join("")}</div>
  </div>
</section>
${faqBlock(faq, "Fiyatlandırma hakkında sık sorulanlar")}
${ctaBand("Aracınız için net fiyat alın", "Marka, konum ve gideceği adres yeterli. Fiyatı telefonda söylüyoruz.")}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle("Oto Çekici Fiyatları – Anadolu Yakası"),
    description: "Anadolu Yakası oto çekici, akü takviye, lastik değişimi ve kurtarma fiyatları. İlçe içi çekici 1.500 ₺'den başlar. Gece ve bayram farkı yok, sabit fiyat.",
    breadcrumbs: crumb("Fiyatlar"),
    schema: [faqSchema(faq)], body,
  })};
}

/* ----------------------------------------------------------------- /sss/ */
function sss() {
  const path = "/sss/";
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Sık sorulan sorular</span>
    <h1>Merak edilenler</h1>
    <p class="lede">Çekici çağırmadan önce en çok sorulan sorular ve net cevapları. Aradığınızı bulamazsanız arayın, telefonda anlatalım.</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>
${faqBlock(generalFaq, "Genel sorular")}
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><h2>Hizmete özel sorular</h2></div>
    <div class="grid grid--3">${sortedServices.map((s) => `<a class="card" href="/hizmetler/${s.slug}/"><h3>${esc(s.name)}</h3><p>${esc(s.faq[0][0])}</p><span class="more">Cevabı gör →</span></a>`).join("")}</div>
  </div>
</section>
${ctaBand()}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle("Sık Sorulan Sorular – Oto Kurtarma"),
    description: "Oto çekici ne kadar sürede gelir, fiyat nasıl belirlenir, kasko çekici karşılar mı, otomatik araç çekilebilir mi? Anadolu Yakası oto kurtarma hakkında tüm cevaplar.",
    breadcrumbs: crumb("S.S.S."),
    schema: [faqSchema(generalFaq)], body,
  })};
}

/* ---------------------------------------------------------- /hakkimizda/ */
function hakkimizda() {
  const path = "/hakkimizda/";
  const years = new Date().getFullYear() - site.foundedYear;
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">Hakkımızda</span>
    <h1>${years} yıldır<br><em>aynı numara</em></h1>
    <p class="lede">Bektaş Oto Kurtarma ${site.foundedYear} yılında ${esc(site.address.district)}'de tek çekiciyle başladı. Bugün ${site.claims.fleetSize} araçlık filoyla Anadolu Yakası'nın ${site.claims.districtCount} ilçesine hizmet veriyoruz — hâlâ aynı aile işletiyor, hâlâ aynı numara.</p>
    <div class="btn-row"><a class="btn" href="${links.tel}">${esc(site.phoneDisplay)}</a></div>
  </div></div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="grid grid--2">
      <div class="prose">
        <h2>Nasıl çalışıyoruz</h2>
        <p>Bu işte müşteri en kırılgan anında arar: gece yarısı, yağmurda, bilmediği bir yolda. O anda en çok ihtiyaç duyulan şey hız değil, öngörülebilirliktir — ne kadar bekleyeceğini ve ne kadar ödeyeceğini bilmek.</p>
        <p>Bu yüzden iki şeyi kural yaptık: varış süresini tahmin olarak değil, en yakın aracın gerçek konumuna bakarak söylüyoruz; fiyatı ise yola çıkmadan önce net rakamla veriyoruz ve sonradan değiştirmiyoruz.</p>
        <h2>Filomuz</h2>
        <p>Kayar kasa çekiciler, dar sokaklar için kompakt araç, alçak otoparklar için kızaklı sistem, motosiklet için rampalı taşıyıcı ve klasik/lüks araçlar için kapalı kasa. Araçlarımız K türü yetki belgeli, sürücülerimiz SRC belgelidir.</p>
        <h2>Sigorta ve belgeler</h2>
        <p>Her taşıma yükleme anından teslimata kadar sigorta kapsamındadır. Teslimde imzalı taşıma tutanağı bırakıyoruz; aracın alınırken ve bırakılırken durumu fotoğraflı olarak kayıt altındadır.</p>
        <h2>Fiyatı nasıl belirliyoruz</h2>
        <p>Üç şeye bakıyoruz: aracın türü, alınacağı yer ve gideceği adres. Bunları telefonda öğrendiğimizde tek bir rakam söylüyoruz — “yaklaşık”, “civarı” ya da “yerinde bakarız” demiyoruz. Rakamı söyledikten sonra yola çıkıyoruz ve o rakam değişmiyor.</p>
        <p>Gece, hafta sonu ve bayram için fark uygulamamamızın sebebi basit: en çok yardıma ihtiyaç duyulan saatlerde fiyat artırmak, bu işi kötü şöhretli yapan şeyin ta kendisi.</p>
        <h2>Neden sadece Anadolu Yakası</h2>
        <p>Bütün İstanbul'a hizmet verdiğini söyleyip her yere geç kalmak yerine tek yakada kalmayı seçtik. Sabit araç konumlandırdığımız 14 ilçenin ara sokaklarını, hangi otoparkın giriş yüksekliğinin ne olduğunu ve hangi kavşakta yüklemenin tehlikeli olduğunu biliyoruz. Şehirlerarası taşıma yapıyoruz; ama acil çağrıda söz verdiğimiz yer burası.</p>
      </div>
      <div class="local">
        <h3>Künye</h3>
        <dl>
          <dt>Unvan</dt><dd>${esc(site.legalName)}</dd>
          <dt>Kuruluş</dt><dd>${site.foundedYear}</dd>
          <dt>Merkez</dt><dd>${site.addressVerified ? `${esc(site.address.district)} / ${esc(site.address.city)}` : esc(site.address.city)}</dd>
          <dt>Filo</dt><dd>${site.claims.fleetSize} araç</dd>
          <dt>Hizmet alanı</dt><dd>Anadolu Yakası ${site.claims.districtCount} ilçe</dd>
          <dt>Çalışma</dt><dd>7 gün 24 saat</dd>
          <dt>Telefon</dt><dd><a href="${links.tel}">${esc(site.phoneDisplay)}</a></dd>
        </dl>
      </div>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Filo</span><h2>Araçlarımız</h2></div>
    ${photo({ key: "filo", label: "Bektaş Oto Kurtarma filosu", alt: "Bektaş Oto Kurtarma çekici filosu", w: 1600, h: 900 })}
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><h2>Değişmeyen dört kural</h2></div>
    <div class="trust">${trustPoints.map((t) => `<div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div>`).join("")}</div>
  </div>
</section>
${ctaBand()}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle(`Hakkımızda – ${site.foundedYear}'den beri`),
    description: `${site.foundedYear}'den beri İstanbul Anadolu Yakası'nda oto kurtarma. ${site.claims.fleetSize} araçlık belgeli filo, sigortalı taşıma, sabit fiyat. Aile işletmesi.`,
    breadcrumbs: crumb("Hakkımızda"), body,
  })};
}

/* ------------------------------------------------------------ /iletisim/ */
function iletisim() {
  const path = "/iletisim/";
  const body = `
<section class="hero">
  <div class="wrap"><div class="hero-in">
    <span class="eyebrow">İletişim</span>
    <h1>Aramanız<br><em>yeterli</em></h1>
    <p class="lede">Form doldurmanıza gerek yok. Telefonu açın ya da WhatsApp'tan konumunuzu gönderin; gerisini biz hallederiz.</p>
    <div class="btn-row">
      <a class="btn" href="${links.tel}">${esc(site.phoneDisplay)}</a>
      <a class="btn btn--wa" href="${links.wa}" rel="noopener">WhatsApp'tan konum gönder</a>
    </div>
  </div></div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Bize ulaşın</h2><p class="lede">Telefon en hızlısı. WhatsApp'tan konum gönderirseniz adres tarif etmenize gerek kalmaz.</p></div>
    <div class="grid grid--2">
      <div class="local">
        <h3>İletişim bilgileri</h3>
        <dl>
          <dt>Telefon</dt><dd><a href="${links.tel}">${esc(site.phoneDisplay)}</a></dd>
          <dt>WhatsApp</dt><dd><a href="${links.wa}" rel="noopener">${esc(site.phoneDisplay)}</a></dd>
          <dt>E-posta</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd>
          <dt>Hizmet alanı</dt><dd>${site.addressVerified ? `${esc(site.address.street)}<br>${esc(site.address.postalCode)} ${esc(site.address.district)} / ${esc(site.address.city)}` : "İstanbul Anadolu Yakası — 14 ilçe<br>Adrese servis, sabit ofis ziyareti gerekmez"}</dd>
          <dt>Çalışma saatleri</dt><dd>7 gün 24 saat, bayram dahil</dd>
          <dt>Ödeme</dt><dd>${esc(site.payments.join(", "))}</dd>
        </dl>
      </div>
      <div class="prose">
        <h2>Ararken bunları hazır edin</h2>
        <ul class="ticks">
          <li>Bulunduğunuz konum — mahalle, cadde veya en yakın referans nokta</li>
          <li>Aracın markası, modeli ve vites tipi (otomatik / manuel)</li>
          <li>Sorunun ne olduğu — çalışmıyor, lastik patladı, kaza yaptı</li>
          <li>Aracın gideceği adres (servis, otopark, ev)</li>
          <li>Kapalı otopark veya site içindeyse giriş izni durumu</li>
        </ul>
        <p style="margin-top:20px">Bu beş bilgiyle size en yakın aracı belirleyip varış süresini ve net fiyatı aynı telefonda söyleyebiliyoruz.</p>
      </div>
    </div>
  </div>
</section>
<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Beklerken</span>
      <h2>Yolda kaldığınızda ilk beş dakika</h2>
      <p class="lede">Çekici gelene kadar geçen süre, kazaların en sık yaşandığı andır. Aracınızın yanında değil, arkasında ve bariyerin ötesinde bekleyin.</p>
    </div>
    <div class="grid grid--2">
      <div class="prose">
        <h3>Şehir içinde</h3>
        <ul class="ticks">
          <li>Dörtlüleri hemen yakın, aracı mümkünse sağa çekin</li>
          <li>Reflektörlü yeleği giyip aracın <b>arkasından</b> inin</li>
          <li>Üçgeni aracın 30 metre gerisine koyun</li>
          <li>Kaldırıma geçin; araç içinde beklemeyin</li>
          <li>Aracı itmeye çalışmayın, otomatik vitesli araçlarda özellikle</li>
        </ul>
      </div>
      <div class="prose">
        <h3>Otoyolda (D-100, TEM, Sahil Yolu)</h3>
        <ul class="ticks">
          <li>Emniyet şeridine geçin, dörtlüleri yakın</li>
          <li>Üçgeni <b>150 metre</b> geriye koyun — şehir içinden çok daha uzağa</li>
          <li>Bariyerin arkasına geçin, hiç kimse araçta kalmasın</li>
          <li>Gece ise yeleksiz inmeyin; görünmüyorsunuz</li>
          <li>Konum tarif edemiyorsanız en yakın kilometre tabelasını okuyun</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <span class="eyebrow">Ne gerekiyor</span>
      <h2>Durumunuza göre hangi hizmet</h2>
      <p class="lede">Her arıza çekici gerektirmez. Aşağıdaki üç durumda araç yerinde çalıştırılıp yola devam edebiliyor; çekici ücreti ödemenize gerek kalmıyor.</p>
    </div>
    <div class="table-scroll">
      <table>
        <caption>Telefonda söylediğiniz belirtiye göre yönlendirme</caption>
        <thead><tr><th scope="col">Belirti</th><th scope="col">Muhtemel sebep</th><th scope="col">Gereken</th></tr></thead>
        <tbody>
          <tr><td>Marşa basınca tık sesi</td><td class="muted">Akü bitmiş</td><td><a href="/hizmetler/aku-takviye/">Akü takviye</a></td></tr>
          <tr><td>Marş dönüyor, çalışmıyor</td><td class="muted">Yakıt veya elektrik</td><td><a href="/hizmetler/yol-yardim/">Yol yardım</a></td></tr>
          <tr><td>Direksiyon ağırlaştı, ses geliyor</td><td class="muted">Lastik inmiş</td><td><a href="/hizmetler/lastik-degisimi/">Lastik değişimi</a></td></tr>
          <tr><td>Vites takmıyor, araç yürümüyor</td><td class="muted">Şanzıman / debriyaj</td><td><a href="/hizmetler/oto-cekici/">Oto çekici</a></td></tr>
          <tr><td>Kaza sonrası hareket edemiyor</td><td class="muted">Şasi / tekerlek kilidi</td><td><a href="/hizmetler/kaza-kurtarma/">Kaza kurtarma</a></td></tr>
          <tr><td>Anahtar içeride kaldı</td><td class="muted">—</td><td><a href="/hizmetler/kapi-acma/">Kapı açma</a></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec sec--panel">
  <div class="wrap">
    <div class="sec-head"><h2>Bölgenize göre</h2><p class="lede">Bulunduğunuz ilçenin sayfasında o bölgeye özel varış süresi ve saha notlarımız var.</p></div>
    ${districtGrid(districts)}
  </div>
</section>
${ctaBand()}`;
  return { path, html: page({
    path, current: path,
    title: mkTitle("İletişim – 7/24 Oto Kurtarma"),
    description: `${site.name} iletişim: ${site.phoneDisplay}. 7 gün 24 saat açık. İstanbul Anadolu Yakası'nın 14 ilçesinde oto çekici ve yol yardım.`,
    breadcrumbs: crumb("İletişim"), body,
  })};
}

/* --------------------------------------------------------------- 404 */
function notFound() {
  const body = `
<section class="err">
  <div class="wrap">
    <span class="code">404</span>
    <h1 style="margin-top:18px">Bu sayfa yok, ama biz varız</h1>
    <p class="lede" style="margin:16px 0 26px">Aradığınız sayfayı bulamadık. Aracınız yolda kaldıysa beklemeyin — doğrudan arayın, sayfayı sonra ararız.</p>
    <div class="btn-row">
      <a class="btn" href="${links.tel}">${esc(site.phoneDisplay)}</a>
      <a class="btn btn--ghost" href="/">Ana sayfaya dön</a>
    </div>
    <div class="sec-head" style="margin-top:52px"><h2>Bölgeler</h2></div>
    <div class="chips">${districts.map((d) => `<a class="chip" href="/${d.slug}-oto-kurtarma/">${esc(d.name)}</a>`).join("")}</div>
  </div>
</section>`;
  return { path: "/404.html", html: page({
    path: "/404.html", title: mkTitle("Sayfa bulunamadı"),
    description: "Aradığınız sayfa bulunamadı. Anadolu Yakası oto kurtarma için 7/24 arayabilirsiniz.",
    body,
  }) };
}

export function staticPages() {
  return [bolgeler(), hizmetler(), fiyatlar(), sss(), hakkimizda(), iletisim(), notFound()];
}
