export async function simulateNotification(data: {
  incidentId: string;
  newStatus: string;
  tenantId: string;
}) {
  console.log(`[NOTIFICATION SYSTEM]: Processing for Tenant ${data.tenantId}`);
  
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log(
    ` [NOTIFICATION SENT]: Incident ${data.incidentId} is now ${data.newStatus}. 
    Emails dispatched to relevant responders.`
  );
  
  return { success: true, timestamp: new Date().toISOString() };
}