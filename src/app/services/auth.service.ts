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
import { User } from '../models/interfaces';

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
                createdAt: new Date()
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
              createdAt: new Date()
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
      console.log('Starting email registration...');
      
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Email registration successful, user:', credential.user.email);
      
      // Update the display name
      await updateProfile(credential.user, { displayName });
      
      const userData = await this.createUserDocument(credential.user, displayName);
      
      console.log('Setting current user in signal:', userData);
      this.currentUser.set(userData);
      
      return true;
    } catch (error) {
      console.error('Email registration error:', error);
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

  private async createUserDocument(firebaseUser: FirebaseUser, displayName: string): Promise<User> {
    try {
      const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
      
      // Always create/update the user data object
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date()
      };

      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.log('Creating new user document');
          await setDoc(userRef, userData);
        } else {
          console.log('User document already exists, updating if needed');
          // Update with latest info
          await updateDoc(userRef, {
            displayName: displayName,
            photoURL: firebaseUser.photoURL || undefined
          });
        }
      } catch (firestoreError) {
        console.warn('Firestore operation failed, continuing with auth:', firestoreError);
        // Don't throw error, just continue with auth
      }

      return userData;
    } catch (error) {
      console.error('Create user document error:', error);
      
      // Return user data even if Firestore fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date()
      };
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