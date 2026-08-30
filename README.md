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

### DNS

Alan adı Cloudflare'de değilse, kayıt şirketinde nameserver'ları
Cloudflare'in verdiği adreslerle değiştir. Custom domain eklendiğinde
Cloudflare A/CNAME kaydını kendisi yazar; SSL sertifikası otomatik gelir.

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
- Fontlar şu an Google Fonts'tan yükleniyor. LCP'yi düşürmek için
  `Saira Condensed` ve `Barlow` woff2 dosyalarını `assets/fonts/` altına
  indirip `@font-face` ile self-host etmek önerilir.

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
