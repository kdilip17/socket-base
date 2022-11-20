const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");
// general Config
const generalConfig = require("./general.config");

const wss = new WebSocket.Server({ server: server });

wss.on("connection", (ws) => {
  ws.send("Welcome to the chat :)");

  setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "HEARTBEAT",
        status: "Healthy",
        updatedAt: new Date(),
      })
    );
  }, 1000 * generalConfig.heartbeatDelay);

  ws.on("message", (data) => {
    let message;
    let actionTime = new Date();

    try {
      message = JSON.parse(data);
    } catch (e) {
      sendError(ws, "Bad formatted payload, non JSON", actionTime);
      return;
    }
    console.log(`Message Type: ${message.type.toLowerCase()}`);
    switch (message.type.toLowerCase()) {
      case "subscribe": {
        wss.clients.forEach(function each(client) {
          actionTime = new Date();
          setTimeout(() => {
            client.send(
              JSON.stringify({
                type: message.type,
                status: "Subscribed",
                updatedAt: actionTime,
              })
            );
          }, 1000 * generalConfig.subscriberDelay);
        });
        break;
      }
      case "unsubscribe": {
        wss.clients.forEach(function each(client) {
          if (client === ws && client.readyState === WebSocket.OPEN) {
            actionTime = new Date();
            setTimeout(() => {
              client.send(
                JSON.stringify({
                  type: message.type,
                  status: "Unsubscribed",
                  updatedAt: actionTime,
                })
              );
              client.close();
            }, 1000 * generalConfig.unsubscribeDelay);
          }
        });
        break;
      }
      case "countsubscribers": {
        actionTime = new Date();
        ws.send(
          JSON.stringify({
            type: message.type,
            count: wss.clients.size,
            updatedAt: actionTime,
          })
        );
        break;
      }
      default: {
        wss.clients.forEach(function each(client) {
          sendError(client, "Requested Method Not Implemented", actionTime);
        });
      }
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

server.listen(generalConfig.port, () =>
  console.log(`Lisening on port : ${generalConfig.port}`)
);
