/**
 * TEK DEGISTIRME NOKTASI.
 * Telefon, WhatsApp, adres ve marka bilgileri sadece burada tutulur;
 * 115+ sayfanin tamami bu dosyadan beslenir.
 */

export const site = {
  name: "Bektaş Oto Kurtarma",
  shortName: "Bektaş",
  legalName: "Bektaş Oto Kurtarma",
  tagline: "İstanbul Anadolu Yakası 7/24 oto çekici ve yol yardım",

  phoneDisplay: "0530 951 25 69",
  phoneHref: "+905309512569",       // tel: linki, ulke koduyla
  phoneSchema: "+90-530-951-25-69", // schema.org icin
  whatsapp: "905309512569",         // wa.me/<numara>

  email: "info@cekici.online",

  /**
   * Adres dogrulanana kadar false birakin.
   * false iken schema.org kaydina posta adresi YAZILMAZ — cekici gibi
   * "hizmet alani" isletmelerinde Google zaten adres gizlemeyi onerir ve
   * yanlis adres yayinlamak dogru adres yayinlamamaktan daha zararlidir.
   * Google Business Profile'daki adresle birebir ayni hale getirince true yapin.
   */
  addressVerified: false,

  address: {
    street: "Örnek Mahallesi, Örnek Caddesi No: 1",
    district: "Ataşehir",
    city: "İstanbul",
    postalCode: "34000",
    country: "TR",
  },
  geo: { lat: 40.9923, lng: 29.1244 }, // Atasehir merkez - gercek konumla degistir

  domain: "cekici.online",
  origin: "https://cekici.online",

  foundedYear: 1998,

  // Sosyal / harita profilleri - bos birakilanlar sayfada gosterilmez
  profiles: {
    googleMaps: "",
    instagram: "",
    facebook: "",
  },

  // Sitede gecen sayisal iddialar. Hepsi dogrulanabilir olmali.
  claims: {
    avgEta: 18,          // dakika, Anadolu Yakasi ortalamasi
    districtCount: 14,
    fleetSize: 9,        // arac sayisi
    reviewRating: null,  // ornegin 4.9 -> Google'da gercekten varsa doldur
    reviewCount: null,   // ornegin 187 -> yoksa null birak, schema'ya yazilmaz
  },

  priceRange: "₺₺",

  // Odeme yontemleri
  payments: ["Nakit", "Kredi kartı", "Havale / EFT"],

  /**
   * FOTOGRAFLAR.
   * Dosyalari assets/img/ altina koyup buraya yolunu yazin (ornek: "/img/cekici-yukleme.webp").
   * null kaldigi surece o alanda markali cizim gosterilir; site hicbir yerde
   * bozuk gorsel veya bos kutu gostermez.
   *
   * Onerilen olculer:
   *   hero          1600x900   — ana sayfa, gece cekimi tercih edin
   *   saha1..saha4  1200x800   — is basinda cekilmis kareler
   *   filo          1600x900   — araclarin toplu fotografi
   * WebP veya AVIF olarak kaydedin, 200 KB alti tutun.
   */
  photos: {
    hero: null,
    saha1: null,
    saha2: null,
    saha3: null,
    saha4: null,
    filo: null,
  },
};

export const nav = [
  { label: "Hizmetler", href: "/hizmetler/" },
  { label: "Bölgeler", href: "/bolgeler/" },
  { label: "Fiyatlar", href: "/fiyatlar/" },
  { label: "S.S.S.", href: "/sss/" },
  { label: "Hakkımızda", href: "/hakkimizda/" },
  { label: "İletişim", href: "/iletisim/" },
];

export const trustPoints = [
  {
    title: "Sigortalı taşıma",
    body: "Aracınız yükleme anından teslimata kadar sigorta kapsamında. Teslimde imzalı tutanak veriyoruz.",
  },
  {
    title: "Telefonda söylenen fiyat",
    body: "Yola çıkmadan önce net tutarı söylüyoruz. Gece, hafta sonu veya bayram farkı uygulamıyoruz.",
  },
  {
    title: "Yetki belgeli filo",
    body: "Araçlarımız K türü yetki belgeli, sürücülerimiz SRC belgeli. Kayıt dışı çekici çalıştırmıyoruz.",
  },
  {
    title: "Doğru ekipman",
    body: "Kayar kasa, kızaklı ve kapalı kasa araçlar. Alçak tavanlı otopark ve düşük gövdeli araçlar dahil.",
  },
];

export const steps = [
  {
    title: "Arayın veya konum gönderin",
    body: "Telefonda ya da WhatsApp'tan konumunuzu paylaşın. Aracın markası, durumu ve bulunduğu yer yeterli.",
  },
  {
    title: "Süreyi ve fiyatı söyleyelim",
    body: "Size en yakın aracı belirleyip tahmini varış süresini ve net tutarı hemen bildiriyoruz.",
  },
  {
    title: "Ekip yola çıksın",
    body: "Çekici yola çıktığında plaka ve sürücü bilgisini iletiyoruz. Varışta yükleme 10 dakikayı geçmez.",
  },
];
