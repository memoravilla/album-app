import { Injectable, inject, signal, effect } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Notification } from '../models/interfaces';

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

  private loadNotifications(userId: string) {
    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
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

      this.notifications.set(notifications);
      this.unreadCount.set(notifications.filter(n => !n.read).length);
    });
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
}
