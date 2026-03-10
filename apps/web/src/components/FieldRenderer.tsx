import type React from "react";
import type { FieldDefinition, ListingDraft } from "@multi-publisher/shared";
import { getDraftValue } from "@multi-publisher/shared";
import { ImagePicker } from "./ImagePicker";

interface FieldRendererProps {
  field: FieldDefinition;
  draft: ListingDraft;
  onChange: (field: FieldDefinition, value: unknown) => void;
  error?: string;
}

export function FieldRenderer({
  field,
  draft,
  onChange,
  error,
}: FieldRendererProps) {
  const value = getDraftValue(draft, field);

  const commonStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${error ? "crimson" : "#ccc"}`,
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
      <label style={{ fontWeight: 600 }}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "text" ? (
        <input
          type="text"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field, e.target.value)}
          style={commonStyle}
        />
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field, e.target.value)}
          rows={5}
          style={{ ...commonStyle, resize: "vertical" }}
        />
      ) : null}

      {field.type === "number" ? (
        <input
          type="number"
          value={value == null ? "" : String(value)}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(field, e.target.value === "" ? undefined : Number(e.target.value))
          }
          style={commonStyle}
        />
      ) : null}

      {field.type === "select" ? (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(field, e.target.value || undefined)}
          style={commonStyle}
        >
          <option value="">Selecciona una opción</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "checkbox" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field, e.target.checked)}
          />
          <span>Activado</span>
        </label>
      ) : null}

      {field.type === "image-picker" ? (
        <ImagePicker
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={(images) => onChange(field, images)}
        />
      ) : null}

      {field.helpText ? (
        <small style={{ color: "#666" }}>{field.helpText}</small>
      ) : null}

      {error ? (
        <small style={{ color: "crimson", fontWeight: 600 }}>{error}</small>
      ) : null}
    </div>
  );
}