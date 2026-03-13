'use server';

/**
 * Sends an emergency SMS via Twilio.
 * Uses provided environment variables for live cloud dispatches.
 * @param to The recipient's phone number in E.164 format.
 * @param message The message content.
 * @returns An object indicating success or failure.
 */
export async function sendEmergencySms(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhone) {
    console.warn(`[SMS SIMULATION] To: ${to} | Message: ${message}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { 
      success: true, 
      simulated: true,
      configMissing: true,
      messagePreview: message,
      error: 'Twilio keys not detected in environment.' 
    };
  }

  try {
    const twilioModule = await import('twilio');
    const twilio = (twilioModule as any).default || twilioModule;
    const client = twilio(accountSid, authToken);
    
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });
    
    return { success: true, simulated: false, configMissing: false, sid: response.sid };
  } catch (error: any) {
    console.error('Twilio Dispatch Error:', error);
    
    // Check for common configuration errors like invalid "From" number
    const isConfigError = error.message?.includes('is not a Twilio phone number') || 
                         error.code === 21606 || // The "From" number is not a valid, SMS-capable Twilio number
                         error.code === 21211;   // Invalid 'To' Phone Number

    return { 
      success: false, 
      simulated: false, 
      configMissing: isConfigError, 
      error: error.message || 'Unknown Twilio error',
      messagePreview: message
    };
  }
}
