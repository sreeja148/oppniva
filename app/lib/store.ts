import type { Opportunity, PathwayStage } from '../data';
import type { StudentProfile, DashboardData } from '../backend';
import { prisma } from './prisma';
import { getCurrentUserId } from './auth';

type ApplicationStatus = 'interested' | 'preparing' | 'applied' | 'completed';

const seedOpportunities: Opportunity[] = [
  {
    id: 'opp_national_ai_olympiad',
    title: 'National AI & Robotics Olympiad',
    organization: 'TechNext Foundation',
    category: 'Competition',
    format: 'Hybrid',
    location: 'Jakarta, Indonesia',
    date: 'Nov 14–16, 2026',
    deadline: 'Applications close Oct 3',
    match: 92,
    icon: '🤖',
    accent: 'lavender',
    description: 'Build and pitch an AI-powered solution to a real community problem alongside a small team.',
    longDescription:
      'Teams of 2–4 students spend six weeks prototyping an AI or robotics solution to a community-chosen challenge, then present to a judging panel of engineers and founders. Mentorship sessions run every other week, and the top three teams receive seed grants to continue building.',
    tags: ['AI', 'Robotics', 'Teamwork'],
    eligibility: ['Ages 15–19', 'No prior competition experience required', 'Team of 2–4 students'],
    benefits: ['Seed grant for top teams', 'Mentorship from industry engineers', 'Certificate of participation'],
    whyMatch: ['Matches your interest in Technology', 'Builds the Coding and Teamwork skills you selected', 'Fits your Product & AI Builder direction'],
  },
  {
    id: 'opp_youth_climate_fellowship',
    title: 'Youth Climate Action Fellowship',
    organization: 'Global Youth Climate Network',
    category: 'Volunteer',
    format: 'Remote',
    location: 'Remote',
    date: 'Rolling cohorts',
    deadline: 'Applications close Sep 20',
    match: 81,
    icon: '🌱',
    accent: 'mint',
    description: 'Join a global cohort running local climate-awareness campaigns with training and a small project fund.',
    longDescription:
      'Over 8 weeks, fellows complete a short curriculum on climate communication and community organizing, then design and run a local micro-campaign with a peer group. Weekly virtual check-ins with a mentor keep momentum going.',
    tags: ['Social impact', 'Leadership', 'Remote'],
    eligibility: ['Ages 14–20', 'Open worldwide', 'No experience required'],
    benefits: ['Digital certificate', 'Project micro-grant up to $150', 'Global peer network'],
    whyMatch: ['Matches your interest in Social impact', 'Great for building Leadership and Teamwork', 'Fully remote fits flexible availability'],
  },
  {
    id: 'opp_design_for_good_workshop',
    title: 'Design for Good Workshop Series',
    organization: 'Studio Kernel',
    category: 'Workshop',
    format: 'Online',
    location: 'Online',
    date: 'Every Saturday, Sep–Oct 2026',
    deadline: 'Applications close Sep 5',
    match: 76,
    icon: '🎨',
    accent: 'sun',
    description: 'A six-session crash course in UX research and prototyping, ending with a portfolio-ready case study.',
    longDescription:
      'Each Saturday session pairs a short lesson (research, wireframing, prototyping, testing, storytelling) with hands-on studio time. By the end you will have a polished case study for your portfolio and feedback from a working product designer.',
    tags: ['Design', 'Portfolio', 'Weekly'],
    eligibility: ['Beginners welcome', 'Laptop with internet access', 'Ages 15+'],
    benefits: ['Portfolio-ready case study', 'Direct feedback from a working designer', 'Certificate of completion'],
    whyMatch: ['Matches your interest in Design', 'Builds Design thinking skills you selected', 'Online format fits your availability'],
  },
  {
    id: 'opp_student_founder_bootcamp',
    title: 'Student Founder Bootcamp',
    organization: 'Launchpad Ventures',
    category: 'Internship',
    format: 'In person',
    location: 'Bandung, Indonesia',
    date: 'Dec 1–19, 2026',
    deadline: 'Applications close Oct 25',
    match: 69,
    icon: '🚀',
    accent: 'coral',
    description: 'A three-week paid internship-style bootcamp where you validate and pitch an early business idea.',
    longDescription:
      'Work inside a real startup studio: shadow founders, run customer interviews, and build a lightweight MVP for your own idea. The bootcamp ends with a demo day in front of local investors, and past participants have gone on to launch registered ventures.',
    tags: ['Business', 'Startups', 'In person'],
    eligibility: ['Ages 16–21', 'Based in or able to travel to Bandung', 'Basic English proficiency'],
    benefits: ['Small weekly stipend', 'Demo day in front of investors', 'Alumni founder network'],
    whyMatch: ['Matches your interest in Business', 'Strong step toward a Future Founder direction', 'Builds Leadership and Presenting skills'],
  },
  {
    id: 'opp_community_science_fair',
    title: 'Regional Community Science Fair',
    organization: 'ScienceBridge Network',
    category: 'Community',
    format: 'In person',
    location: 'Surabaya, Indonesia',
    date: 'Oct 10, 2026',
    deadline: 'Applications close Sep 18',
    match: 64,
    icon: '🔬',
    accent: 'lavender',
    description: 'Showcase an independent research or science project to your local student and mentor community.',
    longDescription:
      'A single-day, low-pressure science fair aimed at first-time presenters. Bring any independent project — from a data analysis to a lab experiment — for informal feedback from local university mentors, with awards in several categories.',
    tags: ['Science', 'Research', 'Community'],
    eligibility: ['Ages 13–19', 'Independent or team project', 'Any research stage welcome'],
    benefits: ['Mentor feedback session', 'Category awards', 'Local science community access'],
    whyMatch: ['Matches your interest in Science', 'Builds the Research skills you selected', 'Low-commitment, single-day format'],
  },
  {
    id: 'opp_indie_film_collective',
    title: 'Youth Indie Film Collective',
    organization: 'Frame & Voice Collective',
    category: 'Community',
    format: 'Hybrid',
    location: 'Yogyakarta, Indonesia',
    date: 'Ongoing, monthly meetups',
    deadline: 'Rolling admissions',
    match: 58,
    icon: '🎬',
    accent: 'mint',
    description: 'A monthly collective for students making short films, with shared equipment and screening nights.',
    longDescription:
      'Members get access to a small pool of shared camera and audio equipment, join monthly workshops on writing and editing, and screen finished shorts at a quarterly community night. Great for building a creative portfolio outside of school.',
    tags: ['Arts & culture', 'Community', 'Monthly'],
    eligibility: ['Ages 15+', 'Any experience level', 'Based near Yogyakarta or able to join online sessions'],
    benefits: ['Shared equipment access', 'Quarterly public screening', 'Creative peer community'],
    whyMatch: ['Matches your interest in Arts & culture', 'Flexible, ongoing commitment', 'Builds a public creative portfolio'],
  },
];

const defaultPathwayStages: PathwayStage[] = [
  { id: 1, status: 'done', icon: '✦', title: 'Find your direction', label: 'Chapter 1', description: 'You told us what excites you and where you want to go.', task: 'Completed during onboarding.', xp: '+50 XP' },
  { id: 2, status: 'current', icon: '⌕', title: 'Find your first opportunity', label: 'Chapter 2', description: 'Explore your matched feed and save a few opportunities worth trying.', task: 'Save at least one opportunity from Discover.', xp: '+75 XP' },
  { id: 3, status: 'next', icon: '↗', title: 'Submit your first application', label: 'Chapter 3', description: 'Turn a saved opportunity into a started application.', task: 'Start an application from any opportunity page.', xp: '+100 XP' },
  { id: 4, status: 'locked', icon: '◎', title: 'Build your portfolio proof', label: 'Chapter 4', description: 'Turn a completed opportunity into a tangible portfolio piece.', task: 'Unlocks once an application is completed.', xp: '+150 XP' },
];

async function ensureSeedOpportunities(): Promise<void> {
  const count = await prisma.opportunity.count();
  if (count === 0) {
    for (const opp of seedOpportunities) {
      await prisma.opportunity.create({
        data: {
          id: opp.id,
          title: opp.title,
          organization: opp.organization,
          category: opp.category,
          format: opp.format,
          location: opp.location,
          date: opp.date,
          deadline: opp.deadline,
          icon: opp.icon,
          accent: opp.accent,
          description: opp.description,
          longDescription: opp.longDescription,
          tags: JSON.stringify(opp.tags),
          eligibility: JSON.stringify(opp.eligibility),
          defaultMatch: opp.match,
          defaultWhyMatch: JSON.stringify(opp.whyMatch),
          defaultBenefits: JSON.stringify(opp.benefits),
        },
      });
    }
  }
}

// ----------------------------------------------------
// Public Store Interface implementations
// ----------------------------------------------------

export async function getProfile(): Promise<StudentProfile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    city: profile.city,
    school: profile.school,
    study: profile.study,
    interests: JSON.parse(profile.interests),
    skills: JSON.parse(profile.skills),
    goal: profile.goal,
    availability: JSON.parse(profile.availability),
  };
}

export async function saveProfile(profile: StudentProfile): Promise<StudentProfile> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existingProfile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  const data = {
    name: profile.name,
    city: profile.city,
    school: profile.school,
    study: profile.study,
    interests: JSON.stringify(profile.interests),
    skills: JSON.stringify(profile.skills),
    goal: profile.goal,
    availability: JSON.stringify(profile.availability),
  };

  let saved;
  if (existingProfile) {
    saved = await prisma.studentProfile.update({
      where: { userId },
      data,
    });
  } else {
    saved = await prisma.studentProfile.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  return {
    id: saved.id,
    name: saved.name,
    city: saved.city,
    school: saved.school,
    study: saved.study,
    interests: JSON.parse(saved.interests),
    skills: JSON.parse(saved.skills),
    goal: saved.goal,
    availability: JSON.parse(saved.availability),
  };
}

export async function listOpportunities(filters?: { category?: string; q?: string; format?: string }): Promise<Opportunity[]> {
  await ensureSeedOpportunities();
  const userId = await getCurrentUserId();

  // Find all opportunities (global seeded ones, plus any user-specific AI recommendations)
  const opps = await prisma.opportunity.findMany({
    where: {
      OR: [
        { userId: null },
        userId ? { userId } : { id: 'none' }, // only fetch recommendation if they are user-specific
      ],
    },
  });

  const userStates: Record<string, { match: number; whyMatch: string; benefits: string }> = {};
  if (userId) {
    const statesList = await prisma.userOpportunityState.findMany({
      where: { userId },
    });
    for (const s of statesList) {
      userStates[s.opportunityId] = s;
    }
  }

  let mappedOpps: Opportunity[] = opps.map((opp) => {
    const userState = userStates[opp.id];
    return {
      id: opp.id,
      title: opp.title,
      organization: opp.organization,
      category: opp.category as Opportunity['category'],
      format: opp.format,
      location: opp.location,
      date: opp.date,
      deadline: opp.deadline,
      icon: opp.icon,
      accent: opp.accent,
      description: opp.description,
      longDescription: opp.longDescription,
      tags: JSON.parse(opp.tags),
      eligibility: JSON.parse(opp.eligibility),
      match: userState ? userState.match : opp.defaultMatch,
      whyMatch: userState ? JSON.parse(userState.whyMatch) : JSON.parse(opp.defaultWhyMatch),
      benefits: userState ? JSON.parse(userState.benefits) : JSON.parse(opp.defaultBenefits),
    };
  });

  if (filters?.category && filters.category !== 'All') {
    mappedOpps = mappedOpps.filter((item) => item.category === filters.category);
  }
  if (filters?.format && filters.format !== 'Any format') {
    mappedOpps = mappedOpps.filter((item) => item.format === filters.format);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    mappedOpps = mappedOpps.filter((item) =>
      `${item.title} ${item.organization} ${item.tags.join(' ')}`.toLowerCase().includes(q)
    );
  }

  return mappedOpps.sort((a, b) => b.match - a.match);
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  await ensureSeedOpportunities();
  const opp = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opp) return null;

  const userId = await getCurrentUserId();
  let userState = null;
  if (userId) {
    userState = await prisma.userOpportunityState.findUnique({
      where: {
        userId_opportunityId: { userId, opportunityId: id },
      },
    });
  }

  return {
    id: opp.id,
    title: opp.title,
    organization: opp.organization,
    category: opp.category as Opportunity['category'],
    format: opp.format,
    location: opp.location,
    date: opp.date,
    deadline: opp.deadline,
    icon: opp.icon,
    accent: opp.accent,
    description: opp.description,
    longDescription: opp.longDescription,
    tags: JSON.parse(opp.tags),
    eligibility: JSON.parse(opp.eligibility),
    match: userState ? userState.match : opp.defaultMatch,
    whyMatch: userState ? JSON.parse(userState.whyMatch) : JSON.parse(opp.defaultWhyMatch),
    benefits: userState ? JSON.parse(userState.benefits) : JSON.parse(opp.defaultBenefits),
  };
}

export async function upsertOpportunities(items: Opportunity[]): Promise<void> {
  const userId = await getCurrentUserId();

  for (const item of items) {
    // 1. Ensure global/user opportunity is in Opportunity table
    const exists = await prisma.opportunity.findUnique({
      where: { id: item.id },
    });

    if (!exists) {
      await prisma.opportunity.create({
        data: {
          id: item.id,
          title: item.title,
          organization: item.organization,
          category: item.category,
          format: item.format,
          location: item.location,
          date: item.date,
          deadline: item.deadline,
          icon: item.icon,
          accent: item.accent,
          description: item.description,
          longDescription: item.longDescription,
          tags: JSON.stringify(item.tags),
          eligibility: JSON.stringify(item.eligibility),
          userId: userId || null, // if recommended to a specific user, save user ID
          defaultMatch: item.match,
          defaultWhyMatch: JSON.stringify(item.whyMatch),
          defaultBenefits: JSON.stringify(item.benefits),
        },
      });
    }

    // 2. If logged in, upsert personalized match info
    if (userId) {
      await prisma.userOpportunityState.upsert({
        where: {
          userId_opportunityId: { userId, opportunityId: item.id },
        },
        create: {
          userId,
          opportunityId: item.id,
          match: item.match,
          whyMatch: JSON.stringify(item.whyMatch),
          benefits: JSON.stringify(item.benefits),
        },
        update: {
          match: item.match,
          whyMatch: JSON.stringify(item.whyMatch),
          benefits: JSON.stringify(item.benefits),
        },
      });
    }
  }
}

export async function getPathway(): Promise<PathwayStage[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return defaultPathwayStages;
  }

  let stages = await prisma.userPathwayStage.findMany({
    where: { userId },
    orderBy: { stageId: 'asc' },
  });

  if (stages.length === 0) {
    // initialize default pathway stages
    await prisma.userPathwayStage.createMany({
      data: defaultPathwayStages.map((stage) => ({
        userId,
        stageId: stage.id,
        status: stage.status,
        icon: stage.icon,
        title: stage.title,
        label: stage.label,
        description: stage.description,
        task: stage.task,
        xp: stage.xp,
      })),
    });

    stages = await prisma.userPathwayStage.findMany({
      where: { userId },
      orderBy: { stageId: 'asc' },
    });
  }

  return stages.map((s) => ({
    id: s.stageId,
    status: s.status as PathwayStage['status'],
    icon: s.icon,
    title: s.title,
    label: s.label,
    description: s.description,
    task: s.task,
    xp: s.xp,
  }));
}

export async function setPathway(stages: PathwayStage[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  for (const stage of stages) {
    await prisma.userPathwayStage.upsert({
      where: {
        userId_stageId: { userId, stageId: stage.id },
      },
      create: {
        userId,
        stageId: stage.id,
        status: stage.status,
        icon: stage.icon,
        title: stage.title,
        label: stage.label,
        description: stage.description,
        task: stage.task,
        xp: stage.xp,
      },
      update: {
        status: stage.status,
        icon: stage.icon,
        title: stage.title,
        label: stage.label,
        description: stage.description,
        task: stage.task,
        xp: stage.xp,
      },
    });
  }
}

export async function isSaved(id: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const state = await prisma.userOpportunityState.findUnique({
    where: {
      userId_opportunityId: { userId, opportunityId: id },
    },
  });

  return state ? state.saved : false;
}

export async function setOpportunitySaved(id: string, saved: boolean): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const existingState = await prisma.userOpportunityState.findUnique({
    where: {
      userId_opportunityId: { userId, opportunityId: id },
    },
  });

  let pointAddition = 0;
  if (saved && (!existingState || !existingState.saved)) {
    pointAddition = 5;
  }

  await prisma.userOpportunityState.upsert({
    where: {
      userId_opportunityId: { userId, opportunityId: id },
    },
    create: {
      userId,
      opportunityId: id,
      saved,
    },
    update: {
      saved,
    },
  });

  if (pointAddition > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        growthPoints: { increment: pointAddition },
      },
    });
  }
}

export async function setApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const existingState = await prisma.userOpportunityState.findUnique({
    where: {
      userId_opportunityId: { userId, opportunityId: id },
    },
  });

  const isNew = !existingState || !existingState.status;
  const pointAddition = isNew && status !== 'interested' ? 20 : 0;

  await prisma.userOpportunityState.upsert({
    where: {
      userId_opportunityId: { userId, opportunityId: id },
    },
    create: {
      userId,
      opportunityId: id,
      status,
    },
    update: {
      status,
    },
  });

  if (pointAddition > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        growthPoints: { increment: pointAddition },
      },
    });
  }

  // Advance the pathway once a student starts their first application (Stage 3 -> done, Stage 4 -> current)
  const applyStage = await prisma.userPathwayStage.findUnique({
    where: {
      userId_stageId: { userId, stageId: 3 },
    },
  });

  if (applyStage && applyStage.status !== 'done') {
    await prisma.userPathwayStage.update({
      where: {
        userId_stageId: { userId, stageId: 3 },
      },
      data: { status: 'done' },
    });

    const nextStage = await prisma.userPathwayStage.findUnique({
      where: {
        userId_stageId: { userId, stageId: 4 },
      },
    });

    if (nextStage) {
      await prisma.userPathwayStage.update({
        where: {
          userId_stageId: { userId, stageId: 4 },
        },
        data: { status: 'current' },
      });
    }
  }
}

export async function getDashboard(): Promise<DashboardData> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      savedOpportunityIds: [],
      appliedOpportunityIds: [],
      growthPoints: 0,
      completedMilestones: 0,
    };
  }

  const states = await prisma.userOpportunityState.findMany({
    where: { userId },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { growthPoints: true },
  });

  const completedStagesCount = await prisma.userPathwayStage.count({
    where: {
      userId,
      status: 'done',
    },
  });

  return {
    savedOpportunityIds: states.filter((s) => s.saved).map((s) => s.opportunityId),
    appliedOpportunityIds: states.filter((s) => s.status).map((s) => s.opportunityId),
    growthPoints: user ? user.growthPoints : 0,
    completedMilestones: completedStagesCount,
  };
}

export async function maybeAdvancePathwayOnSave(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const savedCount = await prisma.userOpportunityState.count({
    where: {
      userId,
      saved: true,
    },
  });

  if (savedCount === 0) return;

  const discoverStage = await prisma.userPathwayStage.findUnique({
    where: {
      userId_stageId: { userId, stageId: 2 },
    },
  });

  if (discoverStage && discoverStage.status !== 'done') {
    await prisma.userPathwayStage.update({
      where: {
        userId_stageId: { userId, stageId: 2 },
      },
      data: { status: 'done' },
    });

    const applyStage = await prisma.userPathwayStage.findUnique({
      where: {
        userId_stageId: { userId, stageId: 3 },
      },
    });

    if (applyStage && applyStage.status === 'next') {
      await prisma.userPathwayStage.update({
        where: {
          userId_stageId: { userId, stageId: 3 },
        },
        data: { status: 'current' },
      });
    }
  }
}
