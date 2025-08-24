import { Component, inject, OnInit, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';
import { InvitationService } from '../../services/invitation.service';
import { Album, Photo, User, AlbumInvitation } from '../../models/interfaces';
import { AlbumMembersComponent } from './album-members.component';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, AlbumMembersComponent],
  template: `
    <div class="min-h-screen bg-beige-50">
      @if (album()) {
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Header -->
          <div class="flex justify-between items-start mb-8">
            <div class="flex-1">
              <div class="flex items-center space-x-4 mb-4">
                <button 
                  (click)="router.navigate(['/app/albums'])"
                  class="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </button>
                <div>
                  <h1 class="text-3xl font-bold text-primary-900">{{ album()!.name }}</h1>
                  @if (album()!.description) {
                    <p class="text-primary-600 mt-1">{{ album()!.description }}</p>
                  }
                </div>
              </div>
              
              <div class="flex items-center space-x-6 text-sm text-primary-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  {{ album()!.members.length }} members
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ photos().length }} photos
                </span>
                @if (album()!.createdAt) {
                  <span>Created {{ formatDate(album()!.createdAt) }}</span>
                }
              </div>
            </div>

            @if (isAdmin()) {
              <div class="relative">
                <button
                  (click)="showAlbumMenu.set(!showAlbumMenu())"
                  class="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"></path>
                  </svg>
                </button>

                @if (showAlbumMenu()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
                    <div class="py-1">
                      <button
                        (click)="editAlbum()"
                        class="flex items-center w-full px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                      >
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit Album
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

          <!-- Tabs -->
          <div class="border-b border-primary-200 mb-8">
            <nav class="-mb-px flex space-x-8">
              <button
                (click)="activeTab.set('photos')"
                [class.border-primary-500]="activeTab() === 'photos'"
                [class.text-primary-600]="activeTab() === 'photos'"
                [class.border-transparent]="activeTab() !== 'photos'"
                [class.text-primary-500]="activeTab() !== 'photos'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm hover:text-primary-600 hover:border-primary-300 transition-colors"
              >
                Photos ({{ photos().length }})
              </button>
              <button
                (click)="activeTab.set('members')"
                [class.border-primary-500]="activeTab() === 'members'"
                [class.text-primary-600]="activeTab() === 'members'"
                [class.border-transparent]="activeTab() !== 'members'"
                [class.text-primary-500]="activeTab() !== 'members'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm hover:text-primary-600 hover:border-primary-300 transition-colors"
              >
                Members ({{ album()!.members.length }})
              </button>
              @if (isAdmin()) {
                <button
                  (click)="activeTab.set('invites')"
                  [class.border-primary-500]="activeTab() === 'invites'"
                  [class.text-primary-600]="activeTab() === 'invites'"
                  [class.border-transparent]="activeTab() !== 'invites'"
                  [class.text-primary-500]="activeTab() !== 'invites'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm hover:text-primary-600 hover:border-primary-300 transition-colors"
                >
                  Pending Invites ({{ pendingInvites().length }})
                </button>
              }
            </nav>
          </div>

          <!-- Tab Content -->
          @if (activeTab() === 'photos') {
            <!-- Photos Tab -->
            <div class="space-y-6">
              <!-- Upload Section -->
              @if (isAdmin()) {
                <div class="bg-white rounded-xl shadow-sm border border-primary-100 p-6">
                  <h3 class="text-lg font-semibold text-primary-900 mb-4">Add Photos</h3>
                  
                  <div class="flex items-center justify-center w-full">
                    <label for="file-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-primary-300 border-dashed rounded-lg cursor-pointer bg-primary-50 hover:bg-primary-100 transition-colors">
                      <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4 text-primary-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="mb-2 text-sm text-primary-500">
                          <span class="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p class="text-xs text-primary-500">PNG, JPG or GIF (MAX. 10MB each)</p>
                      </div>
                      <input 
                        id="file-upload" 
                        type="file" 
                        class="hidden" 
                        multiple 
                        accept="image/*"
                        (change)="onFilesSelected($event)"
                      />
                    </label>
                  </div>

                  @if (selectedFiles().length > 0) {
                    <div class="mt-4">
                      <h4 class="text-sm font-medium text-primary-900 mb-2">Selected Files:</h4>
                      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        @for (file of selectedFiles(); track file.name) {
                          <div class="relative bg-primary-50 rounded-lg p-2">
                            <div class="text-sm text-primary-700 truncate">{{ file.name }}</div>
                            <div class="text-xs text-primary-500">{{ (file.size / 1024 / 1024).toFixed(2) }}MB</div>
                            <button
                              (click)="removeFile(file)"
                              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        }
                      </div>
                      <button
                        (click)="uploadPhotos()"
                        class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Upload {{ selectedFiles().length }} Photo{{ selectedFiles().length !== 1 ? 's' : '' }}
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- Photos Grid -->
              <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
                @if (photos().length === 0) {
                  <div class="p-12 text-center">
                    <svg class="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-primary-900 mb-2">No photos yet</h3>
                    <p class="text-primary-600 mb-4">Start by uploading your first photo to this album.</p>
                    @if (isAdmin()) {
                      <button
                        (click)="document.getElementById('file-upload')?.click()"
                        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Upload First Photo
                      </button>
                    }
                  </div>
                } @else {
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    @for (photo of photos(); track photo.id) {
                      <div class="group relative aspect-square">
                        @if (photo.downloadURL && !isPhotoFailed(photo.downloadURL)) {
                          <img
                            [src]="photo.downloadURL"
                            [alt]="photo.caption || 'Album photo'"
                            class="w-full h-full object-cover rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                            (click)="openPhotoModal(photo)"
                            (error)="onPhotoError(photo.downloadURL)"
                            loading="lazy"
                          />
                        } @else {
                          <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                        }
                        
                        <!-- Photo Actions Overlay -->
                        @if (isAdmin()) {
                          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
                            <button
                              (click)="deletePhoto(photo); $event.stopPropagation()"
                              class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        }

                        <!-- Photo Info Overlay -->
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          @if (photo.caption) {
                            <p class="text-white text-sm truncate">{{ photo.caption }}</p>
                          }
                          @if (uploaderNames().has(photo.uploadedBy)) {
                            <p class="text-gray-300 text-xs">by {{ uploaderNames().get(photo.uploadedBy) }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            </div>
          } @else if (activeTab() === 'members') {
            <!-- Members Tab -->
            <app-album-members
              [albumId]="album()!.id"
              [albumName]="album()!.name"
              (membersChanged)="loadAlbumData()"
            ></app-album-members>
          } @else if (activeTab() === 'invites' && isAdmin()) {
            <!-- Pending Invites Tab -->
            <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
              <div class="px-6 py-4 border-b border-primary-200">
                <h3 class="text-lg font-semibold text-primary-900">Pending Invitations</h3>
                <p class="text-sm text-primary-600">Manage invitations sent to join this album</p>
              </div>

              @if (pendingInvites().length === 0) {
                <div class="p-8 text-center">
                  <svg class="w-12 h-12 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <h4 class="text-lg font-medium text-primary-900 mb-2">No pending invitations</h4>
                  <p class="text-primary-600">All sent invitations have been responded to.</p>
                </div>
              } @else {
                <div class="divide-y divide-primary-200">
                  @for (invite of pendingInvites(); track invite.id) {
                    <div class="p-6 flex items-center justify-between">
                      <div>
                        <h4 class="font-medium text-primary-900">{{ invite.inviteeEmail }}</h4>
                        <p class="text-sm text-primary-600">
                          Invited {{ formatDate(invite.createdAt) }}
                          @if (invite.inviterDisplayName) {
                            by {{ invite.inviterDisplayName }}
                          }
                        </p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Pending
                        </span>
                        @if (isAdmin()) {
                          <button
                            (click)="cancelInvitation(invite)"
                            class="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Cancel invitation"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-primary-600">Loading album...</p>
          </div>
        </div>
      }
    </div>

    <!-- Photo Modal -->
    @if (selectedPhoto()) {
      <div class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <!-- Modal Header -->
        <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div class="text-white">
            @if (selectedPhoto()!.caption) {
              <h3 class="text-lg font-semibold">{{ selectedPhoto()!.caption }}</h3>
            }
            @if (uploaderNames().has(selectedPhoto()!.uploadedBy)) {
              <p class="text-gray-300 text-sm">by {{ uploaderNames().get(selectedPhoto()!.uploadedBy) }}</p>
            }
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Navigation buttons -->
            @if (photos().length > 1) {
              <button
                (click)="previousPhoto()"
                class="p-2 bg-primary-800 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                (click)="nextPhoto()"
                class="p-2 bg-primary-800 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          @if (selectedPhoto()!.downloadURL && !isPhotoFailed(selectedPhoto()!.downloadURL)) {
            <img
              [src]="selectedPhoto()!.downloadURL"
              [alt]="selectedPhoto()!.caption || 'Photo'"
              class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              (error)="onPhotoError(selectedPhoto()!.downloadURL)"
            />
          } @else {
            <div class="bg-gray-100 rounded-lg flex items-center justify-center w-64 h-64 shadow-2xl">
              <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          }
          
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

        <!-- Photo info -->
        <div class="absolute bottom-4 left-4 right-4 text-white text-center">
          @if (photos().length > 1) {
            <p class="text-sm text-gray-300">
              {{ selectedPhotoIndex() + 1 }} of {{ photos().length }}
            </p>
          }
        </div>
      </div>
    }

    <!-- Click outside to close menus -->
    @if (showAlbumMenu()) {
      <div 
        class="fixed inset-0 z-40" 
        (click)="showAlbumMenu.set(false)"
      ></div>
    }
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
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
  failedPhotoUrls = signal<Set<string>>(new Set());

  constructor() {
    // Update uploader names when photos change
    effect(() => {
      this.loadUploaderNames();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const albumId = params['id'];
      if (albumId) {
        this.loadAlbumData(albumId);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
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

  private async loadAlbumData(albumId?: string) {
    if (albumId) {
      await this.albumService.loadAlbumById(albumId);
      await this.albumService.loadAlbumPhotos(albumId);
    }
    
    // Load pending invitations if user is admin
    if (this.album() && this.isAdmin()) {
      this.loadPendingInvitations();
    }
  }

  private async loadPendingInvitations() {
    if (!this.album()) return;
    
    try {
      const invites = await this.invitationService.getAlbumInvitations(this.album()!.id);
      this.pendingInvites.set(invites);
    } catch (error) {
      console.error('Error loading pending invitations:', error);
    }
  }

  isAdmin(): boolean {
    const album = this.album();
    const currentUser = this.authService.currentUser();
    if (!album || !currentUser) return false;
    
    return album.admins.includes(currentUser.uid) || album.createdBy === currentUser.uid;
  }

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    this.selectedFiles.set(validFiles);
  }

  removeFile(fileToRemove: File) {
    const currentFiles = this.selectedFiles();
    this.selectedFiles.set(currentFiles.filter(file => file !== fileToRemove));
  }

  async uploadPhotos() {
    const files = this.selectedFiles();
    const album = this.album();
    
    if (files.length === 0 || !album) return;

    try {
      for (const file of files) {
        await this.albumService.uploadPhoto(album.id, file);
      }
      
      // Clear selected files
      this.selectedFiles.set([]);
      
      // Clear the file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Reload photos
      await this.albumService.loadAlbumPhotos(album.id);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload some photos. Please try again.');
    }
  }

  async deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to delete this photo?')) {
      const success = await this.albumService.deletePhoto(photo.id, photo.storagePath);
      if (success && this.album()) {
        await this.albumService.loadAlbumPhotos(this.album()!.id);
      }
    }
  }

  openPhotoModal(photo: Photo) {
    const photoIndex = this.photos().findIndex(p => p.id === photo.id);
    this.selectedPhoto.set(photo);
    this.selectedPhotoIndex.set(photoIndex);
  }

  closePhotoModal() {
    this.selectedPhoto.set(null);
    this.selectedPhotoIndex.set(0);
  }

  nextPhoto() {
    const photos = this.photos();
    const currentIndex = this.selectedPhotoIndex();
    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    
    this.selectedPhoto.set(photos[nextIndex]);
    this.selectedPhotoIndex.set(nextIndex);
  }

  previousPhoto() {
    const photos = this.photos();
    const currentIndex = this.selectedPhotoIndex();
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    
    this.selectedPhoto.set(photos[prevIndex]);
    this.selectedPhotoIndex.set(prevIndex);
  }

  private async loadUploaderNames() {
    const photos = this.photos();
    const currentNames = this.uploaderNames();
    const newNames = new Map(currentNames);
    
    for (const photo of photos) {
      if (!newNames.has(photo.uploadedBy)) {
        try {
          const userName = await this.authService.getUserDisplayName(photo.uploadedBy);
          newNames.set(photo.uploadedBy, userName || 'Unknown User');
        } catch (error) {
          console.error('Error loading uploader name:', error);
          newNames.set(photo.uploadedBy, 'Unknown User');
        }
      }
    }
    
    this.uploaderNames.set(newNames);
  }

  editAlbum() {
    this.showAlbumMenu.set(false);
    // TODO: Implement edit album functionality
    console.log('Edit album');
  }

  async deleteAlbum() {
    this.showAlbumMenu.set(false);
    const album = this.album();
    if (!album) return;

    if (confirm(`Are you sure you want to delete "${album.name}"? This action cannot be undone and will delete all photos in the album.`)) {
      const success = await this.albumService.deleteAlbum(album.id);
      if (success) {
        this.router.navigate(['/app/albums']);
      } else {
        alert('Failed to delete album. Please try again.');
      }
    }
  }

  async cancelInvitation(invitation: AlbumInvitation) {
    if (confirm(`Cancel invitation for ${invitation.inviteeEmail}?`)) {
      const success = await this.invitationService.cancelInvitation(invitation.id);
      if (success) {
        // Reload pending invitations
        await this.loadPendingInvitations();
      } else {
        alert('Failed to cancel invitation. Please try again.');
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

  onPhotoError(downloadURL: string) {
    const current = this.failedPhotoUrls();
    const updated = new Set(current);
    updated.add(downloadURL);
    this.failedPhotoUrls.set(updated);
  }

  isPhotoFailed(downloadURL: string): boolean {
    return this.failedPhotoUrls().has(downloadURL);
  }
}
