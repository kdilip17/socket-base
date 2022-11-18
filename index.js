const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");

const wss = new WebSocket.Server({ server: server });

wss.on("connection", (ws) => {
  ws.send("Welcome to the chat :)");

  ws.on("message", (data) => {
    let message;
    let actionTime = new Date();

    try {
      message = JSON.parse(data);
    } catch (e) {
      sendError(ws, "Bad formatted payload, non JSON", actionTime);
      return;
    }
    console.log(`Message Type: ${message.type.toLowerCase()}`)
    if (message.type.toLowerCase() === "subscribe") {
      wss.clients.forEach(function each(client) {
        actionTime = new Date();
        setTimeout(() => {
          client.send(
            JSON.stringify({
              type: message.type,
              status: "Subscribed",
              updatedAt: actionTime,
              // size: wss.clients.size,
            })
          );
        }, 0);
      });
    } else if (message.type.toLowerCase() === "unsubscribe") {
      wss.clients.forEach(function each(client) {
        if (client === ws && client.readyState === WebSocket.OPEN) {
          actionTime = new Date();
          setTimeout(() => {
            client.send(
              JSON.stringify({
                type: message.type,
                status: "Unsubscribed",
                updatedAt: actionTime,
                // size: wss.clients.size,
              })
            );
            client.close();
          }, 0);
        }
      });
    } else if (message.type.toLowerCase() === "countsubscribers") {
      actionTime = new Date();
      ws.send(
        JSON.stringify({
          type: message.type,
          count: wss.clients.size,
          updatedAt: actionTime,
        })
      );
    } else {
      wss.clients.forEach(function each(client) {
        sendError(client, "Requested Method Not Implemented", actionTime);
      });
    }
  });
});

const sendError = (ws, message, timestamp) => {
  const messageObject = {
    type: "ERROR",
    error: message,
    updatedAt: timestamp,
  };

  ws.send(JSON.stringify(messageObject));
};

app.get("/", (req, res) => res.send("Hello World!"));

server.listen(3000, () => console.log(`Lisening on port :3000`));
