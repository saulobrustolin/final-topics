import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import buySellRoutes from "./routes/buySellRoutes.js";
import i18n from "./config/i18n.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(i18n.init);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/games", gameRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/buy-sells", buySellRoutes);

app.use((req, res) => {
  res.status(404).json({ message: req.__("errors.route_not_found") });
});

export default app;
