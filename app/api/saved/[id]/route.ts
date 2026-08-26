import { NextRequest, NextResponse } from 'next/server';
import { getDashboard, setApplicationStatus, setOpportunitySaved } from '../../../lib/store';

/** Unsave an opportunity. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await setOpportunitySaved(id, false);
  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}

/** Update an opportunity's application status. Body: { status: 'interested' | 'preparing' | 'applied' | 'completed' } */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { status?: 'interested' | 'preparing' | 'applied' | 'completed' };
  const status = body?.status ?? 'applied';

  await setApplicationStatus(id, status);
  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}
