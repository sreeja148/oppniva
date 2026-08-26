import { NextRequest, NextResponse } from 'next/server';
import { getProfile, saveProfile } from '../../lib/store';
import type { StudentProfile } from '../../backend';

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StudentProfile;

    if (!body || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'A valid student profile is required.' }, { status: 400 });
    }

    const profile = await saveProfile(body);
    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
