import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { allowedCorsOrigins, env } from "./config.js";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import incidentsRoutes from "./routes/incidents.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.NODE_ENV === "development" || allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/admin", adminRoutes);

// default 404
app.use((_req, res) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

// error boundary
app.use(((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "INTERNAL_ERROR", details: err.message || err.toString() });
  } else {
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}) as express.ErrorRequestHandler);

app.listen(env.PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${env.PORT}`);
});

