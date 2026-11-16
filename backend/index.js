const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/waste", require("./routes/waste"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/ml", require("./routes/ml"));
app.use("/api/carbon", require("./routes/carbon"));
app.use("/api/ai", require("./routes/ai"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "2.0", project: "CanteenCarbon" });
});

// Export for Vercel serverless
module.exports = app;

// Start local server only when not in serverless env
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`CanteenCarbon API running on port ${PORT}`));
}
