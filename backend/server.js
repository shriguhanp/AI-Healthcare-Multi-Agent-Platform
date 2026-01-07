import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import aiRouter from "./routes/aiRoute.js"; // 🔥 AI Route
import axios from "axios"; // <-- for n8n requests

// app config
const app = express();
const port = process.env.PORT || 5000;

// database & cloudinary
connectDB();
connectCloudinary();

// middlewares
app.use(cors());
app.use(express.json());

// api routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter); // /chat is under this

// 🔥 AI endpoint to connect n8n Diagnostic agent
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, agent: agentType } = req.body; // rename agent to agentType

    if (!message)
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });

    // Use env variables for webhook URLs
    const n8nWebhookUrl =
      agentType === "diagnostic"
        ? process.env.N8N_DIAGNOSTIC_WEBHOOK
        : process.env.N8N_MASC_WEBHOOK;

    // Make request to n8n
    const response = await axios.post(
      n8nWebhookUrl,
      { message },
      { timeout: 60000 } // 60 seconds timeout
    );

    const reply = response.data.final_response || "No reply from AI agent.";

    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI chat error:", err.message || err);
    let errorMsg = "Unable to get response from AI agent.";

    if (err.code === "ECONNABORTED")
      errorMsg = "AI agent timed out. Please try again.";
    if (err.response?.status)
      errorMsg = `AI agent error: ${err.response.statusText}`;

    res.status(500).json({ success: false, error: errorMsg });
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Prescripto API is running 🚀");
});

// server listener with port check
app
  .listen(port, () => console.log(`Server running on http://localhost:${port}`))
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${port} is already in use!`);
      console.error(`Please either:`);
      console.error(`  1. Stop the process using port ${port}`);
      console.error(`  2. Or set a different PORT in your .env file\n`);
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
