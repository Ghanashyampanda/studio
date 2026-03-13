'use server';

/**
 * Generic Cloud Dispatch for emergency SMS notifications.
 * Transitions away from Twilio to a more flexible cloud simulation.
 * 
 * @param to The recipient's phone number.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencySms(to: string, message: string) {
  // Simulate network latency for cloud dispatch
  await new Promise(resolve => setTimeout(resolve, 800));

  console.info(`[CLOUD DISPATCH] To: ${to} | Message: ${message}`);

  // In a real production scenario with FCM, you would trigger a server-side 
  // notification or a cloud function here.
  return { 
    success: true, 
    simulated: true,
    provider: 'HeatGuard Cloud Bridge',
    messagePreview: message
  };
}
