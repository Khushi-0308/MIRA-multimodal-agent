export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  useCase?: string;
  teamSize?: string;
  avatar: string;
  role: 'member' | 'guest' | 'admin' | 'enterprise';
  joinedAt: string;
}

