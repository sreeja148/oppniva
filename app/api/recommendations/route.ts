import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '../../lib/ai';
import { getProfile, listOpportunities, saveProfile, setPathway, upsertOpportunities } from '../../lib/store';
import type { StudentProfile } from '../../backend';

/**
 * Runs the AI recommendation engine (Member 1) against the current student
 * profile, then merges the results into the shared opportunity store
 * (Member 3) so every other route — and the dashboard/discover screens —
 * immediately see the personalized results.
 *
 * Body: StudentProfile (optional — falls back to the last saved profile).
 */
export async function POST(request: NextRequest) {
  let profile: StudentProfile | null = null;

  try {
    const body = await request.json();
    if (body && typeof body.name === 'string') profile = body as StudentProfile;
  } catch {
    // no body provided — fall through to the last saved profile
  }

  profile = profile ?? (await getProfile());

  if (!profile) {
    return NextResponse.json({ error: 'No student profile available. Save a profile first.' }, { status: 400 });
  }

  await saveProfile(profile);

  const currentOpps = await listOpportunities();
  const result = await getRecommendations(profile, currentOpps);
  await upsertOpportunities(result.opportunities);
  if (result.pathwayStages.length) await setPathway(result.pathwayStages);

  const finalOpps = await listOpportunities();

  return NextResponse.json({
    userSummary: result.userSummary,
    source: result.source,
    opportunities: finalOpps,
    pathwayStages: result.pathwayStages,
  });
}
