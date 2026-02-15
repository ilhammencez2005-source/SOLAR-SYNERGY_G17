
let currentCommand = "LOCK";

export default function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Aggressive No-Cache headers to prevent Arduino from getting old data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentCommand = command;
      console.log(`Server: Updated state to ${currentCommand}`);
      return res.status(200).json({ success: true, state: currentCommand });
    }
    return res.status(400).json({ error: "Invalid command." });
  }

  // GET request (from Arduino)
  // We return plain text so the Arduino can parse it easily
  res.setHeader('Content-Type', 'text/plain');
  return res.status(200).send(currentCommand.trim());
}
