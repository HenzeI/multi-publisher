import type { Page } from "patchright";
import type { ListingDraft } from "@multi-publisher/shared";
import { portalConfigs } from "../config/portals";
import { BasePublisher } from "./basePublisher";
import { milanunciosSelectors } from "./milanuncios.selectors";

type MilanunciosPageState =
  | "blocked"
  | "login"
  | "category"
  | "publish-form"
  | "unknown";

export class MilanunciosPublisher extends BasePublisher {
  protected portalKey = "milanuncios" as const;

  async publish(listing: ListingDraft): Promise<void> {
    await this.withPage(async (page) => {
      const portal = portalConfigs.milanuncios;

      this.log("Abriendo portal de publicación...");
      await page.goto(portal.publishUrl ?? portal.homeUrl, {
        waitUntil: "networkidle",
      });

      await page.waitForTimeout(2000);

      this.log(`URL actual: ${page.url()}`);

      const state = await this.detectPageState(page);
      this.log(`Estado detectado: ${state}`);

      if (state === "blocked") {
        throw new Error(
          "Milanuncios ha mostrado una pantalla de bloqueo o interrupción antes del formulario."
        );
      }

      if (state === "login") {
        this.log("Se requiere inicio de sesión manual.");
        await this.pauseForManualReview(page);
      }

      const stateAfterLogin = await this.detectPageState(page);
      this.log(`Estado tras posible login: ${stateAfterLogin}`);

      if (stateAfterLogin === "category") {
        this.log("Se ha detectado pantalla de categoría. Intentando resolverla automáticamente.");
        await this.selectCategoryUsingSearch(page, listing);
      }

      const stateAfterCategory = await this.detectPageState(page);
      this.log(`Estado tras selección de categoría: ${stateAfterCategory}`);

      await this.ensurePublishFormReady(page);
      await this.fillListingForm(page, listing);

      this.log("Formulario rellenado. Revisa manualmente antes del envío final.");
      await this.pauseForManualReview(page);
    });
  }

  private async detectPageState(page: Page): Promise<MilanunciosPageState> {
    const bodyText = await page.locator("body").innerText().catch(() => "");

    if (
      bodyText.includes("¡Ups! Algo se detuvo") ||
      bodyText.includes("Tu visita a Milanuncios se ha interrumpido")
    ) {
      return "blocked";
    }

    for (const selector of milanunciosSelectors.loginIndicators) {
      if ((await page.locator(selector).count()) > 0) {
        return "login";
      }
    }

    const hasTitle = await this.hasAnySelector(page, milanunciosSelectors.title);
    const hasDescription = await this.hasAnySelector(
      page,
      milanunciosSelectors.description
    );

    if (hasTitle || hasDescription) {
      return "publish-form";
    }

    for (const selector of milanunciosSelectors.categoryIndicators) {
      if ((await page.locator(selector).count()) > 0) {
        return "category";
      }
    }

    const categoryInput = await this.hasAnySelector(
      page,
      milanunciosSelectors.categorySearchInput
    );

    if (categoryInput) {
      return "category";
    }

    return "unknown";
  }

  private async hasAnySelector(page: Page, selectors: string[]): Promise<boolean> {
    for (const selector of selectors) {
      if ((await page.locator(selector).count()) > 0) {
        return true;
      }
    }

    return false;
  }

  private async ensurePublishFormReady(page: Page): Promise<void> {
    const state = await this.detectPageState(page);

    if (state !== "publish-form") {
      await this.dumpVisibleFields(page);
      throw new Error(
        `No se ha detectado el formulario de publicación. Estado actual: ${state}`
      );
    }
  }

  private async fillListingForm(page: Page, listing: ListingDraft): Promise<void> {
    const titleFilled = await this.fillIfPresent(
      page,
      milanunciosSelectors.title,
      listing.title
    );

    if (!titleFilled) {
      await this.dumpVisibleFields(page);
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
      await this.dumpVisibleFields(page);
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
        this.log("No se encontró el campo de precio con los selectores actuales.");
      }
    }

    if (listing.images.length > 0) {
      const imagesUploaded = await this.setFilesIfPresent(
        page,
        milanunciosSelectors.imageInput,
        listing.images
      );

      if (!imagesUploaded) {
        this.log("No se encontró el input de imágenes con los selectores actuales.");
      }
    }

    await this.fillOptionalAttributes(page, listing);
  }

  private async fillOptionalAttributes(
    page: Page,
    listing: ListingDraft
  ): Promise<void> {
    const brand =
      typeof listing.attributes.brand === "string"
        ? listing.attributes.brand
        : undefined;

    const model =
      typeof listing.attributes.model === "string"
        ? listing.attributes.model
        : undefined;

    const location = listing.location ?? "";

    if (brand) {
      await this.fillIfPresent(
        page,
        [
          'input[name="brand"]',
          'input[id*="brand"]',
          'input[placeholder*="marca" i]',
          'input[aria-label*="marca" i]',
        ],
        brand
      );
    }

    if (model) {
      await this.fillIfPresent(
        page,
        [
          'input[name="model"]',
          'input[id*="model"]',
          'input[placeholder*="modelo" i]',
          'input[aria-label*="modelo" i]',
        ],
        model
      );
    }

    if (location) {
      await this.fillIfPresent(
        page,
        [
          'input[name="location"]',
          'input[id*="location"]',
          'input[placeholder*="ubicación" i]',
          'input[placeholder*="ubicacion" i]',
          'input[aria-label*="ubicación" i]',
          'input[aria-label*="ubicacion" i]',
        ],
        location
      );
    }
  }

  private async selectCategoryUsingSearch(
    page: Page,
    listing: ListingDraft
  ): Promise<void> {
    this.log("Intentando seleccionar categoría usando el buscador previo...");

    const searchInput = await this.getFirstVisibleLocator(
      page,
      milanunciosSelectors.categorySearchInput
    );

    if (!searchInput) {
      await this.dumpVisibleFields(page);
      throw new Error(
        "No se encontró el buscador de categoría de Milanuncios."
      );
    }

    await searchInput.click();
    await searchInput.fill(listing.title);

    this.log(`Texto escrito en buscador de categoría: ${listing.title}`);

    await page.waitForTimeout(1500);

    for (const selector of milanunciosSelectors.categorySuggestionItems) {
      const locator = page.locator(selector);

      const count = await locator.count();
      this.log(`Probando sugerencias con selector ${selector} -> ${count}`);

      if (count > 0) {
        const firstVisible = locator.first();
        await firstVisible.click();
        this.log(`Sugerencia seleccionada con selector: ${selector}`);
        await page.waitForTimeout(2000);
        return;
      }
    }

    this.log("No se encontró una sugerencia clara. Se requiere intervención manual.");
    await this.pauseForManualReview(page);
  }
}