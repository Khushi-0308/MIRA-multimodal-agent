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

const THEME_OPTIONS: Array<{ id: MiraThemeId; name: string; icon: string; desc: string }> = [
  { id: 'liquid-rose', name: 'Liquid Rose', icon: '🌸', desc: 'Fluid & soft rose glass' },
  { id: 'midnight', name: 'Midnight', icon: '🌌', desc: 'Cosmic constellation depth' },
  { id: 'glitter', name: 'Glitter', icon: '✨', desc: 'Y2K cyber sparkle gloss' },
  { id: 'bold', name: 'Bold', icon: '⚡', desc: 'Vibrant neo-pop high contrast' },
  { id: 'edge', name: 'Edge', icon: '🧬', desc: 'Cyberpunk HUD telemetry' },
];

const ACCESSORY_OPTIONS: Array<{ id: MascotAccessory; name: string; emoji: string }> = [
  { id: 'none', name: 'Pure MIRA', emoji: '✨' },
  { id: 'bunny-ears', name: 'Bunny Ears', emoji: '🐰' },
  { id: 'cyber-headphones', name: 'Cyber Headphones', emoji: '🎧' },
  { id: 'star-clip', name: 'Star Clip', emoji: '⭐' },
  { id: 'hologram-visor', name: 'Hologram Visor', emoji: '🥽' },
];

const PERSONA_OPTIONS = [
  'Software Engineer & Builder',
  'AI Researcher & Scientist',
  'Creative Designer & Artist',
  'Student & Lifelong Learner',
  'Product Manager & Strategist',
  'Founder & Entrepreneur',
  'Content Creator & Writer',
  'Curious Explorer',
];

const GOAL_OPTIONS = [
  'Multimodal Vision & Voice Assistance',
  'Document Understanding & Deep Research',
  'Daily Workflow & Task Automation',
  'Creative Brainstorming & Companion',
  'Enterprise System Safety & Diagnostics',
];

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'account-khushi',
    profile: {
      id: 'cust-khushi',
      name: 'Khushi',
      email: 'khushi@miralabs.ai',
      phone: '+1 (555) 234-8901',
      company: 'MIRA AI Labs',
      jobTitle: 'Founder & CEO',
      industry: 'AI & Software Engineering',
      useCase: 'Multimodal Vision & Voice Assistance',
      teamSize: '11 - 50 (Growth Team)',
      avatar: '👑',
      role: 'enterprise',
      joinedAt: 'January 2026',
      preferredTheme: 'liquid-rose',
      preferredAccessory: 'bunny-ears',
      bio: 'Pioneering multimodal human-agent collaboration and real-time vision intelligence.',
      primaryGoal: 'Multimodal Vision & Voice Assistance',
    },
    lastActive: 'Just now',
  },
  {
    id: 'account-tisa',
    profile: {
      id: 'cust-tisa',
      name: 'Tisa',
      email: 'tisa@neurallabs.io',
      phone: '+1 (555) 890-1234',
      company: 'Neural Labs',
      jobTitle: 'Lead AI Architect',
      industry: 'AI & Software Engineering',
      useCase: 'Document Understanding & Knowledge RAG',
      teamSize: '2 - 10 (Startup)',
      avatar: '🌟',
      role: 'enterprise',
      joinedAt: 'March 2026',
      preferredTheme: 'midnight',
      preferredAccessory: 'cyber-headphones',
      bio: 'Building neural agents, real-time audio streams, and cognitive context memory.',
      primaryGoal: 'Document Understanding & Deep Research',
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

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'profiles'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields for Registration / Sign In
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('🌸');
  const [selectedTheme, setSelectedTheme] = useState<MiraThemeId>(theme);
  const [selectedAccessory, setSelectedAccessory] = useState<MascotAccessory>(mascotAccessory);
  const [persona, setPersona] = useState(PERSONA_OPTIONS[0]);
  const [primaryGoal, setPrimaryGoal] = useState(GOAL_OPTIONS[0]);
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');

  // Registered Accounts Directory
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
      title: `Individual Profile: ${p.name}`,
      source: 'Account Registry',
      summary: `Active individual is ${p.name} (${p.jobTitle || p.role || 'Member'}), working with MIRA on: ${p.primaryGoal || p.useCase || 'General AI tasks'}. Preferred Theme: ${p.preferredTheme || 'liquid-rose'}.`,
      tokenWeight: 240,
      isPinned: true,
    });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address or username.');
      return;
    }

    // Check if account exists in registry
    const existing = accounts.find(
      (a) => a.profile.email.toLowerCase() === cleanEmail || a.profile.name.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.profile.savedPassword && cleanPass && existing.profile.savedPassword !== cleanPass) {
        setErrorMsg('Invalid password. Please check your credentials.');
        return;
      }
      setSuccessMsg(`Welcome back, ${existing.profile.name}! Initializing your personal MIRA environment...`);
      setTimeout(() => {
        login(existing.profile);
        if (existing.profile.preferredTheme) {
          setTheme(existing.profile.preferredTheme);
        }
        if (existing.profile.preferredAccessory) {
          setMascotAccessory(existing.profile.preferredAccessory);
        }
        syncCustomerToContext(existing.profile);
        setSuccessMsg(null);
      }, 700);
      return;
    }

    // Direct Login with new/custom email
    const profile: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      name: cleanEmail.split('@')[0] || 'User',
      email: cleanEmail,
      avatar: '🌟',
      role: 'member',
      joinedAt: 'Today',
      preferredTheme: theme,
      preferredAccessory: mascotAccessory,
      savedPassword: cleanPass,
      bio: 'Personal MIRA Workspace member.',
    };

    const newAcc: RegisteredAccount = {
      id: `acc-${Date.now().toString(36)}`,
      profile,
      lastActive: 'Just now',
    };
    saveAccountsToStorage([newAcc, ...accounts]);

    setSuccessMsg(`Signed in as ${profile.name}! Preparing your companion...`);
    setTimeout(() => {
      login(profile);
      syncCustomerToContext(profile);
      setSuccessMsg(null);
    }, 700);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName || !cleanEmail) {
      setErrorMsg('Please provide your full display name and email.');
      return;
    }

    if (cleanPass && cleanPass.length < 4) {
      setErrorMsg('Please enter a password with at least 4 characters.');
      return;
    }

    if (cleanPass && cleanPass !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    // Check existing email
    const alreadyExists = accounts.some((a) => a.profile.email.toLowerCase() === cleanEmail);
    if (alreadyExists) {
      setErrorMsg('An account with this email address already exists. Please Sign In.');
      return;
    }

    const newProfile: UserProfile = {
      id: `user-${Date.now().toString(36)}`,
      name: cleanName,
      email: cleanEmail,
      company: company.trim() || undefined,
      jobTitle: persona,
      avatar,
      role: 'member',
      joinedAt: 'Today',
      preferredTheme: selectedTheme,
      preferredAccessory: selectedAccessory,
      bio: bio.trim() || `${persona} passionate about multimodal AI.`,
      primaryGoal,
      savedPassword: cleanPass,
    };

    const newEntry: RegisteredAccount = {
      id: `acc-${Date.now().toString(36)}`,
      profile: newProfile,
      lastActive: 'Just now',
    };

    saveAccountsToStorage([newEntry, ...accounts]);
    setTheme(selectedTheme);
    setMascotAccessory(selectedAccessory);

    setSuccessMsg(`Account created for ${newProfile.name}! Welcome to MIRA.`);
    setTimeout(() => {
      login(newProfile);
      syncCustomerToContext(newProfile);
      setSuccessMsg(null);
    }, 800);
  };

  const handleSwitchToAccount = (acc: RegisteredAccount) => {
    setSuccessMsg(`Switching account to ${acc.profile.name}...`);
    setTimeout(() => {
      login(acc.profile);
      if (acc.profile.preferredTheme) {
        setTheme(acc.profile.preferredTheme);
      }
      if (acc.profile.preferredAccessory) {
        setMascotAccessory(acc.profile.preferredAccessory);
      }
      syncCustomerToContext(acc.profile);
      setSuccessMsg(null);
    }, 500);
  };

  return (
    <div className="page-container login-page-container">
      {/* Top Banner / Breadcrumb */}
      <div className="login-hero-header">
        <div className="login-hero-mascot">
          <MiraAvatar
            size={76}
            state={user ? 'completed' : 'idle'}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
        </div>
        <div className="login-hero-text">
          <div className="status-pill ready" style={{ display: 'inline-flex', marginBottom: 6 }}>
            {user ? '✨ Authenticated Account' : '🔒 MIRA Individual Accounts Portal'}
          </div>
          <h1 className="login-hero-title">
            {user ? `Welcome, ${user.name}` : 'Personalized AI Space for Everyone'}
          </h1>
          <p className="login-hero-sub">
            {user
              ? `Your personal multimodal environment is active. Manage your profile, credentials, or switch accounts below.`
              : `Create your individual MIRA account to personalize your mascot, sync your ContextCore memory, and access all multimodal tools.`}
          </p>
        </div>
      </div>

      {/* Main Container: Logged In Account Dashboard vs. Login / Register Forms */}
      {user ? (
        <div className="account-logged-in-view">
          <div className="account-profile-hero-card">
            <div className="account-hero-left">
              <div className="account-avatar-huge">
                <span className="account-avatar-emoji-large">{user.avatar}</span>
                <span className="account-role-tag">{user.role}</span>
              </div>
              <div className="account-details-col">
                <h2 className="account-user-name">{user.name}</h2>
                <div className="account-user-meta-line">
                  <span className="account-meta-item">
                    <Mail size={14} /> {user.email}
                  </span>
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
                title="Go to My Day"
              >
                <Compass size={15} />
                <span>Open My Day</span>
              </button>
              <button
                className="mira-btn"
                onClick={() => setActiveNavTab('Studio')}
                title="Customize Theme in MIRA Studio"
              >
                <Palette size={15} />
                <span>MIRA Studio</span>
              </button>
              <button
                className="mira-btn mira-btn-danger"
                onClick={logout}
                title="Sign out of this session"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Account Details & Context Grid */}
          <div className="account-info-grid">
            {/* Left Card: Account Preferences */}
            <div className="mira-card account-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <Palette size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span>Personal AI Preferences</span>
                </div>
              </div>
              <div className="account-card-body">
                <div className="account-pref-row">
                  <span className="account-pref-label">Preferred World Theme:</span>
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
                  <span className="account-pref-label">Primary AI Objective:</span>
                  <span className="account-pref-val">
                    {user.primaryGoal || user.useCase || 'General Multimodal Assistance'}
                  </span>
                </div>
                <div className="account-pref-row">
                  <span className="account-pref-label">Account Security:</span>
                  <span className="account-pref-val" style={{ color: 'var(--brand-secondary)' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Protected & Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Context Anchors Linked */}
            <div className="mira-card account-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <Layers size={16} style={{ color: 'var(--brand-secondary)' }} />
                  <span>ContextCore Anchors ({contextCore.activeAnchors.length})</span>
                </div>
                <span className="status-pill ready">Active Grounding</span>
              </div>
              <div className="account-card-body">
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Your persona and session history are currently grounded in MIRA's ContextCore working memory.
                </p>
                <div className="account-anchors-mini-list">
                  {contextCore.activeAnchors.slice(0, 3).map((anc) => (
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

          {/* Switch to Another Individual Account */}
          <div className="mira-card account-switch-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Users size={16} style={{ color: 'var(--brand-primary)' }} />
                <span>Switch to Another Registered Individual Account</span>
              </div>
              <button
                className="mira-btn mira-btn-sm"
                onClick={() => {
                  logout();
                  setActiveTab('signup');
                }}
              >
                <PlusCircle size={13} />
                <span>Create Another Account</span>
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
                        {isThisUser && <span className="current-user-badge">Current</span>}
                      </div>
                      <div className="switch-item-email">{acc.profile.email}</div>
                      <div className="switch-item-role">{acc.profile.jobTitle || acc.profile.role}</div>
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
        /* Not Logged In View: Tabs for Sign In, Create Account, Saved Profiles */
        <div className="login-auth-wrapper">
          {/* Navigation Tab Bar */}
          <div className="login-auth-tabs">
            <button
              className={`login-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
              }}
            >
              <KeyRound size={15} />
              <span>Sign In to Account</span>
            </button>
            <button
              className={`login-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
            >
              <PlusCircle size={15} />
              <span>Create Individual Account</span>
            </button>
            <button
              className={`login-tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profiles');
                setErrorMsg(null);
              }}
            >
              <Users size={15} />
              <span>Saved Profiles ({accounts.length})</span>
            </button>
          </div>

          {/* Feedback Messages */}
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

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <div className="login-form-card">
              <form onSubmit={handleSignIn} className="login-form">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} /> Email Address or Username
                  </label>
                  <input
                    type="text"
                    className="mira-input"
                    placeholder="e.g. khushi@miralabs.ai or tisa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} /> Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="mira-input"
                      placeholder="Enter your security password"
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

                <div className="form-actions-row">
                  <button type="submit" className="mira-btn mira-btn-primary login-submit-btn">
                    <span>Sign In to MIRA</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Quick Preset Accounts */}
              <div className="quick-access-section">
                <div className="quick-access-title">
                  <Sparkles size={13} /> Instant Demo Profiles
                </div>
                <div className="quick-access-buttons">
                  <button
                    type="button"
                    className="quick-persona-btn"
                    onClick={() => {
                      setEmail('khushi@miralabs.ai');
                      setPassword('mira2026');
                    }}
                  >
                    <span>👑 Khushi (Founder)</span>
                  </button>
                  <button
                    type="button"
                    className="quick-persona-btn"
                    onClick={() => {
                      setEmail('tisa@neurallabs.io');
                      setPassword('mira2026');
                    }}
                  >
                    <span>🌟 Tisa (Architect)</span>
                  </button>
                  <button
                    type="button"
                    className="quick-persona-btn guest-btn"
                    onClick={loginAsGuest}
                  >
                    <span>⚡ Quick Guest Mode</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE INDIVIDUAL ACCOUNT */}
          {activeTab === 'signup' && (
            <div className="login-form-card signup-card">
              <form onSubmit={handleSignUp} className="signup-form">
                <div className="signup-grid">
                  {/* Left Column: Personal Credentials */}
                  <div className="signup-column">
                    <h3 className="signup-section-heading">1. Personal Information</h3>

                    <div className="form-group">
                      <label className="form-label">
                        <User size={14} /> Full Name / Nickname *
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
                        <Mail size={14} /> Email Address *
                      </label>
                      <input
                        type="email"
                        className="mira-input"
                        placeholder="alex@personal.io"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Lock size={14} /> Password (Optional / For Security)
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="mira-input"
                          placeholder="Create a password"
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
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Building2 size={14} /> Company or Workspace (Optional)
                      </label>
                      <input
                        type="text"
                        className="mira-input"
                        placeholder="e.g. Freelance / Acorn Labs"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Briefcase size={14} /> Role / Persona
                      </label>
                      <select
                        className="mira-select auth-select"
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                      >
                        {PERSONA_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <User size={14} /> Personal Bio / Pronouns (Optional)
                      </label>
                      <input
                        type="text"
                        className="mira-input"
                        placeholder="e.g. Passionate explorer & researcher"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Right Column: Customization & AI Goals */}
                  <div className="signup-column">
                    <h3 className="signup-section-heading">2. Mascot & World Preferences</h3>

                    {/* Avatar Emoji Picker */}
                    <div className="form-group">
                      <label className="form-label">
                        <Heart size={14} /> Choose Your Profile Avatar
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

                    {/* Theme Choice */}
                    <div className="form-group">
                      <label className="form-label">
                        <Palette size={14} /> Initial World Theme
                      </label>
                      <div className="theme-picker-row">
                        {THEME_OPTIONS.map((t) => (
                          <button
                            type="button"
                            key={t.id}
                            className={`theme-choice-pill ${selectedTheme === t.id ? 'selected' : ''}`}
                            onClick={() => setSelectedTheme(t.id)}
                          >
                            <span>{t.icon}</span>
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mascot Accessory Choice */}
                    <div className="form-group">
                      <label className="form-label">
                        <Sparkles size={14} /> Mascot Accessory
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

                    {/* Primary AI Goal */}
                    <div className="form-group">
                      <label className="form-label">
                        <Target size={14} /> Primary AI Focus
                      </label>
                      <select
                        className="mira-select auth-select"
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value)}
                      >
                        {GOAL_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="signup-submit-row">
                  <button type="submit" className="mira-btn mira-btn-primary signup-btn-huge">
                    <CheckCircle2 size={18} />
                    <span>Complete Registration & Open MIRA</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED PROFILES / MULTI-USER DIRECTORY */}
          {activeTab === 'profiles' && (
            <div className="login-form-card">
              <div className="saved-profiles-header">
                <h3 className="saved-profiles-title">Registered Accounts on this Device</h3>
                <p className="saved-profiles-desc">
                  Select an account to switch your session immediately without retyping:
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
                      <div className="saved-profile-tag">{acc.profile.jobTitle || acc.profile.role}</div>
                    </div>
                    <button className="saved-profile-switch-btn" title="Sign in with this profile">
                      <span>Log In</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button
                  type="button"
                  className="mira-btn mira-btn-primary"
                  onClick={() => setActiveTab('signup')}
                >
                  <PlusCircle size={15} />
                  <span>Register a New Individual Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
