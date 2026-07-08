import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "Tips",
  });

  return {
    title: `${t("title")} | Sorter`,
  };
}

export default async function Tips() {
  const t = await getTranslations("Tips");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("heading")}</h1>

      <ul className="list-disc space-y-2 pl-6">
        <li>{t("plan")}</li>
        <li>{t("rush")}</li>
        <li>{t("group")}</li>
        <li>{t("avoidDroppingItems")}</li>
      </ul>
    </main>
  );
}