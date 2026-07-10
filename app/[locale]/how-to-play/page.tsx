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
      <h1 className="mb-8 text-3xl font-bold">
        {t("heading")}
      </h1>

<section
  className="
    rounded-2xl
    border
    border-zinc-300
    bg-zinc-50
    p-8
    shadow-lg

    dark:border-zinc-700
    dark:bg-zinc-900
  "
>
  <h2 className="mb-4 text-2xl font-bold">
    {t("introduction")}
  </h2>

  <p className="mb-8 leading-8 text-zinc-700 dark:text-zinc-300">
    {t("description")}
  </p>

  <div
    className="
      rounded-xl
      border-l-4
      border-sky-500
      bg-sky-50
      p-5

      dark:bg-sky-950/40
    "
  >
    <h2 className="mb-4 text-xl font-bold">
      🎮 {t("how-to-play")}
    </h2>

    <ul className="space-y-3">
      <li className="flex gap-3">
        <span>📦</span>
        <span>{t("drag-items")}</span>
      </li>

      <li className="flex gap-3">
        <span>🗂️</span>
        <span>{t("group-similar")}</span>
      </li>

      <li className="flex gap-3">
        <span>🔍</span>
        <span>{t("find-number")}</span>
      </li>

      <li className="flex gap-3">
        <span>🏆</span>
        <span>{t("achieve-high-score")}</span>
      </li>
    </ul>
  </div>
</section>

<section
  className="
    mt-8
    rounded-2xl
    border
    border-yellow-300
    bg-yellow-50
    p-8
    shadow-lg

    dark:border-yellow-700
    dark:bg-yellow-950/30
  "
>
  <h2 className="mb-6 text-2xl font-bold">
    💡 {t("tips")}
  </h2>

  <ul className="space-y-4">
    <li>🧠 {t("plan")}</li>
    <li>⚡ {t("rush")}</li>
    <li>📚 {t("group")}</li>
    <li>🚫 {t("avoidDroppingItems")}</li>
  </ul>
</section>

    </main>
  );
}