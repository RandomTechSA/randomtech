# Authentication and production readiness

## Account routes

- Store/home page: `index.html`; visitors browse without an account.
- Buyer account: `account.html`; email/password, Google, Apple and SMS-phone sign-in are supported by Firebase Auth client SDK. Phone sign-in requires Firebase Phone provider, reCAPTCHA, SMS quota and an authorized domain configured in Firebase Console.
- Vendors: `sell.html`; register/sign in, verify email or verify a phone identity, apply, wait for administrative approval, then use `vendor-dashboard.html`.
- Admin: `admin.html`; restricted to the designated verified admin account and server-issued admin claim.

## Before launch

1. Configure each Firebase Auth provider in Firebase Console, OAuth callback settings, Apple Service ID/private key, authorized domains, reCAPTCHA/SMS policy and quota. Merely enabling a provider is not proof of working OAuth/SMS credentials.
2. Restrict API keys as appropriate; rotate PayFast values disclosed in Git history. Public Firebase web config is not a secret, but server credentials are.
3. Run rules/functions emulator tests including unauthenticated, buyer, pending-vendor, approved-vendor and admin cases.
4. Deploy only from a trusted host signed into the correct Firebase project:

```sh
firebase use randomtech-ceb37
firebase deploy --only firestore:rules,functions,hosting
```

This coding environment does not have Firebase CLI credentials or project deployment permissions. No Firebase deployment has been run.

## Not production-ready for commerce yet

This update implements identity entry points and a server-side pending-vendor application status endpoint. It does NOT implement secure checkout, server-priced order creation, PayFast checkout, ITN/signature verification, idempotent payment ledger, refunds, invoice creation, seller settlement or payouts. Do not collect live payment or represent an auth success as a paid order. Before enabling sales, these financial workflows need provider/account requirements, secret rotation, end-to-end testing, reconciliation and operational approval. No software change can claim production readiness for payments without them.

Seller KYC, tax/bank data and payout details are intentionally not collected by this simple application form; build a protected compliance workflow before collecting that sensitive data.
