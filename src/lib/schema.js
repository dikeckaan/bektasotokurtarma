import { site } from "../data/site.js";
import { districts } from "../data/districts.js";

const jsonld = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

export const ORG_ID = `${site.origin}/#kurulus`;

/** Ana kurulus kaydi. Her sayfada bulunur; yerel SEO'nun omurgasi. */
export function organizationSchema() {
  const node = {
    "@type": ["AutomotiveBusiness", "LocalBusiness"],
    "@id": ORG_ID,
    name: site.name,
    alternateName: ["Bektaş Çekici", "Pendik Çekici Bektaş", "Bektaş Oto Kurtarma Pendik"],
    description: `${site.tagline}. Garajı Pendik'te; Pendik'in 36 mahallesi ve Anadolu Yakası'nın ${site.claims.districtCount} ilçesinde oto çekici, yol yardım, akü takviye ve kaza kurtarma hizmeti.`,
    url: site.origin + "/",
    telephone: site.phoneSchema,
    email: site.email,
    priceRange: site.priceRange,
    foundingDate: String(site.foundedYear),
    currenciesAccepted: "TRY",
    paymentAccepted: site.payments.join(", "),
    image: site.origin + "/og.png",
    logo: site.origin + "/og.png",
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    // Hizmet alani isletmesi: adres yalnizca dogrulandiginda yayinlanir.
    ...(site.addressVerified
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.street,
            addressLocality: site.address.district,
            addressRegion: site.address.city,
            postalCode: site.address.postalCode,
            addressCountry: site.address.country,
          },
        }
      : {
          // Hizmet alani isletmesi: sokak adresi yok ama ilce bilgisi dogru ve yerel aramada belirleyici
          address: {
            "@type": "PostalAddress",
            addressLocality: site.address.district,
            addressRegion: site.address.city,
            addressCountry: site.address.country,
          },
        }),
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00", closes: "23:59",
    }],
    // Garajdan 25 km yaricap Pendik'in tamamini ve komsu ilceleri kapsar
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
        geoRadius: 25000,
      },
      ...districts.map((d) => ({ "@type": "AdministrativeArea", name: `${d.name}, İstanbul` })),
    ],
    hasMap: site.profiles.googleMaps || undefined,
    knowsLanguage: "tr-TR",
  };
  const sameAs = Object.values(site.profiles).filter(Boolean);
  if (sameAs.length) node.sameAs = sameAs;
  if (site.claims.reviewRating && site.claims.reviewCount) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: site.claims.reviewRating,
      reviewCount: site.claims.reviewCount,
    };
  }
  return node;
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${site.origin}/#site`,
    url: site.origin + "/",
    name: site.name,
    inLanguage: "tr-TR",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbSchema(crumbs) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.label,
      item: c.href ? site.origin + c.href : undefined,
    })),
  };
}

export function faqSchema(pairs) {
  if (!pairs || !pairs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: pairs.map(([q, a]) => ({
      "@type": "Question", name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** places: ilce adlarinin yanina eklenecek hazir Place dugumleri (mahalle, havalimani). */
export function serviceSchema({ name, description, url, areaNames, price, places = [] }) {
  return {
    "@type": "Service",
    name, description, url: site.origin + url,
    serviceType: name,
    provider: { "@id": ORG_ID },
    areaServed: [
      ...areaNames.map((n) => ({ "@type": "AdministrativeArea", name: `${n}, İstanbul` })),
      ...places,
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: { "@type": "ContactPoint", telephone: site.phoneSchema, contactType: "customer service", availableLanguage: "Turkish" },
      serviceUrl: site.origin + url,
    },
    ...(price ? { offers: { "@type": "Offer", priceCurrency: "TRY", description: price } } : {}),
  };
}

/** Sayfanin tum schema dugumlerini tek @graph icinde birlestirir. */
export function graph(nodes) {
  return jsonld({ "@context": "https://schema.org", "@graph": nodes.filter(Boolean) });
}
