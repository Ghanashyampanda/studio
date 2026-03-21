'use server';

/**
 * @fileOverview Emergency SMS dispatch via Twilio Cloud Node.
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client lazily to handle missing environment variables during setup
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

/**
 * Dispatches an emergency SMS via Twilio.
 * Falls back to simulation mode if Twilio credentials are not configured.
 * @param to The recipient's phone number.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencySms(to: string, message: string) {
  if (!client || !fromNumber) {
    console.warn("[RESCUE PROTOCOL] Twilio configuration incomplete. Reverting to Simulation Mode.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return { 
      success: true, 
      simulated: true,
      provider: 'SunCare Simulation Node',
      messagePreview: message,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });

    console.info(`[RESCUE PROTOCOL] SMS Dispatched via Twilio. SID: ${result.sid} to ${to}`);

    return { 
      success: true, 
      id: result.sid,
      provider: 'Twilio Cloud Dispatch',
      messagePreview: message,
      destination: to,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("[RESCUE PROTOCOL] Twilio Dispatch Failure:", error);
    return { 
      success: false, 
      error: error.message || 'Twilio Network Failure',
      timestamp: new Date().toISOString()
    };
  }
}
