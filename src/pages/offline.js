/**
 * /cevrimdisi/ — baglanti yokken servis calisani tarafindan gosterilen sayfa.
 * Kendisi de onbellege alinir; yani internetsizken bile acilir.
 */
import { site } from "../data/site.js";
import { page, links } from "../lib/layout.js";
import { esc, mkTitle } from "../lib/util.js";

export function offlinePage() {
  const path = "/cevrimdisi/";
  const body = `
<section class="err">
  <div class="wrap">
    <span class="eyebrow">Bağlantı yok</span>
    <h1>İnternet yok,<br><em>telefon var</em></h1>
    <p class="lede" style="margin:16px 0 26px">Bu sayfayı görüyorsanız internet bağlantınız kesilmiş demektir. Telefon hattı çoğu zaman veri bağlantısından önce gelir — doğrudan arayabilirsiniz.</p>
    <div class="btn-row">
      <a class="btn" href="${links.tel}" data-track="tel-offline">${esc(site.phoneDisplay)}</a>
    </div>

    <div class="sec-head" style="margin-top:52px">
      <h2>Daha önce açtığınız sayfalar</h2>
      <p class="lede">Arıza rehberi cihazınıza kaydedilir; bağlantı olmadan da okuyabilirsiniz.</p>
    </div>
    <div class="chips">
      <a class="chip" href="/rehber/">Arıza rehberi</a>
      <a class="chip" href="/rehber/yolda-kaldim-ne-yapmali/">Yolda kaldım, ne yapmalıyım?</a>
      <a class="chip" href="/rehber/hararet-yapiyor/">Araç hararet yapıyor</a>
      <a class="chip" href="/rehber/mars-donmuyor-tik-sesi/">Marş basınca tık sesi</a>
      <a class="chip" href="/rehber/lastik-patladi/">Lastik patladı</a>
      <a class="chip" href="/rehber/kaza-sonrasi-ne-yapmali/">Kaza sonrası ne yapılır</a>
    </div>

    <p class="muted" style="margin-top:40px;max-width:60ch">Yolda kaldıysanız: dörtlüleri yakın, reflektif yeleği giyip aracın arkasından inin, üçgeni şehir içinde 30, otoyolda 150 metre geriye koyun ve bariyerin arkasına geçin.</p>
  </div>
</section>`;

  return {
    path,
    noindex: true,
    html: page({
      path, noindex: true, bare: true,
      title: mkTitle("Bağlantı yok"),
      description: "İnternet bağlantısı olmadığında gösterilen sayfa. Telefonla doğrudan arayabilir, kaydedilmiş arıza rehberini okuyabilirsiniz.",
      body,
    }),
  };
}
