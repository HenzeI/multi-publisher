import type { ListingDraft } from "@multi-publisher/shared";

const API_BASE_URL = "http://localhost:3000/api";

export interface FileEntry {
  name: string;
  relativePath: string;
  absolutePath: string;
  type: "file" | "directory";
  extension?: string;
  mimeType?: string | false;
}

export interface ListFilesResponse {
  path: string;
  items: FileEntry[];
}

export interface SearchFilesResponse {
  query: string;
  items: FileEntry[];
}

export interface PublishResponse {
  success: boolean;
  message: string;
  portals?: string[];
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Error de red");
  }

  return data as T;
}

export async function getHealth() {
  return fetchJson<{ ok: boolean; service: string }>(`${API_BASE_URL}/health`);
}

export async function getFilesBase() {
  return fetchJson<{ baseDir: string }>(`${API_BASE_URL}/files/base`);
}

export async function listFiles(path = "") {
  const query = new URLSearchParams();

  if (path) {
    query.set("path", path);
  }

  return fetchJson<ListFilesResponse>(
    `${API_BASE_URL}/files/list${query.toString() ? `?${query.toString()}` : ""}`
  );
}

export async function searchFilesByName(q: string) {
  const query = new URLSearchParams({ q });

  return fetchJson<SearchFilesResponse>(
    `${API_BASE_URL}/files/search?${query.toString()}`
  );
}

export async function publishListing(listing: ListingDraft) {
  return fetchJson<PublishResponse>(`${API_BASE_URL}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listing),
  });
}