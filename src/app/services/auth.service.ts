import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User, PlanFeatures } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  isInitialized = signal<boolean>(false);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    console.log('Starting auth initialization...');
    
    try {
      // Firebase Auth automatically uses LOCAL persistence by default in modern versions
      console.log('Using default Firebase Auth persistence (LOCAL)...');
      
      // Check for redirect result first (in case user is returning from Google)
      await this.handleRedirectResult();
      
      // Monitor auth state changes
      const unsubscribe = onAuthStateChanged(this.auth, async (firebaseUser) => {
        console.log('🔥 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email} (UID: ${firebaseUser.uid})` : 'No user');
        
        if (firebaseUser) {
          // User is signed in
          console.log('User is authenticated, loading user data...');
          try {
            const userData = await this.getUserData(firebaseUser.uid);
            if (userData) {
              this.currentUser.set(userData);
              console.log('✅ User data loaded from Firestore:', userData.displayName);
            } else {
              // Create user data from Firebase Auth as fallback
              const fallbackUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: new Date(),
                planType: 'basic' // Default to basic plan
              };
              this.currentUser.set(fallbackUser);
              console.log('✅ Using fallback user data:', fallbackUser.displayName);
            }
          } catch (error) {
            console.error('❌ Error loading user data from Firestore:', error);
            // Still set fallback user to maintain auth state
            const fallbackUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
              planType: 'basic' // Default to basic plan
            };
            this.currentUser.set(fallbackUser);
            console.log('⚠️ Set fallback user despite Firestore error');
          }
        } else {
          // User is signed out
          this.currentUser.set(null);
          console.log('❌ User signed out - cleared currentUser');
        }
        
        // Mark auth as initialized after first state change
        if (!this.isInitialized()) {
          this.isInitialized.set(true);
          console.log('✅ Auth initialization complete');
        }
      });
      
      // Store the unsubscribe function if needed
      (this as any).authUnsubscribe = unsubscribe;
      
    } catch (error) {
      console.error('❌ Failed to initialize auth persistence:', error);
      // Still proceed with auth state monitoring even if persistence fails
      this.isInitialized.set(true);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<boolean> {
    try {
      this.isLoading.set(true);
      console.log('Starting email sign-in...');
      
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Email sign-in successful, user:', credential.user.email);
      
      const userData = await this.createUserDocument(credential.user, credential.user.displayName || '');
      
      console.log('Setting current user in signal:', userData);
      this.currentUser.set(userData);
      
      return true;
    } catch (error) {
      console.error('Email sign in error:', error);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async registerWithEmail(email: string, password: string, displayName: string): Promise<boolean> {
    try {
      this.isLoading.set(true);
      console.log('🔄 Starting email registration for:', email);
      
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Email registration successful, user UID:', credential.user.uid);
      
      // Update the Firebase Auth profile first
      console.log('🔄 Updating Firebase Auth profile...');
      await updateProfile(credential.user, { displayName });
      console.log('✅ Firebase Auth profile updated');
      
      // Create the Firestore user document
      console.log('🔄 Creating Firestore user document...');
      const userData = await this.createUserDocument(credential.user, displayName);
      console.log('✅ User document process completed');
      
      console.log('🔄 Setting current user in signal:', userData.email);
      this.currentUser.set(userData);
      console.log('✅ Registration process completed successfully');
      
      return true;
    } catch (error: any) {
      console.error('❌ Email registration error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        console.error('❌ Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        console.error('❌ Invalid email format');
      } else if (error.code === 'auth/weak-password') {
        console.error('❌ Password is too weak');
      }
      
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signInWithGoogle(): Promise<boolean> {
    try {
      this.isLoading.set(true);
      console.log('Starting Google sign-in...');
      
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('Opening Google popup...');
      const credential = await signInWithPopup(this.auth, provider);
      console.log('Google sign-in successful, user:', credential.user.email);
      
      const userData = await this.createUserDocument(credential.user, credential.user.displayName || '');
      
      console.log('Setting current user in signal:', userData);
      this.currentUser.set(userData);
      
      return true;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        return false;
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Popup request was cancelled');
        return false;
      } else if (error.code === 'auth/popup-blocked') {
        console.log('Popup was blocked by browser');
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        console.log('Network request failed');
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async signInWithGoogleRedirect(): Promise<void> {
    try {
      this.isLoading.set(true);
      console.log('Starting Google sign-in with redirect...');
      
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      await signInWithRedirect(this.auth, provider);
      // Note: This will redirect the page, so we won't reach the finally block
    } catch (error: any) {
      console.error('Google sign in redirect error:', error);
      this.isLoading.set(false);
      throw error;
    }
  }

  async handleRedirectResult(): Promise<boolean> {
    try {
      console.log('Checking for redirect result...');
      const result = await getRedirectResult(this.auth);
      
      if (result && result.user) {
        console.log('Redirect result found, user:', result.user.email);
        await this.createUserDocument(result.user, result.user.displayName || '');
        return true;
      }
      
      console.log('No redirect result found');
      return false;
    } catch (error: any) {
      console.error('Handle redirect result error:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<boolean> {
    try {
      const currentFirebaseUser = this.auth.currentUser;
      if (!currentFirebaseUser) return false;

      // Update Firebase Auth profile if display name or photo changed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(currentFirebaseUser, {
          displayName: updates.displayName || currentFirebaseUser.displayName,
          photoURL: updates.photoURL || currentFirebaseUser.photoURL
        });
      }

      // Update Firestore document
      const userRef = doc(this.firestore, `users/${currentFirebaseUser.uid}`);
      await updateDoc(userRef, updates);

      // Update local state
      const currentUserData = this.currentUser();
      if (currentUserData) {
        this.currentUser.set({ ...currentUserData, ...updates });
      }
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = this.auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      return true;
    } catch (error: any) {
      console.error('Change password error:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('New password is too weak');
      }
      throw new Error('Failed to change password');
    }
  }

  // Plan management methods
  async updateUserPlan(planType: 'basic' | 'pro' | 'premium', planExpiresAt?: Date): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      throw new Error('User must be authenticated to update plan');
    }

    try {
      const userRef = doc(this.firestore, `users/${user.uid}`);
      const updateData: Partial<User> = { 
        planType,
        planExpiresAt
      };
      
      await updateDoc(userRef, updateData);
      
      // Update the current user signal
      this.currentUser.set({
        ...user,
        planType,
        planExpiresAt
      });
      
      console.log('✅ User plan updated successfully:', planType);
    } catch (error) {
      console.error('❌ Error updating user plan:', error);
      throw error;
    }
  }

  getPlanFeatures(planType: 'basic' | 'pro' | 'premium'): PlanFeatures {
    const planFeatures: Record<string, PlanFeatures> = {
      basic: {
        name: 'basic',
        displayName: 'Basic',
        price: 0,
        currency: 'USD',
        billingPeriod: 'monthly',
        maxAlbums: 5,
        maxPhotosPerAlbum: 100,
        maxStorageGB: 1,
        hasAdvancedSharing: false,
        hasCustomThemes: false,
        hasPrioritySupport: false,
        hasAdvancedAnalytics: false
      },
      pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 19.00,
        currency: 'USD',
        billingPeriod: 'monthly',
        maxAlbums: 25,
        maxPhotosPerAlbum: 1000,
        maxStorageGB: 10,
        hasAdvancedSharing: true,
        hasCustomThemes: true,
        hasPrioritySupport: false,
        hasAdvancedAnalytics: true
      },
      premium: {
        name: 'premium',
        displayName: 'Premium',
        price: 39.00,
        currency: 'USD',
        billingPeriod: 'monthly',
        maxAlbums: -1, // Unlimited
        maxPhotosPerAlbum: -1, // Unlimited
        maxStorageGB: 100,
        hasAdvancedSharing: true,
        hasCustomThemes: true,
        hasPrioritySupport: true,
        hasAdvancedAnalytics: true
      }
    };

    return planFeatures[planType];
  }

  isPlanActive(): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Basic plan is always active
    if (user.planType === 'basic') return true;

    // For paid plans, check expiration
    if (user.planExpiresAt) {
      return new Date() < new Date(user.planExpiresAt);
    }

    return false;
  }

  getPlanDisplayInfo(): { displayName: string; color: string; badge: string } {
    const user = this.currentUser();
    if (!user) return { displayName: 'Basic', color: 'gray', badge: 'B' };

    const planInfo = {
      basic: { displayName: 'Basic', color: 'gray', badge: 'B' },
      pro: { displayName: 'Pro', color: 'blue', badge: 'P' },
      premium: { displayName: 'Premium', color: 'purple', badge: 'PR' }
    };

    return planInfo[user.planType];
  }

  private async createUserDocument(firebaseUser: FirebaseUser, displayName: string): Promise<User> {
    try {
      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      console.log('🔄 Creating/updating user document for UID:', firebaseUser.uid);
      console.log('🔄 User email:', firebaseUser.email);
      console.log('🔄 Display name:', displayName);
      
      // Always create/update the user data object with proper Firestore timestamp
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        planType: 'basic' // Default to basic plan for new users
      };

      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.log('📝 Creating new user document in Firestore for:', firebaseUser.email);
          await setDoc(userRef, {
            ...userData,
            createdAt: new Date() // Ensure fresh timestamp
          });
          console.log('✅ User document created successfully in Firestore');
        } else {
          console.log('📝 User document already exists, updating if needed for:', firebaseUser.email);
          // Update with latest info, but preserve original createdAt
          const existingData = userSnap.data() as User;
          await updateDoc(userRef, {
            displayName: displayName,
            photoURL: firebaseUser.photoURL || undefined,
            email: firebaseUser.email || '' // Ensure email is up to date
          });
          console.log('✅ User document updated successfully in Firestore');
          
          // Return the existing data with updated fields
          return {
            ...existingData,
            displayName: displayName,
            photoURL: firebaseUser.photoURL || undefined,
            email: firebaseUser.email || ''
          };
        }
      } catch (firestoreError: any) {
        console.error('❌ Firestore operation failed:', firestoreError);
        console.error('❌ Error code:', firestoreError.code);
        console.error('❌ Error message:', firestoreError.message);
        console.error('❌ Error details:', firestoreError);
        
        // Check for specific Firestore errors
        if (firestoreError.code === 'permission-denied') {
          console.error('❌ Permission denied - check Firestore security rules');
          console.error('❌ Attempting to create user document for UID:', firebaseUser.uid);
          console.error('❌ User is authenticated:', !!firebaseUser);
        } else if (firestoreError.code === 'unavailable') {
          console.error('❌ Firestore unavailable - check network connection');
        } else if (firestoreError.code === 'unauthenticated') {
          console.error('❌ User not authenticated for Firestore operations');
        }
        
        // For now, return the user data anyway but log the error
        console.warn('⚠️ Continuing with user data despite Firestore error');
      }

      return userData;
    } catch (error: any) {
      console.error('❌ Create user document error:', error);
      console.error('❌ User UID:', firebaseUser.uid);
      console.error('❌ User email:', firebaseUser.email);
      
      // Return user data even if Firestore fails, but log the error clearly
      const fallbackData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        planType: 'basic' // Default to basic plan
      };
      
      console.warn('⚠️ Returning fallback user data due to Firestore error');
      return fallbackData;
    }
  }

  private async getUserData(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  // Helper method to wait for auth initialization
  async waitForAuthInit(): Promise<void> {
    console.log('🔄 Waiting for auth initialization...');
    
    return new Promise((resolve) => {
      if (this.isInitialized()) {
        console.log('✅ Auth already initialized');
        resolve();
      } else {
        let attempts = 0;
        const maxAttempts = 100; // 5 seconds max wait time
        
        const checkInitialized = () => {
          attempts++;
          
          if (this.isInitialized()) {
            console.log('✅ Auth initialization detected after', attempts * 50, 'ms');
            resolve();
          } else if (attempts >= maxAttempts) {
            console.warn('⚠️ Auth initialization timeout after 5 seconds');
            resolve(); // Don't block forever
          } else {
            setTimeout(checkInitialized, 50);
          }
        };
        
        checkInitialized();
      }
    });
  }

  // Check if user is authenticated (waits for init)
  async isAuthenticated(): Promise<boolean> {
    console.log('🔍 Checking authentication status...');
    await this.waitForAuthInit();
    
    const user = this.currentUser();
    const isAuth = user !== null;
    
    console.log('🔍 Authentication result:', isAuth ? `✅ Authenticated as ${user.email}` : '❌ Not authenticated');
    
    return isAuth;
  }
}