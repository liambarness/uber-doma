// setup_emulator.js
const { PubSub } = require("@google-cloud/pubsub");

// Ensure these match your emulator setup and desired test project ID
const projectId = "test-project";
const host = process.env.PUBSUB_EMULATOR_HOST || "localhost:8538"; // Read from env var

console.log(
  `Connecting to Pub/Sub emulator at ${host} for project ${projectId}`
);

const pubsub = new PubSub({
  projectId: projectId,
  // The JS client library automatically uses PUBSUB_EMULATOR_HOST if set,
  // but you can be explicit for clarity if needed:
  // apiEndpoint: host
});

async function setup() {
  try {
    console.log("Creating topic: ride-requested");
    await pubsub.createTopic("ride-requested");
    console.log("Topic ride-requested created.");

    console.log("Creating topic: payment-processed");
    await pubsub.createTopic("payment-processed");
    console.log("Topic payment-processed created.");

    console.log("Creating subscription: payments-gateway-sub");
    await pubsub
      .topic("ride-requested")
      .createSubscription("payments-gateway-sub");
    console.log("Subscription payments-gateway-sub created.");

    console.log("Creating subscription: driver-gateway-sub");
    await pubsub
      .topic("payment-processed")
      .createSubscription("driver-gateway-sub");
    console.log("Subscription driver-gateway-sub created.");

    console.log("\nEmulator setup complete!");
  } catch (error) {
    // Ignore "Already exists" errors if running multiple times
    if (error.code === 6) {
      // ALREADY_EXISTS code
      console.warn(`Warning: ${error.message} (Ignoring)`);
    } else {
      console.error("ERROR setting up emulator:", error);
      process.exit(1); // Exit with error on other failures
    }
  }
  // Handle potential subsequent ALREADY_EXISTS errors gracefully
  try {
    if (!pubsub.topic("payment-processed").subscription("driver-gateway-sub")) {
      console.log("Creating subscription: driver-gateway-sub (retry)");
      await pubsub
        .topic("payment-processed")
        .createSubscription("driver-gateway-sub");
      console.log("Subscription driver-gateway-sub created.");
    }
  } catch (error) {
    if (error.code === 6) {
      console.warn(`Warning: ${error.message} (Ignoring)`);
    } else {
      console.error("ERROR during subsequent setup:", error);
    }
  }
}

setup();
