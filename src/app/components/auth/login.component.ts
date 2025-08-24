import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-beige-50 to-primary-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary-900 mb-2">Memoravilla</h1>
          <p class="text-primary-700">Sign in to your account</p>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600 text-sm">{{ errorMessage() }}</p>
            </div>
          }

          @if (!isOnline()) {
            <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-yellow-800 text-sm">You're currently offline. Some features may not work properly.</p>
              </div>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-primary-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              @if (loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Email is required</p>
              }
              @if (loginForm.get('email')?.errors?.['email'] && loginForm.get('email')?.touched) {
                <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-primary-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-3 rounded-lg border border-primary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              @if (loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched) {
                <p class="mt-1 text-sm text-red-600">Password is required</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="authService.isLoading() || !loginForm.valid"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (authService.isLoading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-primary-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-primary-500">Or continue with</span>
              </div>
            </div>

            <button
              (click)="signInWithGoogle()"
              [disabled]="authService.isLoading()"
              class="mt-4 w-full flex items-center justify-center px-4 py-3 border border-primary-200 rounded-lg shadow-sm text-primary-700 bg-white hover:bg-primary-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p class="mt-8 text-center text-sm text-primary-600">
            Don't have an account?
            <a routerLink="/auth/register" class="font-medium text-primary-700 hover:text-primary-800">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authService = inject(AuthService);

  errorMessage = signal<string>('');
  isOnline = signal<boolean>(NetworkService.isOnline());

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    // Listen for network changes
    NetworkService.onNetworkChange((online) => {
      this.isOnline.set(online);
      if (!online) {
        this.errorMessage.set('No internet connection detected. Please check your network.');
      } else if (this.errorMessage() && this.errorMessage().includes('internet connection')) {
        this.errorMessage.set('');
      }
    });

    // Check if user is already authenticated after auth initialization
    effect(() => {
      if (this.authService.isInitialized() && this.authService.currentUser()) {
        console.log('Login component: User already authenticated, redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit() {
    // Additional check on component init in case effect doesn't catch it
    if (this.authService.currentUser()) {
      console.log('Login component: User already authenticated on init, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      console.log('Login component: Starting email sign-in...');
      const success = await this.authService.signInWithEmail(email!, password!);
      
      if (success) {
        console.log('Login component: Email sign-in successful, user:', this.authService.currentUser());
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Invalid email or password. Please try again.');
      }
    }
  }

  async signInWithGoogle() {
    // Check network connectivity
    if (!NetworkService.isOnline()) {
      this.errorMessage.set('No internet connection. Please check your network and try again.');
      return;
    }

    this.errorMessage.set('');
    
    try {
      console.log('Login component: Starting Google sign-in...');
      const success = await this.authService.signInWithGoogle();
      
      if (success) {
        console.log('Login component: Google sign-in successful, user:', this.authService.currentUser());
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Google sign-in was cancelled or failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Google sign-in error in component:', error);
      
      // If popup failed due to blocking, try redirect
      if (error.message && error.message.includes('Popup blocked')) {
        console.log('Popup blocked, trying redirect method...');
        try {
          await this.authService.signInWithGoogleRedirect();
          // Redirect method will navigate away from this page
        } catch (redirectError) {
          console.error('Redirect method also failed:', redirectError);
          this.errorMessage.set('Google sign-in failed. Please enable popups or try again.');
        }
      } else {
        if (error.message) {
          this.errorMessage.set(error.message);
        } else {
          this.errorMessage.set('Google sign-in failed. Please try again.');
        }
      }
    }
  }
}
