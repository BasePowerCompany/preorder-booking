import type { ParsedPlaceResult } from "./location-input/googlePlace/utils";
import type {
  SheetDataConfig,
  StoredZipDataItem,
} from "./location-input/zipData/types";
import type { OnAddressSubmitSuccess } from "./types";

export type HubspotFormConfig = {
  target: string;
  region: string;
  portalId: string;
  formId: string;
  onFormSubmit?: any;
  onFormSubmitted?: (
    form: HTMLFormElement,
    args: {
      submissionValues: Record<string, string> & {
        selectedAddress?: ParsedPlaceResult;
        zipConfig?: StoredZipDataItem;
      };
      redirectUrl: string | null;
    },
  ) => void;
};

export type PreorderAppConfig = {
  targetElAddressInput?: HTMLElement;
  targetElsAddressInput?: HTMLElement[];
  googlePublicApiKey?: string;
  targetPanel?: string;
  targetAddressPanel?: string;
  targetAvailableState?: string;
  targetNotAvailableState?: string;
  targetStateContainer?: string;
  targetAvailableText?: string;
  targetDisplayAddress?: string;
  querySelectorClickToOpenForm?: string;
  googleSheetConfig: SheetDataConfig;
  hsFormSuccess?: HubspotFormConfig;
  hsFormNewsletter?: HubspotFormConfig;
  onAddressSelect?: (data: ParsedPlaceResult) => void;
  onAddressSubmitSuccess?: OnAddressSubmitSuccess;
  hidePanelEl?: boolean;
  addressCtaText?: string;
};
export type SubmitFormDescription = { label: string; value: string }[];
