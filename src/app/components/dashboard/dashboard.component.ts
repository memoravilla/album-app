import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlbumService } from '../../services/album.service';
import { InvitationService } from '../../services/invitation.service';
import { Album, AlbumInvitation } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-beige-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-primary-900 mb-2">
            Welcome back, {{ authService.currentUser()?.displayName }}!
          </h1>
          <p class="text-primary-600">
            Manage your photo albums and memories in one place.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
            <div class="flex items-center">
              <div class="p-3 bg-primary-100 rounded-lg">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-primary-600">Total Albums</p>
                <p class="text-2xl font-bold text-primary-900">{{ albums().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
            <div class="flex items-center">
              <div class="p-3 bg-beige-100 rounded-lg">
                <svg class="w-6 h-6 text-beige-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-primary-600">As Admin</p>
                <p class="text-2xl font-bold text-primary-900">{{ adminAlbumsCount() }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
            <div class="flex items-center">
              <div class="p-3 bg-primary-200 rounded-lg">
                <svg class="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-primary-600">As Member</p>
                <p class="text-2xl font-bold text-primary-900">{{ memberAlbumsCount() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Invitations -->
        @if (pendingInvitations().length > 0) {
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-primary-900 mb-4">Pending Album Invitations</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (invitation of pendingInvitations(); track invitation.id) {
                <div class="bg-white rounded-xl shadow-sm border border-amber-200 p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="font-medium text-primary-900 mb-1">{{ invitation.albumName }}</h3>
                      <p class="text-sm text-primary-600">
                        Invited by {{ invitation.inviterName }}
                      </p>
                      <p class="text-xs text-primary-500 mt-1">
                        {{ invitation.createdAt | date:'short' }}
                      </p>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button
                      (click)="acceptInvitation(invitation)"
                      class="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      (click)="declineInvitation(invitation)"
                      class="flex-1 px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-4 mb-8">
          <button
            (click)="openCreateAlbumModal()"
            class="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create New Album
          </button>
          
          <a
            routerLink="/albums"
            class="flex items-center px-6 py-3 bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            View All Albums
          </a>
        </div>

        <!-- Recent Albums -->
        <div class="bg-white rounded-xl shadow-sm border border-primary-100">
          <div class="px-6 py-4 border-b border-primary-100">
            <h2 class="text-xl font-semibold text-primary-900">Recent Albums</h2>
          </div>
          
          <div class="p-6">
            @if (albums().length === 0) {
              <div class="text-center py-12">
                <svg class="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <h3 class="text-lg font-medium text-primary-900 mb-2">No albums yet</h3>
                <p class="text-primary-600 mb-4">Create your first album to start collecting memories!</p>
                <button
                  (click)="openCreateAlbumModal()"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Album
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (album of recentAlbums(); track album.id) {
                  <div class="group cursor-pointer" (click)="navigateToAlbum(album.id)">
                    <div class="bg-primary-50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-primary-100 transition-colors overflow-hidden">
                      @if (album.coverPhotoUrl && !isCoverImageFailed(album.coverPhotoUrl)) {
                        <img
                          [src]="album.coverPhotoUrl"
                          [alt]="album.name"
                          class="w-full h-40 object-cover rounded-lg"
                          (error)="onCoverImageError(album.coverPhotoUrl)"
                        />
                      } @else {
                        <div class="w-full h-40 flex items-center justify-center">
                          <svg class="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                      }
                    </div>
                    <h3 class="font-medium text-primary-900 group-hover:text-primary-700 transition-colors">
                      {{ album.name }}
                    </h3>
                    <p class="text-sm text-primary-600">
                      {{ getTotalMemberCount(album) }} member{{ getTotalMemberCount(album) !== 1 ? 's' : '' }}
                    </p>
                    <div class="flex items-center mt-2">
                      @if (isUserAdmin(album)) {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Admin
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-beige-100 text-beige-800">
                          Member
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Create Album Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 class="text-xl font-semibold text-primary-900 mb-4">Create New Album</h2>
          
          <form (ngSubmit)="createAlbum()" class="space-y-4">
            <div>
              <label for="albumName" class="block text-sm font-medium text-primary-900 mb-2">
                Album Name
              </label>
              <input
                id="albumName"
                type="text"
                [(ngModel)]="newAlbumName"
                name="albumName"
                required
                class="w-full px-4 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter album name"
              />
            </div>

            <div>
              <label for="albumDescription" class="block text-sm font-medium text-primary-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="albumDescription"
                [(ngModel)]="newAlbumDescription"
                name="albumDescription"
                rows="3"
                class="w-full px-4 py-2 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe this album"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="closeCreateModal()"
                class="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!newAlbumName || albumService.isLoading()"
                class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                @if (albumService.isLoading()) {
                  <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </div>
                } @else {
                  Create Album
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  protected albumService = inject(AlbumService);
  protected invitationService = inject(InvitationService);
  private router = inject(Router);
  
  albums = this.albumService.userAlbums;
  pendingInvitations = signal<AlbumInvitation[]>([]);
  showCreateModal = signal(false);
  newAlbumName = '';
  newAlbumDescription = '';
  failedCoverImages = signal<Set<string>>(new Set());

  ngOnInit() {
    console.log('Dashboard initializing...');
    // Wait for auth to be ready before loading albums
    this.loadAlbumsWhenReady();
  }

  private async loadAlbumsWhenReady() {
    console.log('Waiting for auth to initialize...');
    await this.authService.waitForAuthInit();
    
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      console.log('Auth ready, loading albums for user:', currentUser.email);
      await this.albumService.loadUserAlbums();
      await this.loadPendingInvitations();
      
      // Update recent albums after loading
      this.updateRecentAlbums();
    } else {
      console.log('No current user after auth init');
    }
  }

  private async loadPendingInvitations() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    try {
      console.log('Loading pending invitations for user:', currentUser.uid);
      const invitations = await this.invitationService.getPendingInvitations(currentUser.uid);
      this.pendingInvitations.set(invitations);
      console.log('📨 Loaded pending invitations:', invitations.length);
    } catch (error) {
      console.error('Error loading pending invitations:', error);
      this.pendingInvitations.set([]);
    }
  }

  private updateRecentAlbums() {
    const allAlbums = this.albums();
    // Sort by creation date (newest first) and take the first 6
    const sortedAlbums = [...allAlbums]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    
    this.recentAlbums.set(sortedAlbums);
    console.log('📅 Updated recent albums:', sortedAlbums.length, 'albums');
  }

  recentAlbums = signal<Album[]>([]);

  // Computed values
  adminAlbumsCount() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return 0;
    return this.albums().filter(album => album.admins.includes(currentUser.uid)).length;
  }

  memberAlbumsCount() {
    return this.albums().length - this.adminAlbumsCount();
  }

  isUserAdmin(album: Album): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    return album.admins.includes(currentUser.uid) || album.createdBy === currentUser.uid;
  }

  getTotalMemberCount(album: Album): number {
    // Get unique members from both members and admins arrays
    const allMembers = new Set([...(album.members || []), ...(album.admins || [])]);
    return allMembers.size;
  }

  openCreateAlbumModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.newAlbumName = '';
    this.newAlbumDescription = '';
  }

  async createAlbum() {
    if (!this.newAlbumName.trim()) return;

    const albumData = {
      name: this.newAlbumName.trim(),
      description: this.newAlbumDescription.trim() || undefined
    };

    const albumId = await this.albumService.createAlbum(albumData);
    
    if (albumId) {
      this.closeCreateModal();
      // Update recent albums after creating new one
      this.updateRecentAlbums();
      // Navigate to the new album
      this.navigateToAlbum(albumId);
    }
  }

  navigateToAlbum(albumId: string) {
    // Navigate to album view using Angular Router
    this.router.navigate(['/app/albums', albumId]);
  }

  // Invitation handling methods
  async acceptInvitation(invitation: AlbumInvitation) {
    try {
      const success = await this.invitationService.respondToInvitation(invitation.id, 'accepted');
      if (success) {
        console.log('✅ Invitation accepted');
        // Reload data to reflect changes
        await this.loadPendingInvitations();
        await this.albumService.loadUserAlbums();
        this.updateRecentAlbums();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  }

  async declineInvitation(invitation: AlbumInvitation) {
    try {
      const success = await this.invitationService.respondToInvitation(invitation.id, 'declined');
      if (success) {
        console.log('✅ Invitation declined');
        // Reload pending invitations
        await this.loadPendingInvitations();
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  }

  onCoverImageError(coverPhotoUrl: string) {
    const current = this.failedCoverImages();
    const updated = new Set(current);
    updated.add(coverPhotoUrl);
    this.failedCoverImages.set(updated);
  }

  isCoverImageFailed(coverPhotoUrl: string): boolean {
    return this.failedCoverImages().has(coverPhotoUrl);
  }
}
