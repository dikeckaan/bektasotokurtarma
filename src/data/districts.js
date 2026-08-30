/**
 * Anadolu Yakasi ilceleri.
 * Her ilce icin ayri metin uretilebilsin diye mahalle, arter ve yerel not
 * alanlari zorunlu tutuldu. Ayni cumleyi 14 kez tekrarlamak yerine
 * sayfa metni bu alanlardan kuruluyor.
 *
 * loc/abl/dat/gen: Turkce ek almis hazir bicimler (Kadikoy'de, Kadikoy'den...).
 * Ek uretimini koda birakmiyoruz; ozel isimlerde kesme ve unlu uyumu hata veriyor.
 */

export const districts = [
  {
    slug: "kadikoy", name: "Kadıköy",
    loc: "Kadıköy'de", abl: "Kadıköy'den", dat: "Kadıköy'e", gen: "Kadıköy'ün",
    eta: 12, population: "460 bin",
    mahalleler: ["Caferağa", "Osmanağa", "Fenerbahçe", "Göztepe", "Erenköy", "Suadiye", "Bostancı", "Kozyatağı", "Sahrayıcedit", "Acıbadem", "Koşuyolu", "Fikirtepe", "Hasanpaşa", "Merdivenköy", "Rasimpaşa", "Dumlupınar"],
    arterler: ["Bağdat Caddesi", "Minibüs Yolu", "Sahil Yolu", "D-100 (E-5) Göztepe kavşağı", "Fahrettin Kerim Gökay Caddesi"],
    note: "Bağdat Caddesi ve çevresindeki kapalı otoparklar Anadolu Yakası'nın en dar giriş yüksekliklerine sahip. Bu bölgeye kızaklı ve alçak profilli araçla çıkıyoruz.",
    note2: "Moda, Caferağa ve Osmanağa'nın dar sokaklarında büyük kasa çekici manevra yapamaz; buralarda tek araç kaldıran kompakt çekicimizi yönlendiriyoruz.",
    landmark: "Kadıköy İskelesi",
  },
  {
    slug: "uskudar", name: "Üsküdar",
    loc: "Üsküdar'da", abl: "Üsküdar'dan", dat: "Üsküdar'a", gen: "Üsküdar'ın",
    eta: 16, population: "525 bin",
    mahalleler: ["Altunizade", "Bulgurlu", "Kısıklı", "Kuzguncuk", "Beylerbeyi", "Çengelköy", "Ünalan", "Burhaniye", "Bağlarbaşı", "Selimiye", "Ahmediye", "Küçüksu", "Ferah", "Mimar Sinan"],
    arterler: ["15 Temmuz Şehitler Köprüsü çıkışı", "Çamlıca Tüneli", "Altunizade kavşağı", "Boğaziçi sahil yolu", "Libadiye Caddesi"],
    note: "Boğaz köprüsü çıkışında kalan araçlar için trafik akışını kesmeden yükleme yapmak kritik; bu noktalarda emniyet şeridinde 5 dakikada yükleme yapacak şekilde çalışıyoruz.",
    note2: "Kuzguncuk, Çengelköy ve Beylerbeyi'nin yokuşlu dar sokaklarında halatlı çekim yerine kızak kullanıyoruz, aracın altı çizilmiyor.",
    landmark: "Altunizade kavşağı",
  },
  {
    slug: "atasehir", name: "Ataşehir",
    loc: "Ataşehir'de", abl: "Ataşehir'den", dat: "Ataşehir'e", gen: "Ataşehir'in",
    eta: 14, population: "425 bin",
    mahalleler: ["Barbaros", "Küçükbakkalköy", "İçerenköy", "Yenişehir", "Ferhatpaşa", "Aşık Veysel", "Mustafa Kemal", "Örnek", "Esatpaşa", "Mimar Sinan", "İnönü", "Kayışdağı", "Yenisahra"],
    arterler: ["TEM Otoyolu Ataşehir çıkışı", "Ataşehir Bulvarı", "Finans Merkezi", "Şile Otoyolu bağlantısı", "Kayışdağı Caddesi"],
    note: "Finans Merkezi ve Barbaros çevresindeki plaza otoparkları rampalı ve alçak; bu binalardan araç çıkarmak için otopark yönetiminden geçiş izni alıp kızakla çalışıyoruz.",
    note2: "Merkez garajımız Ataşehir'de olduğu için ilçe içi çağrılara ortalamanın altında sürede ulaşıyoruz.",
    landmark: "Ataşehir Finans Merkezi",
  },
  {
    slug: "umraniye", name: "Ümraniye",
    loc: "Ümraniye'de", abl: "Ümraniye'den", dat: "Ümraniye'ye", gen: "Ümraniye'nin",
    eta: 15, population: "740 bin",
    mahalleler: ["Atakent", "Çakmak", "İnkılap", "Tatlısu", "Esenşehir", "Ihlamurkuyu", "Site", "Armağanevler", "Yamanevler", "Dumlupınar", "Namık Kemal", "Altınşehir", "Hekimbaşı", "Madenler"],
    arterler: ["TEM Otoyolu Ümraniye çıkışı", "Alemdağ Caddesi", "Fatih Sultan Mehmet Köprüsü bağlantısı", "Sarıgazi Caddesi", "İnkılap Caddesi"],
    note: "TEM'in Ümraniye kesiminde arıza yapan araçlar için gece görüş ekipmanlı ve reflektörlü yükleme yapıyoruz; otoyolda bekleme süresini kısaltmak güvenlik meselesi.",
    note2: "Ümraniye sanayi bölgesinde ticari araç ve panelvan çağrıları yoğun; 3,5 tona kadar ticari araçları tek seferde taşıyabiliyoruz.",
    landmark: "Ümraniye Meydanı",
  },
  {
    slug: "maltepe", name: "Maltepe",
    loc: "Maltepe'de", abl: "Maltepe'den", dat: "Maltepe'ye", gen: "Maltepe'nin",
    eta: 17, population: "525 bin",
    mahalleler: ["Bağlarbaşı", "Cevizli", "Küçükyalı", "İdealtepe", "Altayçeşme", "Zümrütevler", "Gülsuyu", "Başıbüyük", "Fındıklı", "Esenkent", "Girne", "Aydınevler", "Feyzullah"],
    arterler: ["D-100 Maltepe kesimi", "Sahil Yolu", "Maltepe Sahil Parkı", "Bağdat Caddesi devamı", "Cevizli kavşağı"],
    note: "Sahil Yolu ve D-100 arasındaki bağlantılarda arıza yapan araçlar için trafiğe kapanmadan yükleme yapılacak güvenli nokta seçimi yapıyoruz.",
    note2: "Başıbüyük ve Gülsuyu'nun eğimli sokaklarında el freni tutmayan araçlar için takozlu ve vinçli çekim yöntemi kullanıyoruz.",
    landmark: "Maltepe Sahil",
  },
  {
    slug: "kartal", name: "Kartal",
    loc: "Kartal'da", abl: "Kartal'dan", dat: "Kartal'a", gen: "Kartal'ın",
    eta: 19, population: "480 bin",
    mahalleler: ["Kordonboyu", "Yalı", "Soğanlık", "Yakacık", "Esentepe", "Uğur Mumcu", "Cevizli", "Atalar", "Petrol İş", "Hürriyet", "Orhantepe", "Karlıktepe", "Topselvi"],
    arterler: ["D-100 Kartal kesimi", "Kartal Sahil Yolu", "Ankara Caddesi", "Soğanlık kavşağı", "E-5 bağlantı yolları"],
    note: "Kartal Sahil ve Kordonboyu çevresindeki etkinlik günlerinde araç çıkarmak için belediye trafik ekipleriyle koordineli çalışıyoruz.",
    note2: "Yakacık ve Soğanlık'taki sanayi sitelerinden çıkan servis dışı araçlar için çoklu taşıma yapabiliyoruz.",
    landmark: "Kartal Meydanı",
  },
  {
    slug: "pendik", name: "Pendik",
    loc: "Pendik'te", abl: "Pendik'ten", dat: "Pendik'e", gen: "Pendik'in",
    eta: 23, population: "750 bin",
    mahalleler: ["Batı", "Doğu", "Kaynarca", "Velibaba", "Kurtköy", "Sanayi", "Çamçeşme", "Güzelyalı", "Yeşilbağlar", "Esenyalı", "Fevzi Çakmak", "Ahmet Yesevi", "Dumlupınar", "Ertuğrul Gazi"],
    arterler: ["Sabiha Gökçen Havalimanı yolu", "D-100 Pendik kesimi", "TEM Kurtköy çıkışı", "Ankara Caddesi", "Pendik Sahil"],
    note: "Sabiha Gökçen Havalimanı otoparklarından araç çıkarma en sık aldığımız Pendik çağrısı; uçuş saatine yetişmesi gereken müşteriler için önceliklendirme yapıyoruz.",
    note2: "Kurtköy ve Sanayi mahallesindeki organize alanlarda ağır ticari araç çağrıları için ayrı ekipmanla çıkıyoruz.",
    landmark: "Sabiha Gökçen Havalimanı",
  },
  {
    slug: "tuzla", name: "Tuzla",
    loc: "Tuzla'da", abl: "Tuzla'dan", dat: "Tuzla'ya", gen: "Tuzla'nın",
    eta: 26, population: "290 bin",
    mahalleler: ["Aydınlı", "Şifa", "Postane", "İçmeler", "Anadolu", "Orhanlı", "Cami", "Mescit", "Aydıntepe", "Yayla", "Fatih", "Akfırat"],
    arterler: ["Tuzla Organize Sanayi Bölgesi", "Tuzla Serbest Bölge", "D-100 Tuzla kesimi", "Formula yolu", "Orhanlı kavşağı"],
    note: "Tuzla Organize Sanayi ve tersaneler bölgesinde vardiya değişim saatlerinde yoğunluk oluyor; bu bölgeye gündüz iki araç sabit konumlandırıyoruz.",
    note2: "İçmeler ve Aydıntepe sahil şeridinde tuzlu hava nedeniyle akü ömrü kısalıyor; en sık akü takviyesi çağrısı alan bölgemiz.",
    landmark: "Tuzla Organize Sanayi",
  },
  {
    slug: "sancaktepe", name: "Sancaktepe",
    loc: "Sancaktepe'de", abl: "Sancaktepe'den", dat: "Sancaktepe'ye", gen: "Sancaktepe'nin",
    eta: 21, population: "465 bin",
    mahalleler: ["Abdurrahmangazi", "Sarıgazi", "Yenidoğan", "Osmangazi", "Meclis", "Emek", "Merve", "Eyüp Sultan", "Atatürk", "Fatih", "Hilal", "İnönü"],
    arterler: ["TEM Otoyolu Samandıra çıkışı", "Sarıgazi Caddesi", "Şile Otoyolu bağlantısı", "Ankara asfaltı", "Yenidoğan Caddesi"],
    note: "TEM ve Şile Otoyolu bağlantı kollarında kalan araçlar için gece de aynı sürede çıkıyoruz; bu kavşaklarda uzun bekleme kaza riski yaratıyor.",
    note2: "Sarıgazi ve Yenidoğan'daki yeni yerleşim alanlarında henüz açılmamış yollar var; sürücülerimiz bu bölgeyi harita yerine saha bilgisiyle geziyor.",
    landmark: "Samandıra kavşağı",
  },
  {
    slug: "sultanbeyli", name: "Sultanbeyli",
    loc: "Sultanbeyli'de", abl: "Sultanbeyli'den", dat: "Sultanbeyli'ye", gen: "Sultanbeyli'nin",
    eta: 24, population: "340 bin",
    mahalleler: ["Abdurrahmangazi", "Fatih", "Mehmet Akif", "Turgut Reis", "Hamidiye", "Battalgazi", "Ahmet Yesevi", "Adil", "Mimar Sinan", "Necip Fazıl", "Orhangazi"],
    arterler: ["TEM Otoyolu Sultanbeyli çıkışı", "Bosna Bulvarı", "Fatih Bulvarı", "Ankara Caddesi", "Şehit Er Ali Kaya Caddesi"],
    note: "TEM Sultanbeyli gişeleri çevresinde arıza yapan araçlar için otoyol işletmesinin izin verdiği güvenli çekim noktalarını kullanıyoruz.",
    note2: "İlçede ikinci el araç ticareti yoğun; galeri ve oto pazarları arasındaki taşımalar için gün içi sabit fiyatlı transfer veriyoruz.",
    landmark: "Sultanbeyli TEM gişeleri",
  },
  {
    slug: "cekmekoy", name: "Çekmeköy",
    loc: "Çekmeköy'de", abl: "Çekmeköy'den", dat: "Çekmeköy'e", gen: "Çekmeköy'ün",
    eta: 22, population: "290 bin",
    mahalleler: ["Taşdelen", "Alemdağ", "Ömerli", "Merkez", "Mimar Sinan", "Hamidiye", "Soğukpınar", "Sırapınar", "Çamlık", "Nişantepe", "Ekşioğlu", "Aydınlar"],
    arterler: ["Şile Otoyolu", "Alemdağ Caddesi", "Ömerli bağlantısı", "Taşdelen Caddesi", "Reşadiye Caddesi"],
    note: "Ömerli ve Sırapınar tarafındaki orman yolları kışın buzlanıyor; bu bölgeye zincirli ve çekişli araçla çıkıyoruz.",
    note2: "Nişantepe ve Aydınlar'daki villa sitelerinde site içi geçiş izni gerekiyor, çağrıyı alırken güvenlik bilgisini de not ediyoruz.",
    landmark: "Ömerli Barajı çevresi",
  },
  {
    slug: "beykoz", name: "Beykoz",
    loc: "Beykoz'da", abl: "Beykoz'dan", dat: "Beykoz'a", gen: "Beykoz'un",
    eta: 25, population: "250 bin",
    mahalleler: ["Kavacık", "Paşabahçe", "Anadoluhisarı", "Kanlıca", "Çubuklu", "Acarkent", "Riva", "Göksu", "İncirköy", "Yenimahalle", "Çiftlik", "Tokatköy"],
    arterler: ["FSM Köprüsü Kavacık çıkışı", "Şile Otoyolu Riva bağlantısı", "Boğaz sahil yolu", "Kavacık kavşağı", "Paşabahçe Caddesi"],
    note: "Boğaz sahil yolunun dar kesimlerinde büyük kasa çekici trafiği tıkıyor; Kanlıca ve Anadoluhisarı'na kompakt araçla çıkıyoruz.",
    note2: "Riva ve Acarkent tarafındaki uzun mesafeler için varış süresini çağrı anında ayrıca teyit ediyoruz; ortalamaya sığmayan tek bölgemiz.",
    landmark: "Kavacık kavşağı",
  },
  {
    slug: "sile", name: "Şile",
    loc: "Şile'de", abl: "Şile'den", dat: "Şile'ye", gen: "Şile'nin",
    eta: 41, population: "40 bin",
    mahalleler: ["Merkez", "Ağva", "Çayırbaşı", "Balibey", "Kumbaba", "Doğancılı", "Ahmetli", "Kabakoz", "Teke", "Yeşilvadi"],
    arterler: ["Şile Otoyolu", "Şile-Ağva sahil yolu", "Kumbaba yolu", "Doğancılı sapağı"],
    note: "Hafta sonu ve yaz aylarında Şile yolunda kalan araçlar için Çekmeköy'de bekleyen aracımızı yönlendiriyoruz; mesafe uzun olduğu için varış süresini çağrıda net söylüyoruz.",
    note2: "Ağva ve Kumbaba'daki plaj yollarında kuma saplanan araçlar için vinçli kurtarma yapıyoruz, bu Şile'ye özel en sık işimiz.",
    landmark: "Şile Feneri",
  },
  {
    slug: "adalar", name: "Adalar",
    loc: "Adalar'da", abl: "Adalar'dan", dat: "Adalar'a", gen: "Adalar'ın",
    eta: null, etaNote: "randevulu",
    population: "16 bin",
    mahalleler: ["Büyükada", "Heybeliada", "Burgazada", "Kınalıada", "Sedefadası"],
    arterler: ["Bostancı feribot iskelesi", "Kartal iskelesi", "Ada içi servis yolları"],
    note: "Adalar'da motorlu taşıt kullanımı sınırlı olduğu için taşıma feribot seferine göre planlanıyor; çağrıyı aldığımızda ilk uygun sefer saatini birlikte belirliyoruz.",
    note2: "Ada içindeki elektrikli araç ve hizmet araçları için karşı yakaya taşıma yapıyoruz; işlem Bostancı veya Kartal iskelesinde devralınıyor.",
    landmark: "Büyükada İskelesi",
    special: true,
  },
];

export const districtBySlug = Object.fromEntries(districts.map((d) => [d.slug, d]));

/** Bir ilcenin sayfasindan link verilecek en yakin 4 ilce. */
export function neighbours(slug) {
  const map = {
    kadikoy: ["uskudar", "atasehir", "maltepe", "umraniye"],
    uskudar: ["kadikoy", "umraniye", "atasehir", "beykoz"],
    atasehir: ["kadikoy", "umraniye", "maltepe", "sancaktepe"],
    umraniye: ["atasehir", "uskudar", "sancaktepe", "cekmekoy"],
    maltepe: ["kartal", "kadikoy", "atasehir", "pendik"],
    kartal: ["maltepe", "pendik", "sancaktepe", "sultanbeyli"],
    pendik: ["kartal", "tuzla", "sultanbeyli", "maltepe"],
    tuzla: ["pendik", "kartal", "sultanbeyli", "sancaktepe"],
    sancaktepe: ["sultanbeyli", "umraniye", "cekmekoy", "kartal"],
    sultanbeyli: ["sancaktepe", "pendik", "kartal", "cekmekoy"],
    cekmekoy: ["umraniye", "sancaktepe", "beykoz", "sile"],
    beykoz: ["cekmekoy", "uskudar", "umraniye", "sile"],
    sile: ["cekmekoy", "beykoz", "sancaktepe", "umraniye"],
    adalar: ["maltepe", "kartal", "kadikoy", "pendik"],
  };
  return (map[slug] || []).map((s) => districtBySlug[s]).filter(Boolean);
}
