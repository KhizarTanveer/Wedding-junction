/**
 * Payment validation utilities
 */

/**
 * Luhn algorithm to validate card numbers
 * @param {string} cardNumber - Card number (with or without spaces/dashes)
 * @returns {boolean} True if valid card number
 */
export function validateCardNumber(cardNumber) {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');

  // Card number should be 13-19 digits
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate card expiry date
 * @param {string} expiry - Expiry in MM/YY or MM/YYYY format
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateExpiry(expiry) {
  // Accept formats: MM/YY, MM/YYYY, MMYY, MMYYYY
  const cleaned = expiry.replace(/\D/g, '');

  if (cleaned.length < 4 || cleaned.length > 6) {
    return { isValid: false, error: 'Invalid expiry format' };
  }

  const month = parseInt(cleaned.slice(0, 2), 10);
  let year = parseInt(cleaned.slice(2), 10);

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += 2000;
  }

  // Validate month
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month' };
  }

  // Check if card is expired
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-indexed
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  // Don't accept cards expiring more than 20 years from now
  if (year > currentYear + 20) {
    return { isValid: false, error: 'Invalid expiry year' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate CVV/CVC
 * @param {string} cvv - CVV code
 * @param {string} cardNumber - Optional card number to detect card type
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateCVV(cvv, cardNumber = '') {
  const cleaned = cvv.replace(/\D/g, '');

  // American Express has 4-digit CVV, others have 3
  const isAmex = cardNumber.replace(/\D/g, '').startsWith('34') ||
                 cardNumber.replace(/\D/g, '').startsWith('37');

  const expectedLength = isAmex ? 4 : 3;

  if (cleaned.length !== expectedLength) {
    return {
      isValid: false,
      error: isAmex ? 'CVV must be 4 digits' : 'CVV must be 3 digits'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Format card number with spaces every 4 digits
 * @param {string} cardNumber - Raw card number
 * @returns {string} Formatted card number
 */
export function formatCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ').slice(0, 19); // Max 16 digits + 3 spaces
}

/**
 * Format expiry date as MM/YY
 * @param {string} expiry - Raw expiry input
 * @returns {string} Formatted expiry
 */
export function formatExpiry(expiry) {
  const cleaned = expiry.replace(/\D/g, '');

  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }

  return cleaned;
}

/**
 * Detect card type from card number
 * @param {string} cardNumber - Card number
 * @returns {string|null} Card type or null
 */
export function detectCardType(cardNumber) {
  const cleaned = cardNumber.replace(/\D/g, '');

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^(?:2131|1800|35)/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return type;
    }
  }

  return null;
}

/**
 * Validate complete payment card
 * @param {Object} card - Card details { name, number, expiry, cvv }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validatePaymentCard(card) {
  const errors = {};

  // Validate cardholder name
  if (!card.name || card.name.trim().length < 2) {
    errors.name = 'Please enter cardholder name';
  }

  // Validate card number
  if (!card.number) {
    errors.number = 'Please enter card number';
  } else if (!validateCardNumber(card.number)) {
    errors.number = 'Invalid card number';
  }

  // Validate expiry
  if (!card.expiry) {
    errors.expiry = 'Please enter expiry date';
  } else {
    const expiryResult = validateExpiry(card.expiry);
    if (!expiryResult.isValid) {
      errors.expiry = expiryResult.error;
    }
  }

  // Validate CVV
  if (!card.cvv) {
    errors.cvv = 'Please enter CVV';
  } else {
    const cvvResult = validateCVV(card.cvv, card.number);
    if (!cvvResult.isValid) {
      errors.cvv = cvvResult.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateCardNumber,
  validateExpiry,
  validateCVV,
  formatCardNumber,
  formatExpiry,
  detectCardType,
  validatePaymentCard,
};
