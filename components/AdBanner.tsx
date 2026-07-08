"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdBanner() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const id = setTimeout(() => {
      try {
        window.adsbygoogle?.push({});
      } catch (e) {
        console.debug("Adsense not ready", e);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [pathname]);

  if (process.env.NODE_ENV !== "production") {
    return (
      <div className="flex h-[280px] w-full mx-auto items-center justify-center rounded-lg bg-red-500 text-white" style={{ width: "1200px" }}>
        Adsense
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
        width: "100%",
        height: "280px",
      }}
      data-ad-client="ca-pub-5400903051441488"
      data-ad-slot="8412654331"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}