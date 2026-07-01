import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.jedaeroweb.co.kr",
      priority: 1,
    },
    {
      url: "https://www.jedaeroweb.co.kr/ko",
    },
    {
      url: "https://www.jedaeroweb.co.kr/en",
    },
    {
      url: "https://www.jedaeroweb.co.kr/ja",
    },
    {
      url: "https://www.jedaeroweb.co.kr/zh",
    },
  ];
}