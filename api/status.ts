
// Global variable for bridge state. 
// Note: In serverless, this is persistent as long as the instance stays "warm".
let currentBridgeState = "LOCK";

export default function handler(req: any, res: any) {
  // 1. Setup Aggressive CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. EXTREME Cache-Busting (Prevents Vercel/Proxy/Browser caching)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle State Update from Website
  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentBridgeState = command;
      console.log(`[CLOUD_SYNC] Updated to: ${currentBridgeState}`);
      return res.status(200).json({ success: true, state: currentBridgeState });
    }
    return res.status(400).json({ error: "Invalid Command" });
  }

  // Handle Polling from Arduino (GET Request)
  // We return plain text so the ESP8266 doesn't have to parse complex JSON
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(currentBridgeState);
}
