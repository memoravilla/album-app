# Stripe Integration Setup Guide

This guide will help you set up the Stripe subscription system with Firebase Functions.

## Prerequisites

1. A Stripe account (https://dashboard.stripe.com/)
2. Firebase project with Functions enabled
3. Node.js 18+ for Firebase Functions

## Step 1: Configure Stripe Account

1. **Create a Stripe Account**: Sign up at https://dashboard.stripe.com/
2. **Get API Keys**: 
   - Go to Developers > API Keys
   - Copy your Publishable Key (starts with `pk_test_` or `pk_live_`)
   - Copy your Secret Key (starts with `sk_test_` or `sk_live_`)

3. **Create a Product and Price**:
   - Go to Products in your Stripe Dashboard
   - Create a new product (e.g., "Premium Subscription")
   - Add a recurring price (e.g., $9.99/month)
   - Copy the Price ID (starts with `price_`)

## Step 2: Configure Environment Variables

### Frontend (Angular)
Update your environment files:

**src/environments/environment.ts** (Development):
```typescript
export const environment = {
  production: false,
  // ... other config
  stripe: {
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'
  }
};
```

**src/environments/environment.prod.ts** (Production):
```typescript
export const environment = {
  production: true,
  // ... other config
  stripe: {
    publishableKey: 'pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE'
  }
};
```

### Backend (Firebase Functions)
Set environment variables for Firebase Functions:

```bash
cd functions
firebase functions:config:set stripe.secret_key="sk_test_YOUR_SECRET_KEY_HERE"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET_HERE"
```

For production:
```bash
firebase functions:config:set stripe.secret_key="sk_live_YOUR_LIVE_SECRET_KEY_HERE" --project your-production-project
```

## Step 3: Update Price ID

In `src/app/services/subscription.service.ts`, update the price ID:

```typescript
private readonly PREMIUM_PRICE_ID = 'price_YOUR_ACTUAL_PRICE_ID_HERE';
```

## Step 4: Deploy Firebase Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Step 5: Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Update your Firebase Functions config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET_HERE"
   ```
7. Redeploy functions: `firebase deploy --only functions`

## Step 6: Update Firestore Rules

Make sure your Firestore rules allow users to read/write their subscription data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ... other rules
  }
}
```

## Step 7: Test the Integration

1. Start your development server: `npm start`
2. Navigate to `/app/subscription`
3. Click "Subscribe to Premium"
4. Complete the checkout process with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Test Cards for Development

Use these test card numbers in development:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires 3D Secure**: 4000 0025 0000 3155

## Production Checklist

Before going live:

1. ✅ Replace test API keys with live keys
2. ✅ Update webhook endpoint to production URL
3. ✅ Test with real payment methods
4. ✅ Set up proper error monitoring
5. ✅ Configure subscription management emails in Stripe
6. ✅ Test webhook handling thoroughly
7. ✅ Set up proper logging and monitoring

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check that the webhook secret is correct
   - Ensure the webhook URL is correct
   - Verify Firebase Functions are deployed

2. **Authentication required error**
   - Ensure user is logged in before subscription actions
   - Check Firebase Auth configuration

3. **Price not found**
   - Verify the price ID is correct
   - Check that the price exists in your Stripe account

4. **Functions not deployed**
   - Run `firebase deploy --only functions`
   - Check Firebase Functions logs: `firebase functions:log`

### Logs and Monitoring

Check logs:
```bash
# Firebase Functions logs
firebase functions:log

# Stripe webhook logs
# Go to Stripe Dashboard > Developers > Webhooks > Your webhook > Recent deliveries
```

## Security Notes

1. **Never expose secret keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Validate webhooks** with signature verification
4. **Implement proper error handling** for payment failures
5. **Use HTTPS** in production
6. **Regularly rotate API keys**

## Support

For issues with this integration:
1. Check Firebase Functions logs
2. Check Stripe webhook delivery logs
3. Review Firestore security rules
4. Test with Stripe's test cards
5. Contact support if needed
