import { NextResponse } from "next/server";
import { getStrategySummary } from "@/lib/services/strategyService";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const summary = getStrategySummary(slug);

    if (!summary) {
      return NextResponse.json(
        { error: `No strategy found for "${slug}".` },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while fetching the strategy summary." },
      { status: 500 }
    );
  }
}
