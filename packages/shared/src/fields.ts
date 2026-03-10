import type { FieldGroup, FieldSection, FieldType, PortalKey } from "./listing";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDependency {
  field: string;
  value: unknown;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;

  section: FieldSection;
  group: FieldGroup;

  portal?: PortalKey;
  portals?: PortalKey[];
  categories?: string[];

  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];

  dependsOn?: FieldDependency;
}