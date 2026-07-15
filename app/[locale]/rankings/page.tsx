import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getRankings } from "@/lib/rankings";

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "Rankings",
  });

  return {
    title: `${t("title")}`,
  };
}


export default async function Rankings({
  searchParams,
}: Props) {
  const t = await getTranslations("Rankings");

  const { page } = await searchParams;

  const currentPage = Number(page ?? 1);

  const { rankings, totalPages } =
    getRankings(currentPage);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {t("heading")}
      </h1>

<div
  className="
    overflow-hidden
    rounded-2xl
    border
    border-zinc-300
    dark:border-zinc-700
    shadow-xl
  "
>
  <table className="w-full">
    <thead
      className="
        bg-zinc-900
        text-white

        dark:bg-zinc-100
        dark:text-black
      "
    >
      <tr>
        <th className="p-4 text-left">#</th>

        <th className="p-4 text-left">
          {t("nickname")}
        </th>

        <th className="p-4 text-right">
          {t("score")}
        </th>

        <th className="p-4 text-right">
          {t("stage")}
        </th>

        <th className="p-4 text-right">
          {t("accuracy")}
        </th>
      </tr>
    </thead>

    <tbody>
      {rankings.map((row, index) => (
        <tr
          key={row.id}
          className="
            border-t
            border-zinc-300
            dark:border-zinc-700

            odd:bg-zinc-50
            even:bg-white

            dark:odd:bg-zinc-900
            dark:even:bg-zinc-950

            transition-colors
            hover:bg-yellow-100
            dark:hover:bg-zinc-800
          "
        >
          <td className="p-4 font-bold text-yellow-500">
            {(currentPage - 1) * 10 + index + 1}
          </td>

          <td className="p-4">
            {row.nickname}
          </td>

          <td className="p-4 text-right font-semibold">
            {row.score.toLocaleString()}
          </td>

          <td className="p-4 text-right">
            {row.stage}
          </td>

          <td className="p-4 text-right">
            {row.accuracy}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<div className="mt-8 flex justify-center gap-2">
  {Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).map((pageNo) => (
    <Link
      key={pageNo}
      href={`/rankings?page=${pageNo}`}
      className={`
        min-w-10
        rounded-xl
        border
        px-4
        py-2
        text-center
        transition

        ${
          pageNo === currentPage
            ? `
              border-sky-500
              bg-sky-600
              text-white
              shadow-lg
            `
            : `
              border-zinc-300
              hover:bg-zinc-100

              dark:border-zinc-700
              dark:hover:bg-zinc-800
            `
        }
      `}
    >
      {pageNo}
    </Link>
  ))}
</div>
    </main>
  );
}