'use server';

/**
 * @fileOverview Server action for handling SOS alerts via Firebase Cloud Messaging (FCM Simulation).
 */

/**
 * Simulates a high-priority FCM Cloud Push dispatch.
 * @param token The recipient's FCM registration token.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencyFcm(token: string, message: string) {
  // Simulate network latency for FCM cloud dispatch
  await new Promise(resolve => setTimeout(resolve, 600));

  console.info(`[FCM CLOUD PUSH] Dispatching to Token: ${token.substring(0, 10)}... | Priority: HIGH | Payload: ${message}`);

  return { 
    success: true, 
    simulated: true,
    provider: 'Firebase Cloud Messaging (FCM)',
    messagePreview: message,
    priority: 'high',
    timestamp: new Date().toISOString()
  };
}

/**
 * Simulates a general emergency cloud alert dispatch (Non-SMS).
 */
export async function sendEmergencyAlert(to: string, message: string) {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.info(`[CLOUD ALERT SIMULATION] To: ${to} | Payload: ${message}`);
  return { 
    success: true, 
    simulated: true,
    provider: 'SunCare Alert Cloud Bridge (Simulation)',
    messagePreview: message
  };
}
