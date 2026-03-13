
'use server';

/**
 * @fileOverview Server action for handling SOS alerts.
 * Repurposed from Twilio dispatch to a cloud-ready simulation.
 */

/**
 * Simulates an emergency cloud alert dispatch.
 * @param to The recipient's phone number or identifier.
 * @param message The message content.
 * @returns An object indicating the dispatch status.
 */
export async function sendEmergencyAlert(to: string, message: string) {
  // Simulate network latency for cloud dispatch
  await new Promise(resolve => setTimeout(resolve, 800));

  console.info(`[CLOUD ALERT DISPATCH] To: ${to} | Payload: ${message}`);

  return { 
    success: true, 
    simulated: true,
    provider: 'Firebase Cloud Bridge (Simulation)',
    messagePreview: message
  };
}
