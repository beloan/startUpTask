import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bystroi.ru";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/categories`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/favorites`, lastModified: new Date() },
    { url: `${baseUrl}/account`, lastModified: new Date() },
    { url: `${baseUrl}/rating`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/statistics`, lastModified: new Date() },
    { url: `${baseUrl}/payment`, lastModified: new Date() },
  ];
}
