import type { MetadataRoute } from "next";

const BASE_URL = "https://sorter.jedaeroweb.co.kr";

const locales = ['ko', 'en', 'ja', 'zh', 'fr', 'es', 'de'];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    {
      path: "",
      priority: 1,
    },
    {
      path: "/rankings",
      priority: 0.8,
    },
    {
      path: "/introduction",
      priority: 0.8,
    },
  ];

  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },

    ...locales.flatMap((locale) =>
      routes.map((route) => ({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: route.priority,
      }))
    ),
  ];
}