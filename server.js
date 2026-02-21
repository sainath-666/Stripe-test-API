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

const staticProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 1500000, // ₹15,000.00
    description:
      "High-quality noise-cancelling headphones for an immersive audio experience.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    id: "2",
    name: "Mechanical Gaming Keyboard",
    price: 850000, // ₹8,500.00
    description:
      "RGB mechanical keyboard with tactile switches for ultimate gaming performance.",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
  },
  {
    id: "3",
    name: "4K Ultra HD Monitor",
    price: 2500000, // ₹25,000.00
    description:
      "Crystal clear 27-inch 4K monitor for professionals and gamers alike.",
    image:
      "https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80",
  },
  {
    id: "4",
    name: "Ergonomic Office Chair",
    price: 1200000, // ₹12,000.00
    description: "Comfortable ergonomic chair designed for long working hours.",
    image:
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
  },
];

app.get("/api/products", (req, res) => {
  res.json(staticProducts);
});

app.get("/api/products/:id", (req, res) => {
  const product = staticProducts.find((p) => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = staticProducts.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
              images: [product.image],
              description: product.description,
            },
            unit_amount: product.price,
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
