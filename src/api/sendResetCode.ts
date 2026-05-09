export async function sendVerificationCode() {
  throw new Error(
    "Email sending is disabled in the mobile app. Rotate the leaked Resend key and send mail from a backend or Supabase Edge Function."
  );
}
