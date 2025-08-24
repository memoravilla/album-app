import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🛡️ Auth Guard: Checking access for route:', state.url);
  
  // Wait for auth to initialize before checking
  const isAuthenticated = await authService.isAuthenticated();
  
  if (isAuthenticated) {
    console.log('✅ Auth Guard: Access granted');
    return true;
  } else {
    console.log('❌ Auth Guard: Access denied, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
};
