import Game from "@/components/Game";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (

    <div className="max-w-7xl mx-auto px-4 py-8">

      <Game />

      <div className="my-8">
        <AdBanner />
      </div>

    </div>

  );
}