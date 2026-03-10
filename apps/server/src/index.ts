import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { filesRouter } from "./routes/files";
import { publishRouter } from "./routes/publish";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/api/health", healthRouter);
app.use("/api/files", filesRouter);
app.use("/api/publish", publishRouter);

app.listen(env.port, () => {
  console.log(`Servidor escuchando en http://localhost:${env.port}`);
});