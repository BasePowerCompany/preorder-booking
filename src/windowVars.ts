// exchanging data with initialized HS form is hard, creating some window vars here

import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";
import type { StoredZipDataItem } from "./location-input/zipData/types";

const createWindowState = (key: string) => ({
  update: (data: {
    zipConfig?: StoredZipDataItem;
    selectedAddress?: ParsedPlaceResult;
  }) => {
    try {
      window[key] = {
        ...window[key],
        ...data,
      };
    } catch (e) {}
  },
  get: () => {
    try {
      return window[key];
    } catch {
      return {};
    }
  },
});

export const addressState = createWindowState("addressState");
export const newsletterState = createWindowState("newsletterState");
