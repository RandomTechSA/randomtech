# Clear account and seller journeys

## Which page is for whom?

- **Buyers:** `index.html` remains the storefront/home page. Browse products without signing in. The dedicated buyer sign-in/create-account page is `account.html` (also reachable from the “Buyer account” link on the seller page). Sign-in is intended at checkout, not before browsing.
- **Vendors:** `sell.html` is the separate “Sell with Randomtech” landing page, vendor sign-in and application. A vendor creates an account, verifies email, submits a basic application, waits for admin approval, then uses `vendor-dashboard.html`.
- **Admins:** `admin.html` is staff-only and remains separate.

Buyer auth uses Firebase Authentication email/password, email verification, password reset, and Firebase session state. Seller applications are submitted through a callable function for the verified signed-in UID. Only an authenticated admin can approve a pending application and assign the `role: seller` custom claim. Client code cannot grant itself that role.

## Required Firebase setup

1. Enable Email/Password in Firebase Authentication and configure authorized domains for the deployed storefront.
2. Deploy Functions and restrictive Firestore rules from a trusted Firebase CLI session:

```sh
firebase use randomtech-ceb37
firebase deploy --only functions,firestore:rules,hosting
```

3. Sign in to `/admin.html` with the verified designated account, bootstrap the admin claim once, and sign in again.
4. Review seller applications in the `vendorApplications` collection using a trusted admin workflow/console, then call `approveVendorApplication` as admin with `{ "uid": "APPLICANT_AUTH_UID" }`. This callable is intentionally not exposed as a seller self-service operation.

## Scope and honest status

A successful Firebase sign-in proves identity, not purchase completion. The current storefront does not contain a verified PayFast checkout, secure order-creation flow, invoice issuance or payouts. Do not represent a sign-in as a completed order or collect payment through these pages. Before enabling a real purchase flow, implement server-side checkout and payment notification verification, then connect it to an order/invoice ledger and tested refund/reconciliation workflows.

The home page remains the buyer landing page. This commit adds the account and seller journeys but does not yet wire every legacy homepage/cart button into an online checkout because that checkout is not implemented.
