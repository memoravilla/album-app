import { Component, inject, OnInit, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { InvitationService } from '../../services/invitation.service';
import { Album, Photo, User, AlbumInvitation } from '../../models/interfaces';
import { NavbarComponent } from '../shared/navbar-new.component';
import { AlbumMembersComponent } from './album-members.component';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, AlbumMembersComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="min-h-screen bg-beige-50">
      @if (album()) {
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Album Header -->
          <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-6 mb-8">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-primary-900 mb-2">{{ album()!.name }}</h1>
                @if (album()!.description) {
                  <p class="text-primary-600 mb-4">{{ album()!.description }}</p>
                }
                
                <div class="flex items-center space-x-6 text-sm text-primary-500">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    {{ album()!.members.length }} member{{ album()!.members.length !== 1 ? 's' : '' }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ photos().length }} photo{{ photos().length !== 1 ? 's' : '' }}
                  </span>
                  @if (album()!.expirationDate) {
                    <span class="flex items-center text-orange-600">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Expires {{ album()!.expirationDate ? formatDate(album()!.expirationDate) : 'Unknown' }}
                    </span>
                  }
                </div>
              </div>

              <div class="flex items-center space-x-3">
                @if (isUserAdmin()) {
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    Admin
                  </span>
                } @else {
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-beige-100 text-beige-800">
                    Member
                  </span>
                }
                
                @if (isUserAdmin()) {
                  <div class="relative">
                    <button
                      (click)="toggleAlbumMenu()"
                      class="p-2 text-primary-500 hover:text-primary-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                      </svg>
                    </button>

                    @if (showAlbumMenu()) {
                      <div class="absolute right-0 mt-2 w-48 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
                        <div class="py-1">
                          <button
                            (click)="editAlbumName()"
                            class="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                          >
                            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit Album
                          </button>
                          <button
                            (click)="downloadAllPhotos()"
                            class="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                          >
                            <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Download All
                          </button>
                          <button
                            (click)="deleteAlbum()"
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
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-xl shadow-sm border border-primary-100 mb-8">
            <div class="border-b border-primary-100">
              <nav class="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  (click)="activeTab.set('photos')"
                  [class]="activeTab() === 'photos' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  Photos ({{ photos().length }})
                </button>
                <button
                  (click)="activeTab.set('members')"
                  [class]="activeTab() === 'members' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                  class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  Members ({{ getTotalMemberCount() }})
                </button>
                @if (isUserAdmin()) {
                  <button
                    (click)="activeTab.set('invites')"
                    [class]="activeTab() === 'invites' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                    class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                  >
                    Pending Invites ({{ pendingInvites().length }})
                  </button>
                }
              </nav>
            </div>

            <div class="p-6">
              <!-- Photos Tab -->
              @if (activeTab() === 'photos') {
                <!-- Upload Section -->
                <div class="mb-8">
                  <h3 class="text-lg font-semibold text-primary-900 mb-4">Upload Photos</h3>
                  
                  <div class="flex items-center space-x-4">
                    <div class="flex-1">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        (change)="onFilesSelected($event)"
                        class="hidden"
                        #fileInput
                      />
                      
                      <button
                        (click)="fileInput.click()"
                        [disabled]="albumService.isLoading()"
                        class="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        @if (albumService.isLoading()) {
                          <div class="flex items-center">
                            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                            Uploading...
                          </div>
                        } @else {
                          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                          </svg>
                          Select Photos
                        }
                      </button>
                    </div>
                    
                    @if (selectedFiles().length > 0) {
                      <div class="text-sm text-primary-600">
                        {{ selectedFiles().length }} file{{ selectedFiles().length !== 1 ? 's' : '' }} selected
                      </div>
                      <button
                        (click)="uploadFiles()"
                        [disabled]="albumService.isLoading()"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Upload
                      </button>
                      <button
                        (click)="clearSelection()"
                        class="px-4 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Clear
                      </button>
                    }
                  </div>
                </div>

                <!-- Photos Grid -->
                @if (photos().length === 0) {
                  <div class="text-center py-12">
                    <svg class="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-primary-900 mb-2">No photos yet</h3>
                    <p class="text-primary-600 mb-4">Start uploading photos to this album!</p>
                    <button
                      (click)="fileInput.click()"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Upload First Photo
                    </button>
                  </div>
                } @else {
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    @for (photo of photos(); track photo.id) {
                      <div class="group relative aspect-square">
                        <img
                          [src]="photo.downloadURL"
                          [alt]="photo.caption || 'Album photo'"
                          class="w-full h-full object-cover rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                          (click)="openPhotoModal(photo)"
                          loading="lazy"
                        />
                        
                        <!-- Photo Actions Overlay -->
                      </div>
                    }
                  </div>
                }
              }

              <!-- Members Tab -->
              @if (activeTab() === 'members') {
                <app-album-members
                  [albumId]="album()!.id"
                  [albumName]="album()!.name"
                  (membersChanged)="onMembersChanged()"
                />
              }

              <!-- Pending Invites Tab -->
              @if (activeTab() === 'invites') {
                <div class="space-y-6">
                  <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-primary-900">Pending Invitations</h3>
                    <p class="text-sm text-primary-600">
                      {{ pendingInvites().length }} invitation{{ pendingInvites().length !== 1 ? 's' : '' }} sent
                    </p>
                  </div>

                  @if (pendingInvites().length === 0) {
                    <div class="text-center py-12">
                      <svg class="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <h4 class="text-lg font-medium text-primary-900 mb-2">No pending invitations</h4>
                      <p class="text-primary-600">
                        All users you've invited have already responded or you haven't sent any invitations yet.
                      </p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      @for (invite of pendingInvites(); track invite.id) {
                        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                              <h4 class="font-medium text-primary-900">{{ invite.inviteeEmail }}</h4>
                              <p class="text-sm text-primary-600 mt-1">
                                Invited {{ formatDate(invite.createdAt) }}
                              </p>
                              <p class="text-xs text-primary-500 mt-1">
                                Expires {{ formatDate(invite.expiresAt) }}
                              </p>
                            </div>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          </div>
                          
                          <div class="flex space-x-2">
                            <button
                              (click)="resendInvitation(invite)"
                              class="flex-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                            >
                              Resend
                            </button>
                            <button
                              (click)="cancelInvitation(invite)"
                              class="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="max-w-4xl mx-auto px-4 py-16 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p class="text-primary-600">Loading album...</p>
        </div>
      }
    </div>

    <!-- Photo Modal -->
    @if (selectedPhoto()) {
      <div class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" (click)="closePhotoModal()">
        <div class="max-w-6xl max-h-full w-full flex flex-col" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-4 text-white">
            <div class="flex items-center space-x-4">
              @if (selectedPhoto()!.caption) {
                <h3 class="text-lg font-semibold">{{ selectedPhoto()!.caption }}</h3>
              } @else {
                <h3 class="text-lg font-semibold">{{ selectedPhoto()!.fileName }}</h3>
              }
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Photo counter -->
              <div class="px-3 py-1 bg-primary-800 bg-opacity-80 text-white text-sm rounded-full">
                {{ selectedPhotoIndex() + 1 }} of {{ photos().length }}
              </div>
              
              <!-- Navigation buttons -->
              @if (photos().length > 1) {
                <button
                  (click)="previousPhoto()"
                  [disabled]="selectedPhotoIndex() === 0"
                  class="p-2 bg-primary-800 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <button
                  (click)="nextPhoto()"
                  [disabled]="selectedPhotoIndex() === photos().length - 1"
                  class="p-2 bg-primary-800 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              }
              
              <!-- Close button -->
              <button
                (click)="closePhotoModal()"
                class="p-2 bg-primary-800 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Photo Container -->
          <div class="flex-1 flex items-center justify-center relative">
            <img
              [src]="selectedPhoto()!.downloadURL"
              [alt]="selectedPhoto()!.caption || 'Photo'"
              class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
            
            <!-- Keyboard navigation hints -->
            @if (photos().length > 1) {
              <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 text-sm">
                ← Prev
              </div>
              <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 text-sm">
                Next →
              </div>
            }
          </div>

          <!-- Photo Details -->
          <div class="p-4 bg-black bg-opacity-50 text-white">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <!-- Upload info -->
                  <div>
                    <div class="text-primary-200 mb-1">Uploaded by</div>
                    <div class="font-medium">{{ getUploaderName(selectedPhoto()!.uploadedBy) }}</div>
                  </div>
                  
                  <!-- Upload date -->
                  <div>
                    <div class="text-primary-200 mb-1">Upload date</div>
                    <div class="font-medium">{{ formatDateTime(selectedPhoto()!.uploadedAt) }}</div>
                  </div>
                  
                  <!-- File info -->
                  <div>
                    <div class="text-primary-200 mb-1">File name</div>
                    <div class="font-medium text-xs">{{ selectedPhoto()!.fileName }}</div>
                  </div>
                </div>
                
                @if (selectedPhoto()!.caption) {
                  <div class="mt-3">
                    <div class="text-primary-200 mb-1">Caption</div>
                    <div class="font-medium">{{ selectedPhoto()!.caption }}</div>
                  </div>
                }
              </div>
              
              <!-- Action buttons -->
              <div class="ml-4 flex space-x-2">
                <button
                  (click)="downloadPhoto(selectedPhoto()!)"
                  class="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download
                </button>
                
                @if (canDeletePhoto(selectedPhoto()!)) {
                  <button
                    (click)="deletePhoto(selectedPhoto()!)"
                    class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Delete
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Click outside to close menus -->
    @if (showAlbumMenu()) {
      <div 
        class="fixed inset-0 z-40" 
        (click)="closeMenus()"
      ></div>
    }
  `
})
export class AlbumDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected albumService = inject(AlbumService);
  private authService = inject(AuthService);
  protected invitationService = inject(InvitationService);

  album = this.albumService.selectedAlbum;
  photos = this.albumService.albumPhotos;
  selectedFiles = signal<File[]>([]);
  selectedPhoto = signal<Photo | null>(null);
  selectedPhotoIndex = signal<number>(0);
  showAlbumMenu = signal(false);
  uploaderNames = signal<Map<string, string>>(new Map()); // Cache for uploader names
  pendingInvites = signal<AlbumInvitation[]>([]);
  activeTab = signal<'photos' | 'members' | 'invites'>('photos'); // Add active tab signal

  constructor() {
    // Update uploader names when photos change
    effect(() => {
      this.loadUploaderNames();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    const albumId = this.route.snapshot.params['id'];
    if (albumId) {
      this.albumService.loadAlbumById(albumId);
      this.loadPendingInvites(albumId);
    }
  }

  onMembersChanged() {
    // Refresh album data when members change
    const albumId = this.route.snapshot.params['id'];
    if (albumId) {
      this.albumService.loadAlbumById(albumId);
      // Also reload pending invites in case new ones were sent
      this.loadPendingInvites(albumId);
    }
  }

  private async loadPendingInvites(albumId: string) {
    try {
      // Only load invitations if user is an admin
      if (!this.isUserAdmin()) {
        console.log('� User is not admin, skipping invitation loading');
        this.pendingInvites.set([]);
        return;
      }

      console.log('�🔄 Loading pending invitations for album:', albumId);
      const invites = await this.invitationService.getAlbumInvitations(albumId);
      this.pendingInvites.set(invites);
      console.log('📨 Loaded pending invitations:', invites.length);
    } catch (error: any) {
      console.error('❌ Error loading pending invitations:', error);
      console.error('❌ Error code:', error.code);
      
      if (error.code === 'permission-denied') {
        console.error('❌ Permission denied - user may not have admin access to this album');
      }
      
      this.pendingInvites.set([]);
    }
  }

  getTotalMemberCount(): number {
    const album = this.album();
    if (!album) return 0;
    // Get unique members from both members and admins arrays
    const allMembers = new Set([...(album.members || []), ...(album.admins || [])]);
    return allMembers.size;
  }

  isUserAdmin(): boolean {
    const album = this.album();
    const currentUser = this.authService.currentUser();
    if (!album || !currentUser) return false;
    
    return album.admins.includes(currentUser.uid) || album.createdBy === currentUser.uid;
  }

  async resendInvitation(invite: AlbumInvitation) {
    try {
      const success = await this.invitationService.inviteUserToAlbum(
        invite.albumId,
        invite.albumName,
        invite.inviteeEmail
      );
      if (success) {
        console.log('✅ Invitation resent to:', invite.inviteeEmail);
        // Refresh pending invites
        const albumId = this.route.snapshot.params['id'];
        if (albumId) {
          this.loadPendingInvites(albumId);
        }
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
    }
  }

  async cancelInvitation(invite: AlbumInvitation) {
    try {
      const success = await this.invitationService.cancelInvitation(invite.id);
      if (success) {
        console.log('✅ Invitation cancelled for:', invite.inviteeEmail);
        // Refresh pending invites
        const albumId = this.route.snapshot.params['id'];
        if (albumId) {
          this.loadPendingInvites(albumId);
        }
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
    }
  }

  private async loadUploaderNames() {
    const photos = this.photos();
    const currentUser = this.authService.currentUser();
    const names = new Map<string, string>();
    
    console.log('🔄 Loading uploader names for', photos.length, 'photos');
    
    for (const photo of photos) {
      if (currentUser && photo.uploadedBy === currentUser.uid) {
        names.set(photo.uploadedBy, currentUser.displayName || currentUser.email || 'You');
        console.log('👤 Current user photo:', photo.uploadedBy, '-> You');
      } else {
        // For now, just use a shortened UID. In a real app, fetch user data
        const displayName = `User ${photo.uploadedBy.substring(0, 8)}...`;
        names.set(photo.uploadedBy, displayName);
        console.log('👤 Other user photo:', photo.uploadedBy, '->', displayName);
      }
    }
    
    this.uploaderNames.set(names);
    console.log('✅ Uploader names loaded:', names);
  }

  canDeletePhoto(photo: Photo): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    
    // User can delete photo if they are admin or if they uploaded it
    return this.isUserAdmin() || photo.uploadedBy === currentUser.uid;
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    this.selectedFiles.set(imageFiles);
    
    // Reset the file input
    event.target.value = '';
  }

  async uploadFiles() {
    const album = this.album();
    const files = this.selectedFiles();
    
    if (!album || files.length === 0) return;

    for (const file of files) {
      await this.albumService.uploadPhoto(album.id, file);
    }
    
    this.clearSelection();
  }

  clearSelection() {
    this.selectedFiles.set([]);
  }

  openPhotoModal(photo: Photo) {
    const photoIndex = this.photos().findIndex(p => p.id === photo.id);
    console.log('🖼️ Opening photo modal:', photo.fileName, 'Index:', photoIndex);
    console.log('📋 Photo details:', {
      id: photo.id,
      uploadedBy: photo.uploadedBy,
      uploadedAt: photo.uploadedAt,
      fileName: photo.fileName,
      caption: photo.caption
    });
    
    this.selectedPhoto.set(photo);
    this.selectedPhotoIndex.set(photoIndex);
    
    // Force uploader names to reload if needed
    const uploaderName = this.getUploaderName(photo.uploadedBy);
    console.log('👤 Uploader name:', uploaderName);
  }

  closePhotoModal() {
    this.selectedPhoto.set(null);
    this.selectedPhotoIndex.set(0);
  }

  nextPhoto() {
    const photos = this.photos();
    const currentIndex = this.selectedPhotoIndex();
    
    console.log('➡️ Next photo:', { currentIndex, totalPhotos: photos.length });
    
    if (currentIndex < photos.length - 1) {
      const nextIndex = currentIndex + 1;
      this.selectedPhoto.set(photos[nextIndex]);
      this.selectedPhotoIndex.set(nextIndex);
      console.log('✅ Moved to photo index:', nextIndex, 'Photo:', photos[nextIndex].fileName);
    }
  }

  previousPhoto() {
    const photos = this.photos();
    const currentIndex = this.selectedPhotoIndex();
    
    console.log('⬅️ Previous photo:', { currentIndex, totalPhotos: photos.length });
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      this.selectedPhoto.set(photos[prevIndex]);
      this.selectedPhotoIndex.set(prevIndex);
      console.log('✅ Moved to photo index:', prevIndex, 'Photo:', photos[prevIndex].fileName);
    }
  }

  async deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to delete this photo?')) {
      await this.albumService.deletePhoto(photo.id);
      // Close modal if this was the photo being viewed and there are no more photos
      if (this.selectedPhoto()?.id === photo.id && this.photos().length <= 1) {
        this.closePhotoModal();
      }
    }
  }

  async downloadPhoto(photo: Photo) {
    try {
      console.log('📥 Downloading photo:', photo.fileName);
      
      // Fetch the image data
      const response = await fetch(photo.downloadURL);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.fileName || `photo_${photo.id}.jpg`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Photo downloaded successfully');
    } catch (error) {
      console.error('❌ Error downloading photo:', error);
      alert('Failed to download photo. Please try again.');
    }
  }

  toggleAlbumMenu() {
    this.showAlbumMenu.set(!this.showAlbumMenu());
  }

  closeMenus() {
    this.showAlbumMenu.set(false);
  }

  editAlbumName() {
    this.closeMenus();
    const album = this.album();
    if (!album) return;
    
    const newName = prompt('Enter new album name:', album.name);
    if (newName && newName.trim() !== album.name) {
      this.albumService.updateAlbum(album.id, { name: newName.trim() });
    }
  }

  async downloadAllPhotos() {
    this.closeMenus();
    const album = this.album();
    if (!album) return;

    const success = await this.albumService.downloadAllPhotos(album.id);
    if (!success) {
      alert('Failed to download photos. Please try again.');
    }
  }

  async deleteAlbum() {
    this.closeMenus();
    const album = this.album();
    if (!album) return;
    
    if (confirm(`Are you sure you want to delete "${album.name}"? This action cannot be undone.`)) {
      const success = await this.albumService.deleteAlbum(album.id);
      if (success) {
        this.router.navigate(['/albums']);
      } else {
        alert('Failed to delete album. Please try again.');
      }
    }
  }

  formatDate(date: Date | any): string {
    try {
      if (!date) return '';
      
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

  formatDateTime(date: Date | any): string {
    try {
      if (!date) return '';
      
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
      
      return actualDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error, date);
      return 'Invalid date';
    }
  }

  getUploaderName(uploaderId: string): string {
    const names = this.uploaderNames();
    return names.get(uploaderId) || `User ${uploaderId.substring(0, 8)}...`;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedPhoto()) return;

    switch (event.key) {
      case 'ArrowLeft':
        this.previousPhoto();
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.nextPhoto();
        event.preventDefault();
        break;
      case 'Escape':
        this.closePhotoModal();
        event.preventDefault();
        break;
    }
  }
}
