"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner() {
useEffect(() => {
  if (window.adsbygoogle) {
    try {
      window.adsbygoogle.push({});
    } catch {}
  }
}, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
         width: "100%",
         height: "280px"
      }}
         data-ad-client="ca-pub-5400903051441488"
      data-ad-slot="8412654331"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}