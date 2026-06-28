export const metadata = {
  title: "How to Play | Sorter",
  description: "Learn how to play Sorter.",
};

export default function HowToPlay() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1>How to Play</h1>

      <p>
        Drag the packages onto the correct conveyor destination.
      </p>

      <ol>
        <li>Select a package.</li>
        <li>Drag it.</li>
        <li>Drop it in the correct place.</li>
      </ol>
    </main>
  );
}