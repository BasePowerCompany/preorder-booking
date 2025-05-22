import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";

export type OnAddressSubmitSuccess = (
  data: ParsedPlaceResult,
  leadType?: string,
  zipConfig?: {
    servingNow?: string;
    [key: string]: any;
  },
) => void;

export interface PreorderAppConfig {
  targetElAddressInput?: HTMLElement;
  googlePublicApiKey?: string;
  onAddressSelect?: (data: ParsedPlaceResult) => void;
  onAddressSubmitSuccess?: OnAddressSubmitSuccess;
  addressCtaText?: string;
  googleSheetConfig?: {
    zipsCsvUrl: string;
  };
  querySelectorClickToOpenForm?: string;
}
