import { Router } from "express";
import {
  getBaseDirectoryInfo,
  listDirectory,
  searchImagesByName,
} from "../services/fileBrowserService";

export const filesRouter = Router();

filesRouter.get("/base", async (_req, res) => {
  try {
    const data = await getBaseDirectoryInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error interno",
    });
  }
});

filesRouter.get("/list", async (req, res) => {
  try {
    const relativePath =
      typeof req.query.path === "string" ? req.query.path : "";

    const items = await listDirectory(relativePath);

    res.json({
      path: relativePath,
      items,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Error al listar carpeta",
    });
  }
});

filesRouter.get("/search", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";

    const items = await searchImagesByName(q);

    res.json({
      query: q,
      items,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Error al buscar imágenes",
    });
  }
});