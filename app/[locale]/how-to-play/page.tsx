import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "HowToPlay",
  });

  return {
    title: `${t("title")} | Sorter`,
  };
}

export default async function HowToPlay() {
  const t = await getTranslations("HowToPlay");

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
<h1>{t("heading")}</h1>

<section>
  <h2>{t("introduction")}</h2>

  <p>{t("description")}</p>

  <h2>{t("how-to-play")}</h2>

  <ul>
    <li>{t("drag-items")}</li>
    <li>{t("group-similar")}</li>
    <li>{t("achieve-high-score")}</li>
  </ul>
</section>
    </main>
  );
}