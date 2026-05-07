const crypto = require('crypto');

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 365;

function getSigningSecret() {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) {
    throw new Error('QR_SIGNING_SECRET is required');
  }
  return secret;
}

function getTtlSeconds() {
  const value = Number(process.env.QR_SIGNING_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_TTL_SECONDS;
}

function signTablePayload(tableNumber, ts) {
  const payload = `${tableNumber}.${ts}`;
  return crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');
}

function buildSignedTablePayload(tableNumber) {
  const ts = Math.floor(Date.now() / 1000);
  return {
    table_number: Number(tableNumber),
    ts,
    sig: signTablePayload(tableNumber, ts),
    expires_in: getTtlSeconds(),
  };
}

function verifySignedTablePayload(tableNumber, ts, sig) {
  const normalizedTableNumber = Number(tableNumber);
  const normalizedTs = Number(ts);
  const normalizedSig = String(sig || '').trim();

  if (!Number.isInteger(normalizedTableNumber) || normalizedTableNumber <= 0) {
    throw new Error('Invalid table number');
  }

  if (!Number.isInteger(normalizedTs) || normalizedTs <= 0) {
    throw new Error('Invalid QR timestamp');
  }

  if (!normalizedSig) {
    throw new Error('Missing QR signature');
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - normalizedTs;
  if (ageSeconds < 0 || ageSeconds > getTtlSeconds()) {
    throw new Error('QR code has expired');
  }

  const expectedSig = signTablePayload(normalizedTableNumber, normalizedTs);
  const providedBuffer = Buffer.from(normalizedSig, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid QR signature');
  }

  return true;
}

module.exports = {
  buildSignedTablePayload,
  verifySignedTablePayload,
};
