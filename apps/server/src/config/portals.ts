import type { PortalKey } from "@multi-publisher/shared";

export interface PortalConfig {
  key: PortalKey;
  label: string;
  homeUrl: string;
  publishUrl?: string;
}

export const portalConfigs: Record<PortalKey, PortalConfig> = {
  milanuncios: {
    key: "milanuncios",
    label: "Milanuncios",
    homeUrl: "https://www.milanuncios.com/",
    publishUrl: "https://www.milanuncios.com/",
  },
  wallapop: {
    key: "wallapop",
    label: "Wallapop",
    homeUrl: "https://es.wallapop.com/",
  },
};