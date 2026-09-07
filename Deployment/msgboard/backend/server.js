import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { validateMessage } from "./validate.js";

const prisma = new PrismaClient();
const app = express();
app.use(cors()); // ponytail: only matters for local dev when the frontend runs on another port; nginx makes it same-origin in prod
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1"; // ponytail: bind localhost only; nginx is the public door

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/messages", async (_req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(messages);
  } catch (e) {
    next(e);
  }
});

app.post("/api/messages", async (req, res, next) => {
  const result = validateMessage(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  try {
    const message = await prisma.message.create({ data: result.value });
    res.status(201).json(message);
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal error" });
});

app.listen(PORT, HOST, () => {
  console.log(`msgboard api listening on http://${HOST}:${PORT}`);
});
