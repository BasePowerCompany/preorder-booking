import type { OnAddressSubmitSuccess } from "./types";

export interface PreorderAppConfig {
  targetElAddressInput?: HTMLElement;
  googlePublicApiKey?: string;
  targetPanel?: string;
  targetAddressPanel?: string;
  targetAvailableState?: string;
  targetNotAvailableState?: string;
  targetStateContainer?: string;
  targetAvailableText?: string;
  targetDisplayAddress?: string;
  querySelectorClickToOpenForm?: string;
  addressCtaText?: string;
  onAddressSelect?: () => void;
  onAddressSubmitSuccess?: OnAddressSubmitSuccess;
  hidePanelEl?: boolean;
}
