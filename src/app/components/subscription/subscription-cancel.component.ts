import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subscription-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cancel-container">
      <div class="cancel-content">
        <div class="cancel-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#6c757d"/>
            <path d="M8 8l8 8M8 16l8-8" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        
        <h1>Subscription Cancelled</h1>
        <p>Your subscription process was cancelled. No charges have been made to your account.</p>
        
        <div class="offer">
          <h3>Still interested in premium features?</h3>
          <p>You can subscribe at any time to unlock all premium features and enjoy unlimited access to our platform.</p>
          
          <div class="benefits">
            <ul>
              <li>Unlimited album suggestions</li>
              <li>Advanced voting features</li>
              <li>Priority support</li>
              <li>Exclusive features</li>
            </ul>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/subscription" class="btn btn-primary">
            Try Again
          </a>
          <a routerLink="/" class="btn btn-secondary">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .cancel-content {
      max-width: 500px;
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cancel-icon {
      margin-bottom: 2rem;
    }

    h1 {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    p {
      color: #6c757d;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .offer {
      margin: 2rem 0;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .offer h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .benefits ul {
      list-style: none;
      padding: 0;
      text-align: left;
      margin-top: 1rem;
    }

    .benefits li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }

    .benefits li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #007bff;
      font-weight: bold;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .cancel-content {
        padding: 2rem;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class SubscriptionCancelComponent {}
