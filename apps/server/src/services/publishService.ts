import {
  listingDraftSchema,
  type ListingDraft,
  type PortalKey,
} from "@multi-publisher/shared";
import { MilanunciosPublisher } from "../publishers/milanunciosPublisher";
import { validateImagePaths } from "./fileBrowserService";

export interface PublishResult {
  success: boolean;
  portals: PortalKey[];
  message: string;
}

export async function publishListing(input: unknown): Promise<PublishResult> {
  const parsed = listingDraftSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message ?? "Datos del formulario no válidos.");
  }

  const listing: ListingDraft = parsed.data;

  const validatedImages = await validateImagePaths(listing.images);

  const normalizedListing: ListingDraft = {
    ...listing,
    images: validatedImages,
  };

  for (const portal of normalizedListing.selectedPortals) {
    switch (portal) {
      case "milanuncios": {
        const publisher = new MilanunciosPublisher();
        await publisher.publish(normalizedListing);
        break;
      }

      case "wallapop": {
        throw new Error("Wallapop aún no está implementado.");
      }

      default: {
        throw new Error(`Portal no soportado: ${String(portal)}`);
      }
    }
  }

  return {
    success: true,
    portals: normalizedListing.selectedPortals,
    message: "Proceso de publicación lanzado correctamente.",
  };
}