import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
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
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p class="text-gray-600">Last updated: August 24, 2025</p>
          </div>

          <div class="prose prose-lg max-w-none">
            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                At Memoravilla, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our photo album sharing service. We are committed to protecting your personal information and your right to privacy.
              </p>
              <p class="text-gray-700 leading-relaxed">
                If you have any questions or concerns about our policy or our practices with regards to your personal information, please contact us at privacy&#64;memoravilla.com.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 class="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul class="list-disc pl-6 text-gray-700 mb-4">
                <li>Register for an account</li>
                <li>Upload photos or create albums</li>
                <li>Contact us for support</li>
                <li>Subscribe to our newsletter</li>
              </ul>

              <h3 class="text-xl font-medium text-gray-900 mb-3">Information Automatically Collected</h3>
              <p class="text-gray-700 leading-relaxed mb-4">
                We automatically collect certain information when you visit, use, or navigate our platform:
              </p>
              <ul class="list-disc pl-6 text-gray-700 mb-4">
                <li>Log and usage data</li>
                <li>Device information</li>
                <li>Location data (if permitted)</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                We use your personal information for the following purposes:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li>To provide and maintain our service</li>
                <li>To process your transactions</li>
                <li>To send you technical notices and updates</li>
                <li>To provide customer support</li>
                <li>To improve our service</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                We may share your information in the following situations:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li><strong>With Your Consent:</strong> We share your information when you give us explicit consent</li>
                <li><strong>Service Providers:</strong> We share with third-party vendors who perform services for us</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information to comply with legal obligations</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                We use administrative, technical, and physical safeguards to help protect your personal information. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
              <p class="text-gray-700 leading-relaxed">
                We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul class="list-disc pl-6 text-gray-700">
                <li>The right to access your personal information</li>
                <li>The right to rectify inaccurate information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to access or store information. You can control cookies through your browser settings and may refuse all cookies except those that are strictly necessary.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
              <p class="text-gray-700 leading-relaxed">
                Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p class="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p class="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul class="list-none text-gray-700">
                <li>Email: privacy&#64;memoravilla.com</li>
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
export class PrivacyPolicyComponent {}
