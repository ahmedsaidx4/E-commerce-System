const dotenv = require("dotenv");

console.log("🚀 server.js started");

dotenv.config();

console.log("✅ dotenv loaded");
console.log("PORT:", process.env.PORT);

const app = require("./app");
console.log("✅ app loaded");

const connectDB = require("./config/db");
console.log("✅ db module loaded");

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log("🔌 Connecting to database...");

    await connectDB();

    console.log("✅ Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    process.exit(1);
  }
};

startServer();
