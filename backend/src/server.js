require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  startScheduler();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
})();
