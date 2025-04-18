const express = require("express");
const { PubSub } = require("@google-cloud/pubsub");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8081; // Doesn't need to be exposed externally in K8s
const pubsubClient = new PubSub();
const subscriptionName = "payments-gateway-sub"; // GCP Pub/Sub subscription

// URL for the internal process-payment-service
const PROCESS_PAYMENT_SERVICE_URL =
  process.env.PROCESS_PAYMENT_SERVICE_URL || "http://localhost:3002";

// --- Pub/Sub Subscription Handling ---
function listenForMessages() {
  const subscription = pubsubClient.subscription(subscriptionName);

  const messageHandler = async (message) => {
    console.log(`[Payments Gateway] Received message ${message.id}:`);
    const messageData = JSON.parse(message.data.toString());
    console.log(`\tData: ${JSON.stringify(messageData)}`);

    try {
      // Call the internal Process Payment Service
      console.log(
        `[Payments Gateway] Calling Process Payment Service for Ride ${messageData.rideRequestId}`
      );
      const serviceResponse = await axios.post(
        `${PROCESS_PAYMENT_SERVICE_URL}/process-payment`,
        {
          rideRequestId: messageData.rideRequestId,
          userId: messageData.userId,
          // Pass other relevant details if needed
        }
      );
      console.log(
        `[Payments Gateway] Process Payment Service responded with status ${serviceResponse.status}`
      );

      // Acknowledge the Pub/Sub message only if the service call was successful (or handled)
      message.ack();
      console.log(`[Payments Gateway] Message ${message.id} acknowledged.`);
    } catch (error) {
      console.error(
        `[Payments Gateway] Error processing message ${message.id}: ${error.message}`,
        error.response?.data
      );
      // Decide if the message should be Nacked (re-tried) or Acked (discarded)
      // For simplicity, Nack to allow retries. Configure dead-lettering in Pub/Sub for production.
      message.nack();
      console.log(`[Payments Gateway] Message ${message.id} nacked.`);
    }
  };

  const errorHandler = (error) => {
    console.error(`[Payments Gateway] Received error: ${error.message}`);
    // Potentially exit or implement retry logic for the listener itself
  };

  subscription.on("message", messageHandler);
  subscription.on("error", errorHandler);

  console.log(
    `[Payments Gateway] Listening for messages on subscription ${subscriptionName}...`
  );
}

// Start listening for Pub/Sub messages when the server starts
listenForMessages();

// Optional: Add a health check endpoint
app.get("/health", (req, res) => res.status(200).send("OK"));

app.listen(port, () => {
  console.log(`Payments Gateway (listener) running on port ${port}`);
});
