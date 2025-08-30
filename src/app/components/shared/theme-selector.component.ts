import { Component, inject, signal, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlbumTheme, ThemePreset } from '../../models/interfaces';
import { ThemeService } from '../../services/theme.service';
import { AlbumService } from '../../services/album.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Album Theme</h3>
        @if (selectedTheme()) {
          <button
            (click)="resetToDefault()"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            Reset to Default
          </button>
        }
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-8">
          <svg class="animate-spin h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="ml-2 text-gray-600">Applying theme...</span>
        </div>
      } @else {
        <div class="space-y-6">
          <!-- Current Theme Display -->
          @if (selectedTheme()) {
            <div class="border rounded-lg p-4 bg-gray-50">
              <div class="flex items-center space-x-3">
                <div class="flex space-x-1">
                  <div class="w-4 h-4 rounded-full" [style.background-color]="selectedTheme()!.primary"></div>
                  <div class="w-4 h-4 rounded-full" [style.background-color]="selectedTheme()!.secondary"></div>
                  <div class="w-4 h-4 rounded-full" [style.background-color]="selectedTheme()!.accent"></div>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ selectedTheme()!.name }}</h4>
                  <p class="text-sm text-gray-600">Current theme</p>
                </div>
              </div>
            </div>
          }

          <!-- Free Themes -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Free Themes</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (preset of freeThemes; track preset.id) {
                <div 
                  class="cursor-pointer border rounded-lg p-3 hover:shadow-md transition-shadow"
                  [class.ring-2]="selectedTheme()?.id === preset.id"
                  [class.ring-blue-500]="selectedTheme()?.id === preset.id"
                  (click)="selectTheme(preset.theme)"
                >
                  <div class="flex space-x-1 mb-2">
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.primary"></div>
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.secondary"></div>
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.accent"></div>
                  </div>
                  <h5 class="text-sm font-medium text-gray-900">{{ preset.name }}</h5>
                  <p class="text-xs text-gray-600">{{ preset.description }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Premium Themes -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">Premium Themes</h4>
              @if (!canUsePremiumThemes()) {
                <span class="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Pro/Premium Only</span>
              }
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (preset of premiumThemes; track preset.id) {
                <div 
                  class="cursor-pointer border rounded-lg p-3 transition-shadow relative"
                  [class.hover:shadow-md]="canUsePremiumThemes()"
                  [class.ring-2]="selectedTheme()?.id === preset.id && canUsePremiumThemes()"
                  [class.ring-blue-500]="selectedTheme()?.id === preset.id && canUsePremiumThemes()"
                  [class.opacity-60]="!canUsePremiumThemes()"
                  [class.cursor-not-allowed]="!canUsePremiumThemes()"
                  (click)="selectTheme(preset.theme)"
                >
                  @if (!canUsePremiumThemes()) {
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  }
                  <div class="flex space-x-1 mb-2">
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.primary"></div>
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.secondary"></div>
                    <div class="w-3 h-3 rounded-full" [style.background-color]="preset.theme.accent"></div>
                  </div>
                  <h5 class="text-sm font-medium text-gray-900">{{ preset.name }}</h5>
                  <p class="text-xs text-gray-600">{{ preset.description }}</p>
                </div>
              }
            </div>
          </div>

          @if (!canUsePremiumThemes()) {
            <div class="text-center py-4 border-t">
              <p class="text-sm text-gray-600 mb-3">Unlock premium themes with Pro or Premium plan</p>
              <button 
                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
                (click)="upgradeToPremium()"
              >
                Upgrade Now
              </button>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">{{ error() }}</p>
        </div>
      }

      @if (success()) {
        <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-600 text-sm">{{ success() }}</p>
        </div>
      }
    </div>
  `
})
export class ThemeSelectorComponent implements OnInit, OnChanges {
  @Input() albumId: string = '';
  @Input() currentTheme?: AlbumTheme;
  @Output() themeChanged = new EventEmitter<AlbumTheme>();

  private themeService = inject(ThemeService);
  private albumService = inject(AlbumService);
  private authService = inject(AuthService);

  selectedTheme = signal<AlbumTheme | null>(null);
  isLoading = signal(false);
  error = signal<string>('');
  success = signal<string>('');

  freeThemes: ThemePreset[] = [];
  premiumThemes: ThemePreset[] = [];

  ngOnInit() {
    this.loadThemes();
    this.selectedTheme.set(this.currentTheme || null);
  }

  ngOnChanges() {
    this.selectedTheme.set(this.currentTheme || null);
  }

  loadThemes() {
    this.freeThemes = this.themeService.getFreeThemes();
    this.premiumThemes = this.themeService.getPremiumThemes();
  }

  async selectTheme(theme: AlbumTheme) {
    if (theme.isPremium && !this.canUsePremiumThemes()) {
      this.error.set('Premium themes require Pro or Premium subscription');
      setTimeout(() => this.error.set(''), 3000);
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.success.set('');

    try {
      const success = await this.albumService.updateAlbumTheme(this.albumId, theme);
      
      if (success) {
        this.selectedTheme.set(theme);
        this.themeChanged.emit(theme);
        this.success.set(`Theme "${theme.name}" applied successfully!`);
        setTimeout(() => this.success.set(''), 3000);
      } else {
        this.error.set('Failed to apply theme. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error selecting theme:', error);
      this.error.set('An error occurred while applying the theme.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetToDefault() {
    this.isLoading.set(true);
    this.error.set('');
    this.success.set('');

    try {
      const success = await this.albumService.removeAlbumTheme(this.albumId);
      
      if (success) {
        this.selectedTheme.set(null);
        this.themeChanged.emit(this.themeService.getDefaultTheme());
        this.success.set('Theme reset to default successfully!');
        setTimeout(() => this.success.set(''), 3000);
      } else {
        this.error.set('Failed to reset theme. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error resetting theme:', error);
      this.error.set('An error occurred while resetting the theme.');
    } finally {
      this.isLoading.set(false);
    }
  }

  canUsePremiumThemes(): boolean {
    const user = this.authService.currentUser();
    return user?.planType === 'pro' || user?.planType === 'premium';
  }

  upgradeToPremium() {
    // Navigate to subscription page or emit upgrade event
    window.location.href = '/app/subscription';
  }
}
