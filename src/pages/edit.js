/**
 * /duzenle/ — site verisini düzenleyip src/data/site.js dosyasını indiren araç.
 *
 * Sayfa tamamen statik: hiçbir sunucuya veri göndermez, siteyi değiştirmez.
 * Yaptığı tek şey, formdaki değerlerden geçerli bir site.js metni üretip
 * tarayıcıda dosya olarak indirtmek. Yayına almak için o dosyayı depodaki
 * src/data/site.js ile değiştirip push etmek gerekir.
 *
 * noindex + robots.txt Disallow ile arama motorlarından uzak tutulur.
 */
import { site, nav, trustPoints, steps } from "../data/site.js";
import { page } from "../lib/layout.js";
import { esc } from "../lib/util.js";
import { serializeSite, phoneForms } from "../lib/site-serialize.js";

/** Form alanları. path: site nesnesindeki konum. */
const GROUPS = [
  {
    title: "Marka",
    note: "Sitenin her yerinde ve schema.org kaydında görünen isimler.",
    fields: [
      { path: "name", label: "Marka adı", type: "text" },
      { path: "shortName", label: "Kısa ad", type: "text", hint: "Dar alanlarda kullanılır" },
      { path: "legalName", label: "Ticari unvan", type: "text", hint: "Fatura/kayıt unvanı" },
      { path: "tagline", label: "Slogan", type: "text", wide: true },
      { path: "foundedYear", label: "Kuruluş yılı", type: "number", hint: "Hakkımızda sayfasındaki “X yıldır” bundan hesaplanır" },
    ],
  },
  {
    title: "İletişim",
    note: "Telefonu bir kez yaz; tel: linki, WhatsApp ve schema.org biçimleri otomatik üretilir.",
    fields: [
      { path: "__phone", label: "Telefon", type: "tel", wide: true, hint: "0530 951 25 69 gibi yaz — gerisi hesaplanır" },
      { path: "email", label: "E-posta", type: "text" },
      { path: "domain", label: "Alan adı", type: "text", hint: "www olmadan" },
    ],
  },
  {
    title: "Adres",
    note: "Google Business Profile'daki adresle birebir aynı olmadıkça doğrulandı işaretini açma. Yanlış adres, adressizlikten daha zararlı.",
    fields: [
      { path: "addressVerified", label: "Adres doğrulandı, schema.org kaydına yazılsın", type: "bool", wide: true },
      { path: "address.street", label: "Cadde / sokak", type: "text", wide: true },
      { path: "address.district", label: "İlçe", type: "text" },
      { path: "address.city", label: "Şehir", type: "text" },
      { path: "address.postalCode", label: "Posta kodu", type: "text" },
      { path: "geo.lat", label: "Enlem", type: "number", step: "any" },
      { path: "geo.lng", label: "Boylam", type: "number", step: "any" },
    ],
  },
  {
    title: "Rakamlar",
    note: "Sitede geçen her sayı bir vaat. Doğrulayamadığını yazma.",
    fields: [
      { path: "claims.avgEta", label: "Ortalama varış (dk)", type: "number" },
      { path: "claims.districtCount", label: "İlçe sayısı", type: "number" },
      { path: "claims.fleetSize", label: "Filodaki araç", type: "number" },
      { path: "claims.reviewRating", label: "Google puanı", type: "nullnumber", step: "0.1", hint: "Gerçekten varsa doldur, yoksa boş bırak" },
      { path: "claims.reviewCount", label: "Değerlendirme sayısı", type: "nullnumber", hint: "Puan boşsa bu da boş kalmalı" },
      { path: "priceRange", label: "Fiyat aralığı", type: "text", hint: "schema.org için: ₺, ₺₺, ₺₺₺" },
    ],
  },
  {
    title: "Profiller",
    note: "Boş bırakılanlar sayfada hiç gösterilmez.",
    fields: [
      { path: "profiles.googleMaps", label: "Google Maps", type: "text", wide: true },
      { path: "profiles.instagram", label: "Instagram", type: "text", wide: true },
      { path: "profiles.facebook", label: "Facebook", type: "text", wide: true },
    ],
  },
  {
    title: "Fotoğraflar",
    note: "assets/img/ altına koyduğun dosyanın yolu. Boş bırakılan alanda markanın çekici çizimi görünür.",
    fields: [
      { path: "photos.hero", label: "Hero — 1600×900", type: "nullstr", wide: true },
      { path: "photos.saha1", label: "Saha 1 — 1200×800", type: "nullstr" },
      { path: "photos.saha2", label: "Saha 2 — 1200×800", type: "nullstr" },
      { path: "photos.saha3", label: "Saha 3 — 1200×800", type: "nullstr" },
      { path: "photos.saha4", label: "Saha 4 — 1200×800", type: "nullstr" },
      { path: "photos.filo", label: "Filo — 1600×900", type: "nullstr" },
    ],
  },
];

const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

function field(f) {
  const id = "f_" + f.path.replace(/\./g, "_");
  const raw = f.path === "__phone" ? site.phoneDisplay : get(site, f.path);
  const cls = "fld" + (f.wide ? " fld--wide" : "");

  if (f.type === "bool") {
    return `<label class="${cls} fld--check">
      <input type="checkbox" id="${id}" data-path="${f.path}" data-type="bool"${raw ? " checked" : ""}>
      <span>${esc(f.label)}</span>
    </label>`;
  }

  const value = raw === null || raw === undefined ? "" : String(raw);
  const inputType = f.type === "number" || f.type === "nullnumber" ? "number" : "text";
  return `<div class="${cls}">
    <label for="${id}">${esc(f.label)}</label>
    <input type="${inputType}" id="${id}" data-path="${f.path}" data-type="${f.type}"
      value="${esc(value)}"${f.step ? ` step="${f.step}"` : ""}${f.type === "tel" ? ' inputmode="tel"' : ""}>
    ${f.hint ? `<small>${esc(f.hint)}</small>` : ""}
  </div>`;
}

const STYLE = `<style>
.ed{--gap:18px;padding:34px 0 90px}
.ed-head{border-bottom:1px solid var(--line);padding-bottom:26px;margin-bottom:30px}
.ed-head h1{font-size:clamp(30px,4.5vw,46px)}
.ed-warn{margin-top:18px;border-left:2px solid var(--amber);padding:4px 0 4px 16px;color:var(--mut);font-size:15px;max-width:74ch}
.ed-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,410px);gap:34px;align-items:start}
@media (max-width:1000px){.ed-grid{grid-template-columns:1fr}}
.grp{border:1px solid var(--line);border-radius:3px;background:var(--panel-2);margin-bottom:20px;overflow:hidden}
.grp > summary{
  cursor:pointer;list-style:none;padding:16px 20px;background:var(--panel);
  font-family:var(--f-disp);font-size:20px;font-weight:700;text-transform:uppercase;
  letter-spacing:.03em;color:var(--paper);display:flex;justify-content:space-between;align-items:center;gap:12px;
}
.grp > summary::-webkit-details-marker{display:none}
.grp > summary::after{content:"";width:10px;height:10px;border-right:2px solid var(--amber);border-bottom:2px solid var(--amber);transform:rotate(45deg);transition:transform .15s ease;flex:none}
.grp[open] > summary::after{transform:rotate(225deg)}
.grp-in{padding:20px}
.grp-note{color:var(--mut);font-size:14.5px;margin:0 0 18px;max-width:72ch}
.flds{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}
.fld--wide{grid-column:1/-1}
.fld label{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut);margin-bottom:6px;font-weight:600}
.fld small{display:block;color:#6E757F;font-size:12.5px;margin-top:5px;line-height:1.4}
input[type=text],input[type=number],textarea{
  width:100%;background:#0F1216;border:1px solid #2E343C;border-radius:2px;color:var(--paper);
  font-family:var(--f-body);font-size:15.5px;padding:10px 12px;
}
input:focus,textarea:focus{outline:none;border-color:var(--amber)}
textarea{resize:vertical;min-height:64px;line-height:1.5}
.fld--check{display:flex;align-items:center;gap:10px;color:var(--body);font-size:15px}
.fld--check input{width:18px;height:18px;accent-color:var(--amber);flex:none}
.fld--check label{margin:0}
.rep-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;padding:14px 0;border-top:1px solid var(--line-soft)}
.rep-row:first-child{border-top:0}
.rep-row .cols{display:grid;gap:10px}
.btn-sm{
  background:transparent;border:1px solid #39404A;color:var(--body);border-radius:2px;
  font-family:var(--f-body);font-size:13px;padding:8px 12px;cursor:pointer;white-space:nowrap;
}
.btn-sm:hover{border-color:var(--amber);color:var(--amber)}
.btn-sm.dngr:hover{border-color:var(--danger);color:var(--danger)}
.side{position:sticky;top:82px;display:grid;gap:18px}
.side .card{background:var(--panel-2);border:1px solid var(--line);border-radius:3px;padding:20px;gap:14px}
.out{
  width:100%;min-height:260px;background:#0A0C0F;border:1px solid var(--line);border-radius:2px;
  color:#C9D0D8;font-family:"SFMono-Regular",Menlo,Consolas,monospace;font-size:12px;line-height:1.55;
  padding:14px;white-space:pre;overflow:auto;
}
.acts{display:flex;gap:10px;flex-wrap:wrap}
.acts .btn{font-size:16px;padding:11px 18px}
.chk{display:grid;gap:8px;font-size:14px}
.chk li{list-style:none;display:flex;gap:9px;align-items:flex-start;color:var(--mut)}
.chk li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--ok);margin-top:7px;flex:none}
.chk li.warn{color:var(--amber)}
.chk li.warn::before{background:var(--amber)}
.chk li.bad{color:var(--danger)}
.chk li.bad::before{background:var(--danger)}
.prev{border:1px solid var(--line);border-radius:3px;overflow:hidden}
.prev-bar{background:var(--asphalt);padding:12px 14px;display:flex;align-items:center;gap:10px;justify-content:space-between}
.prev-name{font-family:var(--f-disp);font-size:15px;text-transform:uppercase;letter-spacing:.04em;color:var(--paper)}
.prev-tel{background:var(--amber);color:#141007;font-family:var(--f-disp);font-size:15px;padding:6px 11px;border-radius:2px}
.toast{
  position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);
  background:var(--amber);color:#141007;font-weight:600;font-size:15px;padding:11px 20px;border-radius:2px;
  opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;z-index:80;
}
.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
</style>`;

function repeater(id, title, note, rows, cols) {
  return `<details class="grp"><summary>${esc(title)}</summary><div class="grp-in">
    <p class="grp-note">${esc(note)}</p>
    <div id="${id}" data-rep="${id}">${rows}</div>
    <button type="button" class="btn-sm" data-add="${id}" style="margin-top:14px">+ Satır ekle</button>
  </div></details>`;
}

const navRows = nav.map((n) => `<div class="rep-row"><div class="cols">
  <input type="text" data-f="label" value="${esc(n.label)}" placeholder="Menü adı">
  <input type="text" data-f="href" value="${esc(n.href)}" placeholder="/adres/">
</div><button type="button" class="btn-sm dngr" data-del>Sil</button></div>`).join("");

const pairRows = (arr) => arr.map((t) => `<div class="rep-row"><div class="cols">
  <input type="text" data-f="title" value="${esc(t.title)}" placeholder="Başlık">
  <textarea data-f="body" placeholder="Açıklama">${esc(t.body)}</textarea>
</div><button type="button" class="btn-sm dngr" data-del>Sil</button></div>`).join("");

const payRows = site.payments.map((p) => `<div class="rep-row"><div class="cols">
  <input type="text" data-f="value" value="${esc(p)}" placeholder="Ödeme yöntemi">
</div><button type="button" class="btn-sm dngr" data-del>Sil</button></div>`).join("");

export function editPage() {
  const path = "/duzenle/";

  const body = `
<div class="wrap ed">
  <div class="ed-head">
    <span class="eyebrow">Yönetim aracı</span>
    <h1>Site bilgilerini düzenle</h1>
    <p class="lede">Aşağıdaki alanları doldur, sağdaki <b>site.js indir</b> düğmesine bas. İnen dosyayı depodaki <code>src/data/site.js</code> ile değiştirip push ettiğinde 116 sayfanın tamamı güncellenir.</p>
    <p class="ed-warn">Bu sayfa hiçbir şey kaydetmez ve siteyi değiştirmez — sadece tarayıcında bir dosya üretir. Değişiklik yayına ancak dosyayı depoya koyup push ettiğinde girer.</p>
  </div>

  <div class="ed-grid">
    <form id="ed-form" autocomplete="off">
      ${GROUPS.map((g, i) => `<details class="grp"${i < 3 ? " open" : ""}><summary>${esc(g.title)}</summary><div class="grp-in">
        <p class="grp-note">${esc(g.note)}</p>
        <div class="flds">${g.fields.map(field).join("")}</div>
      </div></details>`).join("")}

      ${repeater("rep-nav", "Menü", "Üst menüdeki bağlantılar. Sıra buradaki sıradır.", navRows)}
      ${repeater("rep-pay", "Ödeme yöntemleri", "İletişim ve hakkımızda sayfalarında listelenir.", payRows)}
      ${repeater("rep-trust", "Güven maddeleri", "Ana sayfa ve fiyatlar sayfasındaki “neden biz” blokları.", pairRows(trustPoints))}
      ${repeater("rep-steps", "Adımlar", "“Nasıl işliyor” bölümündeki sıralı adımlar.", pairRows(steps))}
    </form>

    <aside class="side">
      <div class="card">
        <h3>Önizleme</h3>
        <div class="prev"><div class="prev-bar">
          <span class="prev-name" id="pv-name">${esc(site.name)}</span>
          <span class="prev-tel" id="pv-tel">${esc(site.phoneDisplay)}</span>
        </div></div>
        <ul class="chk" id="checks"></ul>
      </div>

      <div class="card">
        <h3>Çıktı</h3>
        <div class="acts">
          <button type="button" class="btn" id="dl">site.js indir</button>
          <button type="button" class="btn btn--ghost" id="copy">Panoya kopyala</button>
          <button type="button" class="btn-sm" id="reset">Yayındaki hâline dön</button>
        </div>
        <pre class="out" id="out"></pre>
      </div>
    </aside>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
(function () {
  "use strict";
  var form = document.getElementById("ed-form");
  var out = document.getElementById("out");
  var DRAFT = "bektas-site-draft-v1";

  // Node'daki testle birebir ayni kod — src/lib/site-serialize.js kaynagindan gomuldu
  var phoneForms = __PHONE_FN__;
  var buildFile = __SERIALIZE_FN__;

  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("on"); }, 2200);
  }
  function setPath(obj, path, val) {
    var parts = path.split("."), o = obj;
    for (var i = 0; i < parts.length - 1; i++) { if (!o[parts[i]]) o[parts[i]] = {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = val;
  }

  function readRepeater(id, fields) {
    var rows = [];
    document.querySelectorAll("#" + id + " .rep-row").forEach(function (row) {
      var o = {}, ok = false;
      fields.forEach(function (f) {
        var el = row.querySelector('[data-f="' + f + '"]');
        o[f] = el ? el.value.trim() : "";
        if (o[f]) ok = true;
      });
      if (ok) rows.push(o);
    });
    return rows;
  }

  function collect() {
    var s = {};
    form.querySelectorAll("[data-path]").forEach(function (el) {
      var p = el.getAttribute("data-path"), t = el.getAttribute("data-type");
      if (p === "__phone") return;
      var v;
      if (t === "bool") v = el.checked;
      else if (t === "number") v = el.value === "" ? 0 : Number(el.value);
      else if (t === "nullnumber") v = el.value === "" ? null : Number(el.value);
      else if (t === "nullstr") v = el.value.trim() === "" ? null : el.value.trim();
      else v = el.value.trim();
      setPath(s, p, v);
    });

    var ph = phoneForms(document.getElementById("f___phone").value);
    s.phoneDisplay = ph ? ph.display : "";
    s.phoneHref = ph ? ph.href : "";
    s.phoneSchema = ph ? ph.schema : "";
    s.whatsapp = ph ? ph.wa : "";
    s.address = s.address || {};
    s.address.country = "TR";
    s.origin = "https://" + (s.domain || "").replace(/^https?:\\/\\//, "").replace(/\\/$/, "");
    s.payments = readRepeater("rep-pay", ["value"]).map(function (r) { return r.value; });
    s.photos = s.photos || {};

    return {
      site: s,
      nav: readRepeater("rep-nav", ["label", "href"]),
      trustPoints: readRepeater("rep-trust", ["title", "body"]),
      steps: readRepeater("rep-steps", ["title", "body"])
    };
  }

  /* --- kontroller --- */
  function checks(d) {
    var s = d.site, list = [];
    var ph = phoneForms(document.getElementById("f___phone").value);
    if (!ph) list.push(["bad", "Telefon 10 haneli olmalı — şu an geçersiz"]);
    else list.push(["ok", "Telefon: " + ph.display + " · wa.me/" + ph.wa]);

    if (!s.name) list.push(["bad", "Marka adı boş"]);
    if (!s.domain) list.push(["bad", "Alan adı boş"]);

    if (s.addressVerified) {
      if (!s.address.street || !s.address.district) list.push(["bad", "Adres doğrulandı işaretli ama alanlar eksik"]);
      else list.push(["ok", "Adres schema.org kaydına yazılacak"]);
    } else {
      list.push(["warn", "Adres yayınlanmıyor — hizmet alanı işletmesi olarak görünecek"]);
    }

    if (s.claims.reviewCount !== null && s.claims.reviewRating === null)
      list.push(["bad", "Değerlendirme sayısı var ama puan yok — ikisi birlikte olmalı"]);
    else if (s.claims.reviewRating !== null && (s.claims.reviewRating < 1 || s.claims.reviewRating > 5))
      list.push(["bad", "Google puanı 1 ile 5 arasında olmalı"]);
    else if (s.claims.reviewRating === null)
      list.push(["warn", "Google puanı boş — schema.org'a yıldız yazılmayacak"]);
    else list.push(["ok", "Google puanı: " + s.claims.reviewRating + " (" + s.claims.reviewCount + " değerlendirme)"]);

    if (!d.nav.length) list.push(["bad", "Menü boş kaldı"]);
    if (!d.steps.length) list.push(["warn", "Adım kalmadı — “nasıl işliyor” bölümü boş görünür"]);

    var photos = ["hero", "saha1", "saha2", "saha3", "saha4", "filo"].filter(function (k) { return s.photos[k]; });
    list.push([photos.length ? "ok" : "warn", photos.length + "/6 fotoğraf alanı dolu"]);

    document.getElementById("checks").innerHTML = list.map(function (x) {
      return '<li class="' + x[0] + '">' + x[1].replace(/</g, "&lt;") + "</li>";
    }).join("");
  }

  var current = "";
  function refresh(save) {
    var d = collect();
    current = buildFile(d);
    out.textContent = current;
    checks(d);
    document.getElementById("pv-name").textContent = d.site.name || "—";
    document.getElementById("pv-tel").textContent = d.site.phoneDisplay || "—";
    if (save !== false) {
      try { localStorage.setItem(DRAFT, JSON.stringify(snapshot())); } catch (e) {}
    }
  }

  /* --- taslak: form durumunu sakla / geri yukle --- */
  function snapshot() {
    var o = { f: {}, r: {} };
    form.querySelectorAll("[data-path]").forEach(function (el) {
      o.f[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    ["rep-nav", "rep-pay", "rep-trust", "rep-steps"].forEach(function (id) {
      o.r[id] = [];
      document.querySelectorAll("#" + id + " .rep-row").forEach(function (row) {
        var e = {};
        row.querySelectorAll("[data-f]").forEach(function (el) { e[el.getAttribute("data-f")] = el.value; });
        o.r[id].push(e);
      });
    });
    return o;
  }
  function restore(o) {
    Object.keys(o.f || {}).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") el.checked = o.f[id]; else el.value = o.f[id];
    });
    Object.keys(o.r || {}).forEach(function (id) {
      var box = document.getElementById(id);
      if (!box) return;
      var tpl = box.querySelector(".rep-row");
      if (!tpl) return;
      var blank = tpl.cloneNode(true);
      box.innerHTML = "";
      o.r[id].forEach(function (e) {
        var row = blank.cloneNode(true);
        row.querySelectorAll("[data-f]").forEach(function (el) { el.value = e[el.getAttribute("data-f")] || ""; });
        box.appendChild(row);
      });
    });
  }

  /* --- olaylar --- */
  form.addEventListener("input", function () { refresh(); });
  form.addEventListener("change", function () { refresh(); });

  document.addEventListener("click", function (ev) {
    var del = ev.target.closest("[data-del]");
    if (del) {
      var box = del.closest("[data-rep]");
      if (box.querySelectorAll(".rep-row").length > 1) del.closest(".rep-row").remove();
      else toast("Son satır silinemez");
      refresh();
      return;
    }
    var add = ev.target.closest("[data-add]");
    if (add) {
      var target = document.getElementById(add.getAttribute("data-add"));
      var row = target.querySelector(".rep-row").cloneNode(true);
      row.querySelectorAll("[data-f]").forEach(function (el) { el.value = ""; });
      target.appendChild(row);
      var first = row.querySelector("[data-f]");
      if (first) first.focus();
      refresh();
    }
  });

  document.getElementById("dl").addEventListener("click", function () {
    var blob = new Blob([current], { type: "text/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site.js";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("site.js indirildi — src/data/site.js ile değiştir");
  });

  document.getElementById("copy").addEventListener("click", function () {
    navigator.clipboard.writeText(current).then(
      function () { toast("Panoya kopyalandı"); },
      function () { toast("Kopyalanamadı — metni elle seç"); }
    );
  });

  document.getElementById("reset").addEventListener("click", function () {
    try { localStorage.removeItem(DRAFT); } catch (e) {}
    location.reload();
  });

  try {
    var saved = localStorage.getItem(DRAFT);
    if (saved) { restore(JSON.parse(saved)); toast("Kaydedilmiş taslak geri yüklendi"); }
  } catch (e) {}

  refresh(false);
})();
</script>`;

  const inlined = body
    .replace("__PHONE_FN__", phoneForms.toString())
    .replace("__SERIALIZE_FN__", serializeSite.toString());

  return {
    path,
    noindex: true,
    html: page({
      path,
      noindex: true,
      bare: true,
      extraHead: STYLE,
      title: "Site bilgilerini düzenle",
      description: "Bektaş Oto Kurtarma site verisini düzenleyip src/data/site.js dosyasını üreten yönetim aracı. Arama motorlarına kapalıdır.",
      body: inlined,
    }),
  };
}
