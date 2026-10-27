# Kök klasör dosyaları

Bu klasördeki her şey `dist/` kökünüe olduğu gibi kopyalanır. Arama motoru
doğrulama dosyaları buraya konur.

`README.md` kopyalanmaz.

## Şu an burada olanlar

| Dosya | Ne için |
|---|---|
| `yandex_9744c2f595308c07.html` | Yandex Webmaster site doğrulaması |
| `googlea9862d7165ba2e3f.html` | Google Search Console site doğrulaması |

## Yeni doğrulama dosyası eklerken

1. Dosyayı bu klasöre koyun
2. `npm run build && npm run deploy`
3. Arama motorunun panelinde "Doğrula" düğmesine basın

Google Search Console'da HTML dosyası yöntemi yerine **DNS TXT kaydı**
önerilir: alan adı Cloudflare'de olduğu için DNS kaydı eklemek daha
kalıcıdır ve dosya silinme riski taşımaz.

## Önemli

Doğrulama dosyalarını **silmeyin**. Arama motorları doğrulamayı düzenli
aralıklarla tekrar kontrol eder; dosya kaybolursa site doğrulaması düşer
ve panel erişimi kapanır.

Bu dosyalar `npm run canli` testinde kontrol edilir.
