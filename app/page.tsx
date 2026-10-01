import Link from "next/link";
import { strategies } from "@/lib/data/strategies";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">PMS Strategies</h1>
      <p className="mt-2 text-gray-600">Sample data for the take-home coding assessment.</p>
      <ul className="mt-6 space-y-2">
        {strategies.map((strategy) => (
          <li key={strategy.slug}>
            <Link
              href={`/strategy/${strategy.slug}`}
              className="text-blue-600 hover:underline"
            >
              {strategy.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
