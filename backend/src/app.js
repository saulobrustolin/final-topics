import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import i18n from "./config/i18n.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(i18n.init);

setupSwagger(app);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/music", musicRoutes);
app.use("/api/v1/album", albumRoutes);
app.use("/api/v1/artist", artistRoutes);
app.use("/api/v1/search", searchRoutes);

app.use((req, res) => {
  res.status(404).json({ message: req.__("errors.route_not_found") });
});

export default app;
