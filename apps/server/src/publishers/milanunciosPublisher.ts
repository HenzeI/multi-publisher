import type { ListingDraft } from "@multi-publisher/shared";
import { portalConfigs } from "../config/portals";
import { BasePublisher } from "./basePublisher";
import { milanunciosSelectors } from "./milanuncios.selectors";

export class MilanunciosPublisher extends BasePublisher {
  protected portalKey = "milanuncios" as const;

  async publish(listing: ListingDraft): Promise<void> {
    await this.withPage(async (page) => {
      const portal = portalConfigs.milanuncios;

      await page.goto(portal.publishUrl ?? portal.homeUrl, {
        waitUntil: "networkidle",
      });

      await page.waitForTimeout(2000);

      console.log("[Milanuncios] URL actual:", page.url());

      const pageText = await page.locator("body").innerText();

      if (
        pageText.includes("¡Ups! Algo se detuvo") ||
        pageText.includes("Tu visita a Milanuncios se ha interrumpido")
      ) {
        throw new Error(
          "Milanuncios ha bloqueado o interrumpido el acceso antes de cargar el formulario."
        );
      }

      await this.ensureUserIsLoggedInIfNeeded(page);
      await this.navigateToPublishIfNeeded(page, portal.publishUrl ?? portal.homeUrl);
      await this.fillListingForm(page, listing);

      console.log(
        "[Milanuncios] Formulario rellenado. Revisa manualmente antes de enviar."
      );

      await this.pauseForManualReview(page);
    });
  }

  private async ensureUserIsLoggedInIfNeeded(page: import("playwright").Page) {
    // Primera versión:
    // dejamos un punto claro para login manual.
    // Con contexto persistente, normalmente solo tendrás que loguearte una vez.

    console.log("[Milanuncios] Comprueba si la sesión está iniciada.");
    console.log(
      "[Milanuncios] Si es la primera vez, inicia sesión manualmente y continúa."
    );

    await page.waitForLoadState("domcontentloaded");
  }

  private async navigateToPublishIfNeeded(
    page: import("playwright").Page,
    publishUrl: string
  ) {
    if (!page.url().includes("/publicar")) {
      await page.goto(publishUrl, {
        waitUntil: "domcontentloaded",
      });
    }
  }

  private async fillListingForm(
    page: import("playwright").Page,
    listing: ListingDraft
  ) {
    const titleFilled = await this.fillIfPresent(
      page,
      milanunciosSelectors.title,
      listing.title
    );

    if (!titleFilled) {
      throw new Error(
        "No se encontró el campo de título en Milanuncios. Revisa los selectores."
      );
    }

    const descriptionFilled = await this.fillIfPresent(
      page,
      milanunciosSelectors.description,
      listing.description
    );

    if (!descriptionFilled) {
      throw new Error(
        "No se encontró el campo de descripción en Milanuncios. Revisa los selectores."
      );
    }

    if (listing.price != null) {
      const priceFilled = await this.fillIfPresent(
        page,
        milanunciosSelectors.price,
        String(listing.price)
      );

      if (!priceFilled) {
        console.warn(
          "[Milanuncios] No se encontró un campo de precio con los selectores actuales."
        );
      }
    }

    if (listing.images.length > 0) {
      const imagesUploaded = await this.setFilesIfPresent(
        page,
        milanunciosSelectors.imageInput,
        listing.images
      );

      if (!imagesUploaded) {
        console.warn(
          "[Milanuncios] No se encontró el input de imágenes con los selectores actuales."
        );
      }
    }

    await this.fillOptionalAttributes(page, listing);
  }

  private async fillOptionalAttributes(
    page: import("playwright").Page,
    listing: ListingDraft
  ) {
    const brand = typeof listing.attributes.brand === "string"
      ? listing.attributes.brand
      : undefined;

    const model = typeof listing.attributes.model === "string"
      ? listing.attributes.model
      : undefined;

    const location = listing.location ?? "";

    if (brand) {
      await this.fillIfPresent(page, [
        'input[name="brand"]',
        'input[id*="brand"]',
        'input[placeholder*="marca" i]',
      ], brand);
    }

    if (model) {
      await this.fillIfPresent(page, [
        'input[name="model"]',
        'input[id*="model"]',
        'input[placeholder*="modelo" i]',
      ], model);
    }

    if (location) {
      await this.fillIfPresent(page, [
        'input[name="location"]',
        'input[id*="location"]',
        'input[placeholder*="ubicación" i]',
        'input[placeholder*="ubicacion" i]',
      ], location);
    }
  }
}