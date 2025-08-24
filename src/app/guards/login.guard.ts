import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🛡️ Login Guard: Checking access for route:', state.url);
  
  // Wait for auth to initialize before checking
  const isAuthenticated = await authService.isAuthenticated();
  
  if (isAuthenticated) {
    console.log('✅ Login Guard: User is authenticated, redirecting to dashboard');
    // User is already logged in, redirect to dashboard
    router.navigate(['/app/dashboard']);
    return false;
  } else {
    console.log('✅ Login Guard: User not authenticated, allowing access to login/register');
    // User is not logged in, allow access to login/register
    return true;
  }
};
