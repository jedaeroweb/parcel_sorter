import type { MetadataRoute } from "next";

const BASE_URL = "https://sorter.jedaeroweb.co.kr";

const locales = ["ko", "en", "ja", "zh"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/rankings", "/how-to-play"];

  return [
    {
      url: BASE_URL,
      priority: 1,
    },

    ...locales.flatMap((locale) =>
      routes.map((route) => ({
        url: `${BASE_URL}/${locale}${route}`,
      }))
    ),
  ];
}