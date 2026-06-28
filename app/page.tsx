import Game from "@/components/Game";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (

    <div className="max-w-7xl mx-auto px-4 py-8">

      <Game />

      <div className="my-8">
        <AdBanner />
      </div>

      <section className="mt-12">

        <h2 className="text-3xl font-bold mb-4">
          Free Browser Puzzle Game
        </h2>

        <p className="text-zinc-300 leading-8">
          Drag packages to the correct conveyor and
          achieve the highest score.
        </p>

      </section>

    </div>

  );
}