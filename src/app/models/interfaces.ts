export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  planType: 'basic' | 'pro' | 'premium';
  planExpiresAt?: Date; // For pro/premium subscriptions
}

export interface PlanFeatures {
  name: string;
  displayName: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  maxAlbums: number;
  maxPhotosPerAlbum: number;
  maxStorageGB: number;
  hasAdvancedSharing: boolean;
  hasCustomThemes: boolean;
  hasPrioritySupport: boolean;
  hasAdvancedAnalytics: boolean;
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  expirationDate?: Date;
  members: string[]; // User UIDs
  admins: string[]; // User UIDs
  coverPhotoUrl?: string;
}

export interface Photo {
  id: string;
  albumId: string;
  fileName: string;
  downloadURL: string;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt?: Date;
  caption?: string;
  thumbnailUrl?: string;
}

export interface AlbumMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface AlbumInvitation {
  id: string;
  albumId: string;
  albumName: string;
  inviterEmail: string;
  inviterUid: string;
  inviterName?: string;
  inviteeEmail: string;
  inviteeUid?: string; // Set when user accepts invitation
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'album_invitation' | 'album_member_added' | 'photo_uploaded';
  title: string;
  message: string;
  data?: any; // Additional data (e.g., album ID, invitation ID)
  read: boolean;
  createdAt: Date;
}

export interface CreateAlbumData {
  name: string;
  description?: string;
  expirationDate?: Date;
}

export interface UpdateUserProfile {
  displayName?: string;
  bio?: string;
  photoURL?: string;
}

export interface SongSuggestion {
  id: string;
  albumId: string;
  title: string;
  artist: string;
  suggestedBy: string; // User UID
  suggestedAt: Date;
  votes: string[]; // Array of user UIDs who voted for this song
  spotifyUrl?: string;
  youtubeUrl?: string;
  description?: string; // Why this song fits the album
}
