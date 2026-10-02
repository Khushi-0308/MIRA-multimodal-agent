import React, { useState } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
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
} from 'lucide-react';

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
  } = useMira();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isAuthModalOpen) {
    return null;
  }

  const getMascotReactionState = () => {
    if (isSuccess) return 'completed';
    if (focusedField === 'password') return 'waiting for approval'; // Shy / eyes guarded!
    if (focusedField === 'email' || focusedField === 'name') return 'observing'; // Curious & focused
    return 'idle';
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    const cleanName = name.trim() || (cleanEmail.split('@')[0] || 'Member');

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    if (cleanPass.length < 4) {
      setErrorMsg('Password should be at least 4 characters.');
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      login({
        id: `user-${Date.now().toString(36)}`,
        name: cleanName,
        email: cleanEmail,
        avatar: mode === 'signup' ? '🌟' : '🌸',
        role: 'member',
        joinedAt: 'Today',
      });
      setIsSuccess(false);
      setName('');
      setEmail('');
      setPassword('');
    }, 600);
  };

  const handleQuickDemo = (demoType: 'khushi' | 'guest') => {
    setIsSuccess(true);
    setTimeout(() => {
      if (demoType === 'khushi') {
        login({
          id: 'user-khushi',
          name: 'Khushi',
          email: 'khushi@mira.ai',
          avatar: '🌸',
          role: 'member',
          joinedAt: 'Today',
        });
      } else {
        loginAsGuest();
      }
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
        className="mira-modal-card auth-modal-card"
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
              ? 'Welcome! Synchronizing your workspace... 🎉'
              : focusedField === 'password'
              ? "I'm not looking, your password is safe! 🙈"
              : focusedField === 'email' || focusedField === 'name'
              ? "Tell me who you are! ✨"
              : 'Sign in to sync your MIRA Day & World! 💖'}
          </div>
        </div>

        {user ? (
          /* Logged In State View */
          <div className="auth-logged-in-view">
            <div className="auth-profile-card">
              <div className="auth-profile-avatar">{user.avatar}</div>
              <div className="auth-profile-info">
                <h3 className="auth-profile-name">{user.name}</h3>
                <p className="auth-profile-email">{user.email}</p>
                <span className="auth-profile-role font-mono">
                  {user.role.toUpperCase()} • Joined {user.joinedAt}
                </span>
              </div>
            </div>

            <div className="auth-session-info">
              <ShieldCheck size={16} style={{ color: '#10b981' }} />
              <span>Active ContextCore Session Grounded & Secure</span>
            </div>

            <div className="auth-action-buttons">
              <button
                className="mira-btn mira-btn-secondary"
                onClick={() => setIsAuthModalOpen(false)}
              >
                <span>Continue Exploring</span>
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
          /* Sign In / Sign Up Form */
          <>
            {/* Mode Switcher Tabs */}
            <div className="auth-mode-tabs">
              <button
                className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="auth-error-banner" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {mode === 'signup' && (
                <div className="auth-field-group">
                  <label className="auth-label">Your Name</label>
                  <div className="auth-input-wrapper">
                    <User size={15} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Khushi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={15} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@domain.com"
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
                    <span>{mode === 'signin' ? 'Sign In to MIRA' : 'Create My Account'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Options */}
            <div className="auth-divider">
              <span>OR INSTANT DEMO LOGIN</span>
            </div>

            <div className="auth-demo-grid">
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => handleQuickDemo('khushi')}
              >
                <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} />
                <span>Demo User (Khushi)</span>
              </button>
              <button
                type="button"
                className="auth-demo-pill"
                onClick={() => handleQuickDemo('guest')}
              >
                <Zap size={13} style={{ color: '#0284c7' }} />
                <span>Instant Guest Mode</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
