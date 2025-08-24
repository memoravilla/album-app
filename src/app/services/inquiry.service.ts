import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp, query, orderBy, getDocs, QuerySnapshot, DocumentData } from '@angular/fire/firestore';

export interface Inquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Timestamp;
  status: 'new' | 'read' | 'responded';
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class InquiryService {
  constructor(private firestore: Firestore) {}

  async saveInquiry(inquiry: Omit<Inquiry, 'timestamp' | 'status' | 'source'>): Promise<string> {
    try {
      // Validate required fields
      if (!inquiry.name || !inquiry.email || !inquiry.subject || !inquiry.message) {
        throw new Error('All fields are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inquiry.email)) {
        throw new Error('Invalid email format');
      }

      const inquiryData: Inquiry = {
        ...inquiry,
        timestamp: Timestamp.now(),
        status: 'new',
        source: 'website_contact_form'
      };

      const inquiriesRef = collection(this.firestore, 'inquiries');
      const docRef = await addDoc(inquiriesRef, inquiryData);
      
      console.log('Inquiry saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving inquiry:', error);
      throw error;
    }
  }

  async saveContactFormSubmission(formData: { name: string; email: string; subject: string; message: string }): Promise<string> {
    return this.saveInquiry(formData);
  }

  async getInquiries(): Promise<Inquiry[]> {
    try {
      const inquiriesRef = collection(this.firestore, 'inquiries');
      const q = query(inquiriesRef, orderBy('timestamp', 'desc'));
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Inquiry & { id: string }));
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      throw error;
    }
  }
}
