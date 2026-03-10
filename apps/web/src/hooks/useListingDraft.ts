import { useMemo, useState } from "react";
import type { FieldDefinition, ListingDraft, PortalKey } from "@multi-publisher/shared";
import {
  createEmptyListingDraft,
  setDraftValue,
} from "@multi-publisher/shared";

export function useListingDraft() {
  const [draft, setDraft] = useState<ListingDraft>(createEmptyListingDraft());

  const updateField = (field: FieldDefinition, value: unknown) => {
    setDraft((current) => setDraftValue(current, field, value));
  };

  const setImages = (images: string[]) => {
    setDraft((current) => ({
      ...current,
      images,
    }));
  };

  const togglePortal = (portal: PortalKey) => {
    setDraft((current) => {
      const exists = current.selectedPortals.includes(portal);

      return {
        ...current,
        selectedPortals: exists
          ? current.selectedPortals.filter((item) => item !== portal)
          : [...current.selectedPortals, portal],
      };
    });
  };

  const resetDraft = () => {
    setDraft(createEmptyListingDraft());
  };

  return useMemo(
    () => ({
      draft,
      setDraft,
      updateField,
      setImages,
      togglePortal,
      resetDraft,
    }),
    [draft]
  );
}