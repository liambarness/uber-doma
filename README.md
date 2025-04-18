# Uber DOMA Case Study Implementation

This is a basic Node.js implementation demonstrating Domain-Oriented Microservice Architecture (DOMA) concepts, inspired by Uber's model. This project features 3 domains with dedicated services and gateways communicating via Google Cloud Pub/Sub for asynchronous processing.

I may consider adding some type of authentication for accessing the api endpoints in the future as well as a public api gateway that would handle authentication before routing traffic through to the specific domains.

This was a fun little implementation I completed for my Microservice Architecture course. It's definitely a crude example but i feel like it serves as a good showcase of how DOMA should be structured. I definitely see why DOMA is not suggested for small organizations lol.

## Architecture Overview

This implementation uses a simplified 3-domain model:

1.  **Rider Domain:** Handles ride requests.
    *   `rider-gateway`: External entry point for ride requests.
    *   `request-ride-service`: Processes requests and publishes `ride-requested` event.
2.  **Payments Domain:** Handles payment processing simulation.
    *   `payments-gateway`: Subscribes to `ride-requested` events.
    *   `process-payment-service`: Simulates payment and publishes `payment-processed`.
3.  **Driver Domain:** Handles driver assignment simulation.
    *   `driver-gateway`: Subscribes to `payment-processed` events.
    *   `assign-driver-service`: Simulates driver assignment and publishes `driver-assigned`.

**Communication:**

*   HTTP for external requests to `rider-gateway`.
*   HTTP for internal gateway-to-service communication within a domain.
*   **Google Cloud Pub/Sub** for asynchronous, event-driven communication *between* domains (via Gateways subscribing/Services publishing).

## Technologies Used

*   Node.js
*   Express.js
*   Google Cloud Pub/Sub
*   Google Cloud Pub/Sub Emulator (for local development)
*   HTML/JavaScript (for simple frontend testing)
*   Docker (for containerization)
*   Google Kubernetes Engine (GKE)

## Running Locally

1.  **Prerequisites:** Node.js, npm, Google Cloud SDK (`gcloud` CLI).
2.  **Start Pub/Sub Emulator:** This project **requires the Google Cloud Pub/Sub Emulator** running locally `gcloud beta emulators pubsub start --project=test-project --host-port=localhost:8538`.
3.  **Setup Pub/Sub:** Create the necessary topics (`ride-requested`, `payment-processed`, `ride-updates`) and subscriptions within the emulator. (emulator folder does this)
4.  **Install Dependencies:** Run `npm install` in each of the 6 service/gateway directories.
5.  **Run Services:**
    *   Open 6 separate terminals.
    *   In each terminal, `cd` to a service/gateway directory.
    *   Set required environment variables (e.g., `PORT`, `PUBSUB_EMULATOR_HOST=localhost:8538`, internal `*_SERVICE_URL`s). (WILL WORK WITHOUT SETTING ENV VARIABLES)
    *   Run `node server.js`.
6.  **Test Frontend:** Open the `index.html` file in your browser and use the interface to request a ride. Observe the logs across the service terminals and the status updates on the frontend.

## Deployment

This project includes `Dockerfile`s for each service/gateway, suitable for building container images. The architecture is designed to be deployed onto a platform like Google Kubernetes Engine (GKE), leveraging Kubernetes Services for internal communication and potentially a LoadBalancer for the `rider-gateway`.
In a real scenario, you would likely want to create a public API gateway that routes traffic to specific domain gateways. 
