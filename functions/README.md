# Firebase Functions setup and security status

This repository now has a restrictive Firestore ruleset and an admin sign-in page backed by Firebase Authentication. Firestore authorization depends on the server-issued `admin` custom claim; browser state and client-supplied role fields do not grant access.

## Required before use

1. Rotate the PayFast merchant key/passphrase previously committed in browser code. Treat the exposed values as compromised; removing them from the current page does not erase Git history.
2. In Firebase Console, enable Email/Password Authentication and create/verify `randomtechsa@gmail.com`.
3. Deploy the changed Firestore rules and Functions from a trusted machine signed into the correct project. Deploying rules immediately blocks existing public order/settings access; the storefront order/tracking flows must be migrated to authenticated, server-mediated endpoints before being relied on.
4. Open `/admin.html`, sign in with the verified designated account, click **Bootstrap designated admin role** once, then sign out and back in. The callable validates the configured admin email and verification status before assigning the claim.

## Deploy

```sh
firebase use randomtech-ceb37
firebase deploy --only firestore:rules,functions,hosting
```

A GitHub commit does not deploy Firebase resources. Deployment has not been run from this repository session.

## PayFast, invoices and seller payouts

Payment processing remains deliberately disabled. The current secret-readiness callable is diagnostic only. This repository does not yet have a complete PayFast checkout, notification signature/amount/currency verification, idempotent payment ledger, refund workflow, invoice generation after verified payment, or approved seller payout integration. Do not mark an order paid based on a browser redirect or user-submitted field, and do not accept live payments or issue invoices/payouts through client code. These workflows require the provider's current merchant integration requirements, account capabilities, legal/tax invoice details and reconciliation tests; adding a fake or partially verified flow would create financial risk.

## Remaining migration

Firestore access to orders and financial settings is admin-only. The existing public storefront/tracking and any buyer/seller flows must be migrated to narrowly scoped server endpoints before those features can operate against the secured rules. Invoice reads are restricted to the buyer UID on the invoice record or an admin; clients cannot create or change invoices. Unknown collections are denied by default.
