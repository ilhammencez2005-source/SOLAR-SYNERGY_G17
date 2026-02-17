
// Global state for the bridge
// Note: In Vercel, this persists as long as the function is 'warm'.
let currentBridgeState = "LOCK";

export default function handler(req: any, res: any) {
  // 1. Set broad CORS headers for Arduino and Browser access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. EXTREME Cache-Busting (Crucial for Arduino real-time sync)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Update state from Web App
  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentBridgeState = command;
      console.log(`[BRIDGE] State changed to: ${currentBridgeState}`);
      return res.status(200).json({ 
        success: true, 
        state: currentBridgeState,
        timestamp: Date.now() 
      });
    }
    return res.status(400).json({ error: "Invalid Command" });
  }

  // GET: Fetch state (Arduino Polling)
  // We return a simple string for the Arduino to parse easily
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(currentBridgeState);
}
