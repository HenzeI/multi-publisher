import { useMemo, useState } from "react";
import { publishListing } from "./lib/api";
import { getVisibleFieldsByGroup } from "./lib/fieldUtils";
import { useListingDraft } from "./hooks/useListingDraft";
import { Section } from "./components/Section";
import { PortalSelector } from "./components/PortalSelector";
import { FieldRenderer } from "./components/FieldRenderer";

export default function App() {
  const { draft, updateField, togglePortal, resetDraft } = useListingDraft();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const generalFields = useMemo(
    () => getVisibleFieldsByGroup(draft, "general"),
    [draft]
  );

  const detailFields = useMemo(
    () => getVisibleFieldsByGroup(draft, "details"),
    [draft]
  );

  const imageFields = useMemo(
    () => getVisibleFieldsByGroup(draft, "images"),
    [draft]
  );

  const shippingFields = useMemo(
    () => getVisibleFieldsByGroup(draft, "shipping"),
    [draft]
  );

  const portalFields = useMemo(
    () => getVisibleFieldsByGroup(draft, "portal"),
    [draft]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const result = await publishListing(draft);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Multi Publisher</h1>
        <p style={{ color: "#555", margin: 0 }}>
          Formulario maestro para publicar anuncios en varios portales.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <Section
          title="Portales"
          description="Selecciona uno o varios portales destino."
        >
          <PortalSelector
            selectedPortals={draft.selectedPortals}
            onToggle={togglePortal}
          />
        </Section>

        <Section title="Datos generales">
          {generalFields.map((field) => (
            <FieldRenderer
              key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
              field={field}
              draft={draft}
              onChange={updateField}
            />
          ))}
        </Section>

        <Section title="Detalles del producto">
          {detailFields.map((field) => (
            <FieldRenderer
              key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
              field={field}
              draft={draft}
              onChange={updateField}
            />
          ))}
        </Section>

        <Section title="Imágenes">
          {imageFields.map((field) => (
            <FieldRenderer
              key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
              field={field}
              draft={draft}
              onChange={updateField}
            />
          ))}
        </Section>

        {shippingFields.length > 0 ? (
          <Section title="Opciones de envío">
            {shippingFields.map((field) => (
              <FieldRenderer
                key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
                field={field}
                draft={draft}
                onChange={updateField}
              />
            ))}
          </Section>
        ) : null}

        {portalFields.length > 0 ? (
          <Section title="Configuración por portal">
            {portalFields.map((field) => (
              <FieldRenderer
                key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
                field={field}
                draft={draft}
                onChange={updateField}
              />
            ))}
          </Section>
        ) : null}

        <Section title="Acciones">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={submitting}>
              {submitting ? "Publicando..." : "Publicar"}
            </button>

            <button type="button" onClick={resetDraft} disabled={submitting}>
              Limpiar formulario
            </button>
          </div>

          {message ? (
            <div style={{ marginTop: 12, color: "green", fontWeight: 600 }}>
              {message}
            </div>
          ) : null}

          {error ? (
            <div style={{ marginTop: 12, color: "crimson", fontWeight: 600 }}>
              {error}
            </div>
          ) : null}
        </Section>

        <Section title="Vista previa interna del borrador">
          <pre
            style={{
              margin: 0,
              background: "#f6f6f6",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(draft, null, 2)}
          </pre>
        </Section>
      </form>
    </main>
  );
}