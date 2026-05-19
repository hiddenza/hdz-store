import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResend() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // In development/preview we might not have the key yet
      console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
