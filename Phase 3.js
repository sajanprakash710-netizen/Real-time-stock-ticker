const express = require("express");
const WebSocket = require("ws");

const API_KEY = "YOUR_FINNHUB_API_KEY"; // replace
const FINNHUB_WS = `wss://ws.finnhub.io?token=${API_KEY}`;

const app = express();
const server = app.listen(3000, () => console.log("Server running on http://localhost:3000"));

app.use(express.static("public")); // serve frontend

// Proxy WS: Finnhub -> Clients
const wssClient = new WebSocket.Server({ server });
const wssFinnhub = new WebSocket(FINNHUB_WS);

wssFinnhub.on("open", () => {
  console.log("Connected to Finnhub");
  ["AAPL","TSLA","GOOGL"].forEach(s =>
    wssFinnhub.send(JSON.stringify({type:"subscribe", symbol:s}))
  );
});

wssFinnhub.on("message", data => {
  wssClient.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data.toString());
    }
  });
});
