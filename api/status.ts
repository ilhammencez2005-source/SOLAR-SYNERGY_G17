
// Vercel Serverless Function Bridge
// Shared state is best-effort in serverless (reset on cold starts).

let currentCommand = "LOCK";

export default function handler(req: any, res: any) {
  // 1. CORS Headers to allow the App to communicate from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. Prevent Caching (Crucial for hardware control)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle Preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Handle POST (Command from the App)
  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentCommand = command;
      console.log(`Bridge: Updated state to ${currentCommand}`);
      return res.status(200).json({ success: true, state: currentCommand });
    }
    return res.status(400).json({ error: "Invalid command. Use LOCK or UNLOCK." });
  }

  // 4. Handle GET (Status check from ESP8266 or App)
  // Returning text/plain ensures the ESP8266 can read it easily.
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(currentCommand);
}
