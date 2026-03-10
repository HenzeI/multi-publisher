import { useEffect, useState } from "react";
import type { ListingDraft } from "@multi-publisher/shared";
import {
  deleteDraft,
  getDraft,
  listDrafts,
  saveDraft,
  type DraftListItem,
} from "../lib/api";

interface DraftManagerProps {
  draft: ListingDraft;
  onLoadDraft: (draft: ListingDraft) => void;
}

export function DraftManager({ draft, onLoadDraft }: DraftManagerProps) {
  const [items, setItems] = useState<DraftListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshDrafts() {
    try {
      setLoading(true);
      setError("");
      const data = await listDrafts();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar borradores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshDrafts();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const result = await saveDraft(draft);
      onLoadDraft(result.item.listing);
      setMessage(result.message);
      await refreshDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar borrador");
    } finally {
      setSaving(false);
    }
  }

  async function handleLoad(id: string) {
    try {
      setError("");
      setMessage("");
      const item = await getDraft(id);
      onLoadDraft(item.listing);
      setMessage("Borrador cargado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar borrador");
    }
  }

  async function handleDelete(id: string) {
    try {
      setError("");
      setMessage("");
      await deleteDraft(id);
      setMessage("Borrador eliminado correctamente.");
      await refreshDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar borrador");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar borrador"}
        </button>

        <button type="button" onClick={() => void refreshDrafts()} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar lista"}
        </button>
      </div>

      {message ? (
        <div style={{ color: "green", fontWeight: 600 }}>{message}</div>
      ) : null}

      {error ? (
        <div style={{ color: "crimson", fontWeight: 600 }}>{error}</div>
      ) : null}

      {items.length === 0 ? (
        <div style={{ color: "#666" }}>No hay borradores guardados.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{item.title || "Sin título"}</div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  Actualizado: {new Date(item.updatedAt).toLocaleString()}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => void handleLoad(item.id)}>
                  Cargar
                </button>
                <button type="button" onClick={() => void handleDelete(item.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}