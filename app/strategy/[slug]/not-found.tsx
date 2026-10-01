import Link from "next/link";

export default function StrategyNotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Strategy not found</h1>
      <p className="mt-2 text-gray-600">
        We couldn&apos;t find a strategy matching that link. Please check the URL and try again.
      </p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        Back to home
      </Link>
    </main>
  );
}
