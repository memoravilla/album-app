import { Injectable } from '@angular/core';
import { InvitationService } from '../services/invitation.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  constructor(
    private invitationService: InvitationService,
    private authService: AuthService
  ) {}

  async runDiagnostics(albumId?: string): Promise<void> {
    console.log('🔍 Starting Firebase Diagnostics...');
    
    // Test 1: Check authentication
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('❌ No authenticated user');
      return;
    }
    
    console.log('✅ User authenticated:', currentUser.email, 'UID:', currentUser.uid);
    
    // Test 2: Test user document creation
    console.log('🔍 Testing user document operations...');
    await this.invitationService.debugUserCreation();
    
    // Test 3: Test album permissions if albumId provided
    if (albumId) {
      console.log('🔍 Testing album operations for albumId:', albumId);
      await this.invitationService.debugFirebaseOperations(albumId);
    }
    
    console.log('🔍 Diagnostics complete. Check console for results.');
  }
}
