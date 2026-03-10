import { Router } from "express";
import {
  deleteDraft,
  getDraftById,
  listDrafts,
  saveDraft,
} from "../services/draftService";

export const draftsRouter = Router();

draftsRouter.get("/", async (_req, res) => {
  try {
    const drafts = await listDrafts();
    res.json({ items: drafts });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Error al listar borradores",
    });
  }
});

draftsRouter.get("/:id", async (req, res) => {
  try {
    const draft = await getDraftById(req.params.id);
    res.json(draft);
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "Borrador no encontrado",
    });
  }
});

draftsRouter.post("/", async (req, res) => {
  try {
    const saved = await saveDraft(req.body);
    res.json({
      message: "Borrador guardado correctamente.",
      item: saved,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Error al guardar borrador",
    });
  }
});

draftsRouter.delete("/:id", async (req, res) => {
  try {
    await deleteDraft(req.params.id);
    res.json({
      message: "Borrador eliminado correctamente.",
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "Error al eliminar borrador",
    });
  }
});