import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  listingDraftSchema,
  type ListingDraft,
} from "@multi-publisher/shared";
import { env } from "../config/env";

export interface DraftListItem {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  fileName: string;
}

interface StoredDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  listing: ListingDraft;
}

function sanitizeFilePart(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function buildDraftFileName(id: string, title: string): string {
  const safeTitle = sanitizeFilePart(title || "borrador");
  return `${safeTitle || "borrador"}-${id}.json`;
}

function getDraftPathByFileName(fileName: string): string {
  return path.join(env.draftsDir, fileName);
}

async function readStoredDraftFromFile(fileName: string): Promise<StoredDraft> {
  const fullPath = getDraftPathByFileName(fileName);
  const raw = await fs.readFile(fullPath, "utf-8");
  const parsed = JSON.parse(raw) as StoredDraft;

  const listingParsed = listingDraftSchema.safeParse(parsed.listing);

  if (!listingParsed.success) {
    throw new Error(`El borrador ${fileName} no es válido.`);
  }

  return {
    ...parsed,
    listing: listingParsed.data,
  };
}

export async function listDrafts(): Promise<DraftListItem[]> {
  const files = await fs.readdir(env.draftsDir);

  const jsonFiles = files.filter((file) => file.toLowerCase().endsWith(".json"));

  const drafts = await Promise.all(
    jsonFiles.map(async (fileName) => {
      const stored = await readStoredDraftFromFile(fileName);

      return {
        id: stored.id,
        title: stored.listing.title || "Sin título",
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
        fileName,
      };
    })
  );

  return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDraftById(id: string): Promise<StoredDraft> {
  const files = await fs.readdir(env.draftsDir);
  const fileName = files.find((file) => file.endsWith(`${id}.json`));

  if (!fileName) {
    throw new Error("Borrador no encontrado.");
  }

  return readStoredDraftFromFile(fileName);
}

export async function saveDraft(input: unknown): Promise<StoredDraft> {
  const parsed = listingDraftSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message ?? "Borrador no válido.");
  }

  const listing = parsed.data;
  const now = new Date().toISOString();

  let id = listing.id;
  let createdAt = now;

  if (id) {
    try {
      const existing = await getDraftById(id);
      createdAt = existing.createdAt;
    } catch {
      createdAt = now;
    }
  } else {
    id = crypto.randomUUID();
  }

  const storedDraft: StoredDraft = {
    id,
    createdAt,
    updatedAt: now,
    listing: {
      ...listing,
      id,
    },
  };

  const files = await fs.readdir(env.draftsDir);
  const previousFile = files.find((file) => file.endsWith(`${id}.json`));

  if (previousFile) {
    await fs.unlink(getDraftPathByFileName(previousFile));
  }

  const fileName = buildDraftFileName(id, storedDraft.listing.title);
  const fullPath = getDraftPathByFileName(fileName);

  await fs.writeFile(fullPath, JSON.stringify(storedDraft, null, 2), "utf-8");

  return storedDraft;
}

export async function deleteDraft(id: string): Promise<void> {
  const files = await fs.readdir(env.draftsDir);
  const fileName = files.find((file) => file.endsWith(`${id}.json`));

  if (!fileName) {
    throw new Error("Borrador no encontrado.");
  }

  await fs.unlink(getDraftPathByFileName(fileName));
}