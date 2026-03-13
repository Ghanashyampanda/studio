
'use server';

/**
 * Sends an emergency SMS via Twilio.
 * If credentials are missing, falls back to a simulated successful send for prototyping.
 * @param to The recipient's phone number in E.164 format.
 * @param message The message content.
 * @returns An object indicating success or failure, and whether it was simulated.
 */
export async function sendEmergencySms(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // Fallback simulation mode if credentials are missing
  if (!accountSid || !authToken || !twilioPhone) {
    console.warn(`[SMS SIMULATION] To: ${to} | Message: ${message}`);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { 
      success: true, 
      simulated: true,
      error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER for live dispatches.' 
    };
  }

  try {
    // Dynamic import to handle server-side environment correctly
    const twilioModule = await import('twilio');
    const twilio = (twilioModule as any).default || twilioModule;
    const client = twilio(accountSid, authToken);
    
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });
    
    return { success: true, simulated: false, sid: response.sid };
  } catch (error: any) {
    console.error('Twilio Dispatch Error:', error);
    return { success: false, simulated: false, error: error.message || 'Unknown Twilio error' };
  }
}
