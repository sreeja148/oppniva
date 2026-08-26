/**
 * Frontend data contract.
 *
 * The arrays below are intentionally empty. The backend team can replace them
 * with API results while keeping these exported types and component props.
 */

export type OpportunityCategory =
  | 'Competition'
  | 'Workshop'
  | 'Volunteer'
  | 'Community'
  | 'Internship';

export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  format: string;
  location: string;
  date: string;
  deadline: string;
  match: number;
  icon: string;
  accent: string;
  description: string;
  longDescription: string;
  tags: string[];
  eligibility: string[];
  benefits: string[];
  whyMatch: string[];
};

export type PathwayStage = {
  id: number;
  status: 'done' | 'current' | 'next' | 'locked';
  icon: string;
  title: string;
  label: string;
  description: string;
  task: string;
  xp: string;
};

export const opportunities: Opportunity[] = [];
export const pathwayStages: PathwayStage[] = [];

// UI filter labels only; these are not backend records.
export const categories = [
  'All',
  'Competition',
  'Workshop',
  'Volunteer',
  'Community',
  'Internship',
] as const;
