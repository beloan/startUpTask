"use client";

import Script from "next/script";

interface StructuredDataProps {
  type: "Product" | "BreadcrumbList" | "WebSite" | "Organization";
  data: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  const getStructuredData = () => {
    switch (type) {
      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: data.name,
          description: data.description,
          image: data.images,
          offers: {
            "@type": "Offer",
            price: data.price,
            priceCurrency: "RUB",
            availability: data.availability === "InStock"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        };
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Быстро и точка",
          url: "https://bystroi.ru",
          logo: "https://bystroi.ru/logo.png",
        };
      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Быстро и точка",
          url: "https://bystroi.ru",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://bystroi.ru/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="afterInteractive"
    />
  );
};