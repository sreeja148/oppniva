import { NextRequest, NextResponse } from 'next/server';
import { getDashboard, maybeAdvancePathwayOnSave, setOpportunitySaved } from '../../lib/store';

/** Returns the student's dashboard snapshot: saved ids, applied ids, growth points, milestones. */
export async function GET() {
  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}

/** Save an opportunity. Body: { id: string } */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as { id?: string };
  if (!body?.id) {
    return NextResponse.json({ error: 'An opportunity id is required.' }, { status: 400 });
  }

  await setOpportunitySaved(body.id, true);
  await maybeAdvancePathwayOnSave();
  const dashboard = await getDashboard();
  return NextResponse.json(dashboard);
}
