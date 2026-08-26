import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyPassword, setSessionCookie } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Set JWT session cookie
    await setSessionCookie(user.id);

    let mappedProfile = null;
    if (user.profile) {
      mappedProfile = {
        name: user.profile.name,
        city: user.profile.city,
        school: user.profile.school,
        study: user.profile.study,
        interests: JSON.parse(user.profile.interests),
        skills: JSON.parse(user.profile.skills),
        goal: user.profile.goal,
        availability: JSON.parse(user.profile.availability),
      };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name || '',
      },
      profile: mappedProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login.' }, { status: 500 });
  }
}
