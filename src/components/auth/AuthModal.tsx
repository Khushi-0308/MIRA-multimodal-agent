import React, { useState } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import { UserProfile } from '../../types/auth';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  Briefcase,
  Phone,
  Layers,
  Target,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const INDUSTRY_OPTIONS = [
  'AI & Software Engineering',
  'Healthcare & Biotechnology',
  'Finance & FinTech',
  'Creative Design & Media',
  'Education & Research',
  'E-Commerce & Retail',
  'Consulting & Professional Services',
  'Other',
];

const USE_CASE_OPTIONS = [
  'Multimodal Vision & Voice Assistance',
  'Document Understanding & Knowledge RAG',
  'Daily Task Automation & Productivity',
  'Creative AI Companion & Brainstorming',
  'Enterprise Workflow Safety Gates',
];

const TEAM_SIZE_OPTIONS = ['1 (Individual / Freelancer)', '2 - 10 (Startup)', '11 - 50 (Growth Team)', '50+ (Enterprise)'];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    login,
    logout,
    loginAsGuest,
    theme,
    mascotAccessory,
    addAnchor,
  } = useMira();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<1 | 2>(1); // 2-step customer onboarding

  // Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [useCase, setUseCase] = useState(USE_CASE_OPTIONS[0]);
  const [teamSize, setTeamSize] = useState(TEAM_SIZE_OPTIONS[1]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isAuthModalOpen) {
    return null;
  }

  const getMascotReactionState = () => {
    if (isSuccess) return 'completed';
    if (focusedField === 'password' || focusedField === 'confirmPassword') return 'waiting for approval'; // Shy / private
    if (focusedField === 'company' || focusedField === 'jobTitle' || focusedField === 'useCase') return 'thinking'; // Curious reasoning
    if (focusedField) return 'observing';
    return 'idle';
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please provide your full name and work email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('Please choose a password with at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    setStep(2);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'signin') {
      const cleanEmail = email.trim();
      const cleanPass = password.trim();

      if (!cleanEmail || !cleanPass) {
        setErrorMsg('Please enter your email and password.');
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        const profile: UserProfile = {
          id: `user-${Date.now().toString(36)}`,
          name: cleanEmail.split('@')[0] || 'Customer',
          email: cleanEmail,
          company: company.trim() || 'Personal Workspace',
          jobTitle: jobTitle.trim() || 'Member',
          industry: industry,
          useCase: useCase,
          avatar: '🌸',
          role: 'member',
          joinedAt: 'Today',
        };
        login(profile);
        syncCustomerToContext(profile);
        setIsSuccess(false);
      }, 600);
      return;
    }

    // Sign Up Finalization
    if (!company.trim()) {
      setErrorMsg('Please enter your company or workspace name.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      const profile: UserProfile = {
        id: `customer-${Date.now().toString(36)}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim(),
        jobTitle: jobTitle.trim() || 'Leader',
        industry,
        useCase,
        teamSize,
        avatar: '🌟',
        role: 'enterprise',
        joinedAt: 'Today',
      };
      login(profile);
      syncCustomerToContext(profile);
      setIsSuccess(false);
      setStep(1);
    }, 600);
  };

  const syncCustomerToContext = (p: UserProfile) => {
    addAnchor({
      modality: 'session',
      title: `Customer Profile: ${p.name} (${p.company || 'Personal'})`,
      source: 'Customer Onboarding',
      summary: `User is ${p.name}, working as ${p.jobTitle || 'Member'} at ${p.company || 'Personal Workspace'} in ${p.industry || 'Tech'}. Primary goal: ${p.useCase || 'General assistance'}.`,
      tokenWeight: 220,
      isPinned: true,
    });
  };

  const handleQuickDemo = (demoType: 'khushi' | 'tisa' | 'guest') => {
    setIsSuccess(true);
    setTimeout(() => {
      let demoProfile: UserProfile;
      if (demoType === 'khushi') {
        demoProfile = {
          id: 'cust-khushi',
          name: 'Khushi',
          email: 'khushi@miralabs.ai',
          phone: '+1 (555) 234-8901',
          company: 'MIRA AI Labs',
          jobTitle: 'Founder & CEO',
          industry: 'AI & Software Engineering',
          useCase: 'Multimodal Vision & Voice Assistance',
          teamSize: '11 - 50 (Growth Team)',
          avatar: '🌸',
          role: 'enterprise',
          joinedAt: 'Founding Member',
        };
      } else if (demoType === 'tisa') {
        demoProfile = {
          id: 'cust-tisa',
          name: 'Tisa',
          email: 'tisa@novadynamics.io',
          phone: '+1 (555) 890-1234',
          company: 'Nova Dynamics',
          jobTitle: 'Principal AI Architect',
          industry: 'AI & Software Engineering',
          useCase: 'Document Understanding & Knowledge RAG',
          teamSize: '50+ (Enterprise)',
          avatar: '⚡',
          role: 'enterprise',
          joinedAt: 'Today',
        };
      } else {
        loginAsGuest();
        setIsSuccess(false);
        return;
      }
      login(demoProfile);
      syncCustomerToContext(demoProfile);
      setIsSuccess(false);
    }, 450);
  };

  return (
    <div
      className="modal-backdrop auth-modal-backdrop"
      onClick={() => setIsAuthModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mira-modal-card auth-modal-card customer-auth-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={() => setIsAuthModalOpen(false)}
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Top Mascot Hero */}
        <div className="auth-mascot-hero">
          <div className="auth-mascot-halo" />
          <MiraAvatar
            size={88}
            state={getMascotReactionState()}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
          <div className="auth-speech-bubble">
            {isSuccess
              ? 'Setting up your personalized MIRA workspace... 🎉'
              : focusedField === 'password' || focusedField === 'confirmPassword'
              ? "Your password is safe and encrypted locally! 🙈"
              : focusedField === 'company'
              ? "Nice! What does your organization build? 🏢"
              : focusedField === 'useCase'
              ? "I'll optimize my perception for your workflow! ✨"
              : mode === 'signup' && step === 2
              ? "Almost done! Tell me about your team and goals. 🚀"
              : 'Sign in or register your workspace to get started! 💖'}
          </div>
        </div>

        {user ? (
          /* Logged In Customer Profile View */
          <div className="auth-logged-in-view">
            <div className="customer-profile-hero-card">
              <div className="customer-avatar-box">{user.avatar}</div>
              <div className="customer-primary-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h3 className="customer-name">{user.name}</h3>
                  <span className="customer-tier-badge">{user.role.toUpperCase()}</span>
                </div>
                <p className="customer-email">{user.email}</p>
                {user.phone && <p className="customer-phone">{user.phone}</p>}
              </div>
            </div>

            {/* Customer Organization Details Grid */}
            <div className="customer-details-grid">
              <div className="customer-detail-tile">
                <span className="tile-label">
                  <Building2 size={12} /> Company / Workspace
                </span>
                <span className="tile-value">{user.company || 'Personal Space'}</span>
              </div>

              <div className="customer-detail-tile">
                <span className="tile-label">
                  <Briefcase size={12} /> Job Title / Role
                </span>
                <span className="tile-value">{user.jobTitle || 'Team Member'}</span>
              </div>

              <div className="customer-detail-tile">
                <span className="tile-label">
                  <Layers size={12} /> Industry Domain
                </span>
                <span className="tile-value">{user.industry || 'Technology'}</span>
              </div>

              <div className="customer-detail-tile">
                <span className="tile-label">
                  <Target size={12} /> Primary Goal
                </span>
                <span className="tile-value">{user.useCase || 'Multimodal Assistance'}</span>
              </div>
            </div>

            <div className="auth-session-info">
              <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>Customer Context Grounded in ContextCore Working Memory</span>
            </div>

            <div className="auth-action-buttons">
              <button
                className="mira-btn mira-btn-secondary"
                onClick={() => setIsAuthModalOpen(false)}
              >
                <span>Continue to Dashboard</span>
              </button>
              <button
                className="mira-btn mira-btn-danger"
                onClick={logout}
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Customer Onboarding Registration */
          <>
            {/* Mode Switcher Tabs */}
            <div className="auth-mode-tabs">
              <button
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin');
                  setStep(1);
                  setErrorMsg(null);
                }}
              >
                Customer Sign In
              </button>
              <button
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signup');
                  setStep(1);
                  setErrorMsg(null);
                }}
              >
                Register Workspace
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode A: Sign In Form */}
            {mode === 'signin' && (
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                <div className="auth-field-group">
                  <label className="auth-label">Work Email / Customer ID</label>
                  <div className="auth-input-wrapper">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mira-btn mira-btn-primary auth-submit-btn"
                  disabled={isSuccess}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to MIRA Workspace</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode B: Customer Onboarding Step 1 (Personal & Auth Credentials) */}
            {mode === 'signup' && step === 1 && (
              <form className="auth-form" onSubmit={handleNextStep}>
                <div className="signup-step-indicator">
                  <span className="step-badge active">Step 1: Customer Details</span>
                  <span className="step-badge">Step 2: Workspace Profile</span>
                </div>

                <div className="auth-two-col">
                  <div className="auth-field-group">
                    <label className="auth-label">Full Name</label>
                    <div className="auth-input-wrapper">
                      <User size={15} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. Khushi Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Phone Number (Optional)</label>
                    <div className="auth-input-wrapper">
                      <Phone size={15} className="auth-input-icon" />
                      <input
                        type="tel"
                        className="auth-input"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Work Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="khushi@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-two-col">
                  <div className="auth-field-group">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrapper">
                      <Lock size={15} className="auth-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Min 4 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrapper">
                      <Lock size={15} className="auth-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="auth-input"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="mira-btn mira-btn-primary auth-submit-btn">
                  <span>Continue to Workspace Details</span>
                  <ChevronRight size={15} />
                </button>
              </form>
            )}

            {/* Mode B: Customer Onboarding Step 2 (Organization, Industry & Goal) */}
            {mode === 'signup' && step === 2 && (
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                <div className="signup-step-indicator">
                  <span className="step-badge completed">✓ Step 1: Customer Details</span>
                  <span className="step-badge active">Step 2: Workspace Profile</span>
                </div>

                <div className="auth-two-col">
                  <div className="auth-field-group">
                    <label className="auth-label">Company / Workspace Name</label>
                    <div className="auth-input-wrapper">
                      <Building2 size={15} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. MIRA AI Labs"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onFocus={() => setFocusedField('company')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Your Job Title / Role</label>
                    <div className="auth-input-wrapper">
                      <Briefcase size={15} className="auth-input-icon" />
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="e.g. Product Lead, Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        onFocus={() => setFocusedField('jobTitle')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-two-col">
                  <div className="auth-field-group">
                    <label className="auth-label">Industry Domain</label>
                    <select
                      className="auth-select"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      onFocus={() => setFocusedField('industry')}
                      onBlur={() => setFocusedField(null)}
                    >
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-label">Team Size</label>
                    <select
                      className="auth-select"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                    >
                      {TEAM_SIZE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-label">Primary AI Goal & Workflow</label>
                  <select
                    className="auth-select"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    onFocus={() => setFocusedField('useCase')}
                    onBlur={() => setFocusedField(null)}
                  >
                    {USE_CASE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-button-row">
                  <button
                    type="button"
                    className="mira-btn mira-btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft size={15} />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="mira-btn mira-btn-primary auth-submit-btn"
                    style={{ flex: 1 }}
                    disabled={isSuccess}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Onboarding</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Customer Profiles */}
            <div className="auth-divider">
              <span>OR INSTANT CUSTOMER DEMO PRESETS</span>
            </div>

            <div className="auth-demo-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => handleQuickDemo('khushi')}
                title="Login as Khushi (Founder @ MIRA Labs)"
              >
                <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} />
                <span>Khushi (CEO)</span>
              </button>

              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => handleQuickDemo('tisa')}
                title="Login as Tisa (AI Architect @ Nova Dynamics)"
              >
                <Zap size={13} style={{ color: '#8b5cf6' }} />
                <span>Tisa (Architect)</span>
              </button>

              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => handleQuickDemo('guest')}
                title="Explore as Guest"
              >
                <span>Guest Mode</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
