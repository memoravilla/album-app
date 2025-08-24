import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
            <RouterLink
              routerLink="/dashboard"
              routerLinkActive="text-primary-700"
              [routerLinkActiveOptions]="{exact: false}"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              routerLink="/albums"
              routerLinkActive="text-primary-700"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              My Albums
            </RouterLink>
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
                  
                  <RouterLink
                    routerLink="/profile"
                    (click)="closeUserMenu()"
                    class="flex items-center px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Edit Profile
                  </RouterLink>
                  
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
              <RouterLink
                routerLink="/dashboard"
                (click)="closeMobileMenu()"
                class="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md text-base font-medium transition-colors"
              >
                Dashboard
              </RouterLink>
              <RouterLink
                routerLink="/albums"
                (click)="closeMobileMenu()"
                class="block px-3 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md text-base font-medium transition-colors"
              >
                My Albums
              </RouterLink>
            </div>
          </div>
        }
      </div>
    </nav>

    <!-- Click outside to close menus -->
    @if (showUserMenu() || showMobileMenu()) {
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

  user = this.authService.currentUser;
  showUserMenu = signal(false);
  showMobileMenu = signal(false);

  toggleUserMenu() {
    this.showUserMenu.set(!this.showUserMenu());
    this.showMobileMenu.set(false);
  }

  toggleMobileMenu() {
    this.showMobileMenu.set(!this.showMobileMenu());
    this.showUserMenu.set(false);
  }

  closeUserMenu() {
    this.showUserMenu.set(false);
  }

  closeMobileMenu() {
    this.showMobileMenu.set(false);
  }

  closeAllMenus() {
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
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
