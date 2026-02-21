# Stripe-test-API

A minimal Node.js backend project for Stripe Checkout integration for learning purposes.

## Requirements Covered

- Node.js with Express
- Stripe official Node SDK
- dotenv for environment variables
- CORS enabled
- No database

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

   _Note: Add your actual Stripe secret key in the `.env` file._

3. Run the project:

   ```bash
   # Production mode
   npm start

   # Development mode (with nodemon)
   npm run dev
   ```

## API Endpoints

- `POST /create-checkout-session`: Creates a Stripe Checkout Session for a sample product (Stripe Test Product - ₹500) and returns the session ID.
- `POST /webhook`: A simple webhook endpoint that logs received events to the console (e.g. `checkout.session.completed`).
