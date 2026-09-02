import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UpiPaymentParams {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  orderId: string;
}

export function generateUpiUri({ payeeVpa, payeeName, amount, orderId }: UpiPaymentParams): string {
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(`Order_${orderId.slice(0, 8)}`);
  return `upi://pay?pa=${payeeVpa}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=INR&tn=${cleanNote}`;
}

export function sanitizeBio(bio: string): { sanitized: string; isValid: boolean } {
  // Anti-Disintermediation Bio Sanitizer
  const phoneRegex = /(?:\+91|0)?[6-9]\d{9}/g;
  const upiRegex = /[\w.-]+@[\w.-]+/g;
  const triggerPhrasesRegex = /(dm for discount|pay outside|contact on wa|cheaper on discord)/i;

  let isValid = true;
  if (phoneRegex.test(bio) || upiRegex.test(bio) || triggerPhrasesRegex.test(bio)) {
    isValid = false;
  }

  return {
    sanitized: bio.replace(phoneRegex, '[REMOVED]').replace(upiRegex, '[REMOVED]').replace(triggerPhrasesRegex, '[REMOVED]'),
    isValid
  };
}
