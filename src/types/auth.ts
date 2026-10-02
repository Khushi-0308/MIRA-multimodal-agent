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
  preferredTheme?: 'liquid-rose' | 'midnight' | 'glitter' | 'bold' | 'edge';
  preferredAccessory?: 'bunny-ears' | 'cyber-headphones' | 'star-clip' | 'hologram-visor' | 'none';
  bio?: string;
  primaryGoal?: string;
  savedPassword?: string;
}

export interface RegisteredAccount {
  id: string;
  profile: UserProfile;
  lastActive: string;
}


