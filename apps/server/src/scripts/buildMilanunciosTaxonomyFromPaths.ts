import fs from "fs/promises";
import path from "path";

interface PortalTaxonomyNode {
  label: string;
  children: PortalTaxonomyNode[];
}

interface PathIndexItem {
  path: string[];
  depth: number;
  leaf: string;
  normalized: string;
}

const INPUT_PATH = path.resolve(
  process.cwd(),
  "../../data/platform-taxonomies/milanuncios.category-paths.json"
);

const OUTPUT_TREE_PATH = path.resolve(
  process.cwd(),
  "../../data/platform-taxonomies/milanuncios.categories.tree.json"
);

const OUTPUT_INDEX_PATH = path.resolve(
  process.cwd(),
  "../../data/platform-taxonomies/milanuncios.categories.index.json"
);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function insertPath(root: PortalTaxonomyNode[], pathLabels: string[]): void {
  let currentLevel = root;

  for (const label of pathLabels) {
    let node = currentLevel.find((item) => item.label === label);

    if (!node) {
      node = {
        label,
        children: [],
      };
      currentLevel.push(node);
    }

    currentLevel = node.children;
  }
}

function buildTree(paths: string[][]): PortalTaxonomyNode[] {
  const root: PortalTaxonomyNode[] = [];

  for (const pathLabels of paths) {
    if (!Array.isArray(pathLabels) || pathLabels.length === 0) {
      continue;
    }

    insertPath(root, pathLabels);
  }

  return sortTree(root);
}

function sortTree(nodes: PortalTaxonomyNode[]): PortalTaxonomyNode[] {
  return nodes
    .map((node) => ({
      label: node.label,
      children: sortTree(node.children),
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, "es", {
        sensitivity: "base",
      })
    );
}

function buildIndex(paths: string[][]): PathIndexItem[] {
  return paths
    .filter((pathLabels) => Array.isArray(pathLabels) && pathLabels.length > 0)
    .map((pathLabels) => ({
      path: pathLabels,
      depth: pathLabels.length,
      leaf: pathLabels[pathLabels.length - 1],
      normalized: normalizeText(pathLabels.join(" > ")),
    }))
    .sort((a, b) =>
      a.normalized.localeCompare(b.normalized, "es", {
        sensitivity: "base",
      })
    );
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf-8");
  const paths = JSON.parse(raw) as string[][];

  const tree = buildTree(paths);
  const index = buildIndex(paths);

  await fs.mkdir(path.dirname(OUTPUT_TREE_PATH), { recursive: true });

  await fs.writeFile(OUTPUT_TREE_PATH, JSON.stringify(tree, null, 2), "utf-8");
  await fs.writeFile(OUTPUT_INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");

  console.log(`[build-taxonomy] Árbol guardado en: ${OUTPUT_TREE_PATH}`);
  console.log(`[build-taxonomy] Índice guardado en: ${OUTPUT_INDEX_PATH}`);
  console.log(`[build-taxonomy] Total rutas procesadas: ${paths.length}`);
  console.log(`[build-taxonomy] Total entradas índice: ${index.length}`);
}

void main();