import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-sm border-b border-primary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/dashboard" class="text-2xl font-bold text-primary-900">
              Memoravilla
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-primary-100 text-primary-800 font-semibold"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Dashboard
            </a>
            <a
              routerLink="/albums"
              routerLinkActive="bg-primary-100 text-primary-800 font-semibold"
              class="text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              My Albums
            </a>

            <!-- Notifications -->
            <div class="relative">
              <button
                (click)="toggleNotifications()"
                class="relative p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3.403-3.403A2.998 2.998 0 0016 11V7a6 6 0 10-12 0v4c0 .655-.126 1.283-.403 1.838L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (notificationService.unreadCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {{ notificationService.unreadCount() }}
                  </span>
                }
              </button>

              <!-- Notifications Dropdown -->
              @if (showNotifications()) {
                <div class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div class="p-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
                      @if (notificationService.unreadCount() > 0) {
                        <button
                          (click)="markAllAsRead()"
                          class="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Mark all read
                        </button>
                      }
                    </div>
                  </div>
                  
                  <div class="max-h-96 overflow-y-auto">
                    @if (notificationService.notifications().length === 0) {
                      <div class="p-4 text-center text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3.403-3.403A2.998 2.998 0 0016 11V7a6 6 0 10-12 0v4c0 .655-.126 1.283-.403 1.838L0 17h5m10 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        <p>No notifications</p>
                      </div>
                    } @else {
                      @for (notification of notificationService.notifications(); track notification.id) {
                        <div 
                          class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          [class.bg-blue-50]="!notification.read"
                          [class.bg-yellow-50]="notification.id.startsWith('invitation_')"
                          (click)="handleNotificationClick(notification)"
                        >
                          <div class="flex items-start space-x-3">
                            <div class="flex-shrink-0">
                              @if (notification.type === 'album_invitation') {
                                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                  </svg>
                                </div>
                              } @else {
                                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                  </svg>
                                </div>
                              }
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                              <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                              <p class="text-xs text-gray-400 mt-1">{{ formatDate(notification.createdAt) }}</p>
                              
                              @if (notification.type === 'album_invitation') {
                                <div class="flex space-x-2 mt-2">
                                  <button
                                    (click)="respondToInvitation(notification.data.invitationId, 'accepted'); $event.stopPropagation()"
                                    class="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    (click)="respondToInvitation(notification.data.invitationId, 'declined'); $event.stopPropagation()"
                                    class="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                                  >
                                    Decline
                                  </button>
                                </div>
                              }
                            </div>
                            @if (!notification.read || notification.id.startsWith('invitation_')) {
                              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- User Menu -->
          <div class="relative">
            <button
              (click)="toggleUserMenu()"
              class="flex items-center space-x-3 text-sm bg-white border border-primary-200 rounded-full p-2 hover:shadow-md transition-shadow"
            >
              @if (user()?.photoURL) {
                <img
                  [src]="user()?.photoURL"
                  [alt]="user()?.displayName"
                  class="w-8 h-8 rounded-full object-cover"
                />
              } @else {
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ getInitials(user()?.displayName || '') }}
                  </span>
                </div>
              }
              
              <span class="hidden sm:block text-primary-900 font-medium">
                {{ user()?.displayName }}
              </span>
              
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            <!-- Dropdown Menu -->
            @if (showUserMenu()) {
              <div class="absolute right-0 mt-2 w-56 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
                <div class="py-1">
                  <div class="px-4 py-3 border-b border-primary-100">
                    <p class="text-sm font-medium text-primary-900">{{ user()?.displayName }}</p>
                    <p class="text-sm text-primary-500">{{ user()?.email }}</p>
                  </div>
                  
                  <a
                    routerLink="/profile"
                    routerLinkActive="bg-primary-100 text-primary-800 font-semibold"
                    (click)="closeUserMenu()"
                    class="flex items-center px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors rounded-md mx-2"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Edit Profile
                  </a>
                  
                  <button
                    (click)="signOut()"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              (click)="toggleMobileMenu()"
              class="text-primary-600 hover:text-primary-700 p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        @if (showMobileMenu()) {
          <div class="md:hidden border-t border-primary-100">
            <div class="px-2 pt-2 pb-3 space-y-1">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-primary-100 text-primary-800 font-semibold"
                [routerLinkActiveOptions]="{exact: false}"
                (click)="closeMobileMenu()"
                class="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md text-base font-medium transition-all"
              >
                Dashboard
              </a>
              <a
                routerLink="/albums"
                routerLinkActive="bg-primary-100 text-primary-800 font-semibold"
                (click)="closeMobileMenu()"
                class="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md text-base font-medium transition-all"
              >
                My Albums
              </a>
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Click outside to close menus -->
    @if (showUserMenu() || showMobileMenu() || showNotifications()) {
      <div 
        class="fixed inset-0 z-40" 
        (click)="closeAllMenus()"
      ></div>
    }
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  protected notificationService = inject(NotificationService);
  private invitationService = inject(InvitationService);

  user = this.authService.currentUser;
  showUserMenu = signal(false);
  showMobileMenu = signal(false);
  showNotifications = signal(false);

  toggleUserMenu() {
    this.showUserMenu.set(!this.showUserMenu());
    this.showMobileMenu.set(false);
    this.showNotifications.set(false);
  }

  toggleMobileMenu() {
    this.showMobileMenu.set(!this.showMobileMenu());
    this.showUserMenu.set(false);
    this.showNotifications.set(false);
  }

  toggleNotifications() {
    this.showNotifications.set(!this.showNotifications());
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  closeMobileMenu() {
    this.showMobileMenu.set(false);
  }

  closeNotifications() {
    this.showNotifications.set(false);
  }

  closeAllMenus() {
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
    this.showNotifications.set(false);
  }

  async markAllAsRead() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      await this.notificationService.markAllAsRead(currentUser.uid);
    }
  }

  async handleNotificationClick(notification: any) {
    // Don't mark invitation notifications as read since they are pending invitations
    if (!notification.read && !notification.id.startsWith('invitation_')) {
      await this.notificationService.markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.type === 'album_invitation' && notification.data?.albumId) {
      this.router.navigate(['/albums', notification.data.albumId]);
    }
    
    this.closeNotifications();
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined') {
    const success = await this.invitationService.respondToInvitation(invitationId, response);
    if (success) {
      console.log(`✅ Invitation ${response}`);
      // Refresh notifications to remove the responded invitation
      await this.notificationService.refreshNotifications();
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async signOut() {
    this.closeAllMenus();
    await this.authService.signOut();
  }
}
