
// Vercel Serverless Function Bridge
// Shared state is best-effort in serverless.

let currentCommand = "LOCK";

export default function handler(req: any, res: any) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. Cache Control (Important for real-time hardware)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle Command Updates (From App)
  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentCommand = command;
      return res.status(200).json({ success: true, state: currentCommand });
    }
    return res.status(400).json({ error: "Invalid command" });
  }

  // Handle Status Polls (From ESP8266 or App)
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(currentCommand);
}
