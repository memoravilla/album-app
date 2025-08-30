import { User } from '../../models/interfaces';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { updateProfile } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { from } from 'rxjs';
import { Router } from '@angular/router';

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
                <h1 class="text-3xl font-bold mb-2">{{ currentUser()?.displayName }}</h1>
                <p class="text-primary-100 mb-1">{{ currentUser()?.email }}</p>
                <p class="text-primary-200 text-sm">
                  Member since {{ formatDate(currentUser()?.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Profile Content -->
          <div class="p-8">
            @if (isEditing()) {
              <!-- Edit Mode -->
              <form (ngSubmit)="saveProfile()" class="space-y-6">
                <div>
                  <label for="displayName" class="block text-sm font-medium text-primary-900 mb-2">
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    [(ngModel)]="editForm.displayName"
                    name="displayName"
                    required
                    class="w-full px-4 py-3 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label for="bio" class="block text-sm font-medium text-primary-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    [(ngModel)]="editForm.bio"
                    name="bio"
                    rows="4"
                    class="w-full px-4 py-3 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself"
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-primary-900 mb-2">
                    Profile Picture
                  </label>
                  <div class="flex items-center space-x-4">
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
                    
                    <button
                      type="button"
                      (click)="photoInput.click()"
                      class="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Change Photo
                    </button>
                    
                    @if (selectedPhotoFile()) {
                      <button
                        type="button"
                        (click)="removePhoto()"
                        class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    }
                  </div>
                </div>

                @if (errorMessage()) {
                  <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-red-600 text-sm">{{ errorMessage() }}</p>
                  </div>
                }

                @if (successMessage()) {
                  <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-green-600 text-sm">{{ successMessage() }}</p>
                  </div>
                }

                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="cancelEdit()"
                    class="px-6 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="isSaving() || !editForm.displayName"
                    class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    @if (isSaving()) {
                      <div class="flex items-center">
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    } @else {
                      Save Changes
                    }
                  </button>
                </div>
              </form>
            } @else {
              <!-- View Mode -->
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <h2 class="text-2xl font-semibold text-primary-900 mb-4">Profile Information</h2>
                  </div>
                  <button
                    (click)="startEdit()"
                    class="flex items-center px-4 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Profile
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-primary-700 mb-1">Full Name</label>
                      <p class="text-primary-900 text-lg">{{ currentUser()?.displayName || 'Not set' }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-primary-700 mb-1">Email Address</label>
                      <p class="text-primary-900">{{ currentUser()?.email }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-primary-700 mb-1">Member Since</label>
                      <p class="text-primary-900">{{ formatDate(currentUser()?.createdAt) }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-primary-700 mb-1">Current Plan</label>
                      <div class="flex items-center space-x-3">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                              [ngClass]="{
                                'bg-gray-100 text-gray-700': currentUser()?.planType === 'basic',
                                'bg-blue-100 text-blue-700': currentUser()?.planType === 'pro',
                                'bg-purple-100 text-purple-700': currentUser()?.planType === 'premium'
                              }">
                          {{ getPlanDisplayName() }} Plan
                        </span>
                        @if (currentUser()?.planType === 'basic') {
                          <button
                            (click)="upgradePlan()"
                            class="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                          >
                            Upgrade
                          </button>
                        }
                      </div>
                      @if (currentUser()?.planExpiresAt && currentUser()?.planType !== 'basic') {
                        <p class="text-xs text-gray-500 mt-1">
                          Expires {{ formatDate(currentUser()?.planExpiresAt) }}
                        </p>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-primary-700 mb-1">Bio</label>
                    @if (currentUser()?.bio) {
                      <p class="text-primary-900 leading-relaxed">{{ currentUser()?.bio }}</p>
                    } @else {
                      <p class="text-primary-500 italic">No bio added yet</p>
                    }
                  </div>
                </div>

                @if (successMessage()) {
                  <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-green-600 text-sm">{{ successMessage() }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Account Actions -->
        <div class="mt-8 bg-white rounded-xl shadow-sm border border-primary-100 p-6">
          <h3 class="text-lg font-semibold text-primary-900 mb-4">Account Actions</h3>
          
          <div class="flex flex-wrap gap-4">
            <button
              (click)="changePassword()"
              class="flex items-center px-4 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
              Change Password
            </button>
            
            <button
              (click)="signOut()"
              class="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    @if (showPasswordModal()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold text-primary-900 mb-4">Change Password</h2>
          
          @if (passwordError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              {{ passwordError() }}
            </div>
          }

          <form (submit)="submitPasswordChange(); $event.preventDefault()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-primary-700 mb-1">Current Password</label>
              <input
                type="password"
                [value]="currentPasswordForm()"
                (input)="onCurrentPasswordChange($event)"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                [disabled]="isChangingPassword()"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-primary-700 mb-1">New Password</label>
              <input
                type="password"
                [value]="newPasswordForm()"
                (input)="onNewPasswordChange($event)"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minlength="6"
                [disabled]="isChangingPassword()"
              >
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-primary-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                [value]="confirmPasswordForm()"
                (input)="onConfirmPasswordChange($event)"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minlength="6"
                [disabled]="isChangingPassword()"
              >
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                (click)="closePasswordModal()"
                class="flex-1 px-4 py-2 text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                [disabled]="isChangingPassword()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                [disabled]="isChangingPassword()"
              >
                @if (isChangingPassword()) {
                  <span>Changing...</span>
                } @else {
                  <span>Change Password</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private storage = inject(Storage);
  private router = inject(Router);

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
  }

  startEdit() {
    this.resetForm();
    this.isEditing.set(true);
    this.clearMessages();
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedPhotoFile.set(null);
    this.previewUrl.set('');
    this.clearMessages();
    this.resetForm();
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedPhotoFile.set(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    event.target.value = '';
  }

  removePhoto() {
    this.selectedPhotoFile.set(null);
    this.previewUrl.set('');
  }

  async saveProfile() {
    if (!this.editForm.displayName.trim()) return;

    try {
      this.isSaving.set(true);
      this.clearMessages();

      const updates: Partial<User> = {
        displayName: this.editForm.displayName.trim(),
        bio: this.editForm.bio.trim() || undefined
      };

      // Handle photo upload to Firebase Storage
      const selectedFile = this.selectedPhotoFile();
      if (selectedFile) {
        try {
          const currentUser = this.currentUser();
          if (currentUser) {
            // Create a reference to the storage location
            const photoRef = ref(this.storage, `profile-photos/${currentUser.uid}`);
            
            // Upload the file
            const snapshot = await uploadBytes(photoRef, selectedFile);
            
            // Get the download URL
            const photoURL = await getDownloadURL(snapshot.ref);
            
            updates.photoURL = photoURL;
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          this.errorMessage.set('Failed to upload photo. Please try again.');
          return;
        }
      }

      const success = await this.authService.updateUserProfile(updates);

      if (success) {
        this.successMessage.set('Profile updated successfully!');
        this.isEditing.set(false);
        this.selectedPhotoFile.set(null);
        this.previewUrl.set('');
        
        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      this.errorMessage.set('An error occurred while updating your profile.');
    } finally {
      this.isSaving.set(false);
    }
  }

  // Password change modal
  showPasswordModal = signal(false);
  currentPasswordForm = signal('');
  newPasswordForm = signal('');
  confirmPasswordForm = signal('');
  passwordError = signal<string | null>(null);
  isChangingPassword = signal(false);

  changePassword() {
    this.showPasswordModal.set(true);
    this.currentPasswordForm.set('');
    this.newPasswordForm.set('');
    this.confirmPasswordForm.set('');
    this.passwordError.set(null);
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
    this.passwordError.set(null);
  }

  async submitPasswordChange() {
    const currentPassword = this.currentPasswordForm();
    const newPassword = this.newPasswordForm();
    const confirmPassword = this.confirmPasswordForm();

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      this.passwordError.set('New password must be at least 6 characters');
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordError.set(null);

    try {
      await this.authService.changePassword(currentPassword, newPassword);
      this.closePasswordModal();
      alert('Password changed successfully!');
    } catch (error: any) {
      this.passwordError.set(error.message || 'Failed to change password');
    } finally {
      this.isChangingPassword.set(false);
    }
  }

  onCurrentPasswordChange(event: Event) {
    this.currentPasswordForm.set((event.target as HTMLInputElement).value);
  }

  onNewPasswordChange(event: Event) {
    this.newPasswordForm.set((event.target as HTMLInputElement).value);
  }

  onConfirmPasswordChange(event: Event) {
    this.confirmPasswordForm.set((event.target as HTMLInputElement).value);
  }

  async signOut() {
    if (confirm('Are you sure you want to sign out?')) {
      await this.authService.signOut();
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      
      return actualDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  }

  getPlanDisplayName(): string {
    const user = this.currentUser();
    if (!user || !user.planType) return 'Basic';
    
    return user.planType.charAt(0).toUpperCase() + user.planType.slice(1);
  }

  upgradePlan() {
    // Navigate to the upgrade page
    // this.router.navigate(['/app/subscription']);
  }

  private clearMessages() {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
