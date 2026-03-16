import express from "express";
import { env } from "./config/env";

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "whop-jellyfin-bridge",
  });
});

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});