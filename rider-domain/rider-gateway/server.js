const express = require("express");
const axios = require("axios"); // To call the internal service

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080; // Exposed port

const REQUEST_RIDE_SERVICE_URL =
  process.env.REQUEST_RIDE_SERVICE_URL || "http://localhost:3001";

app.post("/request-ride", async (req, res) => {
  const { userId, pickupLocation, destination } = req.body;
  console.log(
    `[Rider Gateway] Received external request for ride: User ${userId}`
  );

  if (!userId || !pickupLocation || !destination) {
    return res
      .status(400)
      .send("Missing userId, pickupLocation, or destination");
  }

  try {
    const serviceResponse = await axios.post(
      `${REQUEST_RIDE_SERVICE_URL}/initiate-ride-request`,
      {
        userId: userId,
        pickup: pickupLocation,
        destination: destination,
      }
    );

    console.log(
      `[Rider Gateway] Forwarded request, service responded with status ${serviceResponse.status}`
    );
    // Return the response from the internal service to the client
    res.status(serviceResponse.status).json(serviceResponse.data);
  } catch (error) {
    console.error(
      `[Rider Gateway] Error calling Request Ride Service: ${error.message}`,
      error.response?.data
    );
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "Error processing ride request.";
    res.status(status).json({ message: message });
  }
});

app.listen(port, () => {
  console.log(`Rider Gateway listening on port ${port}`);
});
