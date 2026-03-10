import type { FieldDefinition } from "./fields";
import type { ListingDraft } from "./listing";

export function getDraftValue(draft: ListingDraft, field: FieldDefinition): unknown {
  if (field.section === "root") {
    return (draft as unknown as Record<string, unknown>)[field.key]
  }

  if (field.section === "attributes") {
    return draft.attributes[field.key];
  }

  if (field.section === "portalSettings" && field.portal) {
    return draft.portalSettings[field.portal]?.[field.key];
  }

  return undefined;
}

export function setDraftValue(
  draft: ListingDraft,
  field: FieldDefinition,
  value: unknown
): ListingDraft {
  const next: ListingDraft = {
    ...draft,
    attributes: { ...draft.attributes },
    portalSettings: { ...draft.portalSettings },
  };

  if (field.section === "root") {
    (next as unknown as Record<string, unknown>)[field.key] = value;
    return next;
  }

  if (field.section === "attributes") {
    next.attributes[field.key] = value;
    return next;
  }

  if (field.section === "portalSettings" && field.portal) {
    const portalData = {
      ...(next.portalSettings[field.portal] ?? {}),
    };

    portalData[field.key] = value;
    next.portalSettings[field.portal] = portalData;
    return next;
  }

  return next;
}