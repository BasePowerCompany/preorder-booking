import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";
import type { StoredZipDataItem } from "./location-input/zipData/types";

export type OnAddressSubmitSuccess = (
  data: ParsedPlaceResult,
  type: string,
  zipConfig: StoredZipDataItem | null
) => void;
