import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";

export interface OnAddressSubmitSuccess {
  (addressData: ParsedPlaceResult, leadType?: string, zipConfig?: any): void;
}
