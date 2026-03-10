import {
  listingDraftPublishSchema,
  listingDraftSaveSchema,
  type ListingDraft,
} from "@multi-publisher/shared";

export interface ValidationErrorMap {
  [key: string]: string;
}

function mapIssues(
  issues: Array<{ path: (string | number | symbol)[]; message: string }>
): ValidationErrorMap {
  const errors: ValidationErrorMap = {};

  for (const issue of issues) {
    const key = issue.path.filter((p) => typeof p !== "symbol").join(".") || "form";

    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function validateListingDraftForSave(
  draft: ListingDraft
): ValidationErrorMap {
  const parsed = listingDraftSaveSchema.safeParse(draft);

  if (parsed.success) {
    return {};
  }

  return mapIssues(parsed.error.issues);
}

export function validateListingDraftForPublish(
  draft: ListingDraft
): ValidationErrorMap {
  const parsed = listingDraftPublishSchema.safeParse(draft);

  if (parsed.success) {
    return {};
  }

  return mapIssues(parsed.error.issues);
}