import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h1>Welcome to Premium!</h1>
        <p>Your subscription has been successfully activated. You now have access to all premium features.</p>
        
        <div class="benefits">
          <h3>You now have access to:</h3>
          <ul>
            <li>Unlimited album suggestions</li>
            <li>Advanced voting features</li>
            <li>Priority support</li>
            <li>Exclusive features</li>
          </ul>
        </div>

        <div class="actions">
          <a routerLink="/" class="btn btn-primary">
            Go to Home
          </a>
          <a routerLink="/subscription" class="btn btn-secondary">
            Manage Subscription
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .success-content {
      max-width: 500px;
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .success-icon {
      margin-bottom: 2rem;
    }

    h1 {
      color: #28a745;
      margin-bottom: 1rem;
    }

    p {
      color: #6c757d;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .benefits {
      margin: 2rem 0;
      text-align: left;
    }

    .benefits h3 {
      margin-bottom: 1rem;
      color: #333;
      text-align: center;
    }

    .benefits ul {
      list-style: none;
      padding: 0;
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
      color: #28a745;
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
      .success-content {
        padding: 2rem;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class SubscriptionSuccessComponent {}
