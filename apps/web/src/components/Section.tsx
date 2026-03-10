import type { PropsWithChildren } from "react";

interface SectionProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        background: "#fff",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        {description ? (
          <p style={{ margin: "6px 0 0", color: "#555" }}>{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}