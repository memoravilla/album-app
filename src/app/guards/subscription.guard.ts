import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { SubscriptionService } from '../services/subscription.service';

export const subscriptionGuard: CanActivateFn = () => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  return subscriptionService.hasActiveSubscription().pipe(
    map(hasSubscription => {
      if (hasSubscription) {
        return true;
      } else {
        // Redirect to subscription page if no active subscription
        router.navigate(['/app/subscription']);
        return false;
      }
    }),
    catchError(() => {
      // If there's an error checking subscription, allow access but log the error
      console.error('Error checking subscription status');
      return of(true);
    })
  );
};

export const noSubscriptionGuard: CanActivateFn = () => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  return subscriptionService.hasActiveSubscription().pipe(
    map(hasSubscription => {
      if (!hasSubscription) {
        return true;
      } else {
        // Redirect to dashboard if already has subscription
        router.navigate(['/app/dashboard']);
        return false;
      }
    }),
    catchError(() => {
      // If there's an error checking subscription, allow access
      return of(true);
    })
  );
};
