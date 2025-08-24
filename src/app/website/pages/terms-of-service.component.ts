import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <a routerLink="/" class="flex items-center">
                <img src="assets/icons/Memorabilia.png" alt="Memoravilla" class="h-8 w-auto mr-3">
                <span class="text-xl font-semibold text-gray-900">Memoravilla</span>
              </a>
            </div>
            <a routerLink="/" class="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-lg shadow-md p-8">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p class="text-gray-600">Last updated: August 24, 2025</p>
          </div>

          <div class="prose prose-lg max-w-none">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                These Terms of Service ("Terms") govern your use of Memoravilla's photo album sharing platform ("Service") operated by Memoravilla ("us", "we", or "our"). By accessing or using our Service, you agree to be bound by these Terms.
              </p>
              <p class="text-gray-700 leading-relaxed">
                If you disagree with any part of these Terms, then you may not access the Service.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Memoravilla provides a digital platform that allows users to:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li>Create and organize photo albums</li>
                <li>Share photos and albums with family and friends</li>
                <li>Collaborate on shared memories</li>
                <li>Store photos securely in the cloud</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                To access certain features of the Service, you must register for an account. When creating an account, you agree to:
              </p>
              <ul class="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all risks of unauthorized access to your account</li>
              </ul>
              <p class="text-gray-700 leading-relaxed">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">User Content</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                You retain ownership of all photos and content you upload to the Service ("User Content"). By uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, copy, modify, and distribute your content solely for the purpose of providing the Service.
              </p>
              
              <h3 class="text-xl font-medium text-gray-900 mb-3">Content Guidelines</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                You agree not to upload content that:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li>Violates any laws or regulations</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains harmful, offensive, or inappropriate material</li>
                <li>Violates privacy rights of others</li>
                <li>Contains viruses or malicious code</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Privacy and Sharing</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                You control who can access your albums through our privacy settings. When you invite others to view or contribute to your albums, you are responsible for ensuring you have the right to share that content.
              </p>
              <p class="text-gray-700 leading-relaxed">
                We are not responsible for how invited users use or share your content once they have access.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                You may not use the Service:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li>For any unlawful purpose or to solicit unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations or laws</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To transmit or procure sending of advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate another user</li>
                <li>To interfere with or circumvent security features</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Subscription and Billing</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                We offer both free and paid subscription plans. Paid subscriptions are billed in advance on a monthly or annual basis and are non-refundable except as required by law.
              </p>
              <p class="text-gray-700 leading-relaxed mb-4">
                You may cancel your subscription at any time, but you will continue to have access until the end of your current billing period.
              </p>
              <p class="text-gray-700 leading-relaxed">
                We reserve the right to change our pricing at any time with 30 days notice to existing subscribers.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Data Backup and Loss</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                While we take reasonable measures to backup and protect your data, we recommend that you maintain your own backups of important photos and content.
              </p>
              <p class="text-gray-700 leading-relaxed">
                We are not liable for any loss of data, photos, or content stored on our platform.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Either party may terminate your account at any time. Upon termination:
              </p>
              <ul class="list-disc pl-6 text-gray-700 mb-4">
                <li>Your right to use the Service will cease immediately</li>
                <li>You may download your content for a period of 30 days</li>
                <li>We may delete your account and content after 30 days</li>
              </ul>
              <p class="text-gray-700 leading-relaxed">
                We reserve the right to terminate accounts that violate these Terms without notice.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Warranties</h2>
              <p class="text-gray-700 leading-relaxed">
                The Service is provided "as is" without any representations or warranties, express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p class="text-gray-700 leading-relaxed">
                In no event shall Memoravilla be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p class="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul class="list-none text-gray-700">
                <li>Email: legal&#64;memoravilla.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Memory Lane, San Francisco, CA 94105</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TermsOfServiceComponent {}
