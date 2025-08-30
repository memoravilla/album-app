import {onCall, onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {FieldValue} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import Stripe from "stripe";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe - Replace with your actual secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil",
});

// Webhook endpoint secret - Replace with your actual webhook secret
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Stripe Price IDs for different plans
const PLAN_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_1S1jyg4lzUROwBs0mCWYbktg", // Replace with your actual Pro price ID
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || "price_1S1jiH4lzUROwBs0lsbjL0RJ", // Replace with your actual Premium price ID
};

/**
 * Create a Stripe customer for authenticated users
 */
export const createStripeCustomer = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;
    const {email, name} = request.data;

    // Check if customer already exists
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
      return {customerId: userDoc.data()?.stripeCustomerId};
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        firebaseUID: uid,
      },
    });

    // Store customer ID in Firestore
    await admin.firestore()
      .collection("users")
      .doc(uid)
      .set(
        {
          stripeCustomerId: customer.id,
          email,
          name,
        },
        {merge: true}
      );

    logger.info(`Created Stripe customer ${customer.id} for user ${uid}`);

    return {customerId: customer.id};
  } catch (error) {
    logger.error("Error creating Stripe customer:", error);
    throw new Error(`Failed to create customer: ${error}`);
  }
});

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;
    const {priceId, successUrl, cancelUrl} = request.data;

    if (!priceId || !successUrl || !cancelUrl) {
      throw new Error("Missing required parameters");
    }

    // Get or create customer
    let customerId: string;
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
      customerId = userDoc.data()?.stripeCustomerId;
    } else {
      // Create customer if doesn't exist
      const customer = await stripe.customers.create({
        metadata: {
          firebaseUID: uid,
        },
      });
      customerId = customer.id;

      // Store customer ID
      await admin.firestore()
        .collection("users")
        .doc(uid)
        .set(
          {
            stripeCustomerId: customerId,
          },
          {merge: true}
        );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        firebaseUID: uid,
      },
      subscription_data: {
        metadata: {
          firebaseUID: uid,
        },
      },
    });

    logger.info(`Created checkout session ${session.id} for user ${uid}`);

    return {sessionId: session.id, url: session.url};
  } catch (error) {
    logger.error("Error creating checkout session:", error);
    throw new Error(`Failed to create checkout session: ${error}`);
  }
});

/**
 * Create a billing portal session for subscription management
 */
export const createPortalSession = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;
    const {returnUrl} = request.data;

    if (!returnUrl) {
      throw new Error("Return URL is required");
    }

    // Get customer ID
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists || !userDoc.data()?.stripeCustomerId) {
      throw new Error("No Stripe customer found");
    }

    const customerId = userDoc.data()?.stripeCustomerId;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    logger.info(`Created portal session for user ${uid}`);

    return {url: session.url};
  } catch (error) {
    logger.error("Error creating portal session:", error);
    throw new Error(`Failed to create portal session: ${error}`);
  }
});

/**
 * Get user's subscription status
 */
export const getSubscriptionStatus = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;

    logger.info(`Getting subscription status for user ${uid}`);

    // Get user data
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    logger.info('User document data:', userDoc.data());

    if (!userDoc.exists) {
      return {
        hasActiveSubscription: false,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        planType: "basic",
      };
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;
    const subscriptionId = userData?.subscriptionId;

    logger.info(`User ${uid} has customer ID: ${stripeCustomerId} and subscription ID: ${subscriptionId}`);

    if (!stripeCustomerId && !subscriptionId) {
      return {
        hasActiveSubscription: false,
        subscriptionStatus: null,
        currentPeriodEnd: null,
        planType: "basic",
      };
    }

    // If we have a subscription ID, get it directly from Stripe
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        logger.info('Retrieved subscription from Stripe:', subscription.id, subscription.status);

        const hasActiveSubscription = [
          "active",
          "trialing",
          "past_due",
        ].includes(subscription.status);

        // Determine plan type based on price ID
        let planType = "basic";
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          if (priceId === PLAN_PRICES.pro) {
            planType = "pro";
          } else if (priceId === PLAN_PRICES.premium) {
            planType = "premium";
          }
        }

        // Convert timestamps to safe numbers
        const stripeSubscription = subscription as any;
        const currentPeriodEnd = stripeSubscription.current_period_end ? Number(stripeSubscription.current_period_end) * 1000 : null;
        const cancelAtPeriodEnd = Boolean(stripeSubscription.cancel_at_period_end);

        return {
          hasActiveSubscription,
          subscriptionStatus: subscription.status,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          planType,
          priceId: subscription.items.data[0]?.price?.id || null,
        };
      } catch (error) {
        logger.error(`Error retrieving subscription ${subscriptionId}:`, error);
        // If subscription doesn't exist in Stripe, check for active subscriptions by customer
      }
    }

    // If no subscription ID or it failed, check by customer ID
    if (stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          logger.info('Found active subscription for customer:', subscription.id, subscription.status);

          const hasActiveSubscription = [
            "active",
            "trialing",
            "past_due",
          ].includes(subscription.status);

          // Determine plan type based on price ID
          let planType = "basic";
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            if (priceId === PLAN_PRICES.pro) {
              planType = "pro";
            } else if (priceId === PLAN_PRICES.premium) {
              planType = "premium";
            }
          }

          // Update user document with found subscription ID
          await admin.firestore()
            .collection("users")
            .doc(uid)
            .set({
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              currentPeriodEnd: Number((subscription as any).current_period_end) * 1000,
              cancelAtPeriodEnd: Boolean((subscription as any).cancel_at_period_end),
              planType,
              priceId: subscription.items.data[0]?.price?.id,
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });

          return {
            hasActiveSubscription,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: Number((subscription as any).current_period_end) * 1000,
            cancelAtPeriodEnd: Boolean((subscription as any).cancel_at_period_end),
            planType,
            priceId: subscription.items.data[0]?.price?.id,
          };
        }
      } catch (error) {
        logger.error(`Error checking subscriptions for customer ${stripeCustomerId}:`, error);
      }
    }

    // No active subscription found
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      planType: "basic",
    };
  } catch (error) {
    logger.error("Error getting subscription status:", error);
    throw new Error(`Failed to get subscription status: ${error}`);
  }
});

/**
 * Stripe webhook handler
 */
export const stripeWebhook = onRequest(async (request, response) => {
  try {
    const signature = request.headers["stripe-signature"];

    if (!signature) {
      response.status(400).send("Missing Stripe signature");
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error("Webhook signature verification failed:", err);
      response.status(400).send(`Webhook Error: ${err}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    response.json({received: true});
  } catch (error) {
    logger.error("Error in webhook handler:", error);
    response.status(500).send("Webhook handler failed");
  }
});

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const firebaseUID = session.metadata?.firebaseUID;

    if (!firebaseUID) {
      logger.error("No Firebase UID in session metadata");
      return;
    }

    // Get the subscription details to determine plan type
    let planType = "basic";
    let priceId = null;
    let currentPeriodEnd = null;
    let cancelAtPeriodEnd = false;

    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Determine plan type based on price ID
        if (subscription.items.data.length > 0) {
          priceId = subscription.items.data[0].price.id;
          if (priceId === PLAN_PRICES.pro) {
            planType = "pro";
          } else if (priceId === PLAN_PRICES.premium) {
            planType = "premium";
          }
        }

        // Get subscription details
        currentPeriodEnd = Number((subscription as any).current_period_end) * 1000;
        cancelAtPeriodEnd = Boolean((subscription as any).cancel_at_period_end);

        logger.info(`Checkout completed - Plan: ${planType}, Price ID: ${priceId}`);
      } catch (error) {
        logger.error("Error retrieving subscription details in checkout completion:", error);
      }
    }

    // Update user document with subscription info and plan type
    await admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .set(
        {
          subscriptionId: session.subscription,
          customerId: session.customer,
          subscriptionStatus: "active",
          planType,
          priceId,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(
      `Updated subscription for user ${firebaseUID}: ${session.subscription} with plan ${planType}`
    );
  } catch (error) {
    logger.error("Error handling checkout session completed:", error);
  }
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const firebaseUID = subscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      logger.error("No Firebase UID in subscription metadata");
      return;
    }

    // Determine plan type based on price ID
    let planType = "basic";
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      if (priceId === PLAN_PRICES.pro) {
        planType = "pro";
      } else if (priceId === PLAN_PRICES.premium) {
        planType = "premium";
      }
    }

    // Update user document
    await admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .set(
        {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          currentPeriodEnd: Number((subscription as any).current_period_end) * 1000,
          cancelAtPeriodEnd: Boolean((subscription as any).cancel_at_period_end),
          planType,
          priceId: subscription.items.data[0]?.price?.id,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(
      `Updated subscription ${subscription.id} for user ${firebaseUID} with plan ${planType}`
    );
  } catch (error) {
    logger.error("Error handling subscription change:", error);
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const firebaseUID = subscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      logger.error("No Firebase UID in subscription metadata");
      return;
    }

    // Update user document
    await admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .set(
        {
          subscriptionStatus: "canceled",
          cancelAtPeriodEnd: true,
          planType: "basic", // Reset to basic plan
          priceId: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(
      `Marked subscription as canceled for user ${firebaseUID}`
    );
  } catch (error) {
    logger.error("Error handling subscription deletion:", error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscription = (invoice as any).subscription as string;
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    const firebaseUID = stripeSubscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      logger.error("No Firebase UID found for payment");
      return;
    }

    // Determine plan type based on price ID
    let planType = "basic";
    let priceId = null;
    if (stripeSubscription.items.data.length > 0) {
      priceId = stripeSubscription.items.data[0].price.id;
      if (priceId === PLAN_PRICES.pro) {
        planType = "pro";
      } else if (priceId === PLAN_PRICES.premium) {
        planType = "premium";
      }
    }

    // Update user document with plan type and payment success
    await admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .set(
        {
          subscriptionStatus: "active",
          planType,
          priceId,
          currentPeriodEnd: Number((stripeSubscription as any).current_period_end) * 1000,
          cancelAtPeriodEnd: Boolean((stripeSubscription as any).cancel_at_period_end),
          lastPaymentDate: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(`Payment succeeded for user ${firebaseUID} with plan ${planType}`);
  } catch (error) {
    logger.error("Error handling payment success:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscription = (invoice as any).subscription as string;
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    const firebaseUID = stripeSubscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      logger.error("No Firebase UID found for failed payment");
      return;
    }

    // Update user document
    await admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .set(
        {
          subscriptionStatus: "past_due",
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(`Payment failed for user ${firebaseUID}`);
  } catch (error) {
    logger.error("Error handling payment failure:", error);
  }
}

/**
 * Manually sync user subscription data from Stripe to Firestore
 * This is useful when webhook events are missed or for manual updates
 */
export const syncUserSubscription = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;
    logger.info(`Syncing subscription data for user ${uid}`);

    // Get user document to find Stripe customer ID
    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      logger.error(`User document not found for ${uid}`);
      throw new Error("User document not found");
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      logger.error(`No Stripe customer ID found for user ${uid}`);
      return {
        success: false,
        message: "No Stripe customer found. Please create a subscription first.",
        hasActiveSubscription: false,
        subscriptionStatus: null,
      };
    }

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });

    logger.info(`Found ${subscriptions.data.length} subscriptions for customer ${stripeCustomerId}`);

    // Find the most recent active subscription
    let activeSubscription = null;
    let subscriptionStatus = "none";
    let hasActiveSubscription = false;

    for (const subscription of subscriptions.data) {
      logger.info(`Subscription ${subscription.id} status: ${subscription.status}`);
      
      if (["active", "trialing", "past_due"].includes(subscription.status)) {
        activeSubscription = subscription;
        subscriptionStatus = subscription.status;
        hasActiveSubscription = true;
        break; // Take the first active subscription
      } else if (subscription.status === "canceled" && !activeSubscription) {
        // Only use canceled as fallback if no active subscription found
        subscriptionStatus = subscription.status;
      }
    }

    // Update user document in Firestore
    const updateData: any = {
      stripeCustomerId,
      subscriptionStatus,
      hasActiveSubscription,
      lastSyncedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (activeSubscription) {
      updateData.subscriptionId = activeSubscription.id;
      updateData.currentPeriodEnd = Number((activeSubscription as any).current_period_end) * 1000;
      updateData.cancelAtPeriodEnd = Boolean((activeSubscription as any).cancel_at_period_end);
      
      // Determine plan type based on price ID
      let planType = "basic";
      if (activeSubscription.items.data.length > 0) {
        const priceId = activeSubscription.items.data[0].price.id;
        if (priceId === PLAN_PRICES.pro) {
          planType = "pro";
        } else if (priceId === PLAN_PRICES.premium) {
          planType = "premium";
        }
      }
      updateData.planType = planType;
      updateData.priceId = activeSubscription.items.data[0]?.price?.id;
      
      // Add metadata from subscription
      if (activeSubscription.metadata?.firebaseUID !== uid) {
        // Update Stripe subscription metadata to include Firebase UID
        await stripe.subscriptions.update(activeSubscription.id, {
          metadata: {
            firebaseUID: uid,
          },
        });
        logger.info(`Updated subscription ${activeSubscription.id} metadata with Firebase UID`);
      }
    } else {
      // No active subscription, set to basic plan
      updateData.planType = "basic";
      updateData.priceId = null;
    }

    await admin.firestore()
      .collection("users")
      .doc(uid)
      .set(updateData, {merge: true});

    logger.info(`Successfully synced subscription data for user ${uid}:`, {
      hasActiveSubscription,
      subscriptionStatus,
      subscriptionId: activeSubscription?.id,
    });

    return {
      success: true,
      message: "Subscription data synced successfully",
      hasActiveSubscription,
      subscriptionStatus,
      subscriptionId: activeSubscription?.id,
      currentPeriodEnd: activeSubscription ? Number((activeSubscription as any).current_period_end) * 1000 : null,
      cancelAtPeriodEnd: activeSubscription ? Boolean((activeSubscription as any).cancel_at_period_end) : null,
    };
  } catch (error) {
    logger.error("Error syncing user subscription:", error);
    throw new Error(`Failed to sync subscription: ${error}`);
  }
});

/**
 * Create or update user document with basic info
 * This ensures the user document exists in Firestore
 */
export const createUserDocument = onCall(async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new Error("Authentication required");
    }

    const uid = request.auth.uid;
    const {email, displayName, photoURL} = request.data;

    logger.info(`Creating/updating user document for ${uid}`);

    // Create or update user document
    await admin.firestore()
      .collection("users")
      .doc(uid)
      .set(
        {
          uid,
          email: email || null,
          displayName: displayName || null,
          photoURL: photoURL || null,
          planType: "basic", // Default to basic plan for new users
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    logger.info(`Successfully created/updated user document for ${uid}`);

    return {
      success: true,
      message: "User document created/updated successfully",
      uid,
    };
  } catch (error) {
    logger.error("Error creating user document:", error);
    throw new Error(`Failed to create user document: ${error}`);
  }
});
