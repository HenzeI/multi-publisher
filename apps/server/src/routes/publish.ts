import { Router } from "express";
import type { ListingDraft } from "@multi-publisher/shared";
import { publishListing } from "../services/publishService";

export const publishRouter = Router();

publishRouter.post("/", async (req, res) => {
  try {
    const listing = req.body as ListingDraft;
    const result = await publishListing(listing);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error al publicar",
    });
  }
});