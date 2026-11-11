# Firebase Functions setup

This folder contains a small, server-only foundation for Randomtech. It does **not** implement PayFast checkout, split payments, ITN validation, refunds, or seller payouts. Do not accept live payments based on the readiness check.

## Prerequisites

- Firebase CLI installed and signed into an account with permission to deploy project `randomtech-ceb37`.
- Firebase Authentication Email/Password enabled; create the `randomtechsa@gmail.com` user in Authentication and verify its email.
- Firebase Functions deployment requires the project billing/plan and required Google Cloud APIs to be enabled.
- Rotate any PayFast merchant key/passphrase previously committed in browser code before storing new values.

## Set secrets securely

Run from the repository root. Firebase CLI prompts for each value; do not put secret values in source, Firestore, `.env` committed to Git, or chat:

```sh
firebase functions:secrets:set PAYFAST_MERCHANT_ID
firebase functions:secrets:set PAYFAST_MERCHANT_KEY
firebase functions:secrets:set PAYFAST_PASSPHRASE
```

Secrets are bound only to `paymentSecretReadiness`; no function returns their values.

## Deploy

```sh
firebase use randomtech-ceb37
firebase deploy --only functions
```

Deployment is not performed by GitHub commits. Run the command from a trusted local machine signed into the Firebase project, then inspect the Functions logs in Firebase Console.

## Admin role bootstrap

After deploying, the admin must sign in through Firebase Authentication with the verified `randomtechsa@gmail.com` account and call the `bootstrapAdminRole` callable once. It grants the `admin: true` custom claim only to that verified account. The caller must sign out and back in so Firebase refreshes the ID token. The existing static admin page is not converted to Firebase Auth by these functions; do not treat it as secured until its client login and Firestore access are migrated.

## Important security work before production

The existing Firestore rules currently permit public read/write access to settings, orders and products, and the admin page contains payment-related values in browser code. Restrict rules and remove/rotate exposed payment credentials before taking payments. Do not store PayFast secrets in Firestore. Use a provider-approved server-side flow and verify PayFast documentation/account capabilities before implementing payment allocation or delayed seller payouts.
