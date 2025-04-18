const express = require("express");
// Optional: const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3003;
// Optional: const pubsubClient = new PubSub();
// Optional: const topicName = 'driver-assigned';

app.post("/assign-driver", async (req, res) => {
  const { rideRequestId, userId, paymentId } = req.body; // Data from payment event via gateway
  console.log(
    `[Assign Driver Service] Received request to assign driver for Ride ${rideRequestId} (Payment: ${paymentId})`
  );

  if (!rideRequestId || !userId || !paymentId) {
    return res.status(400).send("Missing rideRequestId, userId, or paymentId");
  }

  // Simulate finding a driver
  const drivers = ["DriverA", "DriverB", "DriverC", "NoDriverAvailable"];
  const assignedDriver = drivers[Math.floor(Math.random() * drivers.length)];
  const assignmentTimestamp = new Date().toISOString();

  console.log(
    `[Assign Driver Service] Simulating driver assignment for ${rideRequestId}. Result: ${assignedDriver}`
  );

  if (assignedDriver !== "NoDriverAvailable") {
    // Optional: Publish 'driver-assigned' event
    /*
        const eventData = { rideRequestId, userId, assignedDriver, assignmentTimestamp };
        try {
            const dataBuffer = Buffer.from(JSON.stringify(eventData));
            const messageId = await pubsubClient.topic(topicName).publishMessage({ data: dataBuffer });
            console.log(`[Assign Driver Service] Driver Assigned Event ${messageId} published.`);
        } catch (error) {
            console.error(`[Assign Driver Service] Error publishing event: ${error.message}`, error);
            // Log error but proceed, assignment logic is primary
        }
        */

    res.status(200).json({
      message: "Driver assigned successfully.",
      rideRequestId: rideRequestId,
      assignedDriver: assignedDriver,
    });
  } else {
    console.log(
      `[Assign Driver Service] No drivers available for ${rideRequestId}.`
    );
    // Optionally publish a 'no-driver-available' event
    res
      .status(404)
      .json({ message: "No drivers available at the moment.", rideRequestId });
  }
});

app.listen(port, () => {
  console.log(`Assign Driver Service listening on port ${port}`);
});
