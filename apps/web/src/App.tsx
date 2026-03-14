import { useMemo, useState } from "react";
import { publishListing } from "./lib/api";
import { getVisibleFieldsByGroup } from "./lib/fieldUtils";
import { validateListingDraftForPublish, type ValidationErrorMap, } from "./lib/validation";
import { enrichFieldWithCategoryOptions } from "./lib/categoryFieldUtils";
import { useListingDraft } from "./hooks/useListingDraft";
import { Section } from "./components/Section";
import { PortalSelector } from "./components/PortalSelector";
import { FieldRenderer } from "./components/FieldRenderer";
import { DraftManager } from "./components/DraftManager";
import { getPortalCategoryPath } from "@multi-publisher/shared";

export default function App() {
  const { draft, updateField, togglePortal, resetDraft, loadDraft } = useListingDraft();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrorMap>({});

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

    const clientErrors = validateListingDraftForPublish(draft);
    setFieldErrors(clientErrors);

    if (Object.keys(clientErrors).length > 0) {
      setError("Revisa los campos obligatorios antes de publicar.");
      setMessage("");
      return;
    }

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

      <Section
        title="Borradores"
        description="Guarda, recarga y reutiliza anuncios en desarrollo."
      >
        <DraftManager
          draft={draft}
          onLoadDraft={(nextDraft) => {
            loadDraft(nextDraft);
            setFieldErrors({});
            setError("");
            setMessage("");
          }}
        />
      </Section>

      <form onSubmit={handleSubmit}>
        <Section
          title="Portales"
          description="Selecciona uno o varios portales destino."
        >
          <PortalSelector
            selectedPortals={draft.selectedPortals}
            onToggle={togglePortal}
          />
          {fieldErrors.selectedPortals ? (
            <div style={{ marginTop: 8, color: "crimson", fontWeight: 600 }}>
              {fieldErrors.selectedPortals}
            </div>
          ) : null}
        </Section>

        <Section title="Datos generales">
          {generalFields.map((field) => {
            const enrichedField = enrichFieldWithCategoryOptions(field, draft);

            return (
              <FieldRenderer
                key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
                field={enrichedField}
                draft={draft}
                onChange={updateField}
                error={fieldErrors[field.key]}
              />
            );
          })}
        </Section>

        <Section title="Detalles del producto">
          {detailFields.map((field) => (
            <FieldRenderer
              key={`${field.section}-${field.key}-${field.portal ?? "common"}`}
              field={field}
              draft={draft}
              onChange={updateField}
              error={fieldErrors[field.key]}
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
              error={fieldErrors[field.key]}
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
                error={
                  field.portal
                    ? fieldErrors[`portalSettings.${field.portal}.${field.key}`]
                    : undefined
                }
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
                error={
                  field.portal
                    ? fieldErrors[`portalSettings.${field.portal}.${field.key}`]
                    : undefined
                }
              />
            ))}
          </Section>
        ) : null}

        <Section title="Mapeo de categorías por portal">
          <div style={{ display: "grid", gap: 10 }}>
            {draft.selectedPortals.length === 0 ? (
              <div style={{ color: "#666" }}>No hay portales seleccionados.</div>
            ) : (
              draft.selectedPortals.map((portal) => {
                const path = getPortalCategoryPath(
                  portal,
                  draft.category,
                  draft.subcategory
                );

                return (
                  <div
                    key={portal}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <strong>{portal}</strong>
                    <div style={{ marginTop: 6 }}>
                      {path ? path.join(" > ") : "No hay mapeo definido todavía."}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        <Section title="Acciones">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" disabled={submitting}>
              {submitting ? "Publicando..." : "Publicar"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetDraft();
                setFieldErrors({});
                setError("");
                setMessage("");
              }}
              disabled={submitting}
            >
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