# Fotoğraflar

Gerçek fotoğrafları bu klasöre koyun, sonra `src/data/site.js` içindeki
`photos` kaydına yolunu yazın:

```js
photos: {
  hero:  "/img/hero-gece.webp",
  saha1: "/img/kadikoy-yukleme.webp",
  saha2: "/img/tem-gece.webp",
  saha3: "/img/atasehir-aku.webp",
  saha4: "/img/bagdat-otopark.webp",
  filo:  "/img/filo.webp",
}
```

`null` bırakılan her alanda markanın kendi çizimi gösterilir; site hiçbir
yerde bozuk görsel veya boş kutu göstermez.

## Ölçüler

| Anahtar | Ölçü | Ne olmalı |
|---|---|---|
| `hero` | 1600×900 | Gece çekimi, çekici ve tepe lambası görünsün |
| `saha1..saha4` | 1200×800 | İş başında gerçek kareler — yükleme, akü, lastik, otopark |
| `filo` | 1600×900 | Araçların toplu fotoğrafı |

## Kurallar

- **WebP** veya **AVIF** kaydedin, her dosya **200 KB altı** olsun.
  Dönüştürme: `cwebp -q 82 foto.jpg -o foto.webp`
- Stok fotoğraf kullanmayın. "Gerçek işlerden" diyen bir sayfada stok
  görsel kullanmak, sitedeki tek yalan olur.
- İnsan yüzü ve plaka görünüyorsa izin alın veya bulanıklaştırın.
- Dosya adları Türkçe karaktersiz ve tireli: `kadikoy-yukleme.webp`

Build sırasında bu klasör olduğu gibi `dist/img/` içine kopyalanır.
