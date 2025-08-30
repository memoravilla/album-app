import { Injectable, inject, signal } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from '@angular/fire/storage';
import { Album, Photo, CreateAlbumData, AlbumMember } from '../models/interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private authService = inject(AuthService);

  // Signals
  userAlbums = signal<Album[]>([]);
  selectedAlbum = signal<Album | null>(null);
  albumPhotos = signal<Photo[]>([]);
  isLoading = signal(false);

  async createAlbum(albumData: CreateAlbumData): Promise<string | null> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.log('No current user, cannot create album');
      return null;
    }

    try {
      this.isLoading.set(true);
      console.log('Creating album:', albumData.name, 'for user:', currentUser.uid);
      
      const album: Omit<Album, 'id'> = {
        name: albumData.name,
        description: albumData.description,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        expirationDate: albumData.expirationDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year
        members: [currentUser.uid],
        admins: [currentUser.uid]
      };

      console.log('Album data to create:', album);

      const albumsCollection = collection(this.firestore, 'albums');
      const docRef = await addDoc(albumsCollection, album);
      
      console.log('Album created with ID:', docRef.id);
      
      await this.loadUserAlbums();
      return docRef.id;
    } catch (error) {
      console.error('Create album error:', error);
      return null;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadUserAlbums(): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.log('No current user, cannot load albums');
      return;
    }

    console.log('Loading albums for user:', currentUser.uid);

    try {
      const albumsCollection = collection(this.firestore, 'albums');
      const q = query(
        albumsCollection, 
        where('members', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing Firestore query for albums...');
      const querySnapshot = await getDocs(q);
      const albums: Album[] = [];
      
      console.log('Query returned', querySnapshot.size, 'albums');
      
      querySnapshot.forEach((doc) => {
        const albumData = { id: doc.id, ...doc.data() } as Album;
        console.log('Found album:', albumData.name, 'Members:', albumData.members);
        albums.push(albumData);
      });
      
      console.log('Loading thumbnails for albums...');
      const albumsWithThumbnails = await this.loadAlbumsWithThumbnails(albums);
      
      console.log('Setting userAlbums signal with', albumsWithThumbnails.length, 'albums with thumbnails');
      this.userAlbums.set(albumsWithThumbnails);
    } catch (error) {
      console.error('Load albums error:', error);
      // Set empty array to clear any previous data
      this.userAlbums.set([]);
    }
  }

  async loadAlbumById(albumId: string): Promise<boolean> {
    try {
      const albumRef = doc(this.firestore, `albums/${albumId}`);
      const albumSnap = await getDoc(albumRef);
      
      if (albumSnap.exists()) {
        const album = { id: albumSnap.id, ...albumSnap.data() } as Album;
        this.selectedAlbum.set(album);
        await this.loadAlbumPhotos(albumId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load album error:', error);
      return false;
    }
  }

  async loadAlbumPhotos(albumId: string): Promise<void> {
    try {
      const photosCollection = collection(this.firestore, 'photos');
      const q = query(
        photosCollection,
        where('albumId', '==', albumId),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const photos: Photo[] = [];
      
      querySnapshot.forEach((doc) => {
        photos.push({ id: doc.id, ...doc.data() } as Photo);
      });
      
      this.albumPhotos.set(photos);
    } catch (error) {
      console.error('Load photos error:', error);
    }
  }

  async uploadPhoto(albumId: string, file: File, caption?: string): Promise<boolean> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    try {
      this.isLoading.set(true);
      
      // Check if this is the first photo in the album
      const currentPhotos = await this.getAlbumPhotoCount(albumId);
      const isFirstPhoto = currentPhotos === 0;
      
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `albums/${albumId}/${fileName}`;
      
      // Upload file to Storage
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save photo metadata to Firestore
      const photo: Omit<Photo, 'id'> = {
        albumId,
        fileName,
        downloadURL,
        uploadedBy: currentUser.uid,
        uploadedAt: new Date(),
        caption: caption || ''
      };
      
      const photosCollection = collection(this.firestore, 'photos');
      await addDoc(photosCollection, photo);
      
      // If this is the first photo, set it as the album's cover photo
      if (isFirstPhoto) {
        await this.updateAlbum(albumId, { coverPhotoUrl: downloadURL });
      }
      
      // Reload photos
      await this.loadAlbumPhotos(albumId);
      
      return true;
    } catch (error) {
      console.error('Upload photo error:', error);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      // Get photo data first
      const photoRef = doc(this.firestore, `photos/${photoId}`);
      const photoSnap = await getDoc(photoRef);
      
      if (!photoSnap.exists()) return false;
      
      const photoData = photoSnap.data() as Photo;
      
      // Delete from Storage
      const storageRef = ref(this.storage, `albums/${photoData.albumId}/${photoData.fileName}`);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(photoRef);
      
      // Reload photos
      await this.loadAlbumPhotos(photoData.albumId);
      
      return true;
    } catch (error) {
      console.error('Delete photo error:', error);
      return false;
    }
  }

  async updatePhoto(photoId: string, updates: Partial<Photo>): Promise<boolean> {
    try {
      console.log('📝 Updating photo:', photoId, updates);
      
      // Update the photo document in Firestore
      const photoRef = doc(this.firestore, `photos/${photoId}`);
      await updateDoc(photoRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      // Get the updated photo to reload the album photos
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        const photoData = photoSnap.data() as Photo;
        await this.loadAlbumPhotos(photoData.albumId);
      }
      
      console.log('✅ Photo updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Update photo error:', error);
      return false;
    }
  }

  async updateAlbum(albumId: string, updates: Partial<Album>): Promise<boolean> {
    try {
      const albumRef = doc(this.firestore, `albums/${albumId}`);
      await updateDoc(albumRef, updates);
      
      // Update selected album if it's the same
      const selectedAlbum = this.selectedAlbum();
      if (selectedAlbum && selectedAlbum.id === albumId) {
        this.selectedAlbum.set({ ...selectedAlbum, ...updates });
      }
      
      await this.loadUserAlbums();
      return true;
    } catch (error) {
      console.error('Update album error:', error);
      return false;
    }
  }

  async deleteAlbum(albumId: string): Promise<boolean> {
    try {
      // Delete all photos in the album
      const photos = this.albumPhotos();
      for (const photo of photos) {
        await this.deletePhoto(photo.id);
      }
      
      // Delete album document
      const albumRef = doc(this.firestore, `albums/${albumId}`);
      await deleteDoc(albumRef);
      
      await this.loadUserAlbums();
      return true;
    } catch (error) {
      console.error('Delete album error:', error);
      return false;
    }
  }

  // Member Management Methods
  async getAlbumMembers(albumId: string): Promise<AlbumMember[]> {
    try {
      const albumRef = doc(this.firestore, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        console.error('❌ Album not found');
        return [];
      }
      
      const albumData = albumDoc.data() as Album;
      const allMemberIds = [...(albumData.members || []), ...(albumData.admins || [])];
      const uniqueMemberIds = [...new Set(allMemberIds)];
      
      if (uniqueMemberIds.length === 0) {
        return [];
      }

      // Fetch user details for all members
      const usersRef = collection(this.firestore, 'users');
      const members: AlbumMember[] = [];

      for (const uid of uniqueMemberIds) {
        try {
          const userDoc = await getDoc(doc(usersRef, uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            members.push({
              uid,
              email: userData['email'],
              displayName: userData['displayName'],
              photoURL: userData['photoURL'],
              role: albumData.admins.includes(uid) ? 'admin' : 'member',
              joinedAt: userData['createdAt']?.toDate() || new Date()
            });
          }
        } catch (error) {
          console.warn('⚠️ Error fetching user data for UID:', uid, error);
        }
      }

      console.log('✅ Fetched album members:', members.length);
      return members;
    } catch (error) {
      console.error('❌ Error fetching album members:', error);
      return [];
    }
  }

  async addMemberToAlbum(albumId: string, userUid: string): Promise<boolean> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return false;
      }

      // Check if current user is admin of the album
      const isAdmin = await this.isUserAlbumAdmin(albumId, currentUser.uid);
      if (!isAdmin) {
        console.error('❌ User is not an admin of this album');
        return false;
      }

      const albumRef = doc(this.firestore, 'albums', albumId);
      await updateDoc(albumRef, {
        members: arrayUnion(userUid)
      });

      console.log('✅ Member added to album');
      return true;
    } catch (error) {
      console.error('❌ Error adding member to album:', error);
      return false;
    }
  }

  async removeMemberFromAlbum(albumId: string, userUid: string): Promise<boolean> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return false;
      }

      // Check if current user is admin of the album
      const isAdmin = await this.isUserAlbumAdmin(albumId, currentUser.uid);
      if (!isAdmin) {
        console.error('❌ User is not an admin of this album');
        return false;
      }

      const albumRef = doc(this.firestore, 'albums', albumId);
      await updateDoc(albumRef, {
        members: arrayRemove(userUid),
        admins: arrayRemove(userUid) // Also remove from admins if they were one
      });

      console.log('✅ Member removed from album');
      return true;
    } catch (error) {
      console.error('❌ Error removing member from album:', error);
      return false;
    }
  }

  async promoteToAdmin(albumId: string, userUid: string): Promise<boolean> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return false;
      }

      // Check if current user is admin of the album
      const isAdmin = await this.isUserAlbumAdmin(albumId, currentUser.uid);
      if (!isAdmin) {
        console.error('❌ User is not an admin of this album');
        return false;
      }

      const albumRef = doc(this.firestore, 'albums', albumId);
      await updateDoc(albumRef, {
        admins: arrayUnion(userUid),
        members: arrayRemove(userUid) // Remove from members since they're now admin
      });

      console.log('✅ User promoted to admin');
      return true;
    } catch (error) {
      console.error('❌ Error promoting user to admin:', error);
      return false;
    }
  }

  async isUserAlbumAdmin(albumId: string, userUid: string): Promise<boolean> {
    try {
      const albumRef = doc(this.firestore, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        return false;
      }
      
      const albumData = albumDoc.data() as Album;
      return albumData.admins.includes(userUid) || albumData.createdBy === userUid;
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      return false;
    }
  }

  async isUserAlbumMember(albumId: string, userUid: string): Promise<boolean> {
    try {
      const albumRef = doc(this.firestore, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        return false;
      }
      
      const albumData = albumDoc.data() as Album;
      return albumData.members.includes(userUid) || 
             albumData.admins.includes(userUid) || 
             albumData.createdBy === userUid;
    } catch (error) {
      console.error('❌ Error checking member status:', error);
      return false;
    }
  }

  async downloadAllPhotos(albumId: string): Promise<boolean> {
    try {
      const photos = this.albumPhotos();
      if (photos.length === 0) {
        return false;
      }

      // Create a zip file for download
      const JSZip = await import('jszip');
      const zip = new JSZip.default();
      
      // Add each photo to the zip
      for (const photo of photos) {
        try {
          const response = await fetch(photo.downloadURL);
          const blob = await response.blob();
          const fileName = photo.fileName || `photo_${photo.id}.jpg`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error('Error downloading photo:', photo.id, error);
          // Continue with other photos
        }
      }

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${albumId}_photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Bulk download error:', error);
      return false;
    }
  }

  private async getAlbumThumbnail(albumId: string): Promise<string | null> {
    try {
      console.log('🖼️ Getting thumbnail for album:', albumId);
      const photosCollection = collection(this.firestore, 'photos');
      
      // Simple query without orderBy to avoid index issues
      const q = query(
        photosCollection,
        where('albumId', '==', albumId)
      );
      
      console.log('🔍 Executing photo query for album:', albumId);
      const querySnapshot = await getDocs(q);
      console.log('📸 Found', querySnapshot.size, 'photos for album:', albumId);
      
      if (!querySnapshot.empty) {
        // Sort photos by uploadedAt in memory instead of using Firestore orderBy
        const photos = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Photo))
          .sort((a, b) => {
            // Handle both Date and Timestamp types
            const getTime = (date: any): number => {
              if (date instanceof Date) {
                return date.getTime();
              }
              // Assume it's a Firestore Timestamp
              return (date as any).toDate().getTime();
            };
            
            return getTime(a.uploadedAt) - getTime(b.uploadedAt);
          });
        
        const firstPhoto = photos[0];
        console.log('✅ Using first photo as thumbnail:', firstPhoto.fileName, firstPhoto.downloadURL);
        return firstPhoto.downloadURL;
      }
      
      console.log('ℹ️ No photos found for album:', albumId);
      return null;
    } catch (error) {
      console.error('❌ Error loading album thumbnail for', albumId, ':', error);
      return null;
    }
  }

  private async loadAlbumsWithThumbnails(albums: Album[]): Promise<Album[]> {
    console.log('🖼️ Loading thumbnails for', albums.length, 'albums');
    
    const albumsWithThumbnails = await Promise.all(
      albums.map(async (album) => {
        console.log('🔍 Checking album:', album.name, 'Current cover:', album.coverPhotoUrl ? 'Has cover' : 'No cover');
        
        if (!album.coverPhotoUrl) {
          console.log('📥 Fetching thumbnail for album:', album.name);
          const thumbnail = await this.getAlbumThumbnail(album.id);
          const updatedAlbum = { ...album, coverPhotoUrl: thumbnail || undefined };
          console.log('📤 Album', album.name, 'thumbnail result:', thumbnail ? 'Found thumbnail' : 'No thumbnail');
          return updatedAlbum;
        }
        
        console.log('✅ Album', album.name, 'already has cover photo');
        return album;
      })
    );
    
    console.log('🖼️ Finished loading thumbnails');
    return albumsWithThumbnails;
  }

  private async getAlbumPhotoCount(albumId: string): Promise<number> {
    try {
      const photosCollection = collection(this.firestore, 'photos');
      const q = query(photosCollection, where('albumId', '==', albumId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting album photo count:', error);
      return 0;
    }
  }

  // Debug method - can be called from browser console for testing
  async createSampleAlbum(): Promise<void> {
    console.log('🧪 Creating sample album for testing...');
    const albumId = await this.createAlbum({
      name: 'Sample Album',
      description: 'A test album with photos for debugging thumbnails'
    });
    
    if (albumId) {
      console.log('✅ Sample album created:', albumId);
      // You can manually add photos to this album to test thumbnails
    }
  }
}
