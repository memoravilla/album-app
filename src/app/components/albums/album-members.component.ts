import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AlbumService } from '../../services/album.service';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';
import { AlbumMember } from '../../models/interfaces';

@Component({
  selector: 'app-album-members',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Add Member Form (Admin Only) -->
      @if (isAdmin()) {
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Invite Members</h3>
          
          <form [formGroup]="inviteForm" (ngSubmit)="inviteMember()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter email address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              @if (inviteForm.get('email')?.errors?.['required'] && inviteForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Email is required</p>
              }
              @if (inviteForm.get('email')?.errors?.['email'] && inviteForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
              }
            </div>

            @if (inviteError()) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm">{{ inviteError() }}</p>
              </div>
            }

            @if (inviteSuccess()) {
              <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-green-600 text-sm">{{ inviteSuccess() }}</p>
              </div>
            }

            <button
              type="submit"
              [disabled]="!inviteForm.valid || isInviting()"
              class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isInviting()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              } @else {
                Send Invitation
              }
            </button>
          </form>
        </div>
      }

      <!-- Members List -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Members ({{ members().length }})
          </h3>
        </div>

        @if (isLoading()) {
          <div class="p-6 text-center">
            <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 mt-2">Loading members...</p>
          </div>
        } @else if (members().length === 0) {
          <div class="p-6 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p>No members yet</p>
          </div>
        } @else {
          <div class="divide-y divide-gray-200">
            @for (member of members(); track member.uid) {
              <div class="p-6 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  @if (member.photoURL) {
                    <img
                      [src]="member.photoURL"
                      [alt]="member.displayName"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                  } @else {
                    <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-sm font-medium">
                        {{ getInitials(member.displayName) }}
                      </span>
                    </div>
                  }

                  <div>
                    <h4 class="text-sm font-medium text-gray-900">
                      {{ member.displayName }}
                      @if (member.role === 'admin') {
                        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Admin
                        </span>
                      }
                    </h4>
                    <p class="text-sm text-gray-500">{{ member.email }}</p>
                    <p class="text-xs text-gray-400">Joined {{ formatDate(member.joinedAt) }}</p>
                  </div>
                </div>

                <!-- Actions (Admin Only) -->
                @if (isAdmin() && member.uid !== currentUser()?.uid) {
                  <div class="flex items-center space-x-2">
                    @if (member.role === 'member') {
                      <button
                        (click)="promoteToAdmin(member)"
                        class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Make Admin
                      </button>
                    }
                    
                    <button
                      (click)="removeMember(member)"
                      class="text-sm text-red-600 hover:text-red-700 font-medium ml-4"
                    >
                      Remove
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AlbumMembersComponent {
  @Input() albumId: string = '';
  @Input() albumName: string = '';
  @Output() membersChanged = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private albumService = inject(AlbumService);
  private invitationService = inject(InvitationService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  members = signal<AlbumMember[]>([]);
  isLoading = signal(false);
  isInviting = signal(false);
  inviteError = signal<string>('');
  inviteSuccess = signal<string>('');
  isAdmin = signal(false);

  inviteForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    if (this.albumId) {
      this.loadMembers();
      this.checkAdminStatus();
    }
  }

  async loadMembers() {
    this.isLoading.set(true);
    try {
      const members = await this.albumService.getAlbumMembers(this.albumId);
      this.members.set(members);
    } catch (error) {
      console.error('❌ Error loading members:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkAdminStatus() {
    const currentUser = this.currentUser();
    if (currentUser) {
      const isAdmin = await this.albumService.isUserAlbumAdmin(this.albumId, currentUser.uid);
      this.isAdmin.set(isAdmin);
    }
  }

  async inviteMember() {
    if (!this.inviteForm.valid) return;

    const email = this.inviteForm.get('email')?.value;
    if (!email) return;

    this.isInviting.set(true);
    this.inviteError.set('');
    this.inviteSuccess.set('');

    try {
      const success = await this.invitationService.inviteUserToAlbum(
        this.albumId,
        this.albumName,
        email
      );

      if (success) {
        this.inviteSuccess.set(`Invitation sent to ${email}`);
        this.inviteForm.reset();
        setTimeout(() => this.inviteSuccess.set(''), 3000);
      } else {
        this.inviteError.set('Failed to send invitation. User may already be invited or be a member.');
      }
    } catch (error) {
      console.error('❌ Error inviting member:', error);
      this.inviteError.set('An error occurred while sending the invitation.');
    } finally {
      this.isInviting.set(false);
    }
  }

  async removeMember(member: AlbumMember) {
    if (confirm(`Are you sure you want to remove ${member.displayName} from this album?`)) {
      try {
        const success = await this.albumService.removeMemberFromAlbum(this.albumId, member.uid);
        if (success) {
          await this.loadMembers();
          this.membersChanged.emit();
        }
      } catch (error) {
        console.error('❌ Error removing member:', error);
      }
    }
  }

  async promoteToAdmin(member: AlbumMember) {
    if (confirm(`Are you sure you want to make ${member.displayName} an admin?`)) {
      try {
        const success = await this.albumService.promoteToAdmin(this.albumId, member.uid);
        if (success) {
          await this.loadMembers();
          this.membersChanged.emit();
        }
      } catch (error) {
        console.error('❌ Error promoting to admin:', error);
      }
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
      
      return actualDate.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  }
}
