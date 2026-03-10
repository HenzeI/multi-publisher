import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime-types";
import { env } from "../config/env";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
]);

export interface FileEntry {
  name: string;
  relativePath: string;
  absolutePath: string;
  type: "file" | "directory";
  extension?: string;
  mimeType?: string | false;
}

function normalizeRelativePath(input?: string): string {
  if (!input || input.trim() === "") {
    return "";
  }

  return input.replace(/\\/g, "/").replace(/^\/+/, "");
}

function resolveSafePath(relativePath = ""): string {
  const normalized = normalizeRelativePath(relativePath);
  const absolute = path.resolve(env.filesBaseDir, normalized);

  const relativeToBase = path.relative(env.filesBaseDir, absolute);

  if (
    relativeToBase.startsWith("..") ||
    path.isAbsolute(relativeToBase)
  ) {
    throw new Error("Ruta fuera de la carpeta base permitida.");
  }

  return absolute;
}

function toRelativePath(absolutePath: string): string {
  return path.relative(env.filesBaseDir, absolutePath).replace(/\\/g, "/");
}

function isAllowedImage(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export async function getBaseDirectoryInfo() {
  return {
    baseDir: env.filesBaseDir,
  };
}

export async function listDirectory(relativePath = ""): Promise<FileEntry[]> {
  const absolutePath = resolveSafePath(relativePath);
  const stat = await fs.stat(absolutePath);

  if (!stat.isDirectory()) {
    throw new Error("La ruta indicada no es una carpeta.");
  }

  const entries = await fs.readdir(absolutePath, { withFileTypes: true });

  const mapped: FileEntry[] = await Promise.all(
    entries.map(async (entry) => {
      const entryAbsolutePath = path.join(absolutePath, entry.name);
      const relativeEntryPath = toRelativePath(entryAbsolutePath);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          relativePath: relativeEntryPath,
          absolutePath: entryAbsolutePath,
          type: "directory",
        };
      }

      const extension = path.extname(entry.name).toLowerCase();
      const mimeType = mime.lookup(entry.name);

      return {
        name: entry.name,
        relativePath: relativeEntryPath,
        absolutePath: entryAbsolutePath,
        type: "file",
        extension,
        mimeType,
      };
    })
  );

  return mapped.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }

    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });
}

export async function searchImagesByName(query: string): Promise<FileEntry[]> {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  const results: FileEntry[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!isAllowedImage(entry.name)) {
        continue;
      }

      if (!entry.name.toLowerCase().includes(trimmed)) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      results.push({
        name: entry.name,
        relativePath: toRelativePath(absolutePath),
        absolutePath,
        type: "file",
        extension,
        mimeType: mime.lookup(entry.name),
      });
    }
  }

  await walk(env.filesBaseDir);

  return results.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, "es", {
      sensitivity: "base",
    })
  );
}

export async function validateImagePaths(imagePaths: string[]): Promise<string[]> {
  const validAbsolutePaths: string[] = [];

  for (const imagePath of imagePaths) {
    const absolutePath = resolveSafePath(imagePath);
    const stat = await fs.stat(absolutePath);

    if (!stat.isFile()) {
      throw new Error(`La ruta no corresponde a un archivo: ${imagePath}`);
    }

    if (!isAllowedImage(absolutePath)) {
      throw new Error(`Archivo de imagen no permitido: ${imagePath}`);
    }

    validAbsolutePaths.push(absolutePath);
  }

  return validAbsolutePaths;
}