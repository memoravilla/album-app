import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade your Memoravilla experience with more storage, advanced features, and priority support
          </p>
        </div>

        <!-- Current Plan Badge -->
        @if (currentUser()?.planType) {
          <div class="text-center mb-8">
            <div class="inline-flex items-center px-4 py-2 rounded-full"
                 [ngClass]="{
                   'bg-gray-100 text-gray-700': currentUser()?.planType === 'basic',
                   'bg-blue-100 text-blue-700': currentUser()?.planType === 'pro',
                   'bg-purple-100 text-purple-700': currentUser()?.planType === 'premium'
                 }">
              <span class="text-sm font-medium">Current Plan: {{ getPlanDisplayName() }}</span>
            </div>
          </div>
        }

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Basic Plan -->
          <div class="bg-white rounded-lg shadow-lg border-2"
               [ngClass]="currentUser()?.planType === 'basic' ? 'border-blue-500' : 'border-gray-200'">
            <div class="p-8">
              <div class="text-center">
                <h3 class="text-2xl font-semibold text-gray-900 mb-2">Basic</h3>
                <div class="mb-4">
                  <span class="text-4xl font-bold text-gray-900">$0</span>
                  <span class="text-gray-500">/month</span>
                </div>
                @if (currentUser()?.planType === 'basic') {
                  <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                    Current Plan
                  </div>
                }
              </div>
              
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Up to 5 albums
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  100 photos per album
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  1GB storage
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Basic sharing
                </li>
              </ul>
              
              <button 
                [disabled]="currentUser()?.planType === 'basic'"
                class="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                [ngClass]="currentUser()?.planType === 'basic' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'"
              >
                {{ currentUser()?.planType === 'basic' ? 'Current Plan' : 'Downgrade to Basic' }}
              </button>
            </div>
          </div>

          <!-- Pro Plan -->
          <div class="bg-white rounded-lg shadow-lg border-2 transform scale-105"
               [ngClass]="currentUser()?.planType === 'pro' ? 'border-blue-500' : 'border-blue-200'">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <div class="p-8">
              <div class="text-center">
                <h3 class="text-2xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div class="mb-4">
                  <span class="text-4xl font-bold text-gray-900">$9.99</span>
                  <span class="text-gray-500">/month</span>
                </div>
                @if (currentUser()?.planType === 'pro') {
                  <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                    Current Plan
                  </div>
                }
              </div>
              
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Up to 25 albums
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  1,000 photos per album
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  10GB storage
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Advanced sharing controls
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Custom themes
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Advanced analytics
                </li>
              </ul>
              
              <button 
                (click)="selectPlan('pro')"
                [disabled]="true"
                class="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                [ngClass]="currentUser()?.planType === 'pro' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'"
              >
                  Coming Soon
              </button>
            </div>
          </div>

          <!-- Premium Plan -->
          <div class="bg-white rounded-lg shadow-lg border-2"
               [ngClass]="currentUser()?.planType === 'premium' ? 'border-purple-500' : 'border-gray-200'">
            <div class="p-8">
              <div class="text-center">
                <h3 class="text-2xl font-semibold text-gray-900 mb-2">Premium</h3>
                <div class="mb-4">
                  <span class="text-4xl font-bold text-gray-900">$19.99</span>
                  <span class="text-gray-500">/month</span>
                </div>
                @if (currentUser()?.planType === 'premium') {
                  <div class="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                    Current Plan
                  </div>
                }
              </div>
              
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Unlimited albums
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Unlimited photos per album
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  100GB storage
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Advanced sharing controls
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Custom themes
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Priority support
                </li>
                <li class="flex items-center text-gray-700">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Advanced analytics
                </li>
              </ul>
              
              <button 
                (click)="selectPlan('premium')"
                [disabled]="true"
                class="w-full py-3 px-4 rounded-lg font-medium transition-colors"
                [ngClass]="currentUser()?.planType === 'premium' 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <!-- Back to Dashboard -->
        <div class="text-center mt-12">
          <button 
            (click)="goBack()"
            class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  `
})
export class UpgradeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  getPlanDisplayName(): string {
    const user = this.currentUser();
    if (!user || !user.planType) return 'Basic';
    
    return user.planType.charAt(0).toUpperCase() + user.planType.slice(1);
  }

  async selectPlan(planType: 'pro' | 'premium') {
    try {
      // For demo purposes, set expiration to 30 days from now
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      await this.authService.updateUserPlan(planType, expirationDate);
      
      alert(`Successfully upgraded to ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan!`);
      this.router.navigate(['/app/dashboard']);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('There was an error upgrading your plan. Please try again.');
    }
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}
