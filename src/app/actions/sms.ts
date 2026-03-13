
'use server';

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client lazily to avoid errors if credentials are missing during build
const getTwilioClient = () => {
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
};

/**
 * Sends an emergency SMS via Twilio.
 * @param to The recipient's phone number in E.164 format.
 * @param message The message content.
 * @returns An object indicating success or failure.
 */
export async function sendEmergencySms(to: string, message: string) {
  const client = getTwilioClient();

  if (!client || !twilioPhone) {
    console.error('Twilio credentials not configured in environment variables.');
    return { 
      success: false, 
      error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.' 
    };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });
    
    console.log(`SMS successfully dispatched. SID: ${response.sid}`);
    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error('Twilio Dispatch Error:', error);
    return { success: false, error: error.message || 'Unknown Twilio error' };
  }
}
