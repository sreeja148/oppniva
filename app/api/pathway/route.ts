import { NextResponse } from 'next/server';
import { getPathway } from '../../lib/store';

export async function GET() {
  const pathwayStages = await getPathway();
  return NextResponse.json({ pathwayStages });
}
