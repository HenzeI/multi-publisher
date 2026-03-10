import type { ListingDraft, PortalKey } from "@multi-publisher/shared";
import type { Page } from "playwright";
import { launchPersistentBrowserSession } from "./browserManager";

export abstract class BasePublisher {
  protected abstract portalKey: PortalKey;

  abstract publish(listing: ListingDraft): Promise<void>;

  protected async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
    const { context, page } = await launchPersistentBrowserSession();

    try {
      return await callback(page);
    } catch (error) {
      console.error(`[${this.portalKey}] Error durante la automatización:`, error);

      try {
        await page.screenshot({
          path: `./debug-${this.portalKey}-${Date.now()}.png`,
          fullPage: true,
        });

        const html = await page.content();
        console.log(`[${this.portalKey}] HTML recibido (primeros 2000 chars):`);
        console.log(html.slice(0, 2000));
      } catch (debugError) {
        console.error(`[${this.portalKey}] Error generando diagnóstico:`, debugError);
      }

      await page.pause();
      throw error;
    } finally {
      await context.close();
    }
  }

  protected async fillIfPresent(
    page: Page,
    selectors: string[],
    value: string
  ): Promise<boolean> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      const count = await locator.count();

      console.log(`[${this.portalKey}] Probando selector: ${selector} -> ${count}`);

      if (count > 0) {
        await locator.fill(value);
        console.log(`[${this.portalKey}] Campo encontrado con selector: ${selector}`);
        return true;
      }
    }

    return false;
  }

  protected async clickIfPresent(page: Page, selectors: string[]): Promise<boolean> {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();

      if (await locator.count()) {
        await locator.click();
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

      if (await locator.count()) {
        await locator.setInputFiles(filePaths);
        return true;
      }
    }

    return false;
  }

  protected async pauseForManualReview(page: Page): Promise<void> {
    await page.pause();
  }
}