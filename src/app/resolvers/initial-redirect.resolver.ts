import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const initialRedirectResolver: ResolveFn<boolean> = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🚀 Initial Redirect Resolver: Checking authentication for initial route');
  
  // Wait for auth to initialize
  const isAuthenticated = await authService.isAuthenticated();
  
  if (isAuthenticated) {
    console.log('✅ User is authenticated, staying on dashboard');
    return true;
  } else {
    console.log('❌ User not authenticated, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
};
