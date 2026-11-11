'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

initializeApp();
const db = getFirestore();

const ADMIN_EMAIL = 'randomtechsa@gmail.com';
const PAYFAST_MERCHANT_ID = defineSecret('PAYFAST_MERCHANT_ID');
const PAYFAST_MERCHANT_KEY = defineSecret('PAYFAST_MERCHANT_KEY');
const PAYFAST_PASSPHRASE = defineSecret('PAYFAST_PASSPHRASE');

function requireAdmin(request) {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }
}

/**
 * One-time bootstrap for the designated, verified Firebase Auth administrator.
 * It only grants the custom admin claim to the caller whose verified Auth email
 * exactly matches ADMIN_EMAIL. Never accept a role value from the client.
 */
exports.bootstrapAdminRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in with the designated admin account first.');
  }

  const tokenEmail = String(request.auth.token.email || '').toLowerCase();
  if (tokenEmail !== ADMIN_EMAIL || request.auth.token.email_verified !== true) {
    throw new HttpsError('permission-denied', 'A verified designated admin account is required.');
  }

  const user = await getAuth().getUser(request.auth.uid);
  if (!user.emailVerified || String(user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    throw new HttpsError('permission-denied', 'Verify the designated admin email before continuing.');
  }

  await getAuth().setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    admin: true
  });
  await db.collection('users').doc(user.uid).set({
    email: ADMIN_EMAIL,
    name: user.displayName || 'RandomTech Admin',
    role: 'admin',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return { ok: true, message: 'Admin role assigned. Sign out and sign in again to refresh your token.' };
});

/**
 * Returns readiness booleans only. Secret values are never returned to clients.
 * This is a setup diagnostic, NOT a payment, payout, or PayFast verification API.
 */
exports.paymentSecretReadiness = onCall({
  secrets: [PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE]
}, async (request) => {
  requireAdmin(request);

  return {
    configured: {
      merchantId: Boolean(PAYFAST_MERCHANT_ID.value().trim()),
      merchantKey: Boolean(PAYFAST_MERCHANT_KEY.value().trim()),
      passphrase: Boolean(PAYFAST_PASSPHRASE.value().trim())
    },
    paymentProcessingEnabled: false,
    note: 'Secrets are available to trusted Functions only. No checkout, ITN, split-payment, refund, or payout flow is implemented by this diagnostic.'
  };
});
