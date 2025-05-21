import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";

export interface OnAddressSubmitSuccess {
  (addressData: ParsedPlaceResult): void;
}
