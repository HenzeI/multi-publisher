import { chromium } from "playwright";
import type { ListingDraft } from "@multi-publisher/shared";
import { BasePublisher } from "./basePublisher";

export class MilanunciosPublisher extends BasePublisher {
  async publish(listing: ListingDraft): Promise<void> {
    const browser = await chromium.launch({
      headless: false,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto("https://www.milanuncios.com/");

      console.log("Publicando borrador en Milanuncios...");
      console.log("Título:", listing.title);
      console.log("Descripción:", listing.description);
      console.log("Imágenes:", listing.images);

      // Aquí luego haremos:
      // - login
      // - ir a la pantalla de publicación
      // - rellenar formulario
      // - subir imágenes
      // - detener antes del submit final

      await page.pause();
    } finally {
      await context.close();
      await browser.close();
    }
  }
}