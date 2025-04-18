const express = require("express");
const { PubSub } = require("@google-cloud/pubsub");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8082;
const pubsubClient = new PubSub();
const subscriptionName = "driver-gateway-sub";

const ASSIGN_DRIVER_SERVICE_URL =
  process.env.ASSIGN_DRIVER_SERVICE_URL || "http://localhost:3003";

// --- Pub/Sub Subscription Handling ---
function listenForMessages() {
  const subscription = pubsubClient.subscription(subscriptionName);

  const messageHandler = async (message) => {
    console.log(`[Driver Gateway] Received message ${message.id}:`);
    const messageData = JSON.parse(message.data.toString());
    console.log(`\tData: ${JSON.stringify(messageData)}`);

    if (messageData.paymentStatus !== "SUCCESS") {
      console.log(
        `[Driver Gateway] Skipping driver assignment for Ride ${messageData.rideRequestId} due to payment status: ${messageData.paymentStatus}`
      );
      message.ack();
      return;
    }

    try {
      // Call the internal Assign Driver Service
      console.log(
        `[Driver Gateway] Calling Assign Driver Service for Ride ${messageData.rideRequestId}`
      );
      const serviceResponse = await axios.post(
        `${ASSIGN_DRIVER_SERVICE_URL}/assign-driver`,
        {
          rideRequestId: messageData.rideRequestId,
          userId: messageData.userId,
          paymentId: messageData.paymentId,
        }
      );
      console.log(
        `[Driver Gateway] Assign Driver Service responded with status ${serviceResponse.status}`
      );

      // Acknowledge the Pub/Sub message
      message.ack();
      console.log(`[Driver Gateway] Message ${message.id} acknowledged.`);
    } catch (error) {
      console.error(
        `[Driver Gateway] Error processing message ${message.id}: ${error.message}`,
        error.response?.data
      );
      // Nack for retries
      message.nack();
      console.log(`[Driver Gateway] Message ${message.id} nacked.`);
    }
  };

  const errorHandler = (error) => {
    console.error(`[Driver Gateway] Received error: ${error.message}`);
  };

  subscription.on("message", messageHandler);
  subscription.on("error", errorHandler);

  console.log(
    `[Driver Gateway] Listening for messages on subscription ${subscriptionName}...`
  );
}

listenForMessages();

app.listen(port, () => {
  console.log(`Driver Gateway (listener) running on port ${port}`);
});
