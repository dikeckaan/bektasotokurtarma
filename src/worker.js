/**
 * Bektas Oto Kurtarma - statik site worker'i.
 *
 * Isi uc sey: kanonik host'a 301, eski/yanlis yollari toparlama ve
 * statik dosyalara dogru cache + guvenlik basliklarini eklemek.
 * Sayfalarin kendisi build.mjs tarafindan dist/ icine uretiliyor.
 */

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Yaygin yanlis yazimlar ve eski URL'ler icin kalici yonlendirmeler.
const REDIRECTS = new Map([
  ["/index.html", "/"],
  ["/anasayfa", "/"],
  ["/hizmet", "/hizmetler/"],
  ["/bolge", "/bolgeler/"],
  ["/iletisim.html", "/iletisim/"],
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1) Kanonik host: www.* ve diger hostlar apex'e 301.
    const canonical = env.CANONICAL_HOST;
    if (canonical && url.hostname !== canonical && !url.hostname.endsWith(".workers.dev")) {
      url.hostname = canonical;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // 2) Elle tanimli yonlendirmeler.
    const target = REDIRECTS.get(url.pathname.replace(/\/+$/, "") || "/");
    if (target && target !== url.pathname) {
      return Response.redirect(new URL(target, url).toString(), 301);
    }

    // 3) Kok klasordeki .html dosyalari (arama motoru dogrulamalari).
    //    html_handling: "auto-trailing-slash" ayari /dosya.html adresini
    //    /dosya adresine 307 ile yonlendiriyor. Dogrulayicilarin bir kismi
    //    yonlendirme izlemedigi icin tam URL'de 200 donmesi gerekiyor:
    //    istegi uzantisiz haliyle asset katmanina veriyoruz, cevabi
    //    orijinal URL'de donduruyoruz.
    let assetRequest = request;
    if (/^\/[^/]+\.html$/.test(url.pathname) && url.pathname !== "/404.html") {
      const uzantisiz = new URL(url);
      uzantisiz.pathname = url.pathname.replace(/\.html$/, "");
      assetRequest = new Request(uzantisiz, request);
    }

    // 4) Statik dosya.
    const response = await env.ASSETS.fetch(assetRequest);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);

    const contentType = headers.get("content-type") || "";

    // Karakter seti: charset'siz text/plain gonderildiginde tarayici kendi
    // varsayilanina duser (Android'de Turkce yerelde genelde windows-1254) ve
    // llms.txt / robots.txt gibi dosyalarda Turkce karakterler bozuk gorunur.
    if (/^(text\/|application\/(xml|json|javascript))/.test(contentType) && !/charset=/i.test(contentType)) {
      headers.set("content-type", contentType + "; charset=utf-8");
    }

    if (contentType.startsWith("text/html")) {
      // HTML: kisa tarayici cache'i, uzun kenar cache'i (deploy'da purge olur).
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      headers.set("CDN-Cache-Control", "public, max-age=3600");
    } else if (url.pathname === "/sw.js") {
      // Servis calisani asla uzun sureli cache'lenmemeli; yoksa guncelleme
      // hic ulasmaz ve ziyaretci eski siteye kilitlenir.
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      headers.set("Service-Worker-Allowed", "/");
    } else if (url.pathname === "/manifest.webmanifest") {
      headers.set("Content-Type", "application/manifest+json; charset=utf-8");
      headers.set("Cache-Control", "public, max-age=3600");
    } else if (/\.(css|js|woff2|png|jpg|jpeg|webp|avif|svg|ico)$/.test(url.pathname)) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, { status: response.status, headers });
  },
};
