'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
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
    admin: true,
    role: 'admin'
  });
  await db.collection('users').doc(user.uid).set({
    email: ADMIN_EMAIL,
    name: user.displayName || 'RandomTech Admin',
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  return { ok: true, message: 'Admin role assigned. Sign out and sign in again to refresh your token.' };
});

/**
 * A vendor can submit a limited application only for their own verified Auth
 * account. This creates a pending application; it does not grant seller access.
 */
exports.submitVendorApplication = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to apply as a seller.');
  if (request.auth.token.email_verified !== true) {
    throw new HttpsError('failed-precondition', 'Verify your email address before applying.');
  }

  const user = await getAuth().getUser(request.auth.uid);
  if (!user.emailVerified) throw new HttpsError('failed-precondition', 'Verify your email address before applying.');
  if (user.customClaims && (user.customClaims.admin === true || user.customClaims.role === 'seller')) {
    throw new HttpsError('already-exists', 'This account already has an elevated marketplace role.');
  }

  const data = request.data || {};
  const businessName = typeof data.businessName === 'string' ? data.businessName.trim() : '';
  const contactName = typeof data.contactName === 'string' ? data.contactName.trim() : '';
  const phone = typeof data.phone === 'string' ? data.phone.trim() : '';
  const categories = Array.isArray(data.categories)
    ? [...new Set(data.categories.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean))].slice(0, 10)
    : [];

  if (businessName.length < 2 || businessName.length > 100 || contactName.length < 2 || contactName.length > 100) {
    throw new HttpsError('invalid-argument', 'Enter a valid business and contact name.');
  }
  if (phone.length < 7 || phone.length > 30 || categories.length === 0) {
    throw new HttpsError('invalid-argument', 'Enter a valid phone number and select at least one product category.');
  }

  const ref = db.collection('vendorApplications').doc(request.auth.uid);
  const existing = await ref.get();
  if (existing.exists && ['pending', 'approved'].includes(existing.get('status'))) {
    throw new HttpsError('already-exists', 'An application is already being reviewed for this account.');
  }

  await ref.set({
    uid: request.auth.uid,
    email: user.email,
    businessName,
    contactName,
    phone,
    categories,
    status: 'pending',
    submittedAt: FieldValue.serverTimestamp(),
    reviewedAt: null
  });
  return { ok: true, status: 'pending' };
});

/** Only an existing admin may grant the seller claim after reviewing an application. */
exports.approveVendorApplication = onCall(async (request) => {
  requireAdmin(request);
  const uid = typeof (request.data || {}).uid === 'string' ? request.data.uid.trim() : '';
  if (!uid || uid.length > 128) throw new HttpsError('invalid-argument', 'A valid applicant UID is required.');

  const ref = db.collection('vendorApplications').doc(uid);
  const userRef = db.collection('users').doc(uid);
  await db.runTransaction(async (transaction) => {
    const application = await transaction.get(ref);
    if (!application.exists || application.get('status') !== 'pending') {
      throw new HttpsError('failed-precondition', 'A pending vendor application was not found.');
    }
    transaction.update(ref, { status: 'approved', reviewedAt: FieldValue.serverTimestamp(), reviewedBy: request.auth.uid });
    transaction.set(userRef, {
      email: application.get('email'),
      name: application.get('contactName'),
      businessName: application.get('businessName'),
      role: 'seller',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });

  const user = await getAuth().getUser(uid);
  await getAuth().setCustomUserClaims(uid, {
    ...(user.customClaims || {}),
    role: 'seller'
  });
  return { ok: true, uid, message: 'Seller approved. They must refresh their ID token or sign in again.' };
});

/** Secret-readiness diagnostic only; it is not a payment endpoint. */
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
    note: 'Diagnostic only. Checkout, notifications, refunds, invoices and payouts are not implemented.'
  };
});
