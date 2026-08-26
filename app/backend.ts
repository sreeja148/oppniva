import type { Opportunity, PathwayStage } from './data';

export type StudentProfile = {
  id?: string;
  name: string;
  city: string;
  school: string;
  study: string;
  interests: string[];
  skills: string[];
  goal: string;
  availability: string[];
};

export type DashboardData = {
  savedOpportunityIds: string[];
  appliedOpportunityIds: string[];
  growthPoints: number;
  completedMilestones: number;
};

export type OpportunityFilters = {
  category?: string;
  q?: string;
  format?: string;
};

export type ApplicationStatus = 'interested' | 'preparing' | 'applied' | 'completed';

export type RecommendationsResponse = {
  userSummary: string;
  source: 'gemini' | 'fallback';
  opportunities: Opportunity[];
  pathwayStages: PathwayStage[];
};

export type OppnivaBackend = {
  getProfile(): Promise<StudentProfile | null>;
  saveProfile(profile: StudentProfile): Promise<StudentProfile>;
  getOpportunities(filters?: OpportunityFilters): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | null>;
  getPathway(): Promise<PathwayStage[]>;
  getDashboard(): Promise<DashboardData>;
  setOpportunitySaved(id: string, saved: boolean): Promise<void>;
  startApplication(id: string): Promise<void>;
  setApplicationStatus(id: string, status: ApplicationStatus): Promise<void>;
  /** Calls the AI recommendation engine for the given (or last-saved) profile and refreshes the opportunity feed + pathway. */
  getRecommendations(profile?: StudentProfile): Promise<RecommendationsResponse>;
};

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${body}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Talks to the Next.js API routes under app/api/*. Relative URLs work both
 * in the browser (same-origin fetch) and are the simplest option here since
 * every screen that calls this file is a client component ('use client').
 */
export const backend: OppnivaBackend = {
  async getProfile() {
    const data = await json<{ profile: StudentProfile | null }>(await fetch('/api/profile'));
    return data.profile;
  },

  async saveProfile(profile) {
    const data = await json<{ profile: StudentProfile }>(
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      }),
    );
    return data.profile;
  },

  async getOpportunities(filters) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.format) params.set('format', filters.format);
    const query = params.toString();
    const data = await json<{ opportunities: Opportunity[] }>(await fetch(`/api/opportunities${query ? `?${query}` : ''}`));
    return data.opportunities;
  },

  async getOpportunity(id) {
    const response = await fetch(`/api/opportunities/${id}`);
    if (response.status === 404) return null;
    const data = await json<{ opportunity: Opportunity }>(response);
    return data.opportunity;
  },

  async getPathway() {
    const data = await json<{ pathwayStages: PathwayStage[] }>(await fetch('/api/pathway'));
    return data.pathwayStages;
  },

  async getDashboard() {
    return json<DashboardData>(await fetch('/api/saved'));
  },

  async setOpportunitySaved(id, saved) {
    if (saved) {
      await json(
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }),
      );
    } else {
      await json(await fetch(`/api/saved/${id}`, { method: 'DELETE' }));
    }
  },

  async startApplication(id) {
    await this.setApplicationStatus(id, 'applied');
  },

  async setApplicationStatus(id, status) {
    await json(
      await fetch(`/api/saved/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    );
  },

  async getRecommendations(profile) {
    return json<RecommendationsResponse>(
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: profile ? JSON.stringify(profile) : '{}',
      }),
    );
  },
};
