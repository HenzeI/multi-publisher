import fs from "fs/promises";
import path from "path";
import type { Page } from "patchright";
import { launchPersistentBrowserSession } from "../publishers/browserManager";

const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "../../data/platform-taxonomies/milanuncios.category-paths.json"
);

const SELECTORS = {
  items: "li.ma-CategoriesAccordion-listItem",
  button: ".ma-CategoriesAccordion-listItem-Button",
  text: ".ma-CategoriesAccordion-listItem-Text",
};

interface VisibleCategoryItem {
  label: string;
  level: number;
  isLeaf: boolean;
  isOpen: boolean;
  isClosed: boolean;
  isMainCategory: boolean;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function ensureCategoryScreen(page: Page): Promise<void> {
  const bodyText = await page.locator("body").innerText().catch(() => "");

  if (bodyText.includes("Iniciar sesión") || bodyText.includes("Acceder")) {
    console.log(
      "[extract-paths-fast] Parece que hay que iniciar sesión manualmente. Hazlo y luego continúa."
    );
    await page.pause();
  }

  const visible =
    (await page.locator("text=Elige la categoría de tu anuncio").count()) > 0;

  if (!visible) {
    console.log(
      "[extract-paths-fast] No se detecta claramente la pantalla de categorías. Déjala visible y continúa."
    );
    await page.pause();
  }
}

async function getVisibleItems(page: Page): Promise<VisibleCategoryItem[]> {
  return page.evaluate((selectors) => {
    const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

    const nodes = Array.from(document.querySelectorAll(selectors.items));

    return nodes
      .map((node) => {
        const className = node.getAttribute("class") ?? "";
        const level = Number(node.getAttribute("aria-level") ?? "1");
        const textNode = node.querySelector(selectors.text);
        const label = normalize(textNode?.textContent ?? "");

        return {
          label,
          level,
          isLeaf: className.includes("isLeafCategory"),
          isOpen: className.includes("isOpen"),
          isClosed: className.includes("isClosed"),
          isMainCategory: className.includes("isMainCategory"),
        };
      })
      .filter((item) => item.label);
  }, SELECTORS);
}

function dedupeItems(items: VisibleCategoryItem[]): VisibleCategoryItem[] {
  const seen = new Set<string>();
  const result: VisibleCategoryItem[] = [];

  for (const item of items) {
    const key = `${item.level}::${item.label}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result;
}

async function clickByLabelAndLevel(
  page: Page,
  label: string,
  level: number
): Promise<boolean> {
  const items = page.locator(SELECTORS.items);
  const count = await items.count();

  for (let i = 0; i < count; i += 1) {
    const item = items.nth(i);
    const visible = await item.isVisible().catch(() => false);

    if (!visible) {
      continue;
    }

    const ariaLevel = Number((await item.getAttribute("aria-level")) ?? "1");
    if (ariaLevel !== level) {
      continue;
    }

    const text = normalizeText(
      await item.locator(SELECTORS.text).first().innerText().catch(() => "")
    );

    if (text !== label) {
      continue;
    }

    const button = item.locator(SELECTORS.button).first();
    await button.scrollIntoViewIfNeeded().catch(() => undefined);
    await button.click();
    //await page.waitForTimeout(1);
    return true;
  }

  return false;
}

async function ensurePathOpen(page: Page, pathLabels: string[]): Promise<void> {
  for (let i = 0; i < pathLabels.length; i += 1) {
    const label = pathLabels[i];
    const level = i + 1;

    const items = await getVisibleItems(page);
    const current = items.find(
      (item) => item.level === level && item.label === label
    );

    if (!current) {
      throw new Error(
        `No se encontró el paso "${label}" en el nivel ${level}.`
      );
    }

    if (current.isLeaf) {
      continue;
    }

    if (current.isClosed) {
      const clicked = await clickByLabelAndLevel(page, label, level);

      if (!clicked) {
        throw new Error(
          `No se pudo abrir el paso "${label}" en el nivel ${level}.`
        );
      }
    }
  }
}

async function getChildrenOfPath(
  page: Page,
  pathLabels: string[]
): Promise<VisibleCategoryItem[]> {
  const parentLevel = pathLabels.length;

  if (pathLabels.length > 0) {
    await ensurePathOpen(page, pathLabels);
  }

  const items = await getVisibleItems(page);
  const childLevel = parentLevel + 1;
  const result: VisibleCategoryItem[] = [];

  let parentFound = pathLabels.length === 0;

  for (const item of items) {
    if (!parentFound && pathLabels.length > 0) {
      const lastLabel = pathLabels[pathLabels.length - 1];
      if (item.level === parentLevel && item.label === lastLabel) {
        parentFound = true;
      }
      continue;
    }

    if (!parentFound) {
      continue;
    }

    if (item.level < childLevel) {
      break;
    }

    if (item.level === childLevel) {
      result.push(item);
    }
  }

  return dedupeItems(result);
}

async function collectPathsFromPath(
  page: Page,
  currentPath: string[],
  paths: string[][]
): Promise<void> {
  const children = await getChildrenOfPath(page, currentPath);

  if (children.length === 0) {
    if (currentPath.length > 0) {
      paths.push([...currentPath]);
    }
    return;
  }

  for (const child of children) {
    const nextPath = [...currentPath, child.label];
    console.log(`[extract-paths-fast] visitando: ${nextPath.join(" > ")}`);

    if (child.isLeaf) {
      paths.push(nextPath);
      continue;
    }

    await collectPathsFromPath(page, nextPath, paths);
  }
}

function dedupePaths(paths: string[][]): string[][] {
  const seen = new Set<string>();
  const result: string[][] = [];

  for (const path of paths) {
    const key = path.join(" > ");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(path);
  }

  return result;
}

async function getRootCategories(page: Page): Promise<VisibleCategoryItem[]> {
  const items = await getVisibleItems(page);
  return dedupeItems(items.filter((item) => item.level === 1));
}

async function main() {
  const { context, page } = await launchPersistentBrowserSession();

  try {
    await page.goto("https://www.milanuncios.com/publicar-anuncios-gratis/", {
      waitUntil: "networkidle",
    });

    await page.waitForTimeout(20);
    await ensureCategoryScreen(page);

    const rootCategories = await getRootCategories(page);
    const allPaths: string[][] = [];

    for (const root of rootCategories) {
      console.log(`[extract-paths-fast] categoría principal: ${root.label}`);

      if (root.isLeaf) {
        allPaths.push([root.label]);
        continue;
      }

      await collectPathsFromPath(page, [root.label], allPaths);
    }

    const finalPaths = dedupePaths(allPaths).sort((a, b) =>
      a.join(" > ").localeCompare(b.join(" > "), "es", {
        sensitivity: "base",
      })
    );

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(finalPaths, null, 2), "utf-8");

    console.log(`[extract-paths-fast] Rutas guardadas en: ${OUTPUT_PATH}`);
    console.log(`[extract-paths-fast] Total rutas: ${finalPaths.length}`);
  } catch (error) {
    console.error("[extract-paths-fast] Error:", error);
    await page.pause();
  } finally {
    await context.close();
  }
}

void main();