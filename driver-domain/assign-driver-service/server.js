const express = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3003;

app.post("/assign-driver", async (req, res) => {
  const { rideRequestId, userId, paymentId } = req.body;
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
    res.status(200).json({
      message: "Driver assigned successfully.",
      rideRequestId: rideRequestId,
      assignedDriver: assignedDriver,
    });
  } else {
    console.log(
      `[Assign Driver Service] No drivers available for ${rideRequestId}.`
    );
    res
      .status(404)
      .json({ message: "No drivers available at the moment.", rideRequestId });
  }
});

app.listen(port, () => {
  console.log(`Assign Driver Service listening on port ${port}`);
});
