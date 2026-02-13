
// This is a simple memory-based bridge for the ETP Project.
// It allows the App to save a command and the ESP8266 to read it.

let currentCommand = "LOCK";

export default function handler(req: any, res: any) {
  // Allow requests from your app domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // App is sending a command like { "command": "UNLOCK" }
    const { command } = req.body;
    if (command === "UNLOCK" || command === "LOCK") {
      currentCommand = command;
      console.log("Hardware Command Updated to:", currentCommand);
      return res.status(200).send("Updated");
    }
    return res.status(400).send("Invalid Command");
  }

  // GET request (from ESP8266 or App status check)
  // Simply returns "LOCK" or "UNLOCK" as plain text
  res.status(200).send(currentCommand);
}
