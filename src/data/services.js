/**
 * Hizmetler. combo:true olanlar icin ayrica 14 ilcenin her birine
 * ozel kesisim sayfasi uretilir (ornek: /kadikoy-aku-takviye/).
 */

export const services = [
  {
    slug: "oto-cekici", name: "Oto Çekici", h1: "Oto Çekici",
    short: "Çalışmayan aracı istediğiniz servise veya adrese taşıma.",
    combo: true, comboLabel: "Oto Çekici", priority: 1,
    price: "1.500 ₺'den başlayan",
    intro: "Aracınız çalışmıyorsa, vitese takmıyorsa ya da kaza sonrası hareket edemiyorsa kayar kasa çekiciyle olduğu yerden alıp istediğiniz servise, otoparka veya evinize götürüyoruz. Aracın tekerleklerini yerden kesen kasalı taşıma, halatla çekmenin aksine şanzıman ve alt takıma zarar vermez.",
    when: [
      "Motor çalışmıyor ya da çalışıp yürümüyor",
      "Vites takmıyor, debriyaj bırakmış",
      "Kaza sonrası araç sürülebilir durumda değil",
      "Muayene, servis veya galeri arası transfer gerekiyor",
      "Uzun süre çalıştırılmamış araç yerinden kaldırılacak",
    ],
    includes: [
      "Kayar kasa (sıfır dereceli) yükleme",
      "Otomatik ve elektrikli araçlar için tekerlek kaldırma aparatı",
      "Yükleme ve indirme dahil, ek ücret yok",
      "Teslimde imzalı taşıma tutanağı",
    ],
    faq: [
      ["Otomatik vitesli aracım çekilebilir mi?", "Evet. Otomatik şanzımanlı araçlar halatla çekilmez ama kasalı çekiciyle taşınmasında sakınca yoktur. Tekerlekler tamamen yerden kesilerek taşınır."],
      ["Aracın anahtarı bende yoksa ne olur?", "Anahtarsız araçlar için kızak ve tekerlek aparatı kullanıyoruz. Aracın el freni çekili veya vitesi kilitli olsa da yükleme yapabiliyoruz."],
      ["Çekici gelirken aracın yanında beklemem şart mı?", "Site veya otopark gibi kapalı alanlarda evet, çünkü giriş izni gerekiyor. Açık yolda ise anahtarı teslim ederek ayrılabilirsiniz, süreci telefonla yönetiyoruz."],
    ],
  },
  {
    slug: "yol-yardim", name: "Yol Yardım", h1: "Yol Yardım",
    short: "Yerinde müdahaleyle aracı yeniden yola çıkarma.",
    combo: true, comboLabel: "Yol Yardım", priority: 2,
    price: "750 ₺'den başlayan",
    intro: "Her arıza çekici gerektirmez. Akü bitmesi, lastik patlaması, yakıt tükenmesi ya da basit elektrik arızalarında ekibimiz yerinde müdahale ediyor; araç yola çıkabiliyorsa çekici ücreti ödemenize gerek kalmıyor.",
    when: [
      "Akü bitmiş, marş dönmüyor",
      "Lastik patlamış veya inmiş",
      "Yakıt bitmiş",
      "Anahtar araçta kalmış",
      "Basit elektrik arızası nedeniyle araç durmuş",
    ],
    includes: [
      "Yerinde arıza tespiti",
      "Takviye, lastik ve yakıt müdahalesi",
      "Yerinde çözülemezse çekiciye geçiş",
      "Ücret sadece yapılan işlem üzerinden",
    ],
    faq: [
      ["Yerinde çözülmezse iki kere mi ödeyeceğim?", "Hayır. Yol yardım denemesi sonuç vermezse aracınızı çekiciyle taşırken sadece çekici ücretini alıyoruz."],
      ["Gece de yol yardım veriyor musunuz?", "Evet, ekiplerimiz 24 saat vardiyalı çalışıyor. Gece için ek ücret uygulamıyoruz."],
    ],
  },
  {
    slug: "aku-takviye", name: "Akü Takviye", h1: "Akü Takviye ve Değişimi",
    short: "Bitmiş aküye yerinde takviye, gerekirse akü değişimi.",
    combo: true, comboLabel: "Akü Takviye", priority: 3,
    price: "750 ₺'den başlayan",
    intro: "Marşa bastığınızda tık sesi geliyor ya da hiç ses gelmiyorsa sorun büyük ihtimalle akü. Profesyonel takviye cihazıyla aracınızı yerinde çalıştırıyor, aküyü ve şarj sistemini ölçüyoruz. Akü tamamen ölmüşse aynı ziyarette yenisiyle değiştirebiliyoruz.",
    when: [
      "Marş dönmüyor, sadece tık sesi geliyor",
      "Araç uzun süre çalıştırılmamış",
      "Farlar açık unutulmuş, akü boşalmış",
      "Soğuk havada araç zor çalışıyor",
      "Akü sık sık bitiyor, şarj tutmuyor",
    ],
    includes: [
      "Cihazla güvenli takviye (araç elektroniğine zarar vermeden)",
      "Akü ve şarj dinamosu ölçümü",
      "İsteğe bağlı yerinde akü değişimi",
      "Eski akünün geri alınması",
    ],
    faq: [
      ["Start-stop sistemli araçlarda takviye yapılabilir mi?", "Evet. Start-stop ve hibrit araçlarda AGM/EFB aküye uygun, voltaj korumalı cihaz kullanıyoruz; araç elektroniğine zarar vermez."],
      ["Takviye sonrası araç yine bitecek mi?", "Şarj dinamosu sağlamsa hayır. Ölçüm yapıp söylüyoruz: sorun aküdeyse değişim, dinamodaysa servise yönlendirme öneriyoruz."],
      ["Akü değişimi ne kadar sürer?", "Yerinde ortalama 15 dakika. Bataryası bagajda veya koltuk altında olan modellerde bu süre biraz uzayabiliyor."],
    ],
  },
  {
    slug: "lastik-degisimi", name: "Lastik Değişimi", h1: "Yolda Lastik Değişimi",
    short: "Patlayan lastiği yerinde stepneyle değiştirme veya araç taşıma.",
    combo: true, comboLabel: "Lastik Değişimi", priority: 4,
    price: "900 ₺'den başlayan",
    intro: "Lastik patladığında yol kenarında kriko ile uğraşmak hem zor hem tehlikeli. Ekibimiz reflektörlü güvenlik önlemiyle gelip stepnenizi takıyor; stepne yoksa aracınızı en yakın lastikçiye taşıyoruz.",
    when: [
      "Lastik patlamış veya yan duvardan yırtılmış",
      "Stepne var ama kriko/bijon anahtarı yok",
      "Bijonlar sıkışmış, sökülemiyor",
      "Stepne yok veya stepne de inik",
      "Aynı anda birden fazla lastik inmiş",
    ],
    includes: [
      "Reflektör ve uyarı üçgeniyle güvenli alan",
      "Torkmetreyle doğru sıkma",
      "Stepne basıncı kontrolü",
      "Stepne yoksa lastikçiye taşıma",
    ],
    faq: [
      ["Stepnem yok, ne yapacaksınız?", "Aracınızı en yakın açık lastikçiye taşıyoruz. Gece açık lastikçileri biliyoruz, boşuna dolaştırmıyoruz."],
      ["Jant zarar görür mü?", "Görmez. Plastik korumalı aparat ve torkmetre kullanıyoruz; alaşım jantlarda çizik bırakmıyoruz."],
    ],
  },
  {
    slug: "yakit-ikmali", name: "Yakıt İkmali", h1: "Yolda Yakıt İkmali",
    short: "Yakıtı biten araca yerinde benzin, motorin veya LPG desteği.",
    combo: false, priority: 7,
    price: "600 ₺'den başlayan (yakıt bedeli hariç)",
    intro: "Yakıtınız yolda bittiyse en yakın istasyondan alıp getiriyoruz. Aracı yürütecek kadar yakıt bırakıp istasyona kadar eşlik ediyoruz; dizel araçlarda hava yapan sistemi de yerinde havasını alarak çalıştırıyoruz.",
    when: [
      "Depo tamamen boşalmış, araç durmuş",
      "Dizel araçta yakıt bitmiş, sistem hava yapmış",
      "Yanlış yakıt alınmış (bu durumda çekici gerekir)",
    ],
    includes: [
      "Benzin, motorin ve adblue temini",
      "Dizel sistemde hava alma",
      "En yakın istasyona kadar eşlik",
    ],
    faq: [
      ["Yanlış yakıt aldım, çalıştırabilir misiniz?", "Hayır, çalıştırmayın. Yanlış yakıt alınan aracı çalıştırmak motora zarar verir. Bu durumda deponun boşaltılması gerekir; aracı servise taşıyoruz."],
    ],
  },
  {
    slug: "kapi-acma", name: "Araç Kapı Açma", h1: "Kilitli Araç Kapı Açma",
    short: "Anahtar içeride kaldıysa hasarsız kapı açma.",
    combo: true, comboLabel: "Kapı Açma", priority: 5,
    price: "900 ₺'den başlayan",
    intro: "Anahtar araçta kilitli kaldıysa camı kırmadan, kilit göbeğine ve kapı contasına zarar vermeden açıyoruz. İşlem öncesi aracın size ait olduğunu belgelemenizi istiyoruz; ruhsat ve kimlik kontrolü yapmadan hiçbir aracı açmıyoruz.",
    when: [
      "Anahtar araç içinde kilitli kaldı",
      "Kumanda pili bitti, araç açılmıyor",
      "Bagajda anahtar kaldı",
      "Çocuk veya evcil hayvan araçta kaldı (acil öncelik)",
    ],
    includes: [
      "Hasarsız açma tekniği",
      "Ruhsat ve kimlik kontrolü",
      "Araç içinde canlı varsa öncelikli müdahale",
    ],
    faq: [
      ["Ruhsatım da araçta kaldı, ne olacak?", "Aracın size ait olduğunu e-Devlet üzerinden ruhsat kaydınızla gösterebilirsiniz. Kimlik ibrazı ve tutanak imzası yeterli oluyor."],
      ["Araçta çocuk kaldı, ne kadar sürede gelirsiniz?", "Bu çağrılar en yüksek öncelikte. Hemen 112'yi de arayın, biz en yakın aracı derhal yönlendiriyoruz."],
    ],
  },
  {
    slug: "kaza-kurtarma", name: "Kaza Sonrası Kurtarma", h1: "Kaza Sonrası Araç Kurtarma",
    short: "Kaza yapan aracın güvenle alınması ve taşınması.",
    combo: true, comboLabel: "Kaza Kurtarma", priority: 6,
    price: "1.800 ₺'den başlayan",
    intro: "Kaza sonrası araç genellikle hareket edemez, bazen de trafiği kapatacak konumdadır. Ekibimiz yolu güvene alıp aracı vinç ve kızakla kaldırıyor, anlaşmalı olduğunuz servise ya da sigorta şirketinin yönlendirdiği adrese taşıyoruz.",
    when: [
      "Araç kaza sonrası hareket edemiyor",
      "Araç şarampole, refüje veya bariyere girmiş",
      "Tekerlekler kilitli, direksiyon dönmüyor",
      "Trafiği kapatan konumda kalınmış",
      "Sigorta eksperi için araç güvenli alana çekilecek",
    ],
    includes: [
      "Vinçli ve kızaklı kurtarma",
      "Kaza yerinde güvenlik önlemi",
      "Kaza tespit tutanağı sürecinde bekleme",
      "Sigorta anlaşmalı servise teslim",
    ],
    faq: [
      ["Kaza tutanağı tutulmadan aracı çekebilir misiniz?", "Maddi hasarlı kazalarda tutanak tamamlanmadan araç yerinden oynatılmamalı. Ekibimiz gelir, güvenliği sağlar ve tutanak bitene kadar bekler."],
      ["Sigortam çekici karşılıyor mu?", "Çoğu kasko poliçesi yılda belirli sayıda çekici hakkı verir. Poliçe numaranızla şirketinizi arayıp bizi yönlendirmelerini isteyebilirsiniz; anlaşmalı çalışıyoruz."],
    ],
  },
  {
    slug: "motosiklet-cekici", name: "Motosiklet Çekici", h1: "Motosiklet Çekici",
    short: "Motosiklet ve scooter için rampalı, kayışlı taşıma.",
    combo: false, priority: 8,
    price: "1.200 ₺'den başlayan",
    intro: "Motosiklet taşımak arabadan daha hassas bir iş. Rampalı yükleme, ön teker sabitleme kızağı ve yumuşak kayışla taşıyoruz; kaportaya, egzoza ve yan aynalara temas etmeyecek şekilde bağlıyoruz.",
    when: [
      "Motosiklet arıza yaptı veya kaza geçirdi",
      "Kışlık kaldırma / garaj transferi",
      "Servise veya satın alınan yere taşıma",
    ],
    includes: [
      "Ön teker sabitleme kızağı",
      "Yumuşak bağlama kayışı",
      "Aynı anda 2 motosiklete kadar taşıma",
    ],
    faq: [
      ["Motosikletim yatmış, kaldırabilir misiniz?", "Evet, iki kişilik ekiple kaldırıp yüklüyoruz. Yakıt sızıntısı varsa önce onu güvene alıyoruz."],
    ],
  },
  {
    slug: "kapali-kasa-cekici", name: "Kapalı Kasa Çekici", h1: "Kapalı Kasa Çekici",
    short: "Klasik, lüks ve düşük gövdeli araçlar için üstü kapalı taşıma.",
    combo: false, priority: 9,
    price: "3.500 ₺'den başlayan",
    intro: "Klasik otomobil, spor araç ya da yeni teslim alınmış bir araç için açık kasa her zaman doğru seçim değil. Kapalı kasa aracımız hava koşullarına, taş sıçramasına ve meraklı bakışlara karşı tamamen korumalı taşıma sağlar. Randevulu çalışıyoruz.",
    when: [
      "Klasik veya koleksiyon aracı",
      "Düşük gövdeli spor araç",
      "Fuar, düğün veya çekim için transfer",
      "Yeni satın alınmış araç teslimi",
    ],
    includes: [
      "Tam kapalı kasa, hidrolik rampa",
      "Dört nokta yumuşak bağlama",
      "Taşıma öncesi fotoğraflı durum tespiti",
      "Randevulu planlama",
    ],
    faq: [
      ["Aracımın alt takımı çok alçak, rampaya vurur mu?", "Vurmaz. Hidrolik rampa açısı sıfıra yakın indirilebiliyor, gerekirse ek takoz kullanıyoruz. Yükleme öncesi fotoğraf çekip tutanağa ekliyoruz."],
    ],
  },
  {
    slug: "sehirlerarasi-cekici", name: "Şehirlerarası Çekici", h1: "Şehirlerarası Oto Çekici",
    short: "Pendik ve Anadolu Yakası'ndan Türkiye'nin her iline araç taşıma.",
    combo: false, priority: 10,
    price: "Mesafeye göre net fiyat",
    intro: "Pendik ve Anadolu Yakası'ndan Ankara, İzmir, Bursa, Antalya ve diğer illere araç taşıyoruz. Şehirlerarası taşımalarda fiyatı mesafe üzerinden hesaplayıp yola çıkmadan yazılı olarak bildiriyoruz; sürpriz km ücreti çıkmıyor.",
    when: [
      "Başka ilde satın alınan aracın getirilmesi",
      "Taşınma nedeniyle araç transferi",
      "Uzun mesafede arıza yapan araç",
      "Galeri ve servis arası toplu taşıma",
    ],
    includes: [
      "Yola çıkmadan yazılı fiyat",
      "Sigortalı taşıma",
      "Tek seferde 2-6 araç kapasitesi",
      "Teslimat saatinin önceden bildirilmesi",
    ],
    faq: [
      ["Aracı teslim alırken orada olmam gerekir mi?", "Gerekmez. Vekaletname veya yazılı onayla üçüncü kişiye teslim edebiliyoruz; teslim anında fotoğraflı tutanak gönderiyoruz."],
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
export const comboServices = services.filter((s) => s.combo);
export const sortedServices = [...services].sort((a, b) => a.priority - b.priority);
