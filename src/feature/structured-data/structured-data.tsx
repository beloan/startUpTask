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
        const ratingValue = typeof data.rating === "number" ? data.rating : undefined;
        const reviewsCount = typeof data.reviews_count === "number" ? data.reviews_count : undefined;
        const salesCount = typeof data.sales_count === "number" ? data.sales_count : undefined;
        const viewCount = typeof data.view_count === "number" ? data.view_count : undefined;

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
          ...(ratingValue && ratingValue > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue,
                  reviewCount: reviewsCount && reviewsCount > 0 ? reviewsCount : 1,
                },
              }
            : {}),
          ...(salesCount && salesCount > 0
            ? {
                interactionStatistic: [
                  {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/BuyAction",
                    userInteractionCount: salesCount,
                  },
                  ...(viewCount && viewCount > 0
                    ? [
                        {
                          "@type": "InteractionCounter",
                          interactionType: "https://schema.org/ViewAction",
                          userInteractionCount: viewCount,
                        },
                      ]
                    : []),
                ],
              }
            : {}),
        };
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: data?.name || "Быстро и точка",
          url: data?.url || "https://bystroi.ru",
          logo: data?.logo || "https://bystroi.ru/logo.png",
        };
      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: data?.name || "Быстро и точка",
          url: data?.url || "https://bystroi.ru",
          potentialAction: {
            "@type": "SearchAction",
            target: `${data?.url || "https://bystroi.ru"}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        };
      case "BreadcrumbList": {
        const items = Array.isArray(data?.items) ? data.items : [];
        if (!items.length) {
          return null;
        }

        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item: { name: string; url: string }, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };
      }
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