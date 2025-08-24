import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-center',
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
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to frequently asked questions and learn how to make the most of Memoravilla
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mb-12">
          <div class="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search for help articles..."
              class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
            <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- FAQ Categories -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          @for (category of helpCategories; track category.title) {
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <div [innerHTML]="category.icon" class="w-6 h-6 text-primary-600"></div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ category.title }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ category.description }}</p>
              <span class="text-primary-600 text-sm font-medium">{{ category.articleCount }} articles</span>
            </div>
          }
        </div>

        <!-- Popular Articles -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div class="space-y-4">
            @for (article of popularArticles; track article.title) {
              <div class="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                <h3 class="text-lg font-medium text-gray-900 hover:text-primary-600 cursor-pointer mb-2">
                  {{ article.title }}
                </h3>
                <p class="text-gray-600 text-sm mb-2">{{ article.summary }}</p>
                <div class="flex items-center text-xs text-gray-500">
                  <span>{{ article.category }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ article.readTime }} read</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Contact Support -->
        <div class="mt-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of Memoravilla.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/#contact" class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Contact Support
            </a>
            <a href="mailto:support@memoravilla.com" class="border border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HelpCenterComponent {
  helpCategories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of creating your first album',
      articleCount: 8,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>'
    },
    {
      title: 'Albums & Photos',
      description: 'Managing your photo albums and uploads',
      articleCount: 12,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
    },
    {
      title: 'Sharing & Invitations',
      description: 'Invite family and friends to your albums',
      articleCount: 6,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>'
    },
    {
      title: 'Account & Settings',
      description: 'Manage your profile and preferences',
      articleCount: 5,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>'
    },
    {
      title: 'Privacy & Security',
      description: 'Keep your memories safe and secure',
      articleCount: 4,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>'
    },
    {
      title: 'Troubleshooting',
      description: 'Solve common issues and problems',
      articleCount: 7,
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>'
    }
  ];

  popularArticles = [
    {
      title: 'How to create your first photo album',
      summary: 'Step-by-step guide to getting started with Memoravilla and creating beautiful albums.',
      category: 'Getting Started',
      readTime: '3 min'
    },
    {
      title: 'Inviting family members to your album',
      summary: 'Learn how to share your memories with loved ones through secure invitations.',
      category: 'Sharing & Invitations',
      readTime: '2 min'
    },
    {
      title: 'Uploading and organizing photos',
      summary: 'Best practices for uploading photos and keeping your albums organized.',
      category: 'Albums & Photos',
      readTime: '4 min'
    },
    {
      title: 'Managing photo permissions and privacy',
      summary: 'Control who can see and contribute to your photo albums with privacy settings.',
      category: 'Privacy & Security',
      readTime: '3 min'
    },
    {
      title: 'Troubleshooting upload issues',
      summary: 'Common solutions for photos that won\'t upload or display properly.',
      category: 'Troubleshooting',
      readTime: '2 min'
    }
  ];
}
