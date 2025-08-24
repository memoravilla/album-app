import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';
import { AlbumService } from '../../services/album.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 class="text-2xl font-bold mb-4">Debug Panel</h1>
      
      <div class="space-y-4">
        <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">Current User</h2>
          <div class="text-sm">
            <p><strong>UID:</strong> {{ currentUser?.uid || 'None' }}</p>
            <p><strong>Email:</strong> {{ currentUser?.email || 'None' }}</p>
            <p><strong>Display Name:</strong> {{ currentUser?.displayName || 'None' }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">Debug Actions</h2>
          <div class="space-y-2">
            <button 
              (click)="testFirestoreConnection()"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              Test Firestore Connection
            </button>
            
            <button 
              (click)="testInvitationAcceptance()"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
            >
              Test Invitation Acceptance
            </button>
            
            <button 
              (click)="listPendingInvitations()"
              class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mr-2"
            >
              List Pending Invitations
            </button>
            
            <button 
              (click)="listUserAlbums()"
              class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              List User Albums
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">Pending Invitations</h2>
          <div *ngIf="pendingInvitations.length === 0" class="text-gray-500">
            No pending invitations found
          </div>
          <div *ngFor="let invitation of pendingInvitations" class="mb-2 p-2 border rounded">
            <p><strong>Album:</strong> {{ invitation.albumName }}</p>
            <p><strong>From:</strong> {{ invitation.inviterEmail }}</p>
            <p><strong>Status:</strong> {{ invitation.status }}</p>
            <button 
              (click)="debugSpecificInvitation(invitation.id)"
              class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Debug This Invitation
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">User Albums</h2>
          <div *ngIf="userAlbums.length === 0" class="text-gray-500">
            No albums found
          </div>
          <div *ngFor="let album of userAlbums" class="mb-2 p-2 border rounded">
            <p><strong>Name:</strong> {{ album.name }}</p>
            <p><strong>Members:</strong> {{ album.members?.length || 0 }}</p>
            <p><strong>Admins:</strong> {{ album.admins?.length || 0 }}</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-700 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">Console Output</h2>
          <p class="text-sm text-gray-600">Check the browser console for detailed debug output</p>
        </div>
      </div>
    </div>
  `
})
export class DebugComponent implements OnInit {
  currentUser: any = null;
  pendingInvitations: any[] = [];
  userAlbums: any[] = [];

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private albumService: AlbumService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    this.loadPendingInvitations();
    this.loadUserAlbums();
  }

  testFirestoreConnection() {
    console.log('🔍 Starting Firestore connection test...');
    this.invitationService.debugFirestoreConnection();
  }

  testInvitationAcceptance() {
    if (this.pendingInvitations.length > 0) {
      const invitation = this.pendingInvitations[0];
      console.log('🔍 Starting invitation acceptance test for:', invitation.id);
      this.invitationService.debugInvitationAcceptance(invitation.id);
    } else {
      console.log('⚠️ No pending invitations to test');
    }
  }

  debugSpecificInvitation(invitationId: string) {
    console.log('🔍 Starting specific invitation debug for:', invitationId);
    this.invitationService.debugInvitationAcceptance(invitationId);
  }

  async listPendingInvitations() {
    console.log('🔍 Loading pending invitations...');
    if (!this.currentUser) {
      console.error('❌ No current user');
      return;
    }
    try {
      const invitations = await this.invitationService.getPendingInvitations(this.currentUser.uid);
      this.pendingInvitations = invitations;
      console.log('✅ Loaded pending invitations:', invitations);
    } catch (error) {
      console.error('❌ Failed to load pending invitations:', error);
    }
  }

  async loadPendingInvitations() {
    if (!this.currentUser) return;
    try {
      const invitations = await this.invitationService.getPendingInvitations(this.currentUser.uid);
      this.pendingInvitations = invitations;
    } catch (error) {
      console.error('Error loading pending invitations:', error);
    }
  }

  async listUserAlbums() {
    console.log('🔍 Loading user albums...');
    try {
      await this.albumService.loadUserAlbums();
      this.userAlbums = this.albumService.userAlbums();
      console.log('✅ Loaded user albums:', this.userAlbums);
    } catch (error) {
      console.error('❌ Failed to load user albums:', error);
    }
  }

  async loadUserAlbums() {
    try {
      await this.albumService.loadUserAlbums();
      this.userAlbums = this.albumService.userAlbums();
    } catch (error) {
      console.error('Error loading user albums:', error);
    }
  }
}
