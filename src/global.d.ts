/// <reference types="svelte" />

import type { SheetZips } from "./location-input/zipData/fetchZipCodes";
import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";
import type { StoredZipDataItem } from "./location-input/zipData/types";

declare global {
  interface Window {
    preorderZipCodes: SheetZips;
    addressState: {
      selectedAddress?: ParsedPlaceResult;
      zipConfig?: StoredZipDataItem;
    };
    newsletterState: {
      selectedAddress?: ParsedPlaceResult;
      zipConfig?: StoredZipDataItem;
    };
  }
}
