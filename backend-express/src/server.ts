import "dotenv/config";
import app from "./app";
import { ensureStorage } from "./utils/storage";

const port = process.env.PORT || 5001;

const startServer = async () => {
  await ensureStorage();

  app.listen(port, () => {
    console.log(`Express backend listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start Express backend", error);
  process.exit(1);
});
