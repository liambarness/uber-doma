const express = require("express");
const { PubSub } = require("@google-cloud/pubsub");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3002;
const pubsubClient = new PubSub();
const topicName = "payment-processed"; // GCP Pub/Sub topic

app.post("/process-payment", async (req, res) => {
  const { rideRequestId, userId } = req.body; // Data comes from the event via the gateway
  console.log(
    `[Process Payment Service] Received request to process payment for Ride ${rideRequestId}, User ${userId}`
  );

  if (!rideRequestId || !userId) {
    return res.status(400).send("Missing rideRequestId or userId");
  }

  // Simulate payment processing
  const paymentSuccess = Math.random() > 0.1; // 90% success rate
  const paymentId = `PAY_${Date.now()}`;

  console.log(
    `[Process Payment Service] Simulating payment for ${rideRequestId}. Success: ${paymentSuccess}`
  );

  if (paymentSuccess) {
    // Prepare data for the event
    const eventData = {
      paymentId,
      rideRequestId,
      userId,
      paymentStatus: "SUCCESS",
      processedTimestamp: new Date().toISOString(),
    };

    try {
      // Publish event to Pub/Sub
      const dataBuffer = Buffer.from(JSON.stringify(eventData));
      const messageId = await pubsubClient
        .topic(topicName)
        .publishMessage({ data: dataBuffer });
      console.log(
        `[Process Payment Service] Payment Success Event ${messageId} published to ${topicName}.`
      );

      res.status(200).json({
        message: "Payment processed successfully.",
        paymentId: paymentId,
        publishedMessageId: messageId,
      });
    } catch (error) {
      console.error(
        `[Process Payment Service] Error publishing event: ${error.message}`,
        error
      );
      // Even if publishing fails, the payment *was* processed internally
      res.status(500).send("Payment processed, but failed to publish event.");
    }
  } else {
    console.log(
      `[Process Payment Service] Payment failed for ${rideRequestId}.`
    );
    // Optionally publish a 'payment-failed' event here
    res.status(402).json({ message: "Payment failed.", rideRequestId }); // 402 Payment Required (or other appropriate error)
  }
});

app.listen(port, () => {
  console.log(`Process Payment Service listening on port ${port}`);
});
