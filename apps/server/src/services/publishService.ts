import {
  listingDraftPublishSchema,
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

function getPublisherForPortal(portal: PortalKey) {
  switch (portal) {
    case "milanuncios":
      return new MilanunciosPublisher();

    case "wallapop":
      throw new Error("Wallapop aún no está implementado.");
  }
}

export async function publishListing(input: unknown): Promise<PublishResult> {
  const parsed = listingDraftPublishSchema.safeParse(input);

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
    const publisher = getPublisherForPortal(portal);
    await publisher.publish(normalizedListing);
  }

  return {
    success: true,
    portals: normalizedListing.selectedPortals,
    message: "Proceso de publicación lanzado correctamente.",
  };
}