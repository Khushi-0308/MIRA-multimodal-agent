/**
 * Shared session helper for cross-tab and cross-page synchronization
 * Ensures ChatPage, DocumentsPage, VisionPage, and MyDayPage share the same session in MIRA backend.
 */
export const SHARED_SESSION_ID = 'mira-session-companion';

export function getSharedSessionId(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const existing = window.localStorage.getItem('mira_shared_session_id');
    if (existing && existing.trim()) {
      return existing;
    }
    window.localStorage.setItem('mira_shared_session_id', SHARED_SESSION_ID);
  }
  return SHARED_SESSION_ID;
}
