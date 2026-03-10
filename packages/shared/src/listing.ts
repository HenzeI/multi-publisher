export type PortalKey = "milanuncios" | "wallapop";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "multiselect"
  | "image-picker";

export type FieldGroup = "general" | "details" | "images" | "shipping" | "portal";

export type FieldSection = "root" | "attributes" | "portalSettings";

export type ConditionValue = "new" | "like_new" | "good" | "fair" | "used";

export interface ListingDraft {
  id?: string;

  title: string;
  description: string;
  price?: number;
  category?: string;
  subcategory?: string;
  condition?: ConditionValue;
  location?: string;
  images: string[];

  attributes: Record<string, unknown>;

  portalSettings: Partial<Record<PortalKey, Record<string, unknown>>>;

  selectedPortals: PortalKey[];
}

export const createEmptyListingDraft = (): ListingDraft => ({
  title: "",
  description: "",
  price: undefined,
  category: undefined,
  subcategory: "",
  condition: undefined,
  location: "",
  images: [],
  attributes: {},
  portalSettings: {},
  selectedPortals: [],
});