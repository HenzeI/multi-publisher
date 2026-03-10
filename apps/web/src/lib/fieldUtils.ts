import type { FieldDefinition, ListingDraft } from "@multi-publisher/shared";
import { fieldDefinitions, isFieldVisible } from "@multi-publisher/shared";

export function getVisibleFieldsByGroup(
  draft: ListingDraft,
  group: FieldDefinition["group"]
): FieldDefinition[] {
  return fieldDefinitions.filter(
    (field) => field.group === group && isFieldVisible(field, draft)
  );
}