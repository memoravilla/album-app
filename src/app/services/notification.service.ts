import { Injectable, inject, signal, effect } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Notification, AlbumInvitation } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    this.initializeNotifications();
  }

  private initializeNotifications() {
    // Use effect to watch auth state changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadNotifications(user.uid);
      } else {
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }

  private async loadNotifications(userId: string) {
    // Load regular notifications
    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    onSnapshot(q, async (snapshot) => {
      const regularNotifications: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        regularNotifications.push({
          id: doc.id,
          userId: data['userId'],
          type: data['type'],
          title: data['title'],
          message: data['message'],
          data: data['data'],
          read: data['read'],
          createdAt: data['createdAt']?.toDate() || new Date()
        });
      });

      // Load pending invitations and convert them to notifications
      try {
        const pendingInvitations = await this.loadPendingInvitations(userId);
        const invitationNotifications: Notification[] = pendingInvitations.map(invitation => ({
          id: `invitation_${invitation.id}`,
          userId: userId,
          type: 'album_invitation' as const,
          title: 'Album Invitation',
          message: `${invitation.inviterName} invited you to join "${invitation.albumName}"`,
          data: {
            invitationId: invitation.id,
            albumId: invitation.albumId,
            albumName: invitation.albumName,
            inviterName: invitation.inviterName
          },
          read: false, // Invitations are always considered unread until responded to
          createdAt: invitation.createdAt
        }));

        // Combine and sort all notifications by date
        const allNotifications = [...regularNotifications, ...invitationNotifications]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        this.notifications.set(allNotifications);
        this.unreadCount.set(allNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('❌ Error loading pending invitations for notifications:', error);
        // Fallback to just regular notifications
        this.notifications.set(regularNotifications);
        this.unreadCount.set(regularNotifications.filter(n => !n.read).length);
      }
    });
  }

  private async loadPendingInvitations(userId: string): Promise<AlbumInvitation[]> {
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

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: new Date()
      });
      console.log('✅ Notification created successfully');
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(this.firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(promises);
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      const notificationRef = doc(this.firestore, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }

  async refreshNotifications() {
    const user = this.authService.currentUser();
    if (user) {
      // Force reload of notifications including pending invitations
      this.loadNotifications(user.uid);
    }
  }
}
