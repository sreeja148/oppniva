import { NextRequest, NextResponse } from 'next/server';
import { getOpportunityById } from '../../../lib/store';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunityById(id);

  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 });
  }

  return NextResponse.json({ opportunity });
}
