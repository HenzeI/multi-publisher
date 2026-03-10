import path from "node:path";
import type { ListingDraft, PortalKey } from "@multi-publisher/shared";
import type { Page } from "patchright";
import { env } from "../config/env";
import { launchPersistentBrowserSession } from "./browserManager";
import { logStep, writeDebugText } from "./publisherLogger";

export abstract class BasePublisher {
  protected abstract portalKey: PortalKey;

  abstract publish(listing: ListingDraft): Promise<void>;

  protected async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
    const { context, page } = await launchPersistentBrowserSession();

    try {
      return await callback(page);
    } catch (error) {
      logStep(this.portalKey, `Error durante la automatización: ${String(error)}`);

      try {
        const screenshotPath = path.join(
          env.debugDir,
          `${new Date().toISOString().replace(/[:.]/g, "-")}-${this.portalKey}-error.png`
        );

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        const html = await page.content();
        const bodyText = await page.locator("body").innerText().catch(() => "");

        await writeDebugText(this.portalKey, "html", html);
        await writeDebugText(this.portalKey, "body", bodyText);

        logStep(this.portalKey, `Captura guardada en: ${screenshotPath}`);
        logStep(this.portalKey, "Se han guardado HTML y texto de la página.");
      } catch (debugError) {
        logStep(
          this.portalKey,
          `No se pudo generar diagnóstico extra: ${String(debugError)}`
        );
      }

      await page.pause();
      throw error;
    } finally {
      await context.close();
    }
  }

  protected log(message: string): void {
    logStep(this.portalKey, message);
  }

  protected async fillIfPresent(
    page: Page,
    selectors: string[],
    value: string
  ): Promise<boolean> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();

      this.log(`Probando selector fill: ${selector} -> ${count}`);

      if (count > 0) {
        await locator.fill(value);
        this.log(`Campo rellenado con selector: ${selector}`);
        return true;
      }
    }

    return false;
  }

  protected async clickIfPresent(page: Page, selectors: string[]): Promise<boolean> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();

      this.log(`Probando selector click: ${selector} -> ${count}`);

      if (count > 0) {
        await locator.click();
        this.log(`Click ejecutado con selector: ${selector}`);
        return true;
      }
    }

    return false;
  }

  protected async setFilesIfPresent(
    page: Page,
    selectors: string[],
    filePaths: string[]
  ): Promise<boolean> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();

      this.log(`Probando selector files: ${selector} -> ${count}`);

      if (count > 0) {
        await locator.setInputFiles(filePaths);
        this.log(`Archivos asignados con selector: ${selector}`);
        return true;
      }
    }

    return false;
  }

  protected async dumpVisibleFields(page: Page): Promise<void> {
    const fields = await page.locator("input, textarea, select").evaluateAll((elements) =>
      elements.map((el) => ({
        tag: el.tagName,
        name: el.getAttribute("name"),
        id: el.getAttribute("id"),
        placeholder: el.getAttribute("placeholder"),
        ariaLabel: el.getAttribute("aria-label"),
        type: el.getAttribute("type"),
        className: el.getAttribute("class"),
      }))
    );

    await writeDebugText(this.portalKey, "fields", JSON.stringify(fields, null, 2));
    this.log("Se ha guardado un volcado de campos visibles.");
  }

  protected async getFirstVisibleLocator(
    page: Page,
    selectors: string[]
  ): Promise<import("patchright").Locator | null> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();

      this.log(`Probando selector locator: ${selector} -> ${count}`);

      if (count > 0) {
        return locator;
      }
    }

    return null;
  }

  protected async pauseForManualReview(page: Page): Promise<void> {
    this.log("Pausa manual activada.");
    await page.pause();
  }
}
