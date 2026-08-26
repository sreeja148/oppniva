import type { Opportunity, PathwayStage } from '../data';
import type { StudentProfile } from '../backend';

/**
 * Member 1's recommendation engine, ported from the original standalone
 * Gemini Java sample into a small server-side TypeScript service that the
 * /api/recommendations route can call.
 *
 * The system prompt / JSON schema below is carried over as-is from the
 * original sample so the AI's behavior matches what Member 1 designed;
 * only the transport (REST fetch instead of the Java SDK) changed.
 */

const SYSTEM_INSTRUCTION = `You are an AI-powered Opportunity Intelligence & Career Recommendation Engine.

YOUR CORE FUNCTIONS:
1. Analyze User Profiles (skills, interests, career goals, and experience level).
2. Recommend REAL, CURRENT, and HIGH-RELEVANCE opportunities (e.g., Competitions/Olimpiade, Volunteer Work, Leadership Programs, Internships).
3. Provide a clear "Why is this opportunity suitable for me?" explanation for each recommendation.
4. Calculate precise scores (0-100%) and rationales for 5 key metrics:
   - Skill Match
   - Career Impact
   - Difficulty
   - Preparation Time
   - Portfolio Value
5. Generate a 3-step Personalized Career Pathway for each recommended opportunity.

STRICT OUTPUT FORMAT:
You MUST always respond with a raw JSON object adhering to this schema:

{
  "user_summary": "Brief analysis of the user's current profile standing",
  "recommendations": [
    {
      "opportunity_name": "Official Title of the Opportunity/Competition/Program",
      "category": "Competition / Volunteer / Leadership / Internship",
      "organizer": "Organizing Entity / Organization",
      "match_score": "Overall percentage (e.g., 88%)",
      "scoring_metrics": {
        "skill_match": "Percentage & rationale based on existing skills vs requirements",
        "career_impact": "Percentage & rationale on how it boosts career goals",
        "difficulty": "Easy / Medium / Hard & rationale relative to user experience",
        "preparation_time": "Estimated duration needed (e.g., 2 weeks)",
        "portfolio_value": "High / Medium / Low & rationale regarding tangible output"
      },
      "why_suitable": [
        "Direct alignment reason 1",
        "Direct alignment reason 2",
        "Direct alignment reason 3"
      ],
      "personalized_career_pathway": [
        "Step 1: Immediate actionable step (Days 1-7)",
        "Step 2: Core preparation & execution step",
        "Step 3: Post-opportunity leverage for long-term career goal"
      ]
    }
  ]
}`;

type GeminiRecommendation = {
  opportunity_name: string;
  category: string;
  organizer: string;
  match_score: string;
  scoring_metrics: {
    skill_match: string;
    career_impact: string;
    difficulty: string;
    preparation_time: string;
    portfolio_value: string;
  };
  why_suitable: string[];
  personalized_career_pathway: string[];
};

type GeminiResponsePayload = {
  user_summary: string;
  recommendations: GeminiRecommendation[];
};

export type RecommendationResult = {
  userSummary: string;
  opportunities: Opportunity[];
  pathwayStages: PathwayStage[];
  source: 'gemini' | 'fallback';
};

const ACCENTS = ['lavender', 'mint', 'sun', 'coral'];
const CATEGORY_ICON: Record<string, string> = {
  Competition: '🏆',
  Volunteer: '♥',
  Leadership: '↗',
  Internship: '🚀',
  Workshop: '✎',
  Community: '☻',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

function parsePercent(value: string, fallback = 60): number {
  const match = value.match(/\d{1,3}/);
  if (!match) return fallback;
  return Math.min(100, Math.max(0, parseInt(match[0], 10)));
}

/** Map the mapped Opportunity.category values back to the frontend's fixed OpportunityCategory union. */
function normalizeCategory(category: string): Opportunity['category'] {
  const lower = category.toLowerCase();
  if (lower.includes('volunteer')) return 'Volunteer';
  if (lower.includes('intern')) return 'Internship';
  if (lower.includes('workshop')) return 'Workshop';
  if (lower.includes('community') || lower.includes('leadership')) return 'Community';
  return 'Competition';
}

function toOpportunity(rec: GeminiRecommendation, index: number, profile: StudentProfile): Opportunity {
  const category = normalizeCategory(rec.category);
  return {
    id: `ai_${slugify(rec.opportunity_name)}_${index}`,
    title: rec.opportunity_name,
    organization: rec.organizer,
    category,
    format: profile.availability.includes('Online') ? 'Online' : 'Hybrid',
    location: profile.availability.includes('Online') ? 'Online' : profile.city || 'Location TBC',
    date: rec.scoring_metrics.preparation_time || 'Dates announced on registration',
    deadline: `Prep time: ${rec.scoring_metrics.preparation_time}`,
    match: parsePercent(rec.match_score),
    icon: CATEGORY_ICON[category] ?? '✦',
    accent: ACCENTS[index % ACCENTS.length],
    description: rec.why_suitable[0] ?? `A ${category.toLowerCase()} opportunity matched to your profile.`,
    longDescription: [
      `Difficulty: ${rec.scoring_metrics.difficulty}`,
      `Career impact: ${rec.scoring_metrics.career_impact}`,
      `Portfolio value: ${rec.scoring_metrics.portfolio_value}`,
    ].join(' · '),
    tags: profile.skills.slice(0, 3),
    eligibility: [`Recommended for ${profile.study || 'your current stage'}`, 'See official listing for full eligibility'],
    benefits: rec.personalized_career_pathway,
    whyMatch: rec.why_suitable,
  };
}

function toPathwayStages(rec: GeminiRecommendation): PathwayStage[] {
  return rec.personalized_career_pathway.slice(0, 3).map((step, index) => ({
    id: index + 1,
    status: index === 0 ? 'current' : index === 1 ? 'next' : 'locked',
    icon: ['⌕', '↗', '◎'][index] ?? '✦',
    title: step.replace(/^Step \d+:\s*/i, '').split('(')[0].trim() || `Step ${index + 1}`,
    label: `Chapter ${index + 1}`,
    description: step,
    task: step,
    xp: `+${(index + 1) * 50} XP`,
  }));
}

async function callGemini(profile: StudentProfile): Promise<GeminiResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const userInput = `Here is the student profile to analyze:\n${JSON.stringify(
    {
      name: profile.name,
      city: profile.city,
      school: profile.school,
      currentStudy: profile.study,
      interests: profile.interests,
      skills: profile.skills,
      careerGoal: profile.goal,
      availability: profile.availability,
    },
    null,
    2,
  )}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: userInput }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 8192,
        topP: 0.95,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini response did not contain any text output');

  return JSON.parse(text) as GeminiResponsePayload;
}

/** Deterministic, no-API-key-required scoring so the app is fully demoable without Gemini configured. */
function fallbackRecommendations(profile: StudentProfile, pool: Opportunity[]): RecommendationResult {
  const interestTags = [...profile.interests, ...profile.skills, profile.goal].map((s) => s.toLowerCase());
  const scored = pool
    .map((opportunity) => {
      const haystack = `${opportunity.tags.join(' ')} ${opportunity.category} ${opportunity.description}`.toLowerCase();
      const overlap = interestTags.filter((tag) => tag && haystack.includes(tag.split(' ')[0].toLowerCase())).length;
      const match = Math.min(97, 55 + overlap * 12);
      return { ...opportunity, match };
    })
    .sort((a, b) => b.match - a.match);

  return {
    userSummary: `${profile.name || 'This student'} is exploring ${profile.interests.join(', ') || 'a few interest areas'} with a goal of becoming a ${profile.goal || 'well-rounded student'}. Recommendations below are ranked by keyword overlap with the current profile (set GEMINI_API_KEY for full AI-generated matches).`,
    opportunities: scored,
    pathwayStages: [
      { id: 1, status: 'done', icon: '✦', title: 'Find your direction', label: 'Chapter 1', description: 'Profile and goal captured.', task: 'Completed during onboarding.', xp: '+50 XP' },
      { id: 2, status: 'current', icon: '⌕', title: 'Explore your top match', label: 'Chapter 2', description: `Start with ${scored[0]?.title ?? 'your top recommendation'}.`, task: 'Open your top match and save it.', xp: '+75 XP' },
      { id: 3, status: 'next', icon: '↗', title: 'Start an application', label: 'Chapter 3', description: 'Turn a saved opportunity into a started application.', task: 'Start an application from any opportunity page.', xp: '+100 XP' },
      { id: 4, status: 'locked', icon: '◎', title: 'Build your portfolio proof', label: 'Chapter 4', description: 'Unlocks once an application is completed.', task: 'Complete an application.', xp: '+150 XP' },
    ],
    source: 'fallback',
  };
}

export async function getRecommendations(profile: StudentProfile, pool: Opportunity[]): Promise<RecommendationResult> {
  try {
    const payload = await callGemini(profile);
    const opportunities = payload.recommendations.map((rec, index) => toOpportunity(rec, index, profile));
    const pathwayStages = payload.recommendations.length ? toPathwayStages(payload.recommendations[0]) : [];
    return {
      userSummary: payload.user_summary,
      opportunities,
      pathwayStages,
      source: 'gemini',
    };
  } catch (error) {
    console.warn('[oppniva] Falling back to keyword-based recommendations:', (error as Error).message);
    return fallbackRecommendations(profile, pool);
  }
}
