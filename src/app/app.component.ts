import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    @if (authService.isInitialized()) {
      <router-outlet></router-outlet>
    } @else {
      <div class="min-h-screen bg-beige-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p class="text-primary-600 font-medium">Initializing Memoravilla...</p>
          <p class="text-primary-400 text-sm mt-2">Setting up authentication...</p>
        </div>
      </div>
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'memoravilla';
  protected authService = inject(AuthService);
  
  constructor() {
    console.log('🚀 App Component initialized');
    console.log('🔄 Auth service initialization status:', this.authService.isInitialized());
    console.log('👤 Current user at startup:', this.authService.currentUser());
  }
}
