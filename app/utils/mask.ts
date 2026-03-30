/**
 * Mask sensitive data. Never show full PAN, RFC, or CURP in the UI.
 */

/** Show only last 4 digits of card number (PAN). */
export function maskPan(pan: string | null | undefined): string {
  if (!pan || typeof pan !== 'string') return '••••';
  const digits = pan.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• ${digits.slice(-4)}`;
}

/** Show partial RFC/CURP (e.g. first 3 + *** + last 2). Never full. */
export function maskRfcCurp(rfcOrCurp: string | null | undefined): string {
  if (!rfcOrCurp || typeof rfcOrCurp !== 'string') return '—';
  const s = rfcOrCurp.trim().toUpperCase();
  if (s.length <= 4) return '••••';
  return `${s.slice(0, 3)}•••${s.slice(-2)}`;
}

/** Mask client/customer number (e.g. 0000 **** 1234). Never show full. */
export function maskClientNumber(clientNo: string | null | undefined): string {
  if (!clientNo || typeof clientNo !== 'string') return '•••• **** ••••';
  const digits = clientNo.replace(/\D/g, '');
  if (digits.length < 8) return '•••• **** ••••';
  return `${digits.slice(0, 4)} **** ${digits.slice(-4)}`;
}

/** Mask user/email for display (e.g. us***@***.com). Never show full in profile. */
export function maskUserDisplay(userOrEmail: string | null | undefined): string {
  if (!userOrEmail || typeof userOrEmail !== 'string') return '••••••••';
  const s = userOrEmail.trim();
  if (s.includes('@')) {
    const [local, domain] = s.split('@');
    if (local.length <= 2) return '••••••@••••••';
    const maskedLocal = local.slice(0, 2) + '***';
    const maskedDomain = domain ? '***.' + (domain.split('.').pop() ?? '') : '***';
    return `${maskedLocal}@${maskedDomain}`;
  }
  if (s.length <= 4) return '••••••••';
  return s.slice(0, 2) + '***' + s.slice(-2);
}
