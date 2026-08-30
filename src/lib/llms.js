/**
 * llms.txt ve llms-full.txt
 *
 * llmstxt.org onerisi: sitenin ne oldugunu ve nerede ne bulundugunu
 * dil modellerine tek dosyada, markdown olarak anlatir. HTML'i kazimak
 * zorunda kalmadan dogru cevap verebilsinler diye.
 *
 * Icerik HTML'den kazinmiyor, dogrudan veri dosyalarindan uretiliyor —
 * yani site guncellenince bu dosyalar da kendiliginden guncelleniyor.
 */
import { site } from "../data/site.js";
import { districts } from "../data/districts.js";
import { sortedServices, comboServices } from "../data/services.js";
import { generalFaq, priceTable } from "../data/faq.js";
import { etaText, list } from "./util.js";

const u = (p) => site.origin + p;

/** Kisa indeks — llms.txt */
export function llmsTxt() {
  const L = [];
  L.push(`# ${site.name}`);
  L.push("");
  L.push(`> ${site.tagline}. İstanbul Anadolu Yakası'nın ${site.claims.districtCount} ilçesinde 7 gün 24 saat oto çekici, yol yardım, akü takviye, lastik değişimi ve kaza sonrası kurtarma hizmeti veren aile işletmesi. Ortalama varış süresi ${site.claims.avgEta} dakika.`);
  L.push("");
  L.push("## Hızlı bilgiler");
  L.push("");
  L.push(`- **Telefon:** ${site.phoneDisplay} (7/24, bayram ve resmî tatiller dahil)`);
  L.push(`- **WhatsApp:** https://wa.me/${site.whatsapp}`);
  L.push(`- **Web:** ${site.origin}/`);
  L.push(`- **Hizmet alanı:** İstanbul Anadolu Yakası — ${districts.map((d) => d.name).join(", ")}`);
  L.push(`- **Çalışma saatleri:** Her gün 00:00–24:00, kesintisiz`);
  L.push(`- **Ortalama varış:** ${site.claims.avgEta} dakika (ilçeye göre ${Math.min(...districts.filter((d) => d.eta).map((d) => d.eta))}–${Math.max(...districts.filter((d) => d.eta).map((d) => d.eta))} dk)`);
  L.push(`- **Ödeme:** ${site.payments.join(", ")}`);
  L.push(`- **Kuruluş:** ${site.foundedYear}`);
  L.push("");
  L.push("## Öne çıkan politikalar");
  L.push("");
  L.push("- Fiyat yola çıkmadan telefonda net rakamla söylenir ve sonradan değişmez.");
  L.push("- Gece, hafta sonu ve bayram için ek ücret alınmaz.");
  L.push("- Taşıma, yükleme anından teslimata kadar sigortalıdır; teslimde imzalı tutanak verilir.");
  L.push("- Araçlar K türü yetki belgeli, sürücüler SRC belgelidir.");
  L.push("- Yol yardımla yerinde çözülen arızalarda çekici ücreti alınmaz.");
  L.push("");
  L.push("## Hizmetler");
  L.push("");
  sortedServices.forEach((s) => {
    L.push(`- [${s.h1}](${u(`/hizmetler/${s.slug}/`)}): ${s.short} Fiyat: ${s.price}.`);
  });
  L.push("");
  L.push("## Hizmet bölgeleri");
  L.push("");
  districts.forEach((d) => {
    L.push(`- [${d.name} Oto Kurtarma](${u(`/${d.slug}-oto-kurtarma/`)}): ortalama varış ${etaText(d)}. Mahalleler: ${d.mahalleler.slice(0, 6).join(", ")}.`);
  });
  L.push("");
  L.push("## İlçeye özel hizmet sayfaları");
  L.push("");
  districts.forEach((d) => {
    L.push(`- ${d.name}: ` + comboServices.map((s) => `[${s.comboLabel}](${u(`/${d.slug}-${s.slug}/`)})`).join(", "));
  });
  L.push("");
  L.push("## Kurumsal");
  L.push("");
  L.push(`- [Fiyatlar](${u("/fiyatlar/")}): başlangıç fiyatları ve fiyatlandırma kuralları`);
  L.push(`- [Sık sorulan sorular](${u("/sss/")}): süre, fiyat, sigorta, kasko ve ödeme soruları`);
  L.push(`- [Hakkımızda](${u("/hakkimizda/")}): filo, belgeler ve çalışma biçimi`);
  L.push(`- [İletişim](${u("/iletisim/")}): yolda kalındığında ilk beş dakika ve belirti-hizmet tablosu`);
  L.push(`- [Tüm bölgeler](${u("/bolgeler/")}) · [Tüm hizmetler](${u("/hizmetler/")})`);
  L.push("");
  L.push("## Optional");
  L.push("");
  L.push(`- [Tam metin](${u("/llms-full.txt")}): tüm hizmet ve bölge içeriği tek dosyada`);
  L.push(`- [Site haritası](${u("/sitemap.xml")})`);
  L.push("");
  return L.join("\n");
}

/** Tam metin — llms-full.txt */
export function llmsFullTxt() {
  const L = [];
  L.push(`# ${site.name} — tam içerik`);
  L.push("");
  L.push(`${site.tagline}. Telefon: ${site.phoneDisplay}. Web: ${site.origin}/`);
  L.push(`Bu dosya ${site.origin}/ sitesinin tüm hizmet ve bölge içeriğini düz metin olarak içerir.`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("## Hizmetler");
  L.push("");
  sortedServices.forEach((s) => {
    L.push(`### ${s.h1}`);
    L.push("");
    L.push(`URL: ${u(`/hizmetler/${s.slug}/`)}`);
    L.push(`Başlangıç fiyatı: ${s.price}`);
    L.push("");
    L.push(s.intro);
    L.push("");
    L.push("**Şu durumlarda gerekir:**");
    s.when.forEach((w) => L.push(`- ${w}`));
    L.push("");
    L.push("**Hizmete dahil:**");
    s.includes.forEach((i) => L.push(`- ${i}`));
    L.push("");
    s.faq.forEach(([q, a]) => { L.push(`**S: ${q}**`); L.push(`C: ${a}`); L.push(""); });
  });

  L.push("---");
  L.push("");
  L.push("## Hizmet bölgeleri");
  L.push("");
  districts.forEach((d) => {
    L.push(`### ${d.name}`);
    L.push("");
    L.push(`URL: ${u(`/${d.slug}-oto-kurtarma/`)}`);
    L.push(`Ortalama varış süresi: ${etaText(d)}`);
    L.push(`Mahalleler: ${list(d.mahalleler)}`);
    L.push(`Ana arterler: ${list(d.arterler)}`);
    L.push(`Referans nokta: ${d.landmark}`);
    L.push("");
    L.push(d.note);
    L.push("");
    L.push(d.note2);
    L.push("");
    L.push(`${d.name} için ilçeye özel sayfalar: ` + comboServices.map((s) => `${s.comboLabel} (${u(`/${d.slug}-${s.slug}/`)})`).join(", "));
    L.push("");
  });

  L.push("---");
  L.push("");
  L.push("## Fiyatlar");
  L.push("");
  L.push("Aşağıdakiler başlangıç fiyatlarıdır, KDV dahildir. Kesin tutar aracın türüne ve mesafeye göre belirlenir ve yola çıkmadan telefonda söylenir. Gece, hafta sonu ve bayram farkı yoktur.");
  L.push("");
  L.push("| Hizmet | Kapsam | Fiyat |");
  L.push("| --- | --- | --- |");
  priceTable.forEach(([a, b, c]) => L.push(`| ${a} | ${b} | ${c} |`));
  L.push("");

  L.push("---");
  L.push("");
  L.push("## Sık sorulan sorular");
  L.push("");
  generalFaq.forEach(([q, a]) => { L.push(`**S: ${q}**`); L.push(`C: ${a}`); L.push(""); });

  L.push("---");
  L.push("");
  L.push(`Son güncelleme: ${new Date().toISOString().slice(0, 10)}`);
  L.push("");
  return L.join("\n");
}
