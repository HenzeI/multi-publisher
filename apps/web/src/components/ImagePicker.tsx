import { useEffect, useMemo, useState } from "react";
import { getFilesBase, listFiles, searchFilesByName, type FileEntry } from "../lib/api";

interface ImagePickerProps {
  value: string[];
  onChange: (images: string[]) => void;
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [baseDir, setBaseDir] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [items, setItems] = useState<FileEntry[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FileEntry[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");

  const selectedSet = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    void loadBase();
    void loadDirectory("");
  }, []);

  async function loadBase() {
    try {
      const data = await getFilesBase();
      setBaseDir(data.baseDir);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar carpeta base");
    }
  }

  async function loadDirectory(path: string) {
    try {
      setError("");
      setLoadingList(true);
      const data = await listFiles(path);
      setCurrentPath(data.path);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al listar carpeta");
    } finally {
      setLoadingList(false);
    }
  }

  async function runSearch() {
    try {
      setError("");
      setLoadingSearch(true);
      const data = await searchFilesByName(search);
      setSearchResults(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar imágenes");
    } finally {
      setLoadingSearch(false);
    }
  }

  function toggleImage(relativePath: string) {
    if (selectedSet.has(relativePath)) {
      onChange(value.filter((item) => item !== relativePath));
      return;
    }

    onChange([...value, relativePath]);
  }

  function goUp() {
    if (!currentPath) {
      return;
    }

    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    void loadDirectory(parts.join("/"));
  }

  const imageItems = items.filter((item) => item.type === "file");
  const folderItems = items.filter((item) => item.type === "directory");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <strong>Carpeta base:</strong>
        <div style={{ marginTop: 4, color: "#555" }}>{baseDir || "Cargando..."}</div>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Buscar por nombre</h3>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. iphone, frontal, zapatilla..."
            style={{ flex: 1, padding: 10 }}
          />
          <button type="button" onClick={runSearch} disabled={loadingSearch}>
            {loadingSearch ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {searchResults.map((item) => {
              const checked = selectedSet.has(item.relativePath);

              return (
                <label
                  key={item.relativePath}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #e2e2e2",
                    borderRadius: 8,
                    padding: 8,
                    background: checked ? "#eef6ff" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleImage(item.relativePath)}
                  />
                  <span>{item.relativePath}</span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 12,
          background: "#fafafa",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Examinar carpeta</h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <button type="button" onClick={goUp} disabled={!currentPath}>
            Subir nivel
          </button>
          <span style={{ color: "#555" }}>
            Ruta actual: /{currentPath || ""}
          </span>
        </div>

        {loadingList ? <div>Cargando carpeta...</div> : null}

        {!loadingList ? (
          <div style={{ display: "grid", gap: 8 }}>
            {folderItems.map((item) => (
              <button
                key={item.relativePath}
                type="button"
                onClick={() => void loadDirectory(item.relativePath)}
                style={{
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "#fff8e6",
                  cursor: "pointer",
                }}
              >
                📁 {item.name}
              </button>
            ))}

            {imageItems.map((item) => {
              const checked = selectedSet.has(item.relativePath);

              return (
                <label
                  key={item.relativePath}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 8,
                    background: checked ? "#eef6ff" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleImage(item.relativePath)}
                  />
                  <span>🖼️ {item.name}</span>
                </label>
              );
            })}
          </div>
        ) : null}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 12,
          background: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Imágenes seleccionadas</h3>

        {value.length === 0 ? (
          <div style={{ color: "#777" }}>No hay imágenes seleccionadas.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {value.map((imagePath) => (
              <div
                key={imagePath}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <span>{imagePath}</span>
                <button
                  type="button"
                  onClick={() => toggleImage(imagePath)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <div style={{ color: "crimson", fontWeight: 600 }}>{error}</div>
      ) : null}
    </div>
  );
}