import { listingDraftSchema, type ListingDraft } from "@multi-publisher/shared";

export interface ValidationErrorMap {
  [key: string]: string;
}

export function validateListingDraft(draft: ListingDraft): ValidationErrorMap {
  const parsed = listingDraftSchema.safeParse(draft);

  if (parsed.success) {
    return {};
  }

  const errors: ValidationErrorMap = {};

  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "form";

    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}