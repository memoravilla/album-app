import { Injectable, inject, signal } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp
} from '@angular/fire/firestore';
import { SongSuggestion } from '../models/interfaces';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  // Signals
  albumSongs = signal<SongSuggestion[]>([]);
  isLoading = signal(false);

  async suggestSong(albumId: string, songData: {
    title: string;
    artist: string;
    spotifyUrl?: string;
    youtubeUrl?: string;
    description?: string;
  }): Promise<boolean> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No current user, cannot suggest song');
      return false;
    }

    try {
      this.isLoading.set(true);
      console.log('🎵 Suggesting song:', songData);

      const suggestion: Omit<SongSuggestion, 'id'> = {
        albumId,
        title: songData.title.trim(),
        artist: songData.artist.trim(),
        suggestedBy: currentUser.uid,
        suggestedAt: Timestamp.now() as any,
        votes: [currentUser.uid], // User automatically votes for their own suggestion
        spotifyUrl: songData.spotifyUrl?.trim() || "",
        youtubeUrl: songData.youtubeUrl?.trim() || "",
        description: songData.description?.trim() || ""
      };

      const docRef = await addDoc(collection(this.firestore, 'songSuggestions'), suggestion);
      console.log('✅ Song suggested with ID:', docRef.id);

      // Reload songs for this album
      await this.loadAlbumSongs(albumId);
      
      return true;
    } catch (error) {
      console.error('❌ Error suggesting song:', error);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadAlbumSongs(albumId: string): Promise<void> {
    try {
      console.log('🔄 Loading songs for album:', albumId);
      
      const q = query(
        collection(this.firestore, 'songSuggestions'),
        where('albumId', '==', albumId),
        orderBy('votes', 'desc'), // Order by vote count (most voted first)
        orderBy('suggestedAt', 'desc') // Then by suggestion time
      );
      
      const querySnapshot = await getDocs(q);
      const songs: SongSuggestion[] = [];
      
      querySnapshot.forEach((doc) => {
        songs.push({
          id: doc.id,
          ...doc.data()
        } as SongSuggestion);
      });

      // Sort by vote count descending, then by suggestion time descending
      songs.sort((a, b) => {
        if (b.votes.length !== a.votes.length) {
          return b.votes.length - a.votes.length;
        }
        return new Date(b.suggestedAt).getTime() - new Date(a.suggestedAt).getTime();
      });
      
      this.albumSongs.set(songs);
      console.log('✅ Loaded', songs.length, 'song suggestions');
    } catch (error) {
      console.error('❌ Error loading songs:', error);
      this.albumSongs.set([]);
    }
  }

  async voteSong(songId: string): Promise<boolean> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No current user, cannot vote');
      return false;
    }

    try {
      console.log('👍 Voting for song:', songId);
      
      const songRef = doc(this.firestore, `songSuggestions/${songId}`);
      await updateDoc(songRef, {
        votes: arrayUnion(currentUser.uid)
      });
      
      console.log('✅ Vote added successfully');
      
      // Reload songs to update counts
      const currentSongs = this.albumSongs();
      const song = currentSongs.find(s => s.id === songId);
      if (song) {
        await this.loadAlbumSongs(song.albumId);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error voting for song:', error);
      return false;
    }
  }

  async unvoteSong(songId: string): Promise<boolean> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No current user, cannot unvote');
      return false;
    }

    try {
      console.log('👎 Removing vote from song:', songId);
      
      const songRef = doc(this.firestore, `songSuggestions/${songId}`);
      await updateDoc(songRef, {
        votes: arrayRemove(currentUser.uid)
      });
      
      console.log('✅ Vote removed successfully');
      
      // Reload songs to update counts
      const currentSongs = this.albumSongs();
      const song = currentSongs.find(s => s.id === songId);
      if (song) {
        await this.loadAlbumSongs(song.albumId);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error removing vote from song:', error);
      return false;
    }
  }

  async deleteSong(songId: string): Promise<boolean> {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('No current user, cannot delete song');
      return false;
    }

    try {
      console.log('🗑️ Deleting song:', songId);
      
      const songRef = doc(this.firestore, `songSuggestions/${songId}`);
      await deleteDoc(songRef);
      
      console.log('✅ Song deleted successfully');
      
      // Reload songs
      const currentSongs = this.albumSongs();
      const song = currentSongs.find(s => s.id === songId);
      if (song) {
        await this.loadAlbumSongs(song.albumId);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting song:', error);
      return false;
    }
  }

  canDeleteSong(song: SongSuggestion): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    return song.suggestedBy === currentUser.uid;
  }

  hasUserVoted(song: SongSuggestion): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    return song.votes.includes(currentUser.uid);
  }
}
