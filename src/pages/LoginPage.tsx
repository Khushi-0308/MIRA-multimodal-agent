import React, { useState } from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { UserProfile, RegisteredAccount } from '../types/auth';
import { MiraThemeId, MascotAccessory } from '../types/agent';
import {
  User,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Briefcase,
  Target,
  LogOut,
  Users,
  Eye,
  EyeOff,
  Palette,
  Heart,
  Calendar,
  Layers,
  PlusCircle,
  KeyRound,
  Compass,
  Globe,
  Phone,
  Clock,
  MessageSquare,
  Award,
  AtSign,
  Smile,
  Sliders,
} from 'lucide-react';

const AVATAR_CHOICES = [
  { emoji: '🌸', label: 'Petal' },
  { emoji: '🌟', label: 'Nova' },
  { emoji: '🔮', label: 'Cosmic' },
  { emoji: '⚡', label: 'Pulse' },
  { emoji: '🤖', label: 'Cyber' },
  { emoji: '🐱', label: 'Neko' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '💎', label: 'Crystal' },
  { emoji: '🚀', label: 'Voyager' },
  { emoji: '🎨', label: 'Artisan' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🌿', label: 'Flora' },
];

const THEME_OPTIONS: Array<{ id: MiraThemeId; name: string; icon: string; desc: string; accent: string }> = [
  { id: 'liquid-rose', name: 'Liquid Rose', icon: '🌸', desc: 'Fluid & soft rose glassmorphism', accent: '#f472b6' },
  { id: 'midnight', name: 'Midnight', icon: '🌌', desc: 'Cosmic starfield & constellation glow', accent: '#a78bfa' },
  { id: 'glitter', name: 'Glitter', icon: '✨', desc: 'Y2K cyber sparkle & pearlescent gloss', accent: '#ec4899' },
  { id: 'bold', name: 'Bold', icon: '⚡', desc: 'High-contrast neo-pop energy & punch', accent: '#e11d48' },
  { id: 'edge', name: 'Edge', icon: '🧬', desc: 'Cyberpunk HUD telemetry & neon matrix', accent: '#06b6d4' },
];

const ACCESSORY_OPTIONS: Array<{ id: MascotAccessory; name: string; emoji: string }> = [
  { id: 'none', name: 'Pure MIRA', emoji: '✨' },
  { id: 'bunny-ears', name: 'Bunny Ears', emoji: '🐰' },
  { id: 'cyber-headphones', name: 'Cyber Headset', emoji: '🎧' },
  { id: 'star-clip', name: 'Star Clip', emoji: '⭐' },
  { id: 'hologram-visor', name: 'Holo Visor', emoji: '🥽' },
];

const INDUSTRY_OPTIONS = [
  'Artificial Intelligence & ML',
  'Software & Web Engineering',
  'Healthcare & Biotechnology',
  'Finance & FinTech',
  'Creative Design & Media',
  'Education & Academia',
  'E-Commerce & Retail',
  'Product Management & SaaS',
  'Consulting & Strategy',
  'Other / Independent Exploration',
];

const EXPERIENCE_LEVELS = [
  'Student / Early Learner',
  'Junior Professional (1-2 yrs)',
  'Mid-Level Specialist (3-5 yrs)',
  'Senior Engineer / Lead (5-8 yrs)',
  'Director / Executive / Founder (8+ yrs)',
];

const TEAM_SIZE_OPTIONS = [
  'Solo Individual / Freelancer (1)',
  'Early Startup (2 - 10 people)',
  'Growing Team (11 - 50 people)',
  'Mid-Market (51 - 250 people)',
  'Enterprise Organization (250+ people)',
];

const AI_TONE_OPTIONS: Array<{ id: 'friendly' | 'concise' | 'technical' | 'creative'; label: string; desc: string; emoji: string }> = [
  { id: 'friendly', label: 'Warm & Empathetic', desc: 'Encouraging, approachable, and playful companion', emoji: '💖' },
  { id: 'concise', label: 'Concise & Action-Oriented', desc: 'Direct answers, bullet points, zero fluff', emoji: '⚡' },
  { id: 'technical', label: 'Deep Technical & Analytical', desc: 'Precise reasoning, architecture diagrams, code clarity', emoji: '🔬' },
  { id: 'creative', label: 'Creative & Brainstorming', desc: 'Generative thinking, inventive angles, expressive tone', emoji: '🎨' },
];

const GOAL_OPTIONS = [
  'Multimodal Vision & Real-Time Voice Assistance',
  'Deep Document Understanding & RAG Research',
  'Daily Task Automation & Workflow Execution',
  'Creative Writing, Coding & Brainstorming',
  'System Diagnostics & Technical Telemetry',
];

const WORKING_HOURS_OPTIONS = [
  'Early Bird (06:00 - 14:00)',
  'Standard Workday (09:00 - 18:00)',
  'Flexible / Hybrid Schedule',
  'Night Owl (18:00 - 03:00)',
  '24/7 Always Active',
];

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'account-khushi',
    profile: {
      id: 'cust-khushi',
      name: 'Khushi',
      username: 'khushi',
      email: 'khushi@miralabs.ai',
      phone: '+1 (555) 234-8901',
      country: 'United States',
      company: 'MIRA AI Labs',
      jobTitle: 'Founder & CEO',
      industry: 'Artificial Intelligence & ML',
      experienceLevel: 'Director / Executive / Founder (8+ yrs)',
      teamSize: 'Growing Team (11 - 50 people)',
      avatar: '👑',
      role: 'enterprise',
      joinedAt: 'January 2026',
      preferredTheme: 'liquid-rose',
      preferredAccessory: 'bunny-ears',
      aiTone: 'friendly',
      workingHours: 'Standard Workday (09:00 - 18:00)',
      bio: 'Pioneering multimodal human-agent collaboration and real-time vision intelligence.',
      primaryGoal: 'Multimodal Vision & Real-Time Voice Assistance',
    },
    lastActive: 'Just now',
  },
  {
    id: 'account-tisa',
    profile: {
      id: 'cust-tisa',
      name: 'Tisa',
      username: 'tisa',
      email: 'tisa@neurallabs.io',
      phone: '+1 (555) 890-1234',
      country: 'Germany',
      company: 'Neural Labs',
      jobTitle: 'Lead AI Architect',
      industry: 'Software & Web Engineering',
      experienceLevel: 'Senior Engineer / Lead (5-8 yrs)',
      teamSize: 'Early Startup (2 - 10 people)',
      avatar: '🌟',
      role: 'enterprise',
      joinedAt: 'March 2026',
      preferredTheme: 'midnight',
      preferredAccessory: 'cyber-headphones',
      aiTone: 'technical',
      workingHours: 'Flexible / Hybrid Schedule',
      bio: 'Building neural agents, real-time audio streams, and cognitive context memory.',
      primaryGoal: 'Deep Document Understanding & RAG Research',
    },
    lastActive: '10 mins ago',
  },
];

export const LoginPage: React.FC = () => {
  const {
    user,
    login,
    logout,
    loginAsGuest,
    theme,
    setTheme,
    mascotAccessory,
    setMascotAccessory,
    addAnchor,
    setActiveNavTab,
    contextCore,
  } = useMira();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'profiles'>('signup');
  const [signupStep, setSignupStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State: Personal Details
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form State: Professional Details
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [experienceLevel, setExperienceLevel] = useState(EXPERIENCE_LEVELS[2]);
  const [teamSize, setTeamSize] = useState(TEAM_SIZE_OPTIONS[1]);

  // Form State: Customization & AI Goals
  const [avatar, setAvatar] = useState('🌸');
  const [selectedTheme, setSelectedTheme] = useState<MiraThemeId>(theme);
  const [selectedAccessory, setSelectedAccessory] = useState<MascotAccessory>(mascotAccessory);
  const [aiTone, setAiTone] = useState<'friendly' | 'concise' | 'technical' | 'creative'>('friendly');
  const [primaryGoal, setPrimaryGoal] = useState(GOAL_OPTIONS[0]);
  const [workingHours, setWorkingHours] = useState(WORKING_HOURS_OPTIONS[1]);
  const [bio, setBio] = useState('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registered Accounts Directory in LocalStorage
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('mira_registered_directory');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read registered accounts directory:', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  const saveAccountsToStorage = (updatedList: RegisteredAccount[]) => {
    setAccounts(updatedList);
    try {
      localStorage.setItem('mira_registered_directory', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not save accounts:', e);
    }
  };

  const syncCustomerToContext = (p: UserProfile) => {
    addAnchor({
      modality: 'session',
      title: `Individual Profile: ${p.name} (@${p.username || 'user'})`,
      source: 'Account Registry',
      summary: `User is ${p.name}, working as ${p.jobTitle || 'Member'} at ${p.company || 'Personal Space'} in ${p.industry || 'Tech'}. Primary AI Goal: ${p.primaryGoal || 'Multimodal intelligence'}. Preferred Tone: ${p.aiTone || 'friendly'}. Theme: ${p.preferredTheme || 'liquid-rose'}.`,
      tokenWeight: 260,
      isPinned: true,
    });
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (password && password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return false;
    }
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!jobTitle.trim()) {
      setErrorMsg('Please enter your current role or job title.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupStep === 1) {
      if (validateStep1()) setSignupStep(2);
    } else if (signupStep === 2) {
      if (validateStep2()) setSignupStep(3);
    } else if (signupStep === 3) {
      setSignupStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setSignupStep((prev) => Math.max(1, prev - 1));
  };

  // Complete Registration
  const handleCompleteSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const alreadyExists = accounts.some((a) => a.profile.email.toLowerCase() === cleanEmail);
    if (alreadyExists) {
      setErrorMsg('An account with this email address already exists. Please Sign In.');
      return;
    }

    const newProfile: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      name: name.trim(),
      username: username.trim() || name.trim().toLowerCase().replace(/\s+/g, '_'),
      email: cleanEmail,
      phone: phone.trim() || undefined,
      country: country.trim() || 'United States',
      company: company.trim() || 'Independent Workspace',
      jobTitle: jobTitle.trim() || 'Multimodal Innovator',
      industry,
      experienceLevel,
      teamSize,
      avatar,
      role: 'enterprise',
      joinedAt: 'Today',
      preferredTheme: selectedTheme,
      preferredAccessory: selectedAccessory,
      aiTone,
      workingHours,
      bio: bio.trim() || `${jobTitle || 'Builder'} specializing in ${industry}.`,
      primaryGoal,
      savedPassword: password.trim() || undefined,
    };

    const newEntry: RegisteredAccount = {
      id: `acc-${Date.now().toString(36)}`,
      profile: newProfile,
      lastActive: 'Just now',
    };

    saveAccountsToStorage([newEntry, ...accounts]);
    setTheme(selectedTheme);
    setMascotAccessory(selectedAccessory);

    setSuccessMsg(`Welcome to MIRA, ${newProfile.name}! Setting up your personalized companion...`);
    setTimeout(() => {
      login(newProfile);
      syncCustomerToContext(newProfile);
      setSuccessMsg(null);
      setActiveNavTab('MyDay');
    }, 900);
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const query = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!query) {
      setErrorMsg('Please enter your email address or username.');
      return;
    }

    const existing = accounts.find(
      (a) =>
        a.profile.email.toLowerCase() === query ||
        (a.profile.username && a.profile.username.toLowerCase() === query) ||
        a.profile.name.toLowerCase() === query
    );

    if (existing) {
      if (existing.profile.savedPassword && cleanPass && existing.profile.savedPassword !== cleanPass) {
        setErrorMsg('Invalid password for this account.');
        return;
      }
      setSuccessMsg(`Welcome back, ${existing.profile.name}! Restoring your world...`);
      setTimeout(() => {
        login(existing.profile);
        if (existing.profile.preferredTheme) setTheme(existing.profile.preferredTheme);
        if (existing.profile.preferredAccessory) setMascotAccessory(existing.profile.preferredAccessory);
        syncCustomerToContext(existing.profile);
        setSuccessMsg(null);
        setActiveNavTab('MyDay');
      }, 700);
      return;
    }

    // Direct dynamic entry
    const profile: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      name: query.split('@')[0] || 'User',
      username: query.split('@')[0] || 'user',
      email: query.includes('@') ? query : `${query}@mira.ai`,
      avatar: '🌟',
      role: 'member',
      joinedAt: 'Today',
      preferredTheme: theme,
      preferredAccessory: mascotAccessory,
      savedPassword: cleanPass,
      bio: 'Active MIRA companion user.',
    };

    const newAcc: RegisteredAccount = {
      id: `acc-${Date.now().toString(36)}`,
      profile,
      lastActive: 'Just now',
    };
    saveAccountsToStorage([newAcc, ...accounts]);

    setSuccessMsg(`Signed in as ${profile.name}!`);
    setTimeout(() => {
      login(profile);
      syncCustomerToContext(profile);
      setSuccessMsg(null);
      setActiveNavTab('MyDay');
    }, 700);
  };

  const handleSwitchToAccount = (acc: RegisteredAccount) => {
    setSuccessMsg(`Switching profile to ${acc.profile.name}...`);
    setTimeout(() => {
      login(acc.profile);
      if (acc.profile.preferredTheme) setTheme(acc.profile.preferredTheme);
      if (acc.profile.preferredAccessory) setMascotAccessory(acc.profile.preferredAccessory);
      syncCustomerToContext(acc.profile);
      setSuccessMsg(null);
      setActiveNavTab('MyDay');
    }, 600);
  };

  return (
    <div className="page-container login-page-container">
      {/* Top Banner Header */}
      <div className="login-hero-header">
        <div className="login-hero-mascot">
          <MiraAvatar
            size={78}
            state={user ? 'completed' : signupStep === 4 ? 'thinking' : 'idle'}
            theme={user ? theme : selectedTheme}
            accessory={user ? mascotAccessory : selectedAccessory}
            interactive={true}
          />
        </div>
        <div className="login-hero-text">
          <div className="status-pill ready" style={{ display: 'inline-flex', marginBottom: 6 }}>
            {user ? '✨ Authenticated Profile' : '🌟 Individual Customer & Creator Onboarding'}
          </div>
          <h1 className="login-hero-title">
            {user ? `Welcome back, ${user.name}` : 'Create Your Personalized MIRA Space'}
          </h1>
          <p className="login-hero-sub">
            {user
              ? `Your account, role preferences, and ContextCore memory are active across all 5 worlds.`
              : `Fill in your details below so MIRA can tailor its voice, reasoning, daily dashboard, and visual world specifically to you.`}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {user ? (
        /* LOGGED IN ACCOUNT DASHBOARD */
        <div className="account-logged-in-view">
          {/* Main Account Hero Card */}
          <div className="account-profile-hero-card">
            <div className="account-hero-left">
              <div className="account-avatar-huge">
                <span className="account-avatar-emoji-large">{user.avatar}</span>
                <span className="account-role-tag">{user.role}</span>
              </div>
              <div className="account-details-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 className="account-user-name">{user.name}</h2>
                  {user.username && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{user.username}</span>}
                </div>
                <div className="account-user-meta-line">
                  <span className="account-meta-item">
                    <Mail size={14} /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="account-meta-item">
                      <Phone size={14} /> {user.phone}
                    </span>
                  )}
                  {user.company && (
                    <span className="account-meta-item">
                      <Building2 size={14} /> {user.company}
                    </span>
                  )}
                  {user.jobTitle && (
                    <span className="account-meta-item">
                      <Briefcase size={14} /> {user.jobTitle}
                    </span>
                  )}
                  {user.country && (
                    <span className="account-meta-item">
                      <Globe size={14} /> {user.country}
                    </span>
                  )}
                  <span className="account-meta-item">
                    <Calendar size={14} /> Joined {user.joinedAt}
                  </span>
                </div>
                {user.bio && <p className="account-user-bio">"{user.bio}"</p>}
              </div>
            </div>

            <div className="account-hero-actions">
              <button
                className="mira-btn mira-btn-primary"
                onClick={() => setActiveNavTab('MyDay')}
                title="Open My Day Dashboard"
              >
                <Compass size={15} />
                <span>Open My Day</span>
              </button>
              <button
                className="mira-btn"
                onClick={() => setActiveNavTab('Studio')}
                title="Change Theme in MIRA Studio"
              >
                <Palette size={15} />
                <span>MIRA Studio</span>
              </button>
              <button
                className="mira-btn mira-btn-danger"
                onClick={logout}
                title="Log Out of this session"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="account-info-grid">
            {/* Preferences & AI Style */}
            <div className="mira-card account-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <Sliders size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span>AI Companion Alignment & Customization</span>
                </div>
              </div>
              <div className="account-card-body">
                <div className="account-pref-row">
                  <span className="account-pref-label">World Theme:</span>
                  <span className="account-pref-val">
                    {THEME_OPTIONS.find((t) => t.id === theme)?.name || theme}
                  </span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">Mascot Accessory:</span>
                  <span className="account-pref-val">
                    {ACCESSORY_OPTIONS.find((a) => a.id === mascotAccessory)?.name || mascotAccessory}
                  </span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">AI Conversation Tone:</span>
                  <span className="account-pref-val">
                    {AI_TONE_OPTIONS.find((t) => t.id === user.aiTone)?.label || 'Warm & Empathetic'}
                  </span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">Primary Objective:</span>
                  <span className="account-pref-val">
                    {user.primaryGoal || 'Multimodal Vision & Voice Intelligence'}
                  </span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">Working Hours:</span>
                  <span className="account-pref-val">{user.workingHours || 'Standard Workday'}</span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">Industry & Experience:</span>
                  <span className="account-pref-val">
                    {user.industry || 'Tech'} • {user.experienceLevel || 'Professional'}
                  </span>
                </div>
              </div>
            </div>

            {/* ContextCore Anchors */}
            <div className="mira-card account-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <Layers size={16} style={{ color: 'var(--brand-secondary)' }} />
                  <span>ContextCore Grounding Anchors ({contextCore.activeAnchors.length})</span>
                </div>
                <span className="status-pill ready">Active Synced</span>
              </div>
              <div className="account-card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Your profile attributes are actively injected into MIRA's reasoning pipeline:
                </p>
                <div className="account-anchors-mini-list">
                  {contextCore.activeAnchors.map((anc) => (
                    <div key={anc.id} className="account-anchor-chip">
                      <span className="anchor-chip-modality">{anc.modality}</span>
                      <span className="anchor-chip-title">{anc.title}</span>
                      <span className="anchor-chip-weight">{anc.tokenWeight}t</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Switcher Directory */}
          <div className="mira-card account-switch-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Users size={16} style={{ color: 'var(--brand-primary)' }} />
                <span>Switch to Another Individual Profile ({accounts.length} Saved)</span>
              </div>
              <button
                className="mira-btn mira-btn-sm"
                onClick={() => {
                  logout();
                  setActiveTab('signup');
                }}
              >
                <PlusCircle size={13} />
                <span>Create New Profile</span>
              </button>
            </div>
            <div className="account-switch-grid">
              {accounts.map((acc) => {
                const isThisUser = acc.profile.email === user.email;
                return (
                  <div
                    key={acc.id}
                    className={`account-switch-item ${isThisUser ? 'active-current-user' : ''}`}
                    onClick={() => !isThisUser && handleSwitchToAccount(acc)}
                  >
                    <span className="switch-avatar-emoji">{acc.profile.avatar}</span>
                    <div className="switch-item-meta">
                      <div className="switch-item-name">
                        {acc.profile.name}
                        {isThisUser && <span className="current-user-badge">Active</span>}
                      </div>
                      <div className="switch-item-email">{acc.profile.email}</div>
                      <div className="switch-item-role">{acc.profile.jobTitle || acc.profile.company}</div>
                    </div>
                    {!isThisUser && (
                      <button className="switch-item-action-btn" title="Switch to this profile">
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* NOT LOGGED IN: REGISTRATION / SIGN IN / DIRECTORY EXPERIENCE */
        <div className="login-auth-wrapper">
          {/* Tabs */}
          <div className="login-auth-tabs">
            <button
              className={`login-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
            >
              <PlusCircle size={15} />
              <span>Create Individual Account (Detailed Setup)</span>
            </button>
            <button
              className={`login-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
              }}
            >
              <KeyRound size={15} />
              <span>Sign In to Existing Account</span>
            </button>
            <button
              className={`login-tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profiles');
                setErrorMsg(null);
              }}
            >
              <Users size={15} />
              <span>Registered Accounts ({accounts.length})</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="auth-alert error">
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: DETAILED SIGN UP (MULTI-STEP JOURNEY WITH LIVE PREVIEW) */}
          {activeTab === 'signup' && (
            <div className="detailed-signup-layout">
              {/* Left Column: Multi-Step Interactive Form */}
              <div className="signup-form-main-card">
                {/* Step Progress Tracker */}
                <div className="signup-stepper-bar">
                  <div
                    className={`step-indicator ${signupStep >= 1 ? 'active' : ''} ${signupStep > 1 ? 'completed' : ''}`}
                    onClick={() => signupStep > 1 && setSignupStep(1)}
                  >
                    <span className="step-num">{signupStep > 1 ? '✓' : '1'}</span>
                    <span className="step-text">1. Identity</span>
                  </div>
                  <div className="step-connector" />
                  <div
                    className={`step-indicator ${signupStep >= 2 ? 'active' : ''} ${signupStep > 2 ? 'completed' : ''}`}
                    onClick={() => signupStep > 2 && setSignupStep(2)}
                  >
                    <span className="step-num">{signupStep > 2 ? '✓' : '2'}</span>
                    <span className="step-text">2. Career</span>
                  </div>
                  <div className="step-connector" />
                  <div
                    className={`step-indicator ${signupStep >= 3 ? 'active' : ''} ${signupStep > 3 ? 'completed' : ''}`}
                    onClick={() => signupStep > 3 && setSignupStep(3)}
                  >
                    <span className="step-num">{signupStep > 3 ? '✓' : '3'}</span>
                    <span className="step-text">3. World & Mascot</span>
                  </div>
                  <div className="step-connector" />
                  <div
                    className={`step-indicator ${signupStep >= 4 ? 'active' : ''}`}
                  >
                    <span className="step-num">4</span>
                    <span className="step-text">4. AI Goals</span>
                  </div>
                </div>

                {/* STEP 1: IDENTITY & CREDENTIALS */}
                {signupStep === 1 && (
                  <form onSubmit={handleNextStep} className="step-form-pane">
                    <div className="step-pane-header">
                      <h3 className="step-pane-title">👤 Step 1: Personal Profile & Credentials</h3>
                      <p className="step-pane-desc">Tell us who you are and create your security password.</p>
                    </div>

                    <div className="form-two-col">
                      <div className="form-group">
                        <label className="form-label">
                          <User size={14} /> Full Name *
                        </label>
                        <input
                          type="text"
                          className="mira-input"
                          placeholder="e.g. Alex Rivera"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <AtSign size={14} /> Username / Handle
                        </label>
                        <input
                          type="text"
                          className="mira-input"
                          placeholder="e.g. alex_rivera"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-two-col">
                      <div className="form-group">
                        <label className="form-label">
                          <Mail size={14} /> Email Address *
                        </label>
                        <input
                          type="email"
                          className="mira-input"
                          placeholder="alex@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <Phone size={14} /> Phone Number (Optional)
                        </label>
                        <input
                          type="tel"
                          className="mira-input"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Globe size={14} /> Country / Region
                      </label>
                      <input
                        type="text"
                        className="mira-input"
                        placeholder="e.g. United States, India, Germany, UK..."
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>

                    <div className="form-two-col">
                      <div className="form-group">
                        <label className="form-label">
                          <Lock size={14} /> Password
                        </label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="mira-input"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <Lock size={14} /> Confirm Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="mira-input"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="step-actions-row">
                      <div />
                      <button type="submit" className="mira-btn mira-btn-primary">
                        <span>Continue to Step 2: Career</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: PROFESSIONAL & ORGANIZATIONAL DETAILS */}
                {signupStep === 2 && (
                  <form onSubmit={handleNextStep} className="step-form-pane">
                    <div className="step-pane-header">
                      <h3 className="step-pane-title">💼 Step 2: Organization, Role & Experience</h3>
                      <p className="step-pane-desc">Ground MIRA's reasoning in your professional or academic background.</p>
                    </div>

                    <div className="form-two-col">
                      <div className="form-group">
                        <label className="form-label">
                          <Building2 size={14} /> Company / University / Workspace
                        </label>
                        <input
                          type="text"
                          className="mira-input"
                          placeholder="e.g. MIRA AI Labs / Stanford / Freelance"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <Briefcase size={14} /> Job Title / Major / Specialty *
                        </label>
                        <input
                          type="text"
                          className="mira-input"
                          placeholder="e.g. Senior AI Engineer / Product Lead"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Layers size={14} /> Industry Domain
                      </label>
                      <select
                        className="mira-select auth-select"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      >
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-two-col">
                      <div className="form-group">
                        <label className="form-label">
                          <Award size={14} /> Experience Level
                        </label>
                        <select
                          className="mira-select auth-select"
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                          {EXPERIENCE_LEVELS.map((exp) => (
                            <option key={exp} value={exp}>
                              {exp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <Users size={14} /> Team / Workspace Size
                        </label>
                        <select
                          className="mira-select auth-select"
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                        >
                          {TEAM_SIZE_OPTIONS.map((ts) => (
                            <option key={ts} value={ts}>
                              {ts}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="step-actions-row">
                      <button type="button" className="mira-btn" onClick={handlePrevStep}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="mira-btn mira-btn-primary">
                        <span>Continue to Step 3: World & Mascot</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: MIRA WORLD & MASCOT CUSTOMIZATION */}
                {signupStep === 3 && (
                  <form onSubmit={handleNextStep} className="step-form-pane">
                    <div className="step-pane-header">
                      <h3 className="step-pane-title">🎨 Step 3: MIRA World & Mascot Customization</h3>
                      <p className="step-pane-desc">Choose your default aesthetic environment, avatar emoji, and mascot accessory.</p>
                    </div>

                    {/* Avatar Emoji Selector */}
                    <div className="form-group">
                      <label className="form-label">
                        <Heart size={14} /> Choose Your Profile Avatar Mascot
                      </label>
                      <div className="avatar-picker-grid">
                        {AVATAR_CHOICES.map((av) => (
                          <button
                            type="button"
                            key={av.emoji}
                            className={`avatar-choice-btn ${avatar === av.emoji ? 'selected' : ''}`}
                            onClick={() => setAvatar(av.emoji)}
                            title={av.label}
                          >
                            <span className="av-emoji">{av.emoji}</span>
                            <span className="av-label">{av.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5 Themes Selection Cards */}
                    <div className="form-group">
                      <label className="form-label">
                        <Palette size={14} /> Select Your Initial World Theme
                      </label>
                      <div className="theme-select-cards-grid">
                        {THEME_OPTIONS.map((t) => (
                          <div
                            key={t.id}
                            className={`theme-card-option ${selectedTheme === t.id ? 'active' : ''}`}
                            onClick={() => setSelectedTheme(t.id)}
                          >
                            <div className="theme-card-icon">{t.icon}</div>
                            <div className="theme-card-name">{t.name}</div>
                            <div className="theme-card-desc">{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mascot Accessory Selector */}
                    <div className="form-group">
                      <label className="form-label">
                        <Sparkles size={14} /> Companion Accessory
                      </label>
                      <div className="accessory-picker-row">
                        {ACCESSORY_OPTIONS.map((acc) => (
                          <button
                            type="button"
                            key={acc.id}
                            className={`accessory-choice-pill ${selectedAccessory === acc.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAccessory(acc.id)}
                          >
                            <span>{acc.emoji}</span>
                            <span>{acc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="step-actions-row">
                      <button type="button" className="mira-btn" onClick={handlePrevStep}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="mira-btn mira-btn-primary">
                        <span>Continue to Step 4: AI Goals</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 4: AI GOALS & COMPANION ALIGNMENT */}
                {signupStep === 4 && (
                  <form onSubmit={handleCompleteSignUp} className="step-form-pane">
                    <div className="step-pane-header">
                      <h3 className="step-pane-title">🎯 Step 4: AI Goals, Personality & Working Rhythm</h3>
                      <p className="step-pane-desc">Align MIRA's tone, active hours, and primary focus with your daily workflow.</p>
                    </div>

                    {/* AI Interaction Tone */}
                    <div className="form-group">
                      <label className="form-label">
                        <MessageSquare size={14} /> AI Companion Conversation Tone
                      </label>
                      <div className="ai-tone-grid">
                        {AI_TONE_OPTIONS.map((tone) => (
                          <div
                            key={tone.id}
                            className={`ai-tone-card ${aiTone === tone.id ? 'active' : ''}`}
                            onClick={() => setAiTone(tone.id)}
                          >
                            <div className="tone-card-top">
                              <span className="tone-emoji">{tone.emoji}</span>
                              <span className="tone-label">{tone.label}</span>
                            </div>
                            <p className="tone-desc">{tone.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Primary AI Objective */}
                    <div className="form-group">
                      <label className="form-label">
                        <Target size={14} /> Primary AI Objective & Focus
                      </label>
                      <select
                        className="mira-select auth-select"
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value)}
                      >
                        {GOAL_OPTIONS.map((goal) => (
                          <option key={goal} value={goal}>
                            {goal}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Working Hours */}
                    <div className="form-group">
                      <label className="form-label">
                        <Clock size={14} /> Preferred Active Hours / Rhythm
                      </label>
                      <select
                        className="mira-select auth-select"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                      >
                        {WORKING_HOURS_OPTIONS.map((wh) => (
                          <option key={wh} value={wh}>
                            {wh}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bio / Tagline */}
                    <div className="form-group">
                      <label className="form-label">
                        <Smile size={14} /> Personal Bio / Companion Tagline (Optional)
                      </label>
                      <textarea
                        className="mira-input"
                        rows={2}
                        placeholder="e.g. Exploring multimodal agents and neural interfaces..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>

                    <div className="step-actions-row">
                      <button type="button" className="mira-btn" onClick={handlePrevStep}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button type="submit" className="mira-btn mira-btn-primary signup-finish-btn">
                        <CheckCircle2 size={18} />
                        <span>Complete Setup & Enter MIRA</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Live Sticky Profile Preview Card */}
              <div className="signup-preview-col">
                <div className="live-preview-sticky-card">
                  <div className="preview-card-badge">
                    <Sparkles size={13} /> Live Profile Preview
                  </div>

                  <div className="preview-mascot-spot">
                    <MiraAvatar
                      size={90}
                      state={signupStep === 4 ? 'completed' : 'idle'}
                      theme={selectedTheme}
                      accessory={selectedAccessory}
                      interactive={true}
                    />
                  </div>

                  <div className="preview-user-header">
                    <div className="preview-avatar-badge">{avatar}</div>
                    <div className="preview-names">
                      <h4 className="preview-name-text">{name || 'Your Full Name'}</h4>
                      <div className="preview-username-text">@{username || 'username'}</div>
                    </div>
                  </div>

                  <div className="preview-details-list">
                    <div className="preview-detail-row">
                      <span className="p-label">Role:</span>
                      <span className="p-val">{jobTitle || 'Multimodal Innovator'}</span>
                    </div>
                    <div className="preview-detail-row">
                      <span className="p-label">Organization:</span>
                      <span className="p-val">{company || 'Independent Space'}</span>
                    </div>
                    <div className="preview-detail-row">
                      <span className="p-label">World Theme:</span>
                      <span className="p-val" style={{ textTransform: 'capitalize' }}>{selectedTheme.replace('-', ' ')}</span>
                    </div>
                    <div className="preview-detail-row">
                      <span className="p-label">AI Tone:</span>
                      <span className="p-val" style={{ textTransform: 'capitalize' }}>{aiTone}</span>
                    </div>
                    <div className="preview-detail-row">
                      <span className="p-label">Primary Goal:</span>
                      <span className="p-val preview-goal-truncate">{primaryGoal}</span>
                    </div>
                  </div>

                  <div className="preview-grounding-notice">
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span>Auto-grounded to ContextCore Anchor memory upon creation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN TO EXISTING ACCOUNT */}
          {activeTab === 'signin' && (
            <div className="login-form-card">
              <form onSubmit={handleSignIn} className="login-form">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} /> Email Address, Username, or Full Name
                  </label>
                  <input
                    type="text"
                    className="mira-input"
                    placeholder="e.g. khushi@miralabs.ai or tisa"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} /> Security Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="mira-input"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-actions-row">
                  <button type="submit" className="mira-btn mira-btn-primary login-submit-btn">
                    <span>Sign In to MIRA</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Instant Quick Persona Shortcuts */}
              <div className="quick-access-section">
                <div className="quick-access-title">
                  <Sparkles size={13} /> Instant Demo Account Profiles
                </div>
                <div className="quick-access-buttons">
                  <button
                    type="button"
                    className="quick-persona-btn"
                    onClick={() => {
                      setLoginEmail('khushi@miralabs.ai');
                      setLoginPassword('mira2026');
                    }}
                  >
                    <span>👑 Khushi (Founder & CEO)</span>
                  </button>
                  <button
                    type="button"
                    className="quick-persona-btn"
                    onClick={() => {
                      setLoginEmail('tisa@neurallabs.io');
                      setLoginPassword('mira2026');
                    }}
                  >
                    <span>🌟 Tisa (Lead AI Architect)</span>
                  </button>
                  <button
                    type="button"
                    className="quick-persona-btn guest-btn"
                    onClick={() => {
                      loginAsGuest();
                      setActiveNavTab('MyDay');
                    }}
                  >
                    <span>⚡ Instant Guest Access</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED PROFILES DIRECTORY */}
          {activeTab === 'profiles' && (
            <div className="login-form-card">
              <div className="saved-profiles-header">
                <h3 className="saved-profiles-title">Registered Accounts on this Device ({accounts.length})</h3>
                <p className="saved-profiles-desc">
                  Select your profile to restore your theme, accessory, role, and ContextCore memory:
                </p>
              </div>

              <div className="saved-profiles-grid">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="saved-profile-card"
                    onClick={() => handleSwitchToAccount(acc)}
                  >
                    <div className="saved-profile-avatar">{acc.profile.avatar}</div>
                    <div className="saved-profile-info">
                      <div className="saved-profile-name">{acc.profile.name}</div>
                      <div className="saved-profile-email">{acc.profile.email}</div>
                      <div className="saved-profile-tag">{acc.profile.jobTitle || acc.profile.company}</div>
                    </div>
                    <button className="saved-profile-switch-btn" title="Sign in with this profile">
                      <span>Log In</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  type="button"
                  className="mira-btn mira-btn-primary"
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupStep(1);
                  }}
                >
                  <PlusCircle size={15} />
                  <span>Register a New User Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
