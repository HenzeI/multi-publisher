import path from "node:path";
import { chromium, type BrowserContext, type Page } from "patchright";
import { env } from "../config/env";

export interface PersistentBrowserSession {
  context: BrowserContext;
  page: Page;
}

export async function launchPersistentBrowserSession(): Promise<PersistentBrowserSession> {
  const userDataDir = path.resolve(env.playwrightUserDataDir);

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chrome",
    headless: false,
    viewport: null,
  });

  let page = context.pages()[0];

  if (!page) {
    page = await context.newPage();
  }

  return {
    context,
    page,
  };
}