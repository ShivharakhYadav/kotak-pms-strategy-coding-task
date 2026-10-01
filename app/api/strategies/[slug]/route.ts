import { NextResponse } from "next/server";
import { getStrategyBySlug } from "@/lib/services/strategyService";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const strategy = getStrategyBySlug(slug);

    if (!strategy) {
      return NextResponse.json(
        { error: `No strategy found for "${slug}".` },
        { status: 404 }
      );
    }

    return NextResponse.json(strategy);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching the strategy." },
      { status: 500 }
    );
  }
}
