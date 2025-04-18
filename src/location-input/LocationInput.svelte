<script lang="ts">
  import GooglePlaceAutocomplete from "./googlePlace/GooglePlaceAutocomplete.svelte";
  import type { ParsedPlaceResult } from "./googlePlace/utils";
  import { parsePlaceResult } from "./googlePlace/utils";
  import { setHiddenHubspotInputs } from "./hubspot/hsFormUtils";
  import { displayBlock, displayNone, fadeIn } from "../visibilityUtils";
  import { onMount } from "svelte";
  import { getZipStore } from "./zipData/zipStore";
  import type { SheetDataConfig, StoredZipDataItem } from "./zipData/types";
  import type { OnAddressSubmitSuccess } from "../types";
  import { hsFormStateBooking } from "../windowVars";

  export let targetAvailableText: string;
  export let targetDisplayAddress: string;

  export let googlePublicApiKey: string;
  export let googleSheetConfig: SheetDataConfig;
  export let addressCtaText: string = "Get started";

  const { store: zipStore, load: loadZips } = getZipStore(googleSheetConfig);

  onMount(async () => {
    loadZips();
    jQuery(".input-address-container").on("click", function () {
      jQuery(".focus_overlay").show();
      jQuery(".input-address-container").addClass("focused");
      jQuery("input.location-search-input").attr(
        "placeholder",
        "Enter your address",
      );
      jQuery("button.submitAddressButton").hide();
    });
    jQuery(".input-address-container").on("keydown", function () {
      jQuery("input.location-search-input").attr("placeholder", "");
    });
    jQuery(".focus_overlay").on("click", function () {
      jQuery(".focus_overlay").hide();
      jQuery(".submitAddressButton").show();
      jQuery(".input-address-container").removeClass("focused");
    });
  });

  export let panelEl: HTMLDivElement;
  export let stateContainerEl: HTMLDivElement;
  export let addressPanelEl: HTMLDivElement;
  export let targetAvailableStateEl: HTMLDivElement;
  export let targetNotAvailableStateEl: HTMLDivElement;
  export let onAddressSelect: (data: ParsedPlaceResult) => void | undefined;
  export let onAddressSubmitSuccess: OnAddressSubmitSuccess = () => {};
  export let hidePanelEl: boolean = false;

  $: inputErrorMessage = "";
  let selectedAddress: ParsedPlaceResult | undefined;
  $: selectedAddress = undefined;

  const handleSubmit = () => {
    if (!selectedAddress) {
      inputErrorMessage = "Please enter a full address.";
      return;
    }
    if (
      !selectedAddress.postalCode ||
      !selectedAddress.houseNumber ||
      !selectedAddress.street
    ) {
      inputErrorMessage = "Please enter a full address.";
      return;
    }

    if (!hidePanelEl) {
      fadeIn(panelEl);
    }
    displayBlock(stateContainerEl);
    displayNone(addressPanelEl);

    const targetDisplayAddressEl = document.querySelector(targetDisplayAddress);
    targetDisplayAddressEl.innerHTML = selectedAddress.formattedAddress;
    const foundZipItem: StoredZipDataItem | null =
      $zipStore.find((zipItem) => {
        return zipItem.zip === selectedAddress.postalCode;
      }) || null;

    if (foundZipItem) {
      document.querySelector(targetAvailableText).innerHTML =
        foundZipItem.availability;

      displayBlock(targetAvailableStateEl);
      displayNone(targetNotAvailableStateEl);
      setHiddenHubspotInputs(
        window.hsFormPreorder,
        selectedAddress,
        foundZipItem,
      );
      hsFormStateBooking.update({
        selectedAddress,
        zipConfig: foundZipItem,
      });
      onAddressSubmitSuccess?.(
        selectedAddress,
        "lead-preorder-form",
        foundZipItem,
      );
    } else {
      displayBlock(targetNotAvailableStateEl);
      displayNone(targetAvailableStateEl);
      setHiddenHubspotInputs(window.hsFormNewsletter, selectedAddress);
      hsFormStateBooking.update({
        selectedAddress,
        zipConfig: null,
      });
      onAddressSubmitSuccess?.(
        selectedAddress,
        "lead-newsletter-form",
        foundZipItem,
      );
    }
  };
</script>

<div class="input-address-wrap">
  <div class="input-address-container">
    <img
      src="https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg"
      alt="Map pin icon"
    />
    <GooglePlaceAutocomplete
      class="location-search-input"
      apiKey={googlePublicApiKey}
      placeholder="See if your home qualifies"
      onSelect={(value) => {
        const parsed = parsePlaceResult(value);
        onAddressSelect?.(parsed);
        window.blur();
        inputErrorMessage = "";

        selectedAddress = parsed;
        handleSubmit();
      }}
      options={{
        componentRestrictions: { country: "us" },
      }}
    />
  </div>
  <button class="submitAddressButton button secondary w-button">
    {addressCtaText}
  </button>
  {#if inputErrorMessage}
    <p class="preorder-address-error-message">
      {inputErrorMessage}
    </p>
  {/if}
</div>
<div class="focus_overlay"></div>

<svelte:head>
  <script
    charset="utf-8"
    src="//js-eu1.hsforms.net/forms/embed/v2.js"
  ></script>
</svelte:head>

<style lang="scss" global>
  .input-address-container {
    display: flex;
    padding: var(--Spacing-spacing-m, 8px);
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: var(--Spacing-spacing-m, 8px);
    align-self: stretch;
    height: 66px;
    background: #fff;
    border-radius: var(--Radius-radius-l, 8px);
    position: relative;
    z-index: 551;
    @media screen and (max-width: 768px) {
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      height: 48px;
      padding-top: 0px;
    }
  }
  .input-address-container.focused {
    /* Focus styles */
    outline: 2px solid var(--Greyscale-20, #D8D7D5);
  }
  .input-address-container.focused:before {
    content: " ";
    position: absolute;
    z-index: -1;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    border-radius: 12px;
    border: 1px solid var(--Greyscale-90, #54524F);
  }
  .input-address-container img {
    margin: 13px 0 9px 10px;
    position: absolute;
    left: 8px;
  }
  .submitAddressButton {
    display: flex;
    flex-shrink: 0;
    height: 48px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--Spacing-spacing-m, 8px);
    border-radius: var(--Radius-radius-m, 8px);
    position: absolute;
    right: 9px;
    margin-top: -56px;
    z-index: 551;
    padding: 0 20px;
    
    /* label/label2 */
    font-size: 14px;
    font-weight: 500;
    
    @media screen and (max-width: 768px) {
      position: relative;
      width: 100%;
      margin-top: 10px;
      margin-left: 10px;
    }
  }

  .preorder-address-error-message {
    color: #c95151;
    font-size: 14px;
    margin-top: 6px;
  }
  .location-search-input {
    position: absolute;
    height: 44px;
    width: 100%;
    border: none;
    background: none;
    border-radius: 12px;
    border: none !important;
    outline: none !important;
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    padding: 3px 16px 0 48px;
    &.focused {
      border-radius: 0 0 12px 12px;
    }
  }
  .location-search-input::placeholder {
    color: #7F7D7A;
    font-size: 14px;
    font-weight: 500;
  }
  .location-search-input.input:focus {
    box-shadow: none;
  }

  .hs-form__virality-link {
    display: none !important;
  }

  #popup-form {
    transition: 0.2s all;
  }

  .signup_wrapper {
    margin-bottom: 18px;
    @media screen and (max-width: 768px) {
      margin-bottom: 48px;
    }
  }

  .signup_wrapper .paragraph.text-color-white.beta_text {
    display: inline;
    position: absolute;
    left: 0;
    gap: var(--Spacing-spacing-m, 8px);
    border-radius: 4px;
    background: rgba(28, 40, 41, 0.5);
    color: var(--Primitives-White, #fff);
    padding: var(--Spacing-spacing-xs, 2px) var(--Spacing-spacing-m, 8px);
    margin-top: 6px;

    /* body/body2 */
    font-size: 14px;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
  }

  .button.secondary {
    color: #084D41;
    background: #D0F585;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
    @media screen and (max-width: 768px) {
      left: 0;
    }
  }
  .button.secondary:hover {
    background: #ECFAD0;
  }

  .focus_overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(41, 40, 38, 0.8);
    z-index: 50;
    display: none;
  }
</style>