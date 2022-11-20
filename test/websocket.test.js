const WebSocket = require("ws");
const helperUtils = require("../testUtils/utils.js");

const port = 3001;
describe("WebSocket Server - ", () => {
  let server;
  beforeAll(async () => {
    server = await helperUtils.startServer(port);
  });

  afterAll(() => server.close());

  describe("Fail - ", () => {
    test("Fails to connect if provided invalid port number", async () => {
      // Create test client
      const client = new WebSocket(`ws://localhost:3002`);
      client.on("error", (error) => {
        expect(error).toMatchSnapshot();
        // Close the client after it receives the response
        client.close();
      });
      
    });
  })

  describe("Success - ", () => {
    test("sends subribed message with timestamp if receives from {'type': 'SUBSCRIBE'}", async () => {
      // Create test client
      const client = new WebSocket(`ws://localhost:${port}`);
      await helperUtils.waitForSocketState(client, client.OPEN);
      const testMessage = {
        type: "SUBSCRIBE",
        status: "Subscribed",
        updatedAt: "2022-11-20T11:29:54.304Z",
      };
      let responseMessage;
      client.on("message", (data) => {
        responseMessage = data;
        // Close the client after it receives the response
        client.close();
      });
      // Send client message
      client.send(JSON.stringify(testMessage));
      // Perform assertions on the response
      await helperUtils.waitForSocketState(client, client.CLOSED);
      expect(responseMessage.toString()).toMatchSnapshot();
    });

    test("sends unsubribed message with timestamp if receives from {'type': 'UNSUBSCRIBE'}", async () => {
      // Create test client
      const client = new WebSocket(`ws://localhost:${port}`);
      await helperUtils.waitForSocketState(client, client.OPEN);
      const testMessage = {
        type: "UNSUBSCRIBE",
        status: "Unubscribed",
        updatedAt: "2022-11-20T11:29:54.304Z",
      };
      let responseMessage;
      client.on("message", (data) => {
        responseMessage = data;
        // Close the client after it receives the response
        client.close();
      });
      // Send client message
      client.send(JSON.stringify(testMessage));
      // Perform assertions on the response
      await helperUtils.waitForSocketState(client, client.CLOSED);
      expect(responseMessage.toString()).toMatchSnapshot();
    });

    test("sends count message with timestamp if receives from {'type': 'COUNTSUBSCRIBERS'}", async () => {
      // Create test client
      const client = new WebSocket(`ws://localhost:${port}`);
      await helperUtils.waitForSocketState(client, client.OPEN);
      const testMessage = {
        type: "UNSUBSCRIBE",
        count: 1,
        updatedAt: "2022-11-20T11:29:54.304Z",
      };
      let responseMessage;
      client.on("message", (data) => {
        responseMessage = data;
        // Close the client after it receives the response
        client.close();
      });
      // Send client message
      client.send(JSON.stringify(testMessage));
      // Perform assertions on the response
      await helperUtils.waitForSocketState(client, client.CLOSED);
      expect(responseMessage.toString()).toMatchSnapshot();
    });
  });
});
