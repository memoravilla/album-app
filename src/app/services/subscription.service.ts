import { Injectable } from '@angular/core';
import { Functions, httpsCallable, connectFunctionsEmulator } from '@angular/fire/functions';
import { Auth, user } from '@angular/fire/auth';
import { Observable, from, map, switchMap } from 'rxjs';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd?: boolean;
  planType?: string;
  priceId?: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  // Stripe Price IDs for different plans
  private readonly PLAN_PRICES = {
    pro: 'price_1S1jyg4lzUROwBs0mCWYbktg', // Replace with your actual Pro price ID
    premium: 'price_1S1jiH4lzUROwBs0lsbjL0RJ', // Replace with your actual Premium price ID
  };

  constructor(
    private functions: Functions,
    private auth: Auth
  ) {
    // Connect to functions emulator in development
    if (window.location.hostname === 'localhost') {
      connectFunctionsEmulator(this.functions, 'localhost', 5001);
    }
  }

  /**
   * Create a Stripe customer for the current user
   */
  createStripeCustomer(email: string, name: string): Observable<{ customerId: string }> {
    const createCustomer = httpsCallable(this.functions, 'createStripeCustomer');
    return from(createCustomer({ email, name })).pipe(
      map(result => result.data as { customerId: string })
    );
  }

  /**
   * Create a checkout session for subscription
   */
  createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Observable<CheckoutSession> {
    const createSession = httpsCallable(this.functions, 'createCheckoutSession');
    return from(createSession({ priceId, successUrl, cancelUrl })).pipe(
      map(result => result.data as CheckoutSession)
    );
  }

  /**
   * Create a billing portal session
   */
  createPortalSession(returnUrl: string): Observable<{ url: string }> {
    const createPortal = httpsCallable(this.functions, 'createPortalSession');
    return from(createPortal({ returnUrl })).pipe(
      map(result => result.data as { url: string })
    );
  }

  /**
   * Get the current user's subscription status
   */
  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    console.log('🔄 Getting subscription status from Firebase Function...');
    const getStatus = httpsCallable(this.functions, 'getSubscriptionStatus');
    return from(getStatus({})).pipe(
      map(result => {
        console.log('📊 Raw Firebase Function response:', result);
        const status = result.data as SubscriptionStatus;
        console.log('📊 Parsed subscription status:', status);
        return status;
      })
    );
  }

  /**
   * Check if the current user has an active subscription
   */
  hasActiveSubscription(): Observable<boolean> {
    return this.getSubscriptionStatus().pipe(
      map(status => status.hasActiveSubscription)
    );
  }

  /**
   * Subscribe to a specific plan
   */
  subscribeToPlan(planType: 'pro' | 'premium'): Observable<string> {
    const priceId = this.PLAN_PRICES[planType];
    if (!priceId) {
      throw new Error(`Invalid plan type: ${planType}`);
    }
    
    const successUrl = `${window.location.origin}/subscription/success`;
    const cancelUrl = `${window.location.origin}/subscription/cancel`;

    return this.createCheckoutSession(priceId, successUrl, cancelUrl).pipe(
      map(session => session.url!)
    );
  }

  /**
   * Subscribe to the premium plan (legacy method for compatibility)
   */
  subscribeToPremium(): Observable<string> {
    return this.subscribeToPlan('premium');
  }

  /**
   * Subscribe to the pro plan
   */
  subscribeToPro(): Observable<string> {
    return this.subscribeToPlan('pro');
  }

  /**
   * Open the billing portal
   */
  manageBilling(): Observable<string> {
    const returnUrl = `${window.location.origin}/subscription`;
    return this.createPortalSession(returnUrl).pipe(
      map(session => session.url)
    );
  }

  /**
   * Manually sync user subscription data from Stripe to Firestore
   */
  syncUserSubscription(): Observable<any> {
    console.log('🔄 Syncing user subscription data from Stripe...');
    const syncSubscription = httpsCallable(this.functions, 'syncUserSubscription');
    return from(syncSubscription({})).pipe(
      map(result => {
        console.log('✅ Subscription sync result:', result.data);
        return result.data;
      })
    );
  }

  /**
   * Create or update user document in Firestore
   */
  createUserDocument(email: string, displayName: string, photoURL?: string): Observable<any> {
    console.log('🔄 Creating/updating user document...');
    const createUser = httpsCallable(this.functions, 'createUserDocument');
    return from(createUser({ email, displayName, photoURL })).pipe(
      map(result => {
        console.log('✅ User document created/updated:', result.data);
        return result.data;
      })
    );
  }

  /**
   * Check if user is authenticated before allowing subscription actions
   */
  private requireAuth<T>(operation: Observable<T>): Observable<T> {
    return user(this.auth).pipe(
      switchMap(authUser => {
        if (!authUser) {
          throw new Error('Authentication required for subscription operations');
        }
        return operation;
      })
    );
  }

  /**
   * Subscribe with authentication check (legacy method for premium)
   */
  subscribeWithAuth(): Observable<string> {
    return this.requireAuth(this.subscribeToPremium());
  }

  /**
   * Subscribe to a plan with authentication check
   */
  subscribeWithAuthToPlan(planType: 'pro' | 'premium'): Observable<string> {
    return this.requireAuth(this.subscribeToPlan(planType));
  }

  /**
   * Manage billing with authentication check
   */
  manageBillingWithAuth(): Observable<string> {
    return this.requireAuth(this.manageBilling());
  }

  /**
   * Get subscription status with authentication check
   */
  getSubscriptionStatusWithAuth(): Observable<SubscriptionStatus> {
    return this.requireAuth(this.getSubscriptionStatus());
  }

  /**
   * Sync subscription with authentication check
   */
  syncUserSubscriptionWithAuth(): Observable<any> {
    return this.requireAuth(this.syncUserSubscription());
  }

  /**
   * Debug method to check Firestore user document directly
   */
  debugUserDocument(): void {
    user(this.auth).subscribe(authUser => {
      if (authUser) {
        console.log('🔍 Current Firebase Auth user:', authUser.uid);
        console.log('🔍 User email:', authUser.email);
        console.log('🔍 User display name:', authUser.displayName);
      } else {
        console.log('❌ No authenticated user found');
      }
    });
  }
}
