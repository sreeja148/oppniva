import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { hashPassword, setSessionCookie } from '../../../lib/auth';

const defaultPathwayStages = [
  { stageId: 1, status: 'done', icon: '✦', title: 'Find your direction', label: 'Chapter 1', description: 'You told us what excites you and where you want to go.', task: 'Completed during onboarding.', xp: '+50 XP' },
  { stageId: 2, status: 'current', icon: '⌕', title: 'Find your first opportunity', label: 'Chapter 2', description: 'Explore your matched feed and save a few opportunities worth trying.', task: 'Save at least one opportunity from Discover.', xp: '+75 XP' },
  { stageId: 3, status: 'next', icon: '↗', title: 'Submit your first application', label: 'Chapter 3', description: 'Turn a saved opportunity into a started application.', task: 'Start an application from any opportunity page.', xp: '+100 XP' },
  { stageId: 4, status: 'locked', icon: '◎', title: 'Build your portfolio proof', label: 'Chapter 4', description: 'Turn a completed opportunity into a tangible portfolio piece.', task: 'Unlocks once an application is completed.', xp: '+150 XP' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    // Create user and initialize default pathway stages
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        pathwayStages: {
          create: defaultPathwayStages.map((stage) => ({
            stageId: stage.stageId,
            status: stage.status,
            icon: stage.icon,
            title: stage.title,
            label: stage.label,
            description: stage.description,
            task: stage.task,
            xp: stage.xp,
          })),
        },
      },
    });

    // Set JWT session cookie
    await setSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) console.error('Registration error:', error.message);
    else console.error('Registration error:', String(error));
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
