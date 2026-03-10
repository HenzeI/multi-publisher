import type { FieldDefinition } from "./fields";
import type { ListingDraft } from "./listing";

export function isFieldVisible(field: FieldDefinition, draft: ListingDraft): boolean {
  if (field.portals && field.portals.length > 0) {
    const matchesPortal = field.portals.some((portal) =>
      draft.selectedPortals.includes(portal)
    );

    if (!matchesPortal) {
      return false;
    }
  }

  if (field.categories && field.categories.length > 0) {
    if (!draft.category || !field.categories.includes(draft.category)) {
      return false;
    }
  }

  if (field.dependsOn) {
    const currentValue = getValueByKey(draft, field.dependsOn.field);
    if (currentValue !== field.dependsOn.value) {
      return false;
    }
  }

  return true;
}

function getValueByKey(draft: ListingDraft, key: string): unknown {
  if (key in draft) {
    return (draft as unknown as Record<string, unknown>)[key];
  }

  if (key in draft.attributes) {
    return draft.attributes[key];
  }

  for (const portal of Object.keys(draft.portalSettings)) {
    const portalSettings = draft.portalSettings[portal as keyof typeof draft.portalSettings];
    if (portalSettings && key in portalSettings) {
      return portalSettings[key];
    }
  }

  return undefined;
}