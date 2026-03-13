
'use server';

/**
 * @fileOverview Simulated Cloud Dispatch for emergency SMS notifications.
 */

/**
 * Simulates a cloud-based emergency SMS dispatch.
 * @param to The recipient's phone number.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencySms(to: string, message: string) {
  // Simulate network latency for cloud dispatch
  await new Promise(resolve => setTimeout(resolve, 800));

  console.info(`[CLOUD SOS DISPATCH] To: ${to} | Payload: ${message}`);

  return { 
    success: true, 
    simulated: true,
    provider: 'HeatGuard Cloud Bridge (FCM Signaling)',
    messagePreview: message,
    timestamp: new Date().toISOString()
  };
}
