import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { AlbumInvitation, User } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  async inviteUserToAlbum(albumId: string, albumName: string, inviteeEmail: string): Promise<boolean> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return false;
      }

      console.log('🔄 Starting invitation process for:', inviteeEmail, 'to album:', albumName);

      // First, verify that the current user is an admin of the album
      console.log('🔍 Verifying user admin status for album:', albumId);
      const isAdmin = await this.verifyAlbumAdmin(albumId, currentUser.uid);
      if (!isAdmin) {
        console.error('❌ Current user is not an admin of this album');
        return false;
      }
      console.log('✅ User verified as album admin');

      // Check if user exists by email
      console.log('🔍 Checking if user exists with email:', inviteeEmail);
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', inviteeEmail.toLowerCase()));
      
      let userSnapshot;
      try {
        userSnapshot = await getDocs(q);
      } catch (userQueryError: any) {
        console.warn('⚠️ Could not query users collection:', userQueryError);
        // Continue without user lookup
      }
      
      let inviteeUid: string | undefined;
      if (userSnapshot && !userSnapshot.empty) {
        inviteeUid = userSnapshot.docs[0].id;
        console.log('✅ User found with UID:', inviteeUid);
      } else {
        console.log('⚠️ User not found in database, will create invitation anyway');
      }

      // Check if invitation already exists
      console.log('🔍 Checking for existing invitations...');
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      
      let existingSnapshot;
      try {
        const existingQ = query(
          invitationsRef,
          where('albumId', '==', albumId),
          where('inviteeEmail', '==', inviteeEmail.toLowerCase()),
          where('status', '==', 'pending')
        );
        existingSnapshot = await getDocs(existingQ);
      } catch (existingQueryError: any) {
        console.warn('⚠️ Could not check for existing invitations:', existingQueryError);
        // Continue with creating invitation
      }

      if (existingSnapshot && !existingSnapshot.empty) {
        console.warn('⚠️ Invitation already exists for this user and album');
        return false;
      }

      // Create invitation
      console.log('📝 Creating invitation document...');
      const invitation: Omit<AlbumInvitation, 'id'> = {
        albumId,
        albumName,
        inviterUid: currentUser.uid,
        inviterName: currentUser.displayName || currentUser.email || 'Unknown',
        inviterEmail: currentUser.email || '',
        inviteeEmail: inviteeEmail.toLowerCase(),
        inviteeUid,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      console.log('📄 Invitation data:', invitation);

      let docRef: any;
      try {
        docRef = await addDoc(invitationsRef, invitation);
        console.log('✅ Invitation created with ID:', docRef.id);
      } catch (createError: any) {
        console.error('❌ Failed to create invitation document:', createError);
        console.error('❌ Error code:', createError.code);
        console.error('❌ Error message:', createError.message);
        
        if (createError.code === 'permission-denied') {
          console.error('❌ Permission denied - check Firestore security rules');
          console.error('❌ User UID:', currentUser.uid);
          console.error('❌ User email:', currentUser.email);
          console.error('❌ Album ID:', albumId);
        }
        
        return false;
      }

      // Create notification if user exists
      if (inviteeUid && docRef) {
        console.log('🔔 Creating notification for user:', inviteeUid);
        try {
          await this.notificationService.createNotification({
            userId: inviteeUid,
            type: 'album_invitation',
            title: 'Album Invitation',
            message: `${currentUser.displayName || currentUser.email} invited you to join the album "${albumName}"`,
            data: {
              invitationId: docRef.id,
              albumId,
              albumName,
              inviterName: currentUser.displayName || currentUser.email || 'Unknown'
            },
            read: false
          });
          console.log('✅ Notification created successfully');
        } catch (notificationError) {
          console.error('⚠️ Failed to create notification, but invitation was created:', notificationError);
          // Don't fail the entire process if notification fails
        }
      } else {
        console.log('📧 No user UID found, skipping notification');
      }

      console.log('✅ Invitation process completed successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error sending invitation:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return false;
    }
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'declined'): Promise<boolean> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return false;
      }

      console.log(`🔄 Responding to invitation ${invitationId} with: ${response}`);

      const invitationRef = doc(this.firestore, 'albumInvitations', invitationId);
      const invitationDoc = await getDoc(invitationRef);

      if (!invitationDoc.exists()) {
        console.error('❌ Invitation not found');
        return false;
      }

      const invitation = invitationDoc.data() as AlbumInvitation;
      console.log('📄 Invitation data:', invitation);

      // Verify the current user is the invitee
      if (invitation.inviteeUid !== currentUser.uid) {
        console.error('❌ User not authorized to respond to this invitation');
        console.error('❌ Expected UID:', invitation.inviteeUid, 'Actual UID:', currentUser.uid);
        return false;
      }

      // Update invitation status first
      console.log('📝 Updating invitation status...');
      try {
        await updateDoc(invitationRef, {
          status: response,
          respondedAt: new Date()
        });
        console.log('✅ Invitation status updated successfully');
      } catch (invitationUpdateError: any) {
        console.error('❌ Failed to update invitation status:', invitationUpdateError);
        console.error('❌ Error code:', invitationUpdateError.code);
        console.error('❌ Error message:', invitationUpdateError.message);
        return false;
      }

      if (response === 'accepted') {
        console.log('🔄 Processing invitation acceptance...');
        
        // Add user to album members
        const albumRef = doc(this.firestore, 'albums', invitation.albumId);
        
        try {
          console.log('📄 Getting album document...');
          const albumDoc = await getDoc(albumRef);
          
          if (albumDoc.exists()) {
            const albumData = albumDoc.data();
            const currentMembers = albumData['members'] || [];
            console.log('👥 Current album members:', currentMembers);
            
            if (!currentMembers.includes(currentUser.uid)) {
              console.log('➕ Adding user to album members...');
              const updatedMembers = [...currentMembers, currentUser.uid];
              console.log('👥 Updated members list:', updatedMembers);
              
              await updateDoc(albumRef, {
                members: updatedMembers
              });
              console.log('✅ User added to album members successfully');
            } else {
              console.log('ℹ️ User already in album members');
            }
          } else {
            console.error('❌ Album not found:', invitation.albumId);
            return false;
          }
        } catch (albumUpdateError: any) {
          console.error('❌ Failed to add user to album:', albumUpdateError);
          console.error('❌ Error code:', albumUpdateError.code);
          console.error('❌ Error message:', albumUpdateError.message);
          console.error('❌ Album ID:', invitation.albumId);
          console.error('❌ User UID:', currentUser.uid);
          return false;
        }

        // Notify the inviter
        console.log('🔔 Creating notification for inviter...');
        try {
          await this.notificationService.createNotification({
            userId: invitation.inviterUid,
            type: 'album_member_added',
            title: 'Invitation Accepted',
            message: `${currentUser.displayName || currentUser.email} accepted your invitation to join "${invitation.albumName}"`,
            data: {
              albumId: invitation.albumId,
              albumName: invitation.albumName,
              newMemberName: currentUser.displayName || currentUser.email || 'Unknown'
            },
            read: false
          });
          console.log('✅ Notification created successfully');
        } catch (notificationError: any) {
          console.error('⚠️ Failed to create notification:', notificationError);
          // Don't fail the entire process if notification fails
        }
      }

      console.log(`✅ Invitation ${response} successfully`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error responding to invitation:`, error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return false;
    }
  }

  async getPendingInvitations(userId: string): Promise<AlbumInvitation[]> {
    try {
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      const q = query(
        invitationsRef,
        where('inviteeUid', '==', userId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const invitations: AlbumInvitation[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        invitations.push({
          id: doc.id,
          albumId: data['albumId'],
          albumName: data['albumName'],
          inviterUid: data['inviterUid'],
          inviterName: data['inviterName'],
          inviterEmail: data['inviterEmail'],
          inviteeEmail: data['inviteeEmail'],
          inviteeUid: data['inviteeUid'],
          status: data['status'],
          createdAt: data['createdAt']?.toDate() || new Date(),
          expiresAt: data['expiresAt']?.toDate() || new Date(),
          respondedAt: data['respondedAt']?.toDate()
        });
      });

      return invitations;
    } catch (error) {
      console.error('❌ Error fetching pending invitations:', error);
      return [];
    }
  }

  async cancelInvitation(invitationId: string): Promise<boolean> {
    try {
      const invitationRef = doc(this.firestore, 'albumInvitations', invitationId);
      await deleteDoc(invitationRef);
      console.log('✅ Invitation cancelled');
      return true;
    } catch (error) {
      console.error('❌ Error cancelling invitation:', error);
      return false;
    }
  }

  async getAlbumInvitations(albumId: string): Promise<AlbumInvitation[]> {
    try {
      console.log('🔄 Fetching pending invitations for album:', albumId);
      
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      const q = query(
        invitationsRef,
        where('albumId', '==', albumId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const invitations: AlbumInvitation[] = [];

      console.log('📨 Raw query returned', snapshot.size, 'invitations');

      snapshot.forEach((doc) => {
        try {
          const data = doc.data();
          console.log('📄 Processing invitation doc:', doc.id, data);
          
          const invitation: AlbumInvitation = {
            id: doc.id,
            albumId: data['albumId'],
            albumName: data['albumName'],
            inviterUid: data['inviterUid'],
            inviterName: data['inviterName'],
            inviterEmail: data['inviterEmail'],
            inviteeEmail: data['inviteeEmail'],
            inviteeUid: data['inviteeUid'],
            status: data['status'],
            createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
            expiresAt: data['expiresAt']?.toDate ? data['expiresAt'].toDate() : new Date(data['expiresAt']),
            respondedAt: data['respondedAt'] ? (data['respondedAt']?.toDate ? data['respondedAt'].toDate() : new Date(data['respondedAt'])) : undefined
          };
          
          invitations.push(invitation);
          console.log('✅ Added invitation for:', invitation.inviteeEmail);
        } catch (docError) {
          console.error('❌ Error processing invitation document:', doc.id, docError);
        }
      });

      console.log(`📨 Successfully processed ${invitations.length} pending invitations for album ${albumId}`);
      return invitations;
    } catch (error: any) {
      console.error('❌ Error fetching album invitations:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.error('❌ Permission denied - user may not be admin of this album');
      }
      
      return [];
    }
  }

  async getMyAlbumInvitations(albumId: string): Promise<AlbumInvitation[]> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.error('❌ No authenticated user');
        return [];
      }

      console.log('🔄 Fetching invitations sent by current user for album:', albumId);
      
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      const q = query(
        invitationsRef,
        where('albumId', '==', albumId),
        where('inviterUid', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const invitations: AlbumInvitation[] = [];

      console.log('📨 Raw query returned', snapshot.size, 'invitations sent by current user');

      snapshot.forEach((doc) => {
        try {
          const data = doc.data();
          
          const invitation: AlbumInvitation = {
            id: doc.id,
            albumId: data['albumId'],
            albumName: data['albumName'],
            inviterUid: data['inviterUid'],
            inviterName: data['inviterName'],
            inviterEmail: data['inviterEmail'],
            inviteeEmail: data['inviteeEmail'],
            inviteeUid: data['inviteeUid'],
            status: data['status'],
            createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
            expiresAt: data['expiresAt']?.toDate ? data['expiresAt'].toDate() : new Date(data['expiresAt']),
            respondedAt: data['respondedAt'] ? (data['respondedAt']?.toDate ? data['respondedAt'].toDate() : new Date(data['respondedAt'])) : undefined
          };
          
          invitations.push(invitation);
          console.log('✅ Added invitation sent by current user for:', invitation.inviteeEmail);
        } catch (docError) {
          console.error('❌ Error processing invitation document:', doc.id, docError);
        }
      });

      console.log(`📨 Successfully processed ${invitations.length} invitations sent by current user for album ${albumId}`);
      return invitations;
    } catch (error: any) {
      console.error('❌ Error fetching user\'s album invitations:', error);
      return [];
    }
  }

  private async verifyAlbumAdmin(albumId: string, userId: string): Promise<boolean> {
    try {
      const albumRef = doc(this.firestore, 'albums', albumId);
      const albumDoc = await getDoc(albumRef);
      
      if (!albumDoc.exists()) {
        console.error('❌ Album not found:', albumId);
        return false;
      }
      
      const albumData = albumDoc.data();
      const admins = albumData['admins'] || [];
      const createdBy = albumData['createdBy'];
      
      const isAdmin = admins.includes(userId) || createdBy === userId;
      console.log('🔍 Admin check - User:', userId, 'Admins:', admins, 'CreatedBy:', createdBy, 'IsAdmin:', isAdmin);
      
      return isAdmin;
    } catch (error: any) {
      console.error('❌ Error verifying album admin status:', error);
      return false;
    }
  }

  // Debug method to test Firebase permissions and operations
  async debugFirebaseOperations(albumId: string): Promise<void> {
    try {
      const currentUser = this.authService.currentUser();
      console.log('🐛 DEBUG: Current user:', currentUser);
      
      if (!currentUser) {
        console.log('🐛 DEBUG: No authenticated user');
        return;
      }
      
      // Test 1: Check if we can read the album
      console.log('🐛 DEBUG: Testing album read permissions...');
      try {
        const albumRef = doc(this.firestore, 'albums', albumId);
        const albumDoc = await getDoc(albumRef);
        if (albumDoc.exists()) {
          const albumData = albumDoc.data();
          console.log('✅ DEBUG: Album read successful:', albumData['name']);
          console.log('🐛 DEBUG: Album admins:', albumData['admins']);
          console.log('🐛 DEBUG: Album members:', albumData['members']);
          console.log('🐛 DEBUG: Created by:', albumData['createdBy']);
          console.log('🐛 DEBUG: User is admin:', albumData['admins']?.includes(currentUser.uid) || albumData['createdBy'] === currentUser.uid);
        } else {
          console.error('❌ DEBUG: Album not found');
        }
      } catch (albumError: any) {
        console.error('❌ DEBUG: Album read failed:', albumError);
      }
      
      // Test 2: Check if we can create a test invitation document
      console.log('🐛 DEBUG: Testing invitation creation permissions...');
      try {
        const invitationsRef = collection(this.firestore, 'albumInvitations');
        const testInvitation = {
          albumId,
          albumName: 'Test Album',
          inviterUid: currentUser.uid,
          inviterName: currentUser.displayName || 'Test User',
          inviterEmail: currentUser.email || '',
          inviteeEmail: 'test@example.com',
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
        };
        
        // Try to add the test document
        const docRef = await addDoc(invitationsRef, testInvitation);
        console.log('✅ DEBUG: Test invitation created with ID:', docRef.id);
        
        // Clean up - delete the test invitation
        await deleteDoc(doc(this.firestore, 'albumInvitations', docRef.id));
        console.log('✅ DEBUG: Test invitation cleaned up');
        
      } catch (inviteError: any) {
        console.error('❌ DEBUG: Invitation creation failed:', inviteError);
        console.error('❌ DEBUG: Error code:', inviteError.code);
        console.error('❌ DEBUG: Error message:', inviteError.message);
      }
      
      // Test 3: Check user document read permissions
      console.log('🐛 DEBUG: Testing user document permissions...');
      try {
        const userRef = doc(this.firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          console.log('✅ DEBUG: User document read successful');
        } else {
          console.warn('⚠️ DEBUG: User document does not exist');
        }
      } catch (userError: any) {
        console.error('❌ DEBUG: User document read failed:', userError);
      }
      
    } catch (error: any) {
      console.error('❌ DEBUG: Debug operations failed:', error);
    }
  }

  // Debug method to test user creation
  async debugUserCreation(): Promise<void> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        console.log('🐛 DEBUG: No authenticated user for user creation test');
        return;
      }
      
      console.log('🐛 DEBUG: Testing user document creation...');
      const userRef = doc(this.firestore, 'users', currentUser.uid);
      
      try {
        const testData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          createdAt: new Date()
        };
        
        // Test if we can write to user document
        await setDoc(userRef, testData);
        console.log('✅ DEBUG: User document write successful');
        
      } catch (userWriteError: any) {
        console.error('❌ DEBUG: User document write failed:', userWriteError);
        console.error('❌ DEBUG: Error code:', userWriteError.code);
        console.error('❌ DEBUG: Error message:', userWriteError.message);
      }
      
    } catch (error: any) {
      console.error('❌ DEBUG: User creation test failed:', error);
    }
  }
}
