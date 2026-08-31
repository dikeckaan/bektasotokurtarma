# Bektaş Oto Kurtarma — cekici.online

İstanbul Anadolu Yakası için hazırlanmış, Cloudflare Workers üzerinde çalışan
statik web sitesi. Tasarım yönü: **Gece Nöbeti** — koyu asfalt zemin, tepe
lambası kehribarı, sıkışık büyük harf tipografi.

- **116 sayfa**, tamamı build sırasında üretiliyor
- **Sıfır JavaScript** (menü, S.S.S. akordeonu ve sabit arama çubuğu saf CSS)
- Sayfa başına ortalama **~22 KB HTML + 17 KB CSS**
- Veritabanı, CMS ve sunucu yok

---

## Hızlı başlangıç

```bash
npm install
npm run build      # dist/ klasörünü üretir
npm run preview    # yerelde açar (npx serve dist)
npm run deploy     # build + wrangler deploy
```

## GitHub → Cloudflare deploy

Site `cekici.online` alan adına, Cloudflare Workers üzerinden yayınlanır.
İki yol var; **A** daha az parça içerdiği için önerilir.

### A) Cloudflare'in kendi Git bağlantısı (önerilen)

1. Kodu GitHub'a gönder:
   ```bash
   git remote add origin git@github.com:<kullanici>/cekici-online.git
   git push -u origin main
   ```
2. Cloudflare paneli → **Workers & Pages** → **Create** → **Workers** →
   **Import a repository** → GitHub hesabını bağla, depoyu seç.
3. Build ayarları:
   | Alan | Değer |
   |---|---|
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` |
   | Root directory | `/` |
4. **Settings → Domains & Routes → Add → Custom domain** → `cekici.online`
   ve `www.cekici.online`. (Worker `www` isteklerini apex'e 301 atıyor.)

Bundan sonra `main` dalına her push otomatik yayına gider.

### B) GitHub Actions ile (kurulu)

Depoda `.github/workflows/deploy.yml` hazır ve her `main` push'unda çalışıyor.
Sadece iki secret ekle:

- `CLOUDFLARE_API_TOKEN` — Cloudflare → My Profile → API Tokens →
  **Edit Cloudflare Workers** şablonu
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare panelinde sağ sütunda

GitHub deposunda: **Settings → Secrets and variables → Actions → New repository secret**.

Secret'lar eklenene kadar iş uyarı verip atlanır, depo çalışmaya devam eder.

Her iki yolda da build, SEO kontrollerinden geçmezse `exit 1` verir ve
**bozuk site yayına çıkmaz**.

### GitHub Pages önizlemesi

`.github/workflows/pages.yml` her push'ta siteyi
`https://kaandikec.com/bektasotokurtarma/` adresine de gönderir
(adres `configure-pages` adımından okunur, sabit yazılmaz).
Bu bir **önizleme**: asıl site cekici.online.

- Pages alt dizinde servis ettiği için build `BASE_PATH` ile çalışır,
  tüm kök-göreli bağlar öneklenir
- `NOINDEX=1` verilir — aynı içeriğin iki adreste indekslenmesi ikisini de
  zayıflatır, `robots.txt` de `Disallow: /` olur

Yerelde aynı çıktıyı almak için:

```bash
BASE_PATH=/bektasotokurtarma SITE_ORIGIN=https://kaandikec.com NOINDEX=1 npm run build
```

### Ortam değişkenleri

| Değişken | Ne yapar |
|---|---|
| `BASE_PATH` | Alt dizine yayın (`/bektasotokurtarma`) |
| `SITE_ORIGIN` | canonical / og:url / sitemap alan adı |
| `NOINDEX` | `1` ise noindex + `Disallow: /` |

Asıl yayın (cekici.online) için hiçbiri gerekmez.

### Elle deploy

```bash
npx wrangler login
npm run deploy
```

### DNS — YAPILACAK

`cekici.online` Cloudflare'de **active** görünüyor ve Worker'a custom domain
olarak bağlandı (apex + www). Ama alan adının kayıt şirketindeki
nameserver'ları hâlâ Squarespace'te:

```
şu an : nse1.squarespacedns.com … nse4.squarespacedns.com
olmalı: gordon.ns.cloudflare.com
        jo.ns.cloudflare.com
```

Bu yüzden istekler Cloudflare'e hiç ulaşmıyor, Squarespace'in "Coming Soon"
sayfası dönüyor. Kayıt şirketinde nameserver'ları yukarıdaki iki adresle
değiştirin; yayılma tamamlandığında (genelde 1-4 saat) site kendiliğinden
cekici.online üzerinden yayına girer. Worker tarafında yapılacak bir şey yok,
SSL sertifikası da otomatik gelir.

Squarespace DNS'te kalmak isterseniz kısmi (CNAME) kurulum gerekir, o da
Cloudflare Business planı ister — nameserver değişikliği doğru yol.

---

## Yayına almadan önce yapılacaklar

Hepsi tek dosyada: **`src/data/site.js`**

| Alan | Durum |
|---|---|
| `phoneDisplay`, `phoneHref`, `phoneSchema`, `whatsapp` | ✅ girildi — 0530 951 25 69 |
| `domain`, `origin`, `email` | ✅ girildi — cekici.online |
| `addressVerified` + `address` | ⬜ **`false`** — aşağıya bak |
| `foundedYear` | ⬜ kuruluş yılı doğrulanacak (şu an 1998) |
| `claims.avgEta`, `claims.fleetSize` | ⬜ gerçek değerler |
| `claims.reviewRating` / `reviewCount` | ⬜ Google'da gerçekten varsa doldur, **yoksa `null` bırak** |
| `profiles` | ⬜ Google Maps, Instagram, Facebook bağlantıları |
| `photos` | ⬜ `assets/img/README.md` içinde anlatıldı |

Ayrıca:

- `src/data/faq.js` → `priceTable`: fiyatlar yer tutucudur, güncelle
- `src/data/districts.js` → `eta` alanları: gerçek ortalama varış süreleri

### Adres neden boş?

`addressVerified: false` olduğu sürece **posta adresi schema.org kaydına
yazılmaz**, footer ve iletişim sayfasında "hizmet alanı işletmesi" yazar.

Bu bilinçli: çekici gibi adrese giden işletmeler için Google zaten
"service area business" tipini önerir ve adres gizlenebilir. Yanlış bir
adres yayınlamak, adres yayınlamamaktan daha zararlıdır — Google Business
Profile ile sitedeki adres (NAP) uyuşmazsa yerel sıralama doğrudan düşer.

Gerçek adres netleşince: `address` alanlarını doldur, `addressVerified: true`
yap, `geo` koordinatlarını Google Maps'ten al. Tek build ile 116 sayfa güncellenir.

> **Uyarı:** Sitede geçen her sayı (varış süresi, yıl, filo sayısı, puan)
> doğrulanabilir olmalı. Yerel SEO'da en hızlı güven kaybettiren şey,
> gerçek olmayan rakamlardır. `reviewRating` boş bırakılırsa schema'ya
> hiç yazılmaz — uydurma yıldız yayınlanmaz.

---

## Sayfa yapısı

| Tür | Adet | URL kalıbı |
|---|---|---|
| Ana sayfa | 1 | `/` |
| Kurumsal | 7 | `/bolgeler/` `/hizmetler/` `/fiyatlar/` `/sss/` `/hakkimizda/` `/iletisim/` `/404.html` |
| Hizmet | 10 | `/hizmetler/oto-cekici/` |
| İlçe | 14 | `/kadikoy-oto-kurtarma/` |
| İlçe + hizmet | 84 | `/kadikoy-aku-takviye/` |

İlçe + hizmet sayfaları 14 ilçe × 6 öncelikli hizmetten üretiliyor.
Her sayfa, ilçeye özel saha notu, mahalle listesi, ana arterler ve
o ilçeye özel S.S.S. içeriyor; şablon metin tekrarı değil.

### Yeni ilçe / hizmet eklemek

`src/data/districts.js` veya `src/data/services.js` dosyasına bir kayıt ekle,
`npm run build` çalıştır. Sayfa, iç linkler, sitemap ve schema otomatik oluşur.
Hizmete `combo: true` verirsen 14 ilçe için kesişim sayfası da üretilir.

---

## SEO

- **Schema.org** her sayfada tek `@graph`: `AutomotiveBusiness` + `WebSite`
  + `BreadcrumbList` + sayfaya göre `Service` ve `FAQPage`
- `areaServed` olarak 14 ilçe, `openingHoursSpecification` 7/24
- Canonical, `og:` etiketleri, `tr-TR`, `geo.region`
- Otomatik `sitemap.xml` (öncelik kademeli) ve `robots.txt`
- Footer'daki iç link ağı sayesinde her sayfa **en fazla 2 tık** derinlikte
- Build sırasında otomatik kontrol: çift URL, eksik/uzun title,
  kısa description, birden fazla H1, eksik canonical.
  Sorun varsa build `exit 1` verir (CI'da kullanılabilir).

## Dönüşüm

- Mobilde ekranın altında sabit **Ara / WhatsApp** çubuğu
- `tel:` ve `wa.me` bağlantıları her ekranda görünür
- Tıklanabilir öğelerde `data-track` özniteliği var; GA4 veya
  Cloudflare Web Analytics ile olay takibi için hazır

---

## /duzenle/ — site bilgisi düzenleyici

`https://cekici.online/duzenle/`

Marka, telefon, adres, rakamlar, profiller, fotoğraf yolları, menü, ödeme
yöntemleri, güven maddeleri ve adımları form üzerinden düzenleyip
`site.js` dosyasını indirmenizi sağlayan araç sayfası.

**Nasıl kullanılır**

1. Sayfayı aç, alanları doldur
2. **site.js indir** düğmesine bas
3. İnen dosyayı depodaki `src/data/site.js` ile değiştir
4. Commit + push → 117 sayfa birden güncellenir

**Bilinmesi gerekenler**

- Sayfa hiçbir şey kaydetmez ve siteyi değiştirmez; sadece tarayıcıda dosya
  üretir. Değişiklik ancak dosya depoya girip push edilince yayına çıkar.
  Bu yüzden sayfanın herkese açık olması bir güvenlik sorunu değil.
- `noindex, nofollow` + `robots.txt` içinde `Disallow: /duzenle/`;
  sitemap'e girmez ve hiçbir sayfadan link almaz.
- Telefonu bir kez yazarsınız: `tel:` linki, WhatsApp numarası ve
  schema.org biçimi tek girdiden üretilir.
- Yazdıklarınız tarayıcıda taslak olarak saklanır (`localStorage`);
  **Yayındaki hâline dön** taslağı siler.
- Sağdaki kontrol listesi tutarsızlıkları söyler: geçersiz telefon,
  puansız değerlendirme sayısı, doğrulandı işaretli ama eksik adres.

**Kod tekrarı yok:** dosyayı üreten fonksiyon `src/lib/site-serialize.js`
içinde. Sayfa bu fonksiyonun kaynağını `toString()` ile gömüyor, testler de
aynı fonksiyonu çağırıyor — yani tarayıcıdaki üretici ile test edilen kod
birebir aynı.

## SEO ve duyuru

```bash
npm run audit    # SEO denetimi
npm run duyur    # IndexNow bildirimi (Bing, Yandex, Seznam, Naver)
```

`tools/seo-audit.mjs` ölçtükleri: başlık/açıklama benzersizliği ve uzunluğu,
`<main>` içindeki başlık hiyerarşisi, boş başlık, ince içerik, 5-kelimelik
parçalarla kopya içerik benzerliği, tıklama derinliği, gelen iç link sayısı,
çapa metni çeşitliliği, schema.org bütünlüğü, sitemap tutarlılığı, sayfa
ağırlığı. Kritik bulgu varsa `exit 1`.

### llms.txt

- `/llms.txt` — sitenin ne olduğu, hizmetler, bölgeler ve politikalar
- `/llms-full.txt` — tüm hizmet ve bölge içeriği tek dosyada (30 KB)

İkisi de HTML'den kazınmıyor, veri dosyalarından üretiliyor; site
güncellenince kendiliğinden güncelleniyor. `robots.txt` bu adresleri
gösteriyor ve 17 yapay zeka/arama tarayıcısını açıkça karşılıyor.

### IndexNow

`npm run duyur` sitemap'teki tüm URL'leri Bing, Yandex, Seznam ve Naver'a
bildirir. Göndermeden önce anahtar dosyasının ve sitenin canlı olduğunu
doğrular. Anahtar `src/data/indexnow.js` içinde ve gizli değil — alan adı
sahipliği, aynı anahtarın `/{anahtar}.txt` adresinde yayınlanmasıyla kanıtlanır.

**Google IndexNow kullanmaz.** Oraya bildirim için Search Console'a
`https://cekici.online/sitemap.xml` eklemeniz gerekir.

## Canlı kontrol

```bash
npm run canli                    # cekici.online
npm run canli -- https://...     # başka bir adres
```

Yayındaki gerçek cevapları denetler: sayfalar açılıyor mu, **charset
bildiriliyor mu**, cache ve güvenlik başlıkları geliyor mu, robots.txt
sözleşmeleri duruyor mu, `/duzenle/` noindex mi, bilinmeyen yol 404 mü.

Bu sınıf hatalar üretilen dosyada görünmez, yalnızca sunucu cevabında
görünür. Örnek: `.txt` dosyaları `charset` bildirilmeden gönderildiğinde
Android'de Türkçe karakterler bozuk çıkıyordu — dosya UTF-8'di, sorun
başlıktaydı.

## Testler

```bash
npm test
```

`test/site-serialize.test.mjs`: üretilen `site.js` diske yazılıp gerçek bir
ES modülü olarak import ediliyor ve mevcut veriyle alan alan karşılaştırılıyor.
Telefon biçimlendirme, kaçış gerektiren metinler ve `null` değerler ayrıca
test ediliyor. Her iki iş akışı da build'den önce bu testleri çalıştırır.

## PWA — ana ekrana eklenebilir site

Site bir Progressive Web App: telefonda "Ana ekrana ekle" ile uygulama gibi
kurulur, tam ekran açılır ve **arıza rehberi internetsiz çalışır**.

Bunun sebebi pratik: yolda kalan kişi çoğu zaman çekmeyen bir yerde oluyor.
İlk ziyarette 47 rehber sayfası arka planda cihaza indiriliyor; bağlantı
gitse bile "hararet yaptı ne yapmalıyım" sayfası açılıyor.

| Dosya | Ne yapar |
|---|---|
| `manifest.webmanifest` | Uygulama adı, ikonlar, kısayollar (Ara / Rehber / Süre) |
| `sw.js` | Servis çalışanı — build sırasında üretilir, elle düzenlenmez |
| `/cevrimdisi/` | Bağlantı yokken gösterilen sayfa; telefon numarası ve kayıtlı rehber |
| `icon-192.png`, `icon-512.png` | Koddan üretilen uygulama ikonları |

**Önbellek stratejisi**

- Sayfalar: önce ağ (3 sn zaman aşımı), olmazsa önbellek, o da yoksa `/cevrimdisi/`
- Statik dosyalar: önce önbellek (sürümlü oldukları için güvenli)
- Önbellek adı CSS sürüm hash'iyle etiketli; her deploy eskisini siler

**Dikkat:** `sw.js` asla uzun süreli cache'lenmemeli, yoksa güncelleme
ziyaretçiye hiç ulaşmaz ve eski siteye kilitlenirler. Worker bunu
`max-age=0, must-revalidate` ile engelliyor ve `npm run canli` kontrol ediyor.

## Görseller

Fotoğraf yokken site boş görünmüyor: her fotoğraf alanında markanın kendi
çekici çizimi (`src/lib/media.js`) gösteriliyor. `site.photos` içine gerçek
dosya yolu yazıldığı anda o alan `<img>`'e dönüşüyor.

- `assets/img/` → build sırasında `dist/img/` olarak kopyalanır
- Ölçüler ve kurallar: `assets/img/README.md`
- Paylaşım görseli `og.png` (1200×630) build sırasında koddan üretiliyor —
  otoyol değişken mesaj panosu (VMS) dilinde, nokta matrisli. Telefon numarası
  `site.js`'ten geldiği için numara değişince görsel de kendiliğinden güncellenir.
- `favicon.svg` ve `apple-touch-icon.png` de koddan üretiliyor

## Performans notları

- CSS tek dosya, içerik hash'iyle sürümleniyor (`/styles.css?v=ff139b6c`),
  Worker bunu `immutable` olarak 1 yıl cache'liyor
- Görsel kullanılmıyor; eklenirken WebP/AVIF, `width`/`height` ve
  `loading="lazy"` zorunlu (CLS için)
- Fontlar kendi sunucumuzda: `assets/fonts/` içinde 10 woff2 (118 KB),
  `assets/fonts.css` build sırasında `styles.css`'in başına ekleniyor.
  Üçüncü taraf istek yok — hem daha hızlı hem KVKK açısından temiz
  (Google Fonts ziyaretçi IP'sini Google'a gönderir).
  **`latin-ext` alt kümesini silmeyin**, Türkçe karakterler orada.

## Dosya düzeni

```
build.mjs              üretici — tüm sayfaları dist/ içine yazar
wrangler.jsonc         Cloudflare yapılandırması
src/worker.js          301 yönlendirme + cache/güvenlik başlıkları
src/data/              site.js, districts.js, services.js, faq.js
src/lib/               layout.js (kabuk), schema.js, util.js
src/pages/             home, district, service, combo, static
assets/styles.css      tasarım sistemi
dist/                  üretilen çıktı (git'e girmez)
```
