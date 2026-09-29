const dotenv = require("dotenv");

dotenv.config({ path: "./src/config/.env" });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `-------------------Server Is Ready on Port ${PORT}-------------------`,
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
