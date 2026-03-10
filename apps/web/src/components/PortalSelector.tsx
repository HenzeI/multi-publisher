import type { PortalKey } from "@multi-publisher/shared";

const PORTALS: { key: PortalKey; label: string }[] = [
  { key: "milanuncios", label: "Milanuncios" },
  { key: "wallapop", label: "Wallapop" },
];

interface PortalSelectorProps {
  selectedPortals: PortalKey[];
  onToggle: (portal: PortalKey) => void;
}

export function PortalSelector({
  selectedPortals,
  onToggle,
}: PortalSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {PORTALS.map((portal) => {
        const checked = selectedPortals.includes(portal.key);

        return (
          <label
            key={portal.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "10px 12px",
              cursor: "pointer",
              background: checked ? "#eef6ff" : "#fff",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(portal.key)}
            />
            <span>{portal.label}</span>
          </label>
        );
      })}
    </div>
  );
}