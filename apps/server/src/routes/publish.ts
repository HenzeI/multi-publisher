import { Router } from "express";
import { publishListing } from "../services/publishService";

export const publishRouter = Router();

publishRouter.post("/", async (req, res) => {
  try {
    const result = await publishListing(req.body);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error al publicar",
    });
  }
});