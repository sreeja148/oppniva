'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { categories, Opportunity, PathwayStage } from './data';
import { backend, StudentProfile } from './backend';

type Screen = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'discover' | 'detail' | 'pathway' | 'profile';
type AuthMode = 'login' | 'signup';
type ProfileDraft = {
  name: string;
  city: string;
  school: string;
  study: string;
  interests: string[];
  skills: string[];
  goal: string;
  availability: string[];
};

const initialProfile: ProfileDraft = {
  name: '',
  city: '',
  school: '',
  study: '',
  interests: [],
  skills: [],
  goal: '',
  availability: [],
};

const navItems: { screen: Screen; icon: string; label: string }[] = [
  { screen: 'dashboard', icon: '⌂', label: 'Home' },
  { screen: 'discover', icon: '⌕', label: 'Discover' },
  { screen: 'pathway', icon: '⌁', label: 'Pathway' },
  { screen: 'profile', icon: '☺', label: 'Profile' },
];

const getDisplayName = (profile: ProfileDraft) => profile.name.trim() || 'Your profile';
const getFirstName = (profile: ProfileDraft) => profile.name.trim().split(' ')[0] || 'there';
const getInitials = (profile: ProfileDraft) => {
  const initials = profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('');
  return initials.toUpperCase() || 'YO';
};

function Brand({ light = false }: { light?: boolean }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark">O</span><span>oppniva</span></span>;
}

function Mascot({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`mascot ${compact ? 'compact' : ''}`} aria-hidden="true">
      <span className="mascot-ear left" /><span className="mascot-ear right" />
      <span className="mascot-face"><i /><b>ᴗ</b><i /></span><span className="mascot-body">✦</span>
    </span>
  );
}

function OpportunityCard({ opportunity, saved, onSave, onOpen, featured = false }: {
  opportunity: Opportunity;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  featured?: boolean;
}) {
  return (
    <article className={`opportunity-card ${featured ? 'featured-card' : ''}`}>
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave} type="button" aria-label={`${saved ? 'Unsave' : 'Save'} ${opportunity.title}`} aria-pressed={saved}>{saved ? '♥' : '♡'}</button>
      <button className="card-main-button" onClick={onOpen} type="button" aria-label={`View ${opportunity.title}`}>
        <div className={`opportunity-art ${opportunity.accent}`}>
          <span className="art-grid" aria-hidden="true" /><b>{opportunity.icon}</b>
          <span className="category-float">{opportunity.category}</span>
          <span className="match-float">✦ {opportunity.match}% match</span>
        </div>
        <div className="opportunity-card-copy">
          <p className="org-line">{opportunity.organization}</p>
          <h3>{opportunity.title}</h3>
          <p className="card-description">{opportunity.description}</p>
          <div className="tag-row">{opportunity.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="card-meta"><span>◷ {opportunity.date}</span><span>⌖ {opportunity.location}</span></div>
          <div className="card-footer"><span className="deadline-dot" /> <b>{opportunity.deadline}</b><span className="open-label">View details →</span></div>
        </div>
      </button>
    </article>
  );
}

function InlineEmpty({ title, copy, action, onAction }: { title: string; copy: string; action?: string; onAction?: () => void }) {
  return <div className="inline-empty"><span>✦</span><div><b>{title}</b><p>{copy}</p></div>{action && onAction && <button type="button" onClick={onAction}>{action} →</button>}</div>;
}

function Landing({ navigate, setAuthMode, opportunities }: { navigate: (screen: Screen) => void; setAuthMode: (mode: AuthMode) => void; opportunities: Opportunity[] }) {
  const start = (mode: AuthMode) => { setAuthMode(mode); navigate('auth'); };
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Main navigation">
        <button className="brand-button" type="button" onClick={() => navigate('landing')}><Brand /></button>
        <div className="nav-links"><a href="#opportunities">Discover</a><a href="#how">How it works</a><a href="#stories">Student stories</a></div>
        <div className="nav-actions"><button className="text-button" onClick={() => start('login')} type="button">Log in</button><button className="primary-button small" onClick={() => start('signup')} type="button">Get started <span>↗</span></button></div>
      </nav>

      <section className="hero">
        <div className="doodle sparkle-one" aria-hidden="true">✦</div><div className="doodle loop" aria-hidden="true">⌁</div>
        <div className="hero-copy">
          <div className="eyebrow"><span>✦</span> Made for ambitious students</div>
          <h1>Your next big<br />opportunity is <em>closer</em><br />than you think.</h1>
          <p>Discover competitions, workshops, volunteering, and communities handpicked for who you are—and where you want to go.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => start('signup')} type="button">Find my opportunities <span>↗</span></button><a className="watch-link" href="#how"><span className="play">▶</span> See how it works</a></div>
          <div className="student-proof"><div className="avatar-stack" aria-hidden="true"><span>✦</span><span>⌁</span><span>↗</span><span>+</span></div><div><strong>Built for students</strong><small>ready for your real community data</small></div></div>
        </div>
        <div className="hero-stage" id="opportunities" aria-label="Opportunity preview">
          <div className="stage-blob" aria-hidden="true" /><Mascot />
          <div className="match-bubble" aria-hidden="true"><b>—</b><span>your match</span></div>
          <div className="opportunity-stack">
            {opportunities.length ? opportunities.slice(0, 3).map((item, index) => (
              <article className={`preview-card card-${index + 1}`} key={item.id}>
                <div className={`card-icon ${item.accent}`}>{item.icon}</div><div className="card-copy"><div className="card-topline"><span>{item.category}</span><span>♡</span></div><h2>{item.title}</h2><p>{item.location} · {item.date}</p><span className="match-pill">✦ {item.match}% match</span></div>
              </article>
            )) : [0, 1, 2].map((index) => <article className={`preview-card preview-placeholder card-${index + 1}`} key={index}><div className="card-icon lavender">✦</div><div className="card-copy"><div className="skeleton-line short" /><div className="skeleton-line" /><div className="skeleton-line medium" /><span className="match-pill">Ready for backend data</span></div></article>)}
          </div><div className="tiny-note" aria-hidden="true"><span>new!</span><b>→</b></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Oppniva opportunity types"><p>One place for every way to grow</p><div><span>🏆 Competitions</span><span>✎ Workshops</span><span>♥ Volunteering</span><span>☻ Communities</span><span>◎ Internships</span></div></section>

      <section className="landing-section how-section" id="how">
        <div className="section-kicker">Your future, made less fuzzy</div><h2>A path that starts with <em>you.</em></h2><p className="section-intro">Tell us what lights you up. Oppniva turns it into a feed of real opportunities and a simple, motivating career path.</p>
        <div className="how-grid">
          {[['01', 'Share your spark', 'Choose your interests, skills, location, and the kind of future you’re curious about.'], ['02', 'Meet your matches', 'Get a personal feed ranked by fit, distance, effort, and the skills you want to build.'], ['03', 'Grow with a plan', 'Save, apply, track deadlines, and see every small win move your pathway forward.']].map(([number, title, copy]) => <article key={number}><span>{number}</span><div className="mini-doodle">✦</div><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="landing-section story-section" id="stories">
        <div className="story-card"><div className="quote-mark">✦</div><blockquote>Student stories and outcome highlights can live here once your team connects real content.</blockquote><div className="story-person"><span>API</span><div><b>Community stories</b><small>Backend content placeholder</small></div></div></div>
        <div className="story-side"><span className="section-kicker">Small discovery, big direction</span><h2>There’s more out there than you’ve been told.</h2><p>Start with one opportunity. Learn what energizes you. Build the proof that you can do the thing you’re dreaming about.</p><button className="secondary-button" type="button" onClick={() => start('signup')}>Create my free profile →</button></div>
      </section>

      <section className="landing-cta"><Mascot compact /><div><span>Ready when you are ✦</span><h2>Your future doesn’t need a perfect plan.<br />It just needs a first step.</h2><button className="cream-button" onClick={() => start('signup')} type="button">Show me what’s possible <b>↗</b></button></div></section>
      <footer className="landing-footer"><Brand /><p>Discover more. Become more.</p><span>© 2026 Oppniva · Built for students</span></footer>
    </main>
  );
}

function AuthScreen({ mode, setMode, navigate, onAuthSuccess }: { mode: AuthMode; setMode: (mode: AuthMode) => void; navigate: (screen: Screen) => void; onAuthSuccess: (profile: ProfileDraft | null, defaultName: string) => void }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onAuthSuccess(null, name);
        navigate('onboarding');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onAuthSuccess(data.profile, data.user.name || '');
        if (data.profile) {
          navigate('dashboard');
        } else {
          navigate('onboarding');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <button className="auth-back" type="button" onClick={() => navigate('landing')}>← Back home</button>
      <section className="auth-art-panel">
        <Brand light /><div className="auth-art-copy"><span className="eyebrow light">✦ Opportunities, minus the overwhelm</span><h1>One small yes<br />can change your<br /><em>whole direction.</em></h1><p>Find experiences that fit your interests, your schedule, and the person you’re becoming.</p></div>
        <div className="auth-mascot-wrap"><div className="auth-orbit" /><Mascot /><span className="auth-note">you’ve got this! ↗</span></div>
        <div className="auth-quote">A small first step can reveal a whole new direction.</div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-tabs" role="tablist"><button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>Sign up</button><button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Log in</button></div>
          <div className="auth-heading"><span className="form-sparkle">✦</span><h2>{mode === 'signup' ? 'Let’s find your next thing.' : 'Welcome back, explorer.'}</h2><p>{mode === 'signup' ? 'Your personal opportunity map starts here.' : 'Your saved opportunities are waiting for you.'}</p></div>
          <form onSubmit={submit}>
            {mode === 'signup' && <label>Full name<input required name="name" placeholder="What should we call you?" /></label>}
            <label>Email address<input required type="email" name="email" placeholder="you@example.com" /></label>
            <label>Password<div className="password-field relative"><input className="pr-10" required minLength={6} type={showPassword ? "text" : "password"} name="password" placeholder="At least 6 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>
            {mode === 'login' && <button className="forgot-button" type="button">Forgot password?</button>}
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{error}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait...' : (mode === 'signup' ? 'Create my profile' : 'Log in')} <span>↗</span></button>
          </form>
          <p className="auth-terms">By continuing, you agree to our <u>Terms</u> and <u>Privacy Policy</u>.</p>
        </div>
      </section>
    </main>
  );
}

const onboardingSteps = [
  { title: 'First, the basics.', copy: 'This helps us keep recommendations relevant and close to home.' },
  { title: 'What lights you up?', copy: 'Pick as many as you like. Curiosity is allowed to be messy.' },
  { title: 'What’s already in your toolkit?', copy: 'No pressure—beginner is a perfectly good starting point.' },
  { title: 'Where do you want to go?', copy: 'Choose the direction that feels most exciting right now.' },
  { title: 'Make it fit your life.', copy: 'A good opportunity should work with your schedule, not against it.' },
];

function ChoiceGrid({ options, selected, onToggle, single = false }: { options: { icon: string; label: string; sub?: string }[]; selected: string[]; onToggle: (value: string) => void; single?: boolean }) {
  return <div className={`choice-grid ${single ? 'single-choice' : ''}`}>{options.map((option) => <button key={option.label} type="button" className={selected.includes(option.label) ? 'selected' : ''} onClick={() => onToggle(option.label)} aria-pressed={selected.includes(option.label)}><span>{option.icon}</span><div><b>{option.label}</b>{option.sub && <small>{option.sub}</small>}</div><i>{selected.includes(option.label) ? '✓' : '+'}</i></button>)}</div>;
}

function Onboarding({ profile, setProfile, onComplete, navigate }: { profile: ProfileDraft; setProfile: (profile: ProfileDraft) => void; onComplete: () => void; navigate: (screen: Screen) => void }) {
  const [step, setStep] = useState(0);
  const toggle = (key: 'interests' | 'skills' | 'availability', value: string) => {
    const existing = profile[key];
    setProfile({ ...profile, [key]: existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value] });
  };
  const next = () => step === onboardingSteps.length - 1 ? onComplete() : setStep((value) => value + 1);
  const canContinue = step === 0 ? Boolean(profile.name && profile.city && profile.school) : step === 1 ? profile.interests.length > 0 : step === 2 ? profile.skills.length > 0 : step === 3 ? Boolean(profile.goal) : profile.availability.length > 0;
  return (
    <main className="onboarding-page">
      <header className="onboarding-header"><button className="brand-button" type="button" onClick={() => navigate('landing')}><Brand /></button><button type="button" onClick={() => navigate('dashboard')}>Skip for now</button></header>
      <div className="onboarding-progress"><div><span style={{ width: `${((step + 1) / onboardingSteps.length) * 100}%` }} /></div><p>Step {step + 1} of {onboardingSteps.length}</p></div>
      <section className="onboarding-card">
        <div className="step-heading"><span>{['⌖', '✦', '↗', '◎', '◷'][step]}</span><div><h1>{onboardingSteps[step].title}</h1><p>{onboardingSteps[step].copy}</p></div></div>
        <div className="step-content">
          {step === 0 && <div className="basics-form"><label>Your name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your name" /></label><div><label>City<input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} placeholder="e.g. Jakarta" /></label><label>School or university<input value={profile.school} onChange={(event) => setProfile({ ...profile, school: event.target.value })} placeholder="Where do you study?" /></label></div><label>Current study <input value={profile.study} onChange={(event) => setProfile({ ...profile, study: event.target.value })} placeholder="e.g. Grade 11 or Design, Year 2" /></label></div>}
          {step === 1 && <ChoiceGrid options={[{icon:'⌘', label:'Technology', sub:'AI, coding, product'}, {icon:'✎', label:'Design', sub:'Visual, UX, creative'}, {icon:'♥', label:'Social impact', sub:'People and planet'}, {icon:'◌', label:'Business', sub:'Startups, finance'}, {icon:'⚗', label:'Science', sub:'Research, health'}, {icon:'♪', label:'Arts & culture', sub:'Music, film, writing'}]} selected={profile.interests} onToggle={(value) => toggle('interests', value)} />}
          {step === 2 && <ChoiceGrid options={[{icon:'⌕', label:'Research'}, {icon:'◫', label:'Presenting'}, {icon:'⌨', label:'Coding'}, {icon:'✎', label:'Design thinking'}, {icon:'☺', label:'Teamwork'}, {icon:'↗', label:'Leadership'}]} selected={profile.skills} onToggle={(value) => toggle('skills', value)} />}
          {step === 3 && <ChoiceGrid single options={[{icon:'⌘', label:'Product & AI Builder', sub:'Make useful technology'}, {icon:'✎', label:'Creative Problem Solver', sub:'Design better experiences'}, {icon:'♥', label:'Impact Changemaker', sub:'Help communities thrive'}, {icon:'◎', label:'Future Founder', sub:'Turn ideas into ventures'}]} selected={profile.goal ? [profile.goal] : []} onToggle={(value) => setProfile({ ...profile, goal: value })} />}
          {step === 4 && <ChoiceGrid options={[{icon:'◷', label:'Weekends', sub:'Best for in-person events'}, {icon:'☼', label:'Weekdays', sub:'After school or campus'}, {icon:'⌂', label:'In person', sub:'Near your city'}, {icon:'◉', label:'Online', sub:'Join from anywhere'}]} selected={profile.availability} onToggle={(value) => toggle('availability', value)} />}
        </div>
        <div className="step-footer"><button className="back-button" type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>← Back</button><span className="step-encouragement">{['Nice to meet you!', 'Follow your curiosity', 'Every skill counts', 'A direction, not a box', 'Almost there!'][step]} ✦</span><button className="primary-button" disabled={!canContinue} type="button" onClick={next}>{step === onboardingSteps.length - 1 ? 'Build my dashboard' : 'Continue'} <span>→</span></button></div>
      </section>
    </main>
  );
}

function AppShell({ screen, navigate, savedCount, profile, children }: { screen: Screen; navigate: (screen: Screen) => void; savedCount: number; profile: ProfileDraft; children: ReactNode }) {
  return (
    <main className="product-shell">
      <aside className="app-sidebar">
        <button className="brand-button sidebar-brand" type="button" onClick={() => navigate('dashboard')}><Brand /></button>
        <nav aria-label="App navigation">{navItems.map((item) => <button type="button" key={item.screen} className={screen === item.screen ? 'active' : ''} onClick={() => navigate(item.screen)}><span>{item.icon}</span><b>{item.label}</b>{item.screen === 'profile' && <i />}</button>)}</nav>
        <div className="sidebar-grow-card"><span>✦</span><b>Your progress</b><p>Pathway progress will appear here once connected.</p><div><i style={{ width: '0%' }} /></div></div>
        <button className="sidebar-profile" type="button" onClick={() => navigate('profile')}><span>{getInitials(profile)}</span><div><b>{getDisplayName(profile)}</b><small>Student profile</small></div><i>•••</i></button>
      </aside>
      <div className="product-main">
        <header className="mobile-app-header"><button className="brand-button" onClick={() => navigate('dashboard')} type="button"><Brand /></button><button className="mobile-avatar" type="button" onClick={() => navigate('profile')}>{getInitials(profile)}</button></header>
        {children}
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile app navigation">{navItems.map((item) => <button type="button" key={item.screen} className={screen === item.screen ? 'active' : ''} onClick={() => navigate(item.screen)}><span>{item.icon}</span><small>{item.label}</small>{item.screen === 'discover' && savedCount > 0 && <i>{savedCount}</i>}</button>)}</nav>
    </main>
  );
}

function ProductHeader({ title, eyebrow, navigate, action, profile }: { title: string; eyebrow?: string; navigate: (screen: Screen) => void; action?: ReactNode; profile: ProfileDraft }) {
  return <header className="product-header"><div>{eyebrow && <span className="product-eyebrow">{eyebrow}</span>}<h1>{title}</h1></div><div className="header-actions">{action}<button className="notification-button" type="button" aria-label="Notifications">♢<i /></button><button className="header-avatar" type="button" onClick={() => navigate('profile')}>{getInitials(profile)}</button></div></header>;
}

function Dashboard({ navigate, profile, savedIds, appliedIds, onOpen, onSave, opportunities }: { navigate: (screen: Screen) => void; profile: ProfileDraft; savedIds: string[]; appliedIds: string[]; onOpen: (id: string) => void; onSave: (id: string) => void; opportunities: Opportunity[] }) {
  const recommended = opportunities[0];
  const savedItems = opportunities.filter((item) => savedIds.includes(item.id));
  return (
    <AppShell screen="dashboard" navigate={navigate} savedCount={savedIds.length} profile={profile}>
      <div className="product-page dashboard-page">
        <ProductHeader profile={profile} eyebrow="YOUR DASHBOARD" title={`Hey ${getFirstName(profile)}, what will you try next?`} navigate={navigate} action={<button className="header-search" onClick={() => navigate('discover')} type="button">⌕ <span>Search opportunities</span><kbd>⌘ K</kbd></button>} />
        {recommended ? <section className="dashboard-hero">
          <div className="dash-hero-copy"><span className="tiny-label">✦ TOP MATCH FOR YOU</span><h2>{recommended.title}</h2><p>{recommended.description}</p><div className="dash-hero-tags"><span>🏆 {recommended.category}</span><span>◷ {recommended.deadline}</span><span>⌖ {recommended.location}</span></div><div className="dash-hero-actions"><button className="cream-button" type="button" onClick={() => onOpen(recommended.id)}>See opportunity <b>↗</b></button><button className="glass-save" onClick={() => onSave(recommended.id)} type="button">{savedIds.includes(recommended.id) ? '♥ Saved' : '♡ Save'}</button></div></div>
          <div className="dash-hero-art"><span className="giant-match"><b>{recommended.match}%</b><small>match</small></span><Mascot /><span className="dash-doodle">you + this = ✦</span></div>
        </section> : <section className="dashboard-hero empty-dashboard-hero"><div className="dash-hero-copy"><span className="tiny-label">✦ TOP MATCH FOR YOU</span><h2>Your best match will<br />appear right here.</h2><p>Connect the opportunities endpoint to fill this dashboard with personalized results.</p><div className="dash-hero-actions"><button className="cream-button" type="button" onClick={() => navigate('discover')}>View empty feed <b>↗</b></button></div></div><div className="dash-hero-art"><span className="giant-match"><b>—</b><small>match</small></span><Mascot /><span className="dash-doodle">waiting for data ✦</span></div></section>}
        <section className="stat-grid">
          <article><span className="stat-icon lavender">♡</span><div><b>{savedIds.length}</b><small>Saved opportunities</small></div><button type="button" onClick={() => navigate('discover')}>View →</button></article>
          <article><span className="stat-icon mint">↗</span><div><b>{appliedIds.length}</b><small>Applications started</small></div><span className="trend">+{appliedIds.length}</span></article>
          <article><span className="stat-icon sun">✦</span><div><b>0</b><small>Growth points</small></div><span className="trend">+0</span></article>
          <article><span className="stat-icon coral">⌁</span><div><b>0</b><small>Pathway milestones</small></div><button type="button" onClick={() => navigate('pathway')}>View →</button></article>
        </section>
        <div className="dashboard-columns">
          <section className="dashboard-panel deadlines-panel"><div className="panel-title"><div><span>Coming up</span><h2>Deadlines to watch</h2></div><button type="button" onClick={() => navigate('discover')}>See all →</button></div>
            {opportunities.length ? opportunities.slice(0, 3).map((item) => <button className="deadline-row" type="button" key={item.id} onClick={() => onOpen(item.id)}><span className={`date-tile ${item.accent}`}><b>—</b><small>DATE</small></span><div><b>{item.title}</b><small>{item.organization}</small></div><span>{item.deadline}</span><i>›</i></button>) : <InlineEmpty title="No deadlines yet" copy="Deadline records from the backend will appear here." action="Open feed" onAction={() => navigate('discover')} />}
          </section>
          <section className="dashboard-panel weekly-panel"><div className="panel-title"><div><span>Your momentum</span><h2>This week</h2></div><b className="week-count">0/3</b></div><div className="week-ring empty-ring"><div><b>0%</b><span>complete</span></div></div><InlineEmpty title="No activity yet" copy="Weekly goals will be calculated by the backend." /><button className="pathway-link" type="button" onClick={() => navigate('pathway')}>View pathway →</button></section>
        </div>
        <section className="saved-snapshot"><div className="panel-title"><div><span>Your collection</span><h2>Saved for later</h2></div><button type="button" onClick={() => navigate('discover')}>Discover more →</button></div>{savedItems.length ? <div className="snapshot-row">{savedItems.slice(0, 3).map((item) => <button type="button" key={item.id} onClick={() => onOpen(item.id)}><span className={`snapshot-icon ${item.accent}`}>{item.icon}</span><div><small>{item.category}</small><b>{item.title}</b></div><i>↗</i></button>)}</div> : <InlineEmpty title="Nothing saved yet" copy="Saved opportunities will appear here once the API is connected." />}</section>
      </div>
    </AppShell>
  );
}

function Discover({ navigate, profile, savedIds, onSave, onOpen, opportunities }: { navigate: (screen: Screen) => void; profile: ProfileDraft; savedIds: string[]; onSave: (id: string) => void; onOpen: (id: string) => void; opportunities: Opportunity[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('Any format');
  const visible = useMemo(() => opportunities.filter((item) => (category === 'All' || item.category === category) && (format === 'Any format' || item.format === format) && `${item.title} ${item.organization} ${item.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [opportunities, category, query, format]);
  return (
    <AppShell screen="discover" navigate={navigate} savedCount={savedIds.length} profile={profile}>
      <div className="product-page discover-page">
        <ProductHeader profile={profile} eyebrow="CURATED FOR YOU" title="Discover your next move" navigate={navigate} action={<button className="saved-header-button" type="button" onClick={() => setQuery(savedIds.length ? opportunities.find((item) => savedIds.includes(item.id))?.title ?? '' : '')}>♥ {savedIds.length} saved</button>} />
        <section className="discover-intro"><div><span>✦ Fresh matches, every week</span><p>{profile.interests.length ? <>Based on your interests in <b>{profile.interests.join(', ')}</b>{profile.goal ? <> and your goal to become a <b>{profile.goal}</b></> : null}.</> : <>Complete onboarding or connect a student profile to personalize this feed.</>}</p></div><Mascot compact /></section>
        <div className="search-filter-row"><label className="feed-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by topic, skill, or organization" /><kbd>⌘ K</kbd></label><select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Filter by format"><option>Any format</option><option>Online</option><option>In person</option><option>Hybrid</option><option>Remote</option></select></div>
        <div className="category-row" aria-label="Opportunity category filters">{categories.map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)} aria-pressed={category === item}>{item === 'All' ? '✦ ' : ''}{item}<span>{item === 'All' ? opportunities.length : opportunities.filter((opportunity) => opportunity.category === item).length}</span></button>)}</div>
        <div className="results-heading"><p><b>{visible.length} opportunities</b> that could be your next chapter</p><select aria-label="Sort opportunities"><option>Best match</option><option>Deadline soon</option><option>Newest</option></select></div>
        {visible.length ? <section className="opportunity-grid">{visible.map((item, index) => <OpportunityCard key={item.id} opportunity={item} saved={savedIds.includes(item.id)} onSave={() => onSave(item.id)} onOpen={() => onOpen(item.id)} featured={index === 0} />)}</section> : <section className="empty-state"><span>⌕</span><h2>No opportunities yet</h2><p>This screen is ready for records from your team’s backend.</p><button className="secondary-button" type="button" onClick={() => { setQuery(''); setCategory('All'); setFormat('Any format'); }}>Clear filters</button></section>}
      </div>
    </AppShell>
  );
}

function Detail({ opportunity, navigate, profile, saved, applied, onSave, onApply, notify }: { opportunity: Opportunity; navigate: (screen: Screen) => void; profile: ProfileDraft; saved: boolean; applied: boolean; onSave: () => void; onApply: () => void; notify: (message: string) => void }) {
  return (
    <AppShell screen="detail" navigate={navigate} savedCount={saved ? 1 : 0} profile={profile}>
      <div className="detail-page product-page">
        <div className="detail-topbar"><button type="button" onClick={() => navigate('discover')}>← Back to opportunities</button><div><button type="button" onClick={() => notify('Link copied to your clipboard')}>↗ Share</button><button className={saved ? 'saved' : ''} onClick={onSave} type="button">{saved ? '♥ Saved' : '♡ Save'}</button></div></div>
        <section className={`detail-hero ${opportunity.accent}`}><span className="detail-pattern" aria-hidden="true" /><div className="detail-hero-copy"><div><span>{opportunity.category}</span><span>{opportunity.format}</span></div><p>{opportunity.organization}</p><h1>{opportunity.title}</h1><p>{opportunity.description}</p><div><span>⌖ {opportunity.location}</span><span>◷ {opportunity.date}</span><span>◎ Free to join</span></div></div><div className="detail-match"><span>Great fit</span><b>{opportunity.match}%</b><small>match for you</small></div><Mascot compact /></section>
        <div className="detail-layout"><article className="detail-content">
          <section><span className="content-kicker">THE OPPORTUNITY</span><h2>Make an idea matter.</h2><p>{opportunity.longDescription}</p><div className="benefit-grid">{opportunity.benefits.map((item, index) => <div key={item}><span>{['✦', '⌁', '↗', '◎'][index]}</span><b>{item}</b></div>)}</div></section>
          <section className="why-match-section"><div><span className="content-kicker">WHY IT FOUND YOU</span><h2>This has your name on it.</h2></div><ul>{opportunity.whyMatch.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
          <section><span className="content-kicker">GOOD TO KNOW</span><h2>Who can join?</h2><ul className="eligibility-list">{opportunity.eligibility.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
          <section><span className="content-kicker">YOUR ROUTE IN</span><h2>From curious to submitted</h2><div className="timeline"><div className="done"><span>1</span><b>Check your fit</b><small>That’s done—you’re a {opportunity.match}% match.</small></div><div><span>2</span><b>Build your application</b><small>About 25 minutes · save anytime</small></div><div><span>3</span><b>Submit and celebrate</b><small>Before {opportunity.deadline}</small></div></div></section>
        </article>
        <aside className="apply-card"><div className="deadline-banner"><span>◷</span><div><small>APPLICATION DEADLINE</small><b>{opportunity.deadline}</b></div></div><div className="apply-card-body"><p>Ready to give it a shot?</p><h2>Your future self might thank you.</h2><button className={`primary-button ${applied ? 'applied' : ''}`} type="button" onClick={onApply}>{applied ? '✓ Application started' : 'Start application'} <span>{applied ? '' : '↗'}</span></button><button className={saved ? 'save-wide saved' : 'save-wide'} type="button" onClick={onSave}>{saved ? '♥ Saved to dashboard' : '♡ Save for later'}</button><small>Free to apply · Takes about 25 min</small></div><div className="application-check"><b>What you’ll need</b><span>Short motivation statement</span><span>Basic student information</span><span>A team can be added later</span></div><div className="safety-note"><span>☻</span><p><b>Checked by Oppniva</b>We review every opportunity for student safety and legitimacy.</p></div></aside>
        </div>
      </div>
    </AppShell>
  );
}

function EmptyDetail({ navigate, profile }: { navigate: (screen: Screen) => void; profile: ProfileDraft }) {
  return <AppShell screen="detail" navigate={navigate} savedCount={0} profile={profile}><div className="detail-page product-page"><div className="detail-topbar"><button type="button" onClick={() => navigate('discover')}>← Back to opportunities</button></div><section className="empty-detail"><Mascot compact /><span>OPPORTUNITY DETAILS</span><h1>Select an opportunity</h1><p>The detail screen is ready. Once the backend returns an opportunity by ID, its overview, eligibility, benefits, match reasons, deadline, and application actions will render here.</p><button className="primary-button" type="button" onClick={() => navigate('discover')}>Return to feed <b>→</b></button></section></div></AppShell>;
}

function Pathway({ navigate, profile, savedCount, pathwayStages }: { navigate: (screen: Screen) => void; profile: ProfileDraft; savedCount: number; pathwayStages: PathwayStage[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const activeId = selected ?? pathwayStages[0]?.id;
  const stage = pathwayStages.find((item) => item.id === activeId);
  return (
    <AppShell screen="pathway" navigate={navigate} savedCount={savedCount} profile={profile}>
      <div className="product-page pathway-page">
        <ProductHeader profile={profile} eyebrow="YOUR NORTH STAR" title="A little closer every week" navigate={navigate} />
        <section className="pathway-goal"><div><span className="goal-icon">⌘</span><div><small>YOUR CURRENT DIRECTION</small><h2>{profile.goal || 'No direction selected'}</h2><p>{profile.goal ? 'Your pathway will adapt as your interests and experience grow.' : 'Add a goal during onboarding or connect the student profile endpoint.'}</p></div></div><button type="button" onClick={() => navigate('profile')}>Edit direction ✎</button></section>
        <section className="pathway-map"><div className="pathway-map-head"><div><span>✦ YOUR JOURNEY</span><h2>Your chapters. Your pace.</h2></div><div className="pathway-progress"><b>0%</b><div><i style={{ width: '0%' }} /></div><small>Waiting for pathway progress</small></div></div>
          {pathwayStages.length ? <div className="stage-track">{pathwayStages.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item.id)} className={`${item.status} ${activeId === item.id ? 'selected' : ''}`}><span className="stage-number">{item.icon}</span><small>{item.label}</small><b>{item.title}</b><i>{item.status === 'locked' ? 'Locked' : item.xp}</i></button>)}</div> : <InlineEmpty title="No pathway stages yet" copy="Stages returned by the pathway endpoint will be rendered as an interactive roadmap." action="Edit profile" onAction={() => navigate('profile')} />}
          {stage && <div className="stage-detail"><div className="stage-detail-icon">{stage.icon}</div><div><span>CHAPTER {stage.id}</span><h3>{stage.title}</h3><p>{stage.description}</p></div><div className="stage-task"><small>{stage.status === 'current' ? 'YOUR NEXT MOVE' : 'CHAPTER NOTE'}</small><b>{stage.task}</b>{stage.status === 'current' && <button type="button" onClick={() => navigate('discover')}>Find a project →</button>}</div></div>}
        </section>
        <div className="pathway-bottom"><section className="skill-cloud"><div className="panel-title"><div><span>Skills you’re growing</span><h2>Your toolkit</h2></div><b>0 skills</b></div><InlineEmpty title="No skill progress yet" copy="Skill names and progress percentages will appear here." /></section><section className="mentor-note backend-note"><span className="quote-mark">✦</span><p>This panel is ready for mentor guidance, pathway recommendations, or next-step content from the backend.</p><div><span>API</span><b>Backend content<small>Not connected yet</small></b></div></section></div>
      </div>
    </AppShell>
  );
}

function Profile({ navigate, profile, setProfile, savedCount, appliedCount, notify, onLogout }: { navigate: (screen: Screen) => void; profile: ProfileDraft; setProfile: (profile: ProfileDraft) => void; savedCount: number; appliedCount: number; notify: (message: string) => void; onLogout: () => void }) {
  const [editing, setEditing] = useState(false);
  const save = () => {
    setEditing(false);
    backend.saveProfile(profile as StudentProfile).catch(() => {});
    notify('Your profile has been updated');
  };
  return (
    <AppShell screen="profile" navigate={navigate} savedCount={savedCount} profile={profile}>
      <div className="product-page profile-page">
        <ProductHeader
          profile={profile}
          eyebrow="YOUR STORY SO FAR"
          title="Profile"
          navigate={navigate}
          action={
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="edit-profile-button" type="button" onClick={() => editing ? save() : setEditing(true)}>
                {editing ? '✓ Save changes' : '✎ Edit profile'}
              </button>
              <button className="edit-profile-button" style={{ borderColor: '#ef4444', color: '#ef4444' }} type="button" onClick={onLogout}>
                Log out
              </button>
            </div>
          }
        />
        <section className="profile-hero"><div className="profile-avatar">{getInitials(profile)}<span>✦</span></div><div className="profile-identity">{editing ? <><input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your name" /><input value={profile.study} onChange={(event) => setProfile({ ...profile, study: event.target.value })} placeholder="Your current study" /></> : <><h2>{getDisplayName(profile)}</h2><p>{profile.study || 'Add your study details'}</p></>}<span>⌖ {[profile.city, profile.school].filter(Boolean).join(' · ') || 'Add your location and school'}</span><div>{profile.interests.map((item) => <b key={item}>{item}</b>)}</div></div><div className="profile-level"><div><span style={{ height: '0%' }} /></div><b>New</b><small>Student</small><p>Progress not connected</p></div></section>
        <section className="profile-stats"><article><span>✦</span><b>0</b><small>Growth points</small></article><article><span>♡</span><b>{savedCount}</b><small>Opportunities saved</small></article><article><span>↗</span><b>{appliedCount}</b><small>Applications</small></article><article><span>⌁</span><b>0</b><small>Milestones reached</small></article></section>
        <div className="profile-columns"><div>
          <section className="profile-panel about-panel"><div className="panel-title"><div><span>Your compass</span><h2>Direction & interests</h2></div></div><div className="direction-card"><span>⌘</span><div><small>EXPLORING A PATH TOWARD</small><h3>{profile.goal || 'No direction selected'}</h3><p>{profile.goal ? 'Your pathway will adapt as you grow.' : 'Complete onboarding or connect the profile API.'}</p></div><button type="button" onClick={() => navigate('pathway')}>View pathway →</button></div><h3 className="subsection-label">Interests</h3><div className="profile-chip-row">{profile.interests.map((item) => <span key={item}>✦ {item}</span>)}<button type="button" onClick={() => setEditing(true)}>+ Add</button></div></section>
          <section className="profile-panel"><div className="panel-title"><div><span>What you bring</span><h2>Skills</h2></div><button type="button" onClick={() => setEditing(true)}>Update</button></div>{profile.skills.length ? <div className="skill-bars">{profile.skills.map((skill) => <div key={skill}><span><b>{skill}</b><small>Awaiting score</small></span><div><i style={{ width: '0%' }} /></div></div>)}</div> : <InlineEmpty title="No skills added" copy="Student skill records will appear here." />}</section>
        </div><aside>
          <section className="profile-strength"><span>PROFILE STRENGTH</span><div className="strength-ring empty-strength"><b>0%</b></div><h3>Ready to get started</h3><p>Profile completeness can be calculated after the backend is connected.</p><button type="button" onClick={() => setEditing(true)}>Add profile details</button></section>
          <section className="profile-panel mini-activity"><div className="panel-title"><div><span>Latest</span><h2>Recent activity</h2></div></div><InlineEmpty title="No recent activity" copy="Applications, saves, and milestones will appear here." /></section>
        </aside></div>
      </div>
    </AppShell>
  );
}

export default function OppnivaApp() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [profile, setProfile] = useState<ProfileDraft>(initialProfile);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [toast, setToast] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pathwayStages, setPathwayStages] = useState<PathwayStage[]>([]);

  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer); }, [toast]);

  const loadBackendData = useCallback(async () => {
    try {
      const [savedProfile, feed, pathway, dashboard] = await Promise.all([
        backend.getProfile(),
        backend.getOpportunities(),
        backend.getPathway(),
        backend.getDashboard(),
      ]);
      if (savedProfile) {
        setProfile(savedProfile);
      }
      setOpportunities(feed);
      setPathwayStages(pathway);
      setSavedIds(dashboard.savedOpportunityIds);
      setAppliedIds(dashboard.appliedOpportunityIds);
      return savedProfile;
    } catch {
      // Offline fallback / guest view
      return null;
    }
  }, []);

  // Load whatever the backend already knows on first render: a previously
  // saved profile, the current opportunity feed, pathway, and dashboard
  // counters. This keeps every screen usable the moment the API is live,
  // without requiring the student to go through onboarding again.
  useEffect(() => {
    (async () => {
      const savedProfile = await loadBackendData();
      if (savedProfile) {
        setScreen('dashboard');
      }
    })();
  }, [loadBackendData]);

  const navigate = useCallback((next: Screen) => { setScreen(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const openOpportunity = (id: string) => { setSelectedId(id); navigate('detail'); };

  const handleAuthSuccess = useCallback((loggedInProfile: ProfileDraft | null, name: string) => {
    if (loggedInProfile) {
      setProfile(loggedInProfile);
      loadBackendData();
    } else {
      setProfile({ ...initialProfile, name });
    }
  }, [loadBackendData]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setProfile(initialProfile);
      setOpportunities([]);
      setPathwayStages([]);
      setSavedIds([]);
      setAppliedIds([]);
      setToast('Logged out successfully ✦');
      navigate('landing');
    } catch {
      setToast('Failed to log out');
    }
  }, [navigate]);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((current) => {
      const saving = !current.includes(id);
      backend.setOpportunitySaved(id, saving).then(() => {
        loadBackendData(); // refresh dashboard metrics / growth points
      }).catch(() => {});
      setToast(saving ? 'Saved to your dashboard ♥' : 'Removed from saved');
      return saving ? [...current, id] : current.filter((item) => item !== id);
    });
  }, [loadBackendData]);

  const apply = useCallback((id: string) => {
    setAppliedIds((current) => {
      if (current.includes(id)) return current;
      backend.startApplication(id).then(() => {
        loadBackendData(); // refresh dashboard metrics / growth points
      }).catch(() => {});
      setToast('Application started—nice move! ✦');
      return [...current, id];
    });
  }, [loadBackendData]);

  // Save the profile to the backend, then ask the AI recommendation engine
  // (Member 1) for a personalized feed + pathway before landing on the dashboard.
  const completeOnboarding = useCallback(async (finishedProfile: ProfileDraft) => {
    const payload: StudentProfile = { ...finishedProfile };
    try {
      await backend.saveProfile(payload);
      const recommendations = await backend.getRecommendations(payload);
      setOpportunities(recommendations.opportunities);
      if (recommendations.pathwayStages.length) setPathwayStages(recommendations.pathwayStages);
      setToast('Your dashboard is ready ✦');
    } catch {
      setToast('Your dashboard is ready ✦ (offline — showing cached opportunities)');
    } finally {
      await loadBackendData();
      navigate('dashboard');
    }
  }, [loadBackendData, navigate]);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId);

  return (
    <>
      {screen === 'landing' && <Landing navigate={navigate} setAuthMode={setAuthMode} opportunities={opportunities} />}
      {screen === 'auth' && <AuthScreen mode={authMode} setMode={setAuthMode} navigate={navigate} onAuthSuccess={handleAuthSuccess} />}
      {screen === 'onboarding' && <Onboarding profile={profile} setProfile={setProfile} navigate={navigate} onComplete={() => completeOnboarding(profile)} />}
      {screen === 'dashboard' && <Dashboard navigate={navigate} profile={profile} savedIds={savedIds} appliedIds={appliedIds} onOpen={openOpportunity} onSave={toggleSave} opportunities={opportunities} />}
      {screen === 'discover' && <Discover navigate={navigate} profile={profile} savedIds={savedIds} onSave={toggleSave} onOpen={openOpportunity} opportunities={opportunities} />}
      {screen === 'detail' && (selectedOpportunity ? <Detail opportunity={selectedOpportunity} navigate={navigate} profile={profile} saved={savedIds.includes(selectedOpportunity.id)} applied={appliedIds.includes(selectedOpportunity.id)} onSave={() => toggleSave(selectedOpportunity.id)} onApply={() => apply(selectedOpportunity.id)} notify={setToast} /> : <EmptyDetail navigate={navigate} profile={profile} />)}
      {screen === 'pathway' && <Pathway navigate={navigate} profile={profile} savedCount={savedIds.length} pathwayStages={pathwayStages} />}
      {screen === 'profile' && <Profile navigate={navigate} profile={profile} setProfile={setProfile} savedCount={savedIds.length} appliedCount={appliedIds.length} notify={setToast} onLogout={handleLogout} />}
      {toast && <div className="toast" role="status"><span>✦</span>{toast}</div>}
    </>
  );
}
