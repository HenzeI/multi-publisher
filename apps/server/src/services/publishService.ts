import type { ListingDraft, PortalKey } from "@multi-publisher/shared";
import { MilanunciosPublisher } from "../publishers/milanunciosPublisher";
import { validateImagePaths } from "./fileBrowserService";

export interface PublishResult {
  success: boolean;
  portals: PortalKey[];
  message: string;
}

function validateListingDraft(listing: ListingDraft): void {
  if (!listing.title.trim()) {
    throw new Error("El título es obligatorio.");
  }

  if (!listing.description.trim()) {
    throw new Error("La descripción es obligatoria.");
  }

  if (listing.price == null || Number.isNaN(Number(listing.price))) {
    throw new Error("El precio es obligatorio.");
  }

  if (!listing.category?.trim()) {
    throw new Error("La categoría es obligatoria.");
  }

  if (!listing.condition) {
    throw new Error("El estado es obligatorio.");
  }

  if (!listing.location?.trim()) {
    throw new Error("La ubicación es obligatoria.");
  }

  if (!listing.images.length) {
    throw new Error("Debes seleccionar al menos una imagen.");
  }

  if (!listing.selectedPortals.length) {
    throw new Error("Debes seleccionar al menos un portal.");
  }
}

export async function publishListing(
  listing: ListingDraft
): Promise<PublishResult> {
  validateListingDraft(listing);

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
        throw new Error(`Portal no soportado: ${portal satisfies never}`);
      }
    }
  }

  return {
    success: true,
    portals: normalizedListing.selectedPortals,
    message: "Proceso de publicación lanzado correctamente.",
  };
}