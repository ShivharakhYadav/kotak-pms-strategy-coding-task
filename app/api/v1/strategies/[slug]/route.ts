import { handleGetStrategy } from "@/lib/http/handlers/strategyHandlers";

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleGetStrategy(request, slug);
}
