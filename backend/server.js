require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const connectDB = require("./config/db");
const app = require("./app");
const { initializeSocket } = require("./socket/socketServer");
const { initScheduler } = require("./utils/scheduler");

const PORT = process.env.PORT || 5000;

connectDB();

// Initialize scheduler after DB connection is established
mongoose.connection.once("open", () => {
  initScheduler();
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in routes/controllers
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time chat`);
});
