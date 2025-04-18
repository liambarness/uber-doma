const express = require("express");
const { PubSub } = require("@google-cloud/pubsub");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;
const pubsubClient = new PubSub();
const topicName = "ride-requested";

app.post("/initiate-ride-request", async (req, res) => {
  const { userId, pickup, destination } = req.body;
  console.log(
    `[Request Ride Service] Received ride request from User ${userId}: ${pickup} to ${destination}`
  );

  if (!userId || !pickup || !destination) {
    return res.status(400).send("Missing userId, pickup, or destination");
  }

  const rideRequestId = `RIDE_${Date.now()}`;

  // Prepare data for the event
  const eventData = {
    rideRequestId,
    userId,
    pickup,
    destination,
    requestTimestamp: new Date().toISOString(),
  };

  try {
    // Publish event to Pub/Sub
    const dataBuffer = Buffer.from(JSON.stringify(eventData));
    const messageId = await pubsubClient
      .topic(topicName)
      .publishMessage({ data: dataBuffer });
    console.log(
      `[Request Ride Service] Event ${messageId} published to ${topicName}.`
    );

    res.status(202).json({
      message: "Ride request received and event published.",
      rideRequestId: rideRequestId,
      publishedMessageId: messageId,
    });
  } catch (error) {
    console.error(
      `[Request Ride Service] Error publishing event: ${error.message}`,
      error
    );
    res.status(500).send("Failed to publish ride request event.");
  }
});

app.listen(port, () => {
  console.log(`Request Ride Service listening on port ${port}`);
});
