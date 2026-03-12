import "dotenv/config";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";

import { connectDb } from "./config/db.js";
import { ENV } from "./config/env.js";
import authRouter from "./routes/auth.js";
import { createDocumentRouter } from "./routes/documents.js";
import { createUploadRouter } from "./routes/upload.js";
import { aiRouter } from "./routes/ai.js";
import { seedRouter } from "./dev/seed.js";

import { User } from "./models/User.js";
import { Message } from "./models/Message.js";
import {
  getUserDocumentRole,
  hasAtLeastRole,
  ROLE_EDITOR,
  ROLE_VIEWER
} from "./utils/roles.js";

async function bootstrap() {
  await connectDb();

  const app = express();
  const server = http.createServer(app);
  

  const PORT = Number(ENV.PORT) || 5000;

  const io = new SocketIOServer(server, {
    cors: {
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST"]
    }
  });

  app.use(cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true 
  }));

  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get('/', (req, res) => res.send('SyncDoc Server is Live!'));
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/documents", createDocumentRouter(io));
  app.use("/api/upload", createUploadRouter(io));
  app.use("/api/ai", aiRouter);
  app.use("/api/dev", seedRouter);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, ENV.JWT_SECRET);
      const user = await User.findById(payload.userId);
      if (!user) return next(new Error("Invalid user"));
      socket.user = { id: user._id.toString(), name: user.name, email: user.email };
      next();
    } catch (err) {
      next(new Error("Auth error"));
    }
  });

 
  io.on("connection", socket => {
    socket.on("doc:join", async ({ documentId }) => {
      try {
        const { role } = await getUserDocumentRole(socket.user.id, documentId);
        if (!role) return socket.emit("doc:error", { code: 404, message: "No access" });
        socket.join(`doc:${documentId}`);
        socket.emit("doc:joined", { documentId, role });
      } catch {
        socket.emit("doc:error", { code: 500, message: "Join failed" });
      }
    });

    socket.on("doc:edit", async ({ documentId, content }) => {
      try {
        const { doc, role } = await getUserDocumentRole(socket.user.id, documentId);
        if (!doc || !hasAtLeastRole(role, ROLE_EDITOR)) return;
        doc.content = content;
        await doc.save();
        socket.to(`doc:${documentId}`).emit("doc:content", { content });
      } catch (err) {
        socket.emit("doc:error", { code: 500, message: "Edit failed" });
      }
    });

    socket.on("chat:message", async ({ documentId, text }) => {
      try {
        const { role } = await getUserDocumentRole(socket.user.id, documentId);
        if (!role) return;
        const message = await Message.create({
          document: documentId,
          sender: socket.user.id,
          text
        });
        const populated = await message.populate("sender", "name email");
        io.to(`doc:${documentId}`).emit("chat:message", populated);
      } catch (err) {
        socket.emit("chat:error", { code: 500, message: "Send failed" });
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Fatal error during bootstrap", err);
  process.exit(1);
});

