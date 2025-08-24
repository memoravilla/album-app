export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
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
  inviterUid: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  inviteeUid?: string; // Set when user is found
  status: 'pending' | 'accepted' | 'declined' | 'expired';
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
