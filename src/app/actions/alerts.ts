'use server';

/**
 * @fileOverview Server action for handling SOS alerts via Cloud Messaging (FCM Simulation).
 */

/**
 * Simulates an emergency FCM Cloud Push dispatch.
 * @param token The recipient's FCM registration token.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencyFcm(token: string, message: string) {
  // Simulate network latency for FCM cloud dispatch
  await new Promise(resolve => setTimeout(resolve, 600));

  console.info(`[FCM CLOUD PUSH] Token: ${token.substring(0, 10)}... | Payload: ${message}`);

  return { 
    success: true, 
    simulated: true,
    provider: 'Firebase Cloud Messaging (Simulation)',
    messagePreview: message,
    priority: 'high'
  };
}

/**
 * Simulates a general emergency cloud alert dispatch.
 */
export async function sendEmergencyAlert(to: string, message: string) {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.info(`[CLOUD ALERT DISPATCH] To: ${to} | Payload: ${message}`);
  return { 
    success: true, 
    simulated: true,
    provider: 'HeatGuard Cloud Bridge (Simulation)',
    messagePreview: message
  };
}
