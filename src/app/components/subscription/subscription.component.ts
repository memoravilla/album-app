import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService, SubscriptionStatus } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p class="text-gray-600">Manage your Memorabilia subscription plan</p>
          </div>

          <!-- Current Status -->
          <div *ngIf="subscriptionStatus" class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-blue-900 mb-2">Current Plan</h2>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-800">
                  <span class="font-medium">Plan:</span> {{ subscriptionStatus.planType || 'Basic' }}
                </p>
                <p class="text-blue-800" *ngIf="subscriptionStatus.subscriptionStatus">
                  <span class="font-medium">Status:</span> {{ subscriptionStatus.subscriptionStatus }}
                </p>
              </div>
              <button 
                (click)="refreshStatus()"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                [disabled]="isLoading">
                {{ isLoading ? 'Refreshing...' : 'Refresh Status' }}
              </button>
            </div>
          </div>

          <!-- Plan Selection -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
            
            <div class="grid md:grid-cols-3 gap-6">
              <!-- Basic Plan -->
              <div class="border rounded-lg p-6 relative bg-gray-50">
                <div class="text-center">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p class="text-3xl font-bold text-gray-700 mb-4">Free</p>
                  <ul class="text-left text-gray-600 mb-6 space-y-2">
                    <li>✓ 3 Albums</li>
                    <li>✓ 100 Photos per Album</li>
                    <li>✓ Basic sharing options</li>
                    <li>✓ Mobile & web access</li>
                    <li>✓ Community support</li>
                  </ul>
                  <button 
                    *ngIf="!isCurrentPlan('Basic')"
                    (click)="switchToBasic()"
                    class="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    [disabled]="isLoading">
                    Switch to Basic
                  </button>
                  <div *ngIf="isCurrentPlan('Basic')" class="w-full py-2 px-4 bg-green-100 text-green-800 rounded-md text-center font-medium">
                    Current Plan
                  </div>
                </div>
              </div>

              <!-- Premium Plan -->
              <div class="border-2 border-blue-500 rounded-lg p-6 relative bg-white">
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span class="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Popular</span>
                </div>
                <div class="text-center">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                  <p class="text-3xl font-bold text-blue-600 mb-1">€19.00</p>
                  <p class="text-gray-500 mb-4">/month</p>
                  <ul class="text-left text-gray-600 mb-6 space-y-2">
                    <li>✓ Everything in Basic</li>
                    <li>✓ 10 Albums</li>
                    <li>✓ 500 Photos per Album</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <button 
                    *ngIf="!isCurrentPlan('pro')"
                    (click)="subscribeToPro()"
                    class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    [disabled]="isLoading">
                    {{ isLoading ? 'Processing...' : 'Choose Pro' }}
                  </button>
                  <div *ngIf="isCurrentPlan('pro')" class="w-full py-2 px-4 bg-green-100 text-green-800 rounded-md text-center font-medium">
                    Current Plan
                  </div>
                </div>
              </div>

              <!-- Pro Plan -->
              <div class="border rounded-lg p-6 relative bg-white">
                <div class="text-center">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p class="text-3xl font-bold text-purple-600 mb-1">€39.00</p>
                  <p class="text-gray-500 mb-4">/month</p>
                  <ul class="text-left text-gray-600 mb-6 space-y-2">
                    <li>✓ Everything in Pro</li>
                    <li>✓ Unlimited albums</li>
                    <li>✓ Unlimited Photos</li>
                    <li>✓ Photo editing tools</li>
                    <li>✓ Custom Theming</li>
                    <li>✓ Dedicated support</li>
                  </ul>
                  <button 
                    *ngIf="!isCurrentPlan('premium')"
                    (click)="subscribeToPremium()"
                    class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    [disabled]="isLoading">
                    {{ isLoading ? 'Processing...' : 'Choose Premium' }}
                  </button>
                  <div *ngIf="isCurrentPlan('premium')" class="w-full py-2 px-4 bg-green-100 text-green-800 rounded-md text-center font-medium">
                    Current Plan
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Error/Success Messages -->
          <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p class="text-red-800">{{ errorMessage }}</p>
          </div>
          
          <div *ngIf="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p class="text-green-800">{{ successMessage }}</p>
          </div>

          <!-- Debug Info -->
          <div *ngIf="debugInfo" class="mt-6 p-4 bg-gray-100 border rounded-md">
            <h3 class="font-semibold text-gray-900 mb-2">Debug Information:</h3>
            <pre class="text-sm text-gray-700 overflow-x-auto">{{ debugInfo }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  subscriptionStatus: SubscriptionStatus | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  debugInfo = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadSubscriptionStatus();
  }

  private async loadSubscriptionStatus() {
    try {
      this.isLoading = true;
      this.subscriptionService.getSubscriptionStatus().subscribe({
        next: (status) => {
          this.subscriptionStatus = status;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subscription status:', error);
          this.errorMessage = 'Failed to load subscription status';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading subscription status:', error);
      this.errorMessage = 'Failed to load subscription status';
      this.isLoading = false;
    }
  }

  isCurrentPlan(planType: string): boolean {
    if (!this.subscriptionStatus) {
      return planType === 'basic';
    }
    return (this.subscriptionStatus.planType || 'basic') === planType;
  }

  async subscribeToPremium() {
    await this.subscribeToPlan('Premium');
  }

  async subscribeToPro() {
    await this.subscribeToPlan('Pro');
  }

  async switchToBasic() {
    try {
      this.isLoading = true;
      this.clearMessages();
      
      // For switching to basic, we would typically cancel the subscription through Stripe
      // For now, we'll just sync the status and let the user manage through Stripe portal
      this.successMessage = 'To cancel your subscription, please use the "Sync with Stripe" button or manage through the billing portal.';
      await this.loadSubscriptionStatus();
    } catch (error) {
      console.error('Error switching to Basic:', error);
      this.errorMessage = 'Failed to switch to Basic plan';
    } finally {
      this.isLoading = false;
    }
  }

  private async subscribeToPlan(planType: 'Premium' | 'Pro') {
    try {
      this.isLoading = true;
      this.clearMessages();

      // Check if user is authenticated
      const user = this.authService.currentUser();
      if (!user) {
        this.errorMessage = 'Please sign in to subscribe';
        this.router.navigate(['/login']);
        return;
      }

      // Subscribe to the plan
      if (planType === 'Premium') {
        this.subscriptionService.subscribeToPremium().subscribe({
          next: (checkoutUrl) => {
            window.location.href = checkoutUrl;
          },
          error: (error) => {
            console.error(`Error subscribing to ${planType}:`, error);
            this.errorMessage = `Failed to subscribe to ${planType} plan`;
            this.isLoading = false;
          }
        });
      } else {
        this.subscriptionService.subscribeToPro().subscribe({
          next: (checkoutUrl) => {
            window.location.href = checkoutUrl;
          },
          error: (error) => {
            console.error(`Error subscribing to ${planType}:`, error);
            this.errorMessage = `Failed to subscribe to ${planType} plan`;
            this.isLoading = false;
          }
        });
      }
    } catch (error) {
      console.error(`Error subscribing to ${planType}:`, error);
      this.errorMessage = `Failed to subscribe to ${planType} plan`;
      this.isLoading = false;
    }
  }

  async refreshStatus() {
    await this.loadSubscriptionStatus();
    this.successMessage = 'Subscription status refreshed';
  }

  async syncWithStripe() {
    try {
      this.isLoading = true;
      this.clearMessages();
      
      this.subscriptionService.syncUserSubscription().subscribe({
        next: (result) => {
          this.successMessage = 'Successfully synced with Stripe';
          this.loadSubscriptionStatus();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error syncing with Stripe:', error);
          this.errorMessage = 'Failed to sync with Stripe';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      console.log(error);
      this.errorMessage = 'Failed to sync with Stripe';
      this.isLoading = false;
    }
  }

  async debugSubscription() {
    try {
      this.isLoading = true;
      this.clearMessages();
      
      this.subscriptionService.getSubscriptionStatus().subscribe({
        next: (status) => {
          this.debugInfo = JSON.stringify(status, null, 2);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error getting debug info:', error);
          this.errorMessage = 'Failed to get debug information';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error getting debug info:', error);
      this.errorMessage = 'Failed to get debug information';
      this.isLoading = false;
    }
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.debugInfo = '';
  }
}
