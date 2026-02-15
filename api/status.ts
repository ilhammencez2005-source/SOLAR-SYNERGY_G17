
// Vercel serverless functions can reset variables. 
// We use a global variable which stays warm as long as there is traffic.
let currentBridgeState = "LOCK";

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentBridgeState = command;
      console.log(`[CLOUD_BRIDGE] State changed to: ${currentBridgeState}`);
      return res.status(200).json({ success: true, newState: currentBridgeState });
    }
    return res.status(400).json({ error: "Invalid Command" });
  }

  // GET Request (Arduino Polling)
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(currentBridgeState);
}
