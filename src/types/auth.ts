export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  teamSize?: string;
  avatar: string;
  role: 'member' | 'guest' | 'admin' | 'enterprise';
  joinedAt: string;
  preferredTheme?: 'liquid-rose' | 'midnight' | 'glitter' | 'bold' | 'edge';
  preferredAccessory?: 'bunny-ears' | 'cyber-headphones' | 'star-clip' | 'hologram-visor' | 'none';
  aiTone?: 'friendly' | 'concise' | 'technical' | 'creative';
  workingHours?: string;
  bio?: string;
  primaryGoal?: string;
  useCase?: string;
  savedPassword?: string;
}

export interface RegisteredAccount {
  id: string;
  profile: UserProfile;
  lastActive: string;
}
