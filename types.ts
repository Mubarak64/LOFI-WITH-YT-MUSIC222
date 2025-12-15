export interface Song {
  id: string;
  title: string;
  artist?: string;
  coverUrl: string;
  audioUrl: string;
  createdAt: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  active: boolean;
  order: number;
}

export interface AdConfig {
  id: string;
  content: string; // HTML string or Image URL
  type: 'html' | 'image';
  placement: 'top' | 'bottom' | 'feed';
  active: boolean;
}

export interface ExternalLinks {
  youtube: string;
  telegram: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
}

export const ADMIN_EMAIL = "mubarakkhan6430@gmail.com";