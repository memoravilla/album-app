import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
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

      // Check if user exists by email
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', inviteeEmail.toLowerCase()));
      const userSnapshot = await getDocs(q);
      
      let inviteeUid: string | undefined;
      if (!userSnapshot.empty) {
        inviteeUid = userSnapshot.docs[0].id;
      }

      // Check if invitation already exists
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      const existingQ = query(
        invitationsRef,
        where('albumId', '==', albumId),
        where('inviteeEmail', '==', inviteeEmail.toLowerCase()),
        where('status', '==', 'pending')
      );
      const existingSnapshot = await getDocs(existingQ);

      if (!existingSnapshot.empty) {
        console.warn('⚠️ Invitation already exists for this user and album');
        return false;
      }

      // Create invitation
      const invitation: Omit<AlbumInvitation, 'id'> = {
        albumId,
        albumName,
        inviterUid: currentUser.uid,
        inviterName: currentUser.displayName,
        inviterEmail: currentUser.email,
        inviteeEmail: inviteeEmail.toLowerCase(),
        inviteeUid,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      const docRef = await addDoc(invitationsRef, invitation);
      console.log('✅ Invitation created with ID:', docRef.id);

      // Create notification if user exists
      if (inviteeUid) {
        await this.notificationService.createNotification({
          userId: inviteeUid,
          type: 'album_invitation',
          title: 'Album Invitation',
          message: `${currentUser.displayName} invited you to join the album "${albumName}"`,
          data: {
            invitationId: docRef.id,
            albumId,
            albumName,
            inviterName: currentUser.displayName
          },
          read: false
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
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

      const invitationRef = doc(this.firestore, 'albumInvitations', invitationId);
      const invitationDoc = await getDoc(invitationRef);

      if (!invitationDoc.exists()) {
        console.error('❌ Invitation not found');
        return false;
      }

      const invitation = invitationDoc.data() as AlbumInvitation;

      // Verify the current user is the invitee
      if (invitation.inviteeUid !== currentUser.uid) {
        console.error('❌ User not authorized to respond to this invitation');
        return false;
      }

      // Update invitation status
      await updateDoc(invitationRef, {
        status: response,
        respondedAt: new Date()
      });

      if (response === 'accepted') {
        // Add user to album members
        const albumRef = doc(this.firestore, 'albums', invitation.albumId);
        const albumDoc = await getDoc(albumRef);
        
        if (albumDoc.exists()) {
          const albumData = albumDoc.data();
          const currentMembers = albumData['members'] || [];
          
          if (!currentMembers.includes(currentUser.uid)) {
            await updateDoc(albumRef, {
              members: [...currentMembers, currentUser.uid]
            });
          }
        }

        // Notify the inviter
        await this.notificationService.createNotification({
          userId: invitation.inviterUid,
          type: 'album_member_added',
          title: 'Invitation Accepted',
          message: `${currentUser.displayName} accepted your invitation to join "${invitation.albumName}"`,
          data: {
            albumId: invitation.albumId,
            albumName: invitation.albumName,
            newMemberName: currentUser.displayName
          },
          read: false
        });
      }

      console.log(`✅ Invitation ${response} successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error responding to invitation:`, error);
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
      const invitationsRef = collection(this.firestore, 'albumInvitations');
      const q = query(
        invitationsRef,
        where('albumId', '==', albumId),
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
          createdAt: data['createdAt'].toDate(),
          expiresAt: data['expiresAt'].toDate(),
          respondedAt: data['respondedAt'] ? data['respondedAt'].toDate() : undefined
        });
      });

      console.log(`📨 Found ${invitations.length} pending invitations for album ${albumId}`);
      return invitations;
    } catch (error) {
      console.error('❌ Error fetching album invitations:', error);
      return [];
    }
  }
}
