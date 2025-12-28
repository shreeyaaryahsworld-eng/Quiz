require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const progressRoutes = require("./routes/progressRoutes");
const userAnswerRoutes = require("./routes/userAnswerRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to mongodb
connectDB();

// routes
app.use("/api/progress", progressRoutes);
app.use("/api/user-answers", userAnswerRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

const PORT = process.env.PORT || 5000;

// 🔥 THIS MUST EXIST
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
