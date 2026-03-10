import type { ListingDraft } from "@multi-publisher/shared";

export abstract class BasePublisher {
  abstract publish(listing: ListingDraft): Promise<void>;
}