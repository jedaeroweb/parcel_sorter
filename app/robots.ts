import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jedaeroweb.co.kr"),

  title: {
    default: "Conveyor Game",
    template: "%s | Conveyor Game",
  },

  description: "Conveyor puzzle game",

  applicationName: "Conveyor Game",

  keywords: [
    "game",
    "conveyor",
    "puzzle",
    "sorting",
    "brain game",
  ],

  authors: [
    {
      name: "Jedaeroweb",
      url: "https://www.jedaeroweb.co.kr",
    },
  ],

  creator: "Jedaeroweb",

  openGraph: {
    type: "website",
    siteName: "Conveyor Game",
    locale: "ko_KR",
  },

  twitter: {
    card: "summary_large_image",
  },
};