import type { FieldDefinition, ListingDraft } from "@multi-publisher/shared";
import {
  getSubcategoriesByCategory,
  internalCategories,
} from "@multi-publisher/shared";

export function enrichFieldWithCategoryOptions(
  field: FieldDefinition,
  draft: ListingDraft
): FieldDefinition {
  if (field.key === "category") {
    return {
      ...field,
      options: internalCategories.map((category) => ({
        label: category.label,
        value: category.key,
      })),
    };
  }

  if (field.key === "subcategory") {
    return {
      ...field,
      options: getSubcategoriesByCategory(draft.category).map((subcategory) => ({
        label: subcategory.label,
        value: subcategory.key,
      })),
    };
  }

  return field;
}