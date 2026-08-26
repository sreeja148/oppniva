import { NextRequest, NextResponse } from 'next/server';
import { listOpportunities } from '../../lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') ?? undefined;
  const q = searchParams.get('q') ?? undefined;
  const format = searchParams.get('format') ?? undefined;

  const opportunities = await listOpportunities({ category, q, format });
  return NextResponse.json({ opportunities });
}
