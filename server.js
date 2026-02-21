require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 5000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

// Webhook endpoint needs raw body for signature verification in production,
// but for this simple learning project, we can parse it as JSON if we skip signature verification,
// or we can use express.raw just to be safe. We'll stick to express.json() for global and just read req.body.type.
// Actually, let's use express.json() for everything.
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Stripe Test Product",
            },
            unit_amount: 50000, // ₹500
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Simple webhook endpoint
app.post("/webhook", (req, res) => {
  const event = req.body;

  console.log(`Webhook received! Event Type: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log(`Payment successful for session ID: ${session.id}`);
      // Here you would normally fulfill the order
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send("Webhook received");
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
