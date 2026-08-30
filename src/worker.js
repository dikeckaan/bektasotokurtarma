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

    // 3) Statik dosya.
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) headers.set(key, value);

    const contentType = headers.get("content-type") || "";
    if (contentType.startsWith("text/html")) {
      // HTML: kisa tarayici cache'i, uzun kenar cache'i (deploy'da purge olur).
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      headers.set("CDN-Cache-Control", "public, max-age=3600");
    } else if (/\.(css|js|woff2|png|jpg|jpeg|webp|avif|svg|ico)$/.test(url.pathname)) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, { status: response.status, headers });
  },
};
