import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/interfaces';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { updateProfile } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-beige-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-xl shadow-sm border border-primary-100 overflow-hidden">
          <!-- Profile Header -->
          <div class="bg-gradient-to-r from-primary-500 to-beige-500 px-8 py-12">
            <div class="flex items-center space-x-6">
              @if (currentUser()?.photoURL && !profileImageError()) {
                <img
                  [src]="currentUser()?.photoURL"
                  [alt]="currentUser()?.displayName"
                  class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  (error)="profileImageError.set(true)"
                />
              } @else {
                <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span class="text-3xl font-bold text-primary-600">
                    {{ getInitials(currentUser()?.displayName || '') }}
                  </span>
                </div>
              }

              <div class="text-white">
                <h1 class="text-3xl font-bold mb-2">{{ currentUser()?.displayName || 'User' }}</h1>
                <p class="text-primary-100 mb-1">{{ currentUser()?.email }}</p>
                @if (currentUser()?.bio) {
                  <p class="text-primary-200 text-sm">{{ currentUser()?.bio }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Profile Content -->
          <div class="p-8">
            @if (!isEditing()) {
              <!-- View Mode -->
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-xl font-semibold text-primary-900 mb-4">Profile Information</h2>
                  </div>
                  <button
                    (click)="startEditing()"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-primary-700 mb-1">Display Name</label>
                    <p class="text-primary-900 bg-primary-50 px-3 py-2 rounded-lg">
                      {{ currentUser()?.displayName || 'Not set' }}
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-primary-700 mb-1">Email</label>
                    <p class="text-primary-900 bg-primary-50 px-3 py-2 rounded-lg">
                      {{ currentUser()?.email }}
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-primary-700 mb-1">Bio</label>
                  <p class="text-primary-900 bg-primary-50 px-3 py-2 rounded-lg min-h-[80px]">
                    {{ currentUser()?.bio || 'Tell us about yourself...' }}
                  </p>
                </div>
              </div>
            } @else {
              <!-- Edit Mode -->
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <h2 class="text-xl font-semibold text-primary-900">Edit Profile</h2>
                  <div class="space-x-2">
                    <button
                      (click)="cancelEditing()"
                      class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      (click)="saveProfile()"
                      [disabled]="isSaving()"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      @if (isSaving()) {
                        Saving...
                      } @else {
                        Save Changes
                      }
                    </button>
                  </div>
                </div>

                <!-- Profile Photo Upload -->
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onPhotoSelected($event)"
                      class="hidden"
                      #photoInput
                    />
                    
                    @if (previewUrl()) {
                      <img
                        [src]="previewUrl()"
                        alt="Preview"
                        class="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
                      />
                    } @else if (currentUser()?.photoURL && !editImageError()) {
                      <img
                        [src]="currentUser()?.photoURL"
                        [alt]="currentUser()?.displayName"
                        class="w-20 h-20 rounded-full object-cover border-2 border-primary-200"
                        (error)="editImageError.set(true)"
                      />
                    } @else {
                      <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center border-2 border-primary-200">
                        <span class="text-xl font-medium text-primary-600">
                          {{ getInitials(editForm.displayName) }}
                        </span>
                      </div>
                    }
                  </div>
                  
                  <button
                    (click)="photoInput.click()"
                    class="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                  >
                    Change Photo
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="displayName" class="block text-sm font-medium text-primary-700 mb-1">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      [(ngModel)]="editForm.displayName"
                      placeholder="Enter your display name"
                      class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-primary-700 mb-1">Email</label>
                    <input
                      type="email"
                      [value]="currentUser()?.email"
                      disabled
                      class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                    <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div>
                  <label for="bio" class="block text-sm font-medium text-primary-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    [(ngModel)]="editForm.bio"
                    rows="4"
                    placeholder="Tell us about yourself"
                    class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>
              </div>
            }

            <!-- Error and Success Messages -->
            @if (errorMessage()) {
              <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex">
                  <svg class="w-5 h-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-red-600">{{ errorMessage() }}</p>
                </div>
              </div>
            }

            @if (successMessage()) {
              <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex">
                  <svg class="w-5 h-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-sm text-green-600">{{ successMessage() }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private storage = inject(Storage);

  currentUser = this.authService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  selectedPhotoFile = signal<File | null>(null);
  previewUrl = signal<string>('');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  profileImageError = signal(false);
  editImageError = signal(false);

  editForm = {
    displayName: '',
    bio: ''
  };

  constructor() {
    // Reset image errors when user changes
    effect(() => {
      const currentUser = this.currentUser();
      this.profileImageError.set(false);
      this.editImageError.set(false);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.resetForm();
  }

  private resetForm() {
    const user = this.currentUser();
    if (user) {
      this.editForm = {
        displayName: user.displayName || '',
        bio: user.bio || ''
      };
    }
    this.selectedPhotoFile.set(null);
    this.previewUrl.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  startEditing() {
    this.isEditing.set(true);
    this.resetForm();
  }

  cancelEditing() {
    this.isEditing.set(false);
    this.resetForm();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.errorMessage.set('Image size must be less than 5MB');
        return;
      }

      this.selectedPhotoFile.set(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      this.errorMessage.set('');
    } else {
      this.errorMessage.set('Please select a valid image file');
    }
  }

  async saveProfile() {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser?.auth) {
        throw new Error('No authenticated user found');
      }

      let photoURL = currentUser.photoURL;

      // Upload photo if selected
      if (this.selectedPhotoFile()) {
        const file = this.selectedPhotoFile()!;
        const storageRef = ref(this.storage, `profile-photos/${currentUser.uid}/${file.name}`);
        
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser.auth, {
        displayName: this.editForm.displayName,
        photoURL: photoURL
      });

      // Update local user data
      await this.authService.updateUserProfile({
        displayName: this.editForm.displayName,
        bio: this.editForm.bio,
        photoURL: photoURL
      });

      this.successMessage.set('Profile updated successfully!');
      this.isEditing.set(false);
      
      // Clear form
      this.selectedPhotoFile.set(null);
      this.previewUrl.set('');

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      this.errorMessage.set('Failed to update profile. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
