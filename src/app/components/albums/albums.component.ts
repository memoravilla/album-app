import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { Album } from '../../models/interfaces';

@Component({
  selector: 'app-albums',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-beige-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-primary-900">My Albums</h1>
            <p class="text-primary-600 mt-2">
              Manage all your photo collections
            </p>
          </div>
          
          <button
            (click)="openCreateAlbumModal()"
            class="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Album
          </button>
        </div>

        <!-- Filters -->
        <div class="flex space-x-4 mb-6">
          <button
            (click)="setFilter('all')"
            [class.bg-primary-600]="currentFilter() === 'all'"
            [class.text-white]="currentFilter() === 'all'"
            [class.bg-white]="currentFilter() !== 'all'"
            [class.text-primary-600]="currentFilter() !== 'all'"
            class="px-4 py-2 rounded-lg border border-primary-300 hover:bg-primary-50 transition-colors"
          >
            All Albums ({{ albums().length }})
          </button>
          <button
            (click)="setFilter('admin')"
            [class.bg-primary-600]="currentFilter() === 'admin'"
            [class.text-white]="currentFilter() === 'admin'"
            [class.bg-white]="currentFilter() !== 'admin'"
            [class.text-primary-600]="currentFilter() !== 'admin'"
            class="px-4 py-2 rounded-lg border border-primary-300 hover:bg-primary-50 transition-colors"
          >
            As Admin ({{ adminAlbums().length }})
          </button>
          <button
            (click)="setFilter('member')"
            [class.bg-primary-600]="currentFilter() === 'member'"
            [class.text-white]="currentFilter() === 'member'"
            [class.bg-white]="currentFilter() !== 'member'"
            [class.text-primary-600]="currentFilter() !== 'member'"
            class="px-4 py-2 rounded-lg border border-primary-300 hover:bg-primary-50 transition-colors"
          >
            As Member ({{ memberAlbums().length }})
          </button>
        </div>

        <!-- Albums Grid -->
        @if (filteredAlbums().length === 0) {
          <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-12 text-center">
            <svg class="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h3 class="text-lg font-medium text-primary-900 mb-2">
              @if (currentFilter() === 'all') {
                No albums yet
              } @else if (currentFilter() === 'admin') {
                No albums where you're admin
              } @else {
                No albums where you're a member
              }
            </h3>
            <p class="text-primary-600 mb-4">
              @if (currentFilter() === 'all') {
                Create your first album to start collecting memories!
              } @else {
                Try a different filter or create a new album.
              }
            </p>
            <button
              (click)="openCreateAlbumModal()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Album
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (album of filteredAlbums(); track album.id) {
              <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden hover:shadow-md transition-shadow">
                <!-- Album Cover -->
                <div class="relative bg-primary-50">
                  @if (album.coverPhotoUrl && !isCoverImageFailed(album.coverPhotoUrl)) {
                    <img
                      [src]="album.coverPhotoUrl"
                      [alt]="album.name"
                      class="w-full h-48 object-cover cursor-pointer"
                      (click)="navigateToAlbum(album.id)"
                      (error)="onCoverImageError(album.coverPhotoUrl)"
                    />
                  } @else {
                    <div 
                      class="w-full h-48 flex items-center justify-center cursor-pointer hover:bg-primary-100 transition-colors"
                      (click)="navigateToAlbum(album.id)"
                    >
                      <svg class="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  }
                </div>

                <!-- Album Info -->
                <div class="p-4">
                  <div class="flex justify-between items-start mb-2">
                    <h3 
                      class="font-semibold text-primary-900 cursor-pointer hover:text-primary-700 transition-colors truncate pr-2"
                      (click)="navigateToAlbum(album.id)"
                    >
                      {{ album.name }}
                    </h3>
                    
                    @if (isUserAdmin(album)) {
                      <div class="relative flex-shrink-0">
                        <button
                          (click)="toggleAlbumMenu(album.id)"
                          class="p-1 text-primary-500 hover:text-primary-700 transition-colors"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                          </svg>
                        </button>

                        <!-- Dropdown Menu -->
                        @if (activeMenuId() === album.id) {
                          <div class="absolute right-0 mt-2 w-48 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
                            <div class="py-1">
                              <button
                                (click)="editAlbum(album)"
                                class="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                              >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Edit Album
                              </button>
                              <button
                                (click)="deleteAlbum(album)"
                                class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                Delete Album
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>

                  @if (album.description) {
                    <p class="text-sm text-primary-600 mb-3 line-clamp-2">
                      {{ album.description }}
                    </p>
                  }

                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center space-x-4 text-sm text-primary-500">
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        {{ album.members.length }}
                      </span>
                    </div>
                    
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

                  @if (album.expirationDate) {
                    <div class="mt-2 text-xs text-orange-600">
                      Expires: {{ formatDate(album.expirationDate) }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Click outside to close menus -->
    @if (activeMenuId()) {
      <div 
        class="fixed inset-0 z-40" 
        (click)="closeMenus()"
      ></div>
    }
  `
})
export class AlbumsComponent implements OnInit {
  private albumService = inject(AlbumService);
  private authService = inject(AuthService);
  private router = inject(Router);

  albums = this.albumService.userAlbums;
  currentFilter = signal<'all' | 'admin' | 'member'>('all');
  activeMenuId = signal<string | null>(null);
  failedCoverImages = signal<Set<string>>(new Set());

  ngOnInit() {
    console.log('📱 Albums component initializing...');
    this.loadAlbumsWhenReady();
  }

  private async loadAlbumsWhenReady() {
    console.log('⏳ Waiting for auth to initialize...');
    await this.authService.waitForAuthInit();
    
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      console.log('✅ Auth ready, loading albums for user:', currentUser.email);
      await this.albumService.loadUserAlbums();
    } else {
      console.log('❌ No current user after auth init');
    }
  }

  adminAlbums() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.albums().filter(album => album.admins.includes(currentUser.uid));
  }

  memberAlbums() {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this.albums().filter(album => 
      album.members.includes(currentUser.uid) && !album.admins.includes(currentUser.uid)
    );
  }

  filteredAlbums() {
    switch (this.currentFilter()) {
      case 'admin':
        return this.adminAlbums();
      case 'member':
        return this.memberAlbums();
      default:
        return this.albums();
    }
  }

  setFilter(filter: 'all' | 'admin' | 'member') {
    this.currentFilter.set(filter);
    this.closeMenus();
  }

  isUserAdmin(album: Album): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    return album.admins.includes(currentUser.uid) || album.createdBy === currentUser.uid;
  }

  toggleAlbumMenu(albumId: string) {
    this.activeMenuId.set(this.activeMenuId() === albumId ? null : albumId);
  }

  closeMenus() {
    this.activeMenuId.set(null);
  }

  navigateToAlbum(albumId: string) {
    this.closeMenus();
    this.router.navigate(['/app/albums', albumId]);
  }

  openCreateAlbumModal() {
    // Navigate to dashboard where the modal is implemented
    this.router.navigate(['/app/dashboard']);
  }

  editAlbum(album: Album) {
    this.closeMenus();
    // TODO: Implement edit album modal
    console.log('Edit album:', album);
  }

  async deleteAlbum(album: Album) {
    this.closeMenus();
    
    if (confirm(`Are you sure you want to delete "${album.name}"? This action cannot be undone.`)) {
      const success = await this.albumService.deleteAlbum(album.id);
      if (!success) {
        alert('Failed to delete album. Please try again.');
      }
    }
  }

  formatDate(date: Date | any): string {
    try {
      if (!date) return 'Unknown';
      
      let actualDate: Date;
      if (date instanceof Date) {
        actualDate = date;
      } else if (date.toDate && typeof date.toDate === 'function') {
        actualDate = date.toDate();
      } else if (typeof date === 'string' || typeof date === 'number') {
        actualDate = new Date(date);
      } else {
        return 'Invalid date';
      }
      
      if (isNaN(actualDate.getTime())) {
        return 'Invalid date';
      }
      
      return actualDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
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
