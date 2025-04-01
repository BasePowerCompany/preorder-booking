<script lang="ts">
  import GooglePlaceAutocomplete from "./googlePlace/GooglePlaceAutocomplete.svelte";
  import { ParsedPlaceResult, parsePlaceResult } from "./googlePlace/utils";
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
    const input = document.querySelector('input.location-search-input');
    const container = document.querySelector('.input-address-container');
    
    input.addEventListener('focus', () => {
      jQuery(".focus_overlay").show();
      container.classList.add("focused");
      input.placeholder = "Enter your home address";
      jQuery("button.submitAddressButton").hide();
    });

    input.addEventListener('blur', () => {
      if (!document.querySelector('.pac-container')?.contains(document.activeElement)) {
        jQuery(".focus_overlay").hide();
        jQuery(".submitAddressButton").show();
        container.classList.remove("focused");
      }
    });

    jQuery(".focus_overlay").on("click", function () {
      input.blur();
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

  // Update placeholder text
  const defaultPlaceholder = "Enter your home address";
</script>

<div class="component-wrapper">
  <div class="input-address-wrap">
    <div class="input-address-container">
      <img
        src="https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg"
        alt="Map pin icon"
        class="location-pin"
      />
      <GooglePlaceAutocomplete
        class="location-search-input"
        apiKey={googlePublicApiKey}
        placeholder={defaultPlaceholder}
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
  </div>
</div>

<div class="focus_overlay"></div>

<svelte:head>
  <script
    charset="utf-8"
    type="text/javascript"
    src="//js-eu1.hsforms.net/forms/embed/v2.js"
  ></script>
</svelte:head>

<style lang="scss">
  .component-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 12px;
    }
  }

  .input-address-wrap {
    position: relative;
    z-index: 551;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 8px;
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;

    @media screen and (max-width: 768px) {
      height: auto;
      padding: 4px;
      flex-direction: column;
      gap: 12px;
      background: none;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: none;
    }
  }

  .input-address-container {
    display: flex;
    padding: 0 16px;
    align-items: center;
    height: 56px;
    border-radius: 12px;
    position: relative;
    z-index: 552;
    background: transparent !important;
    flex: 1;
    
    &.focused {
      outline: none;
      border: none;
    }
    
    .location-pin {
      width: 20px;
      height: 20px;
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 1;
      z-index: 552;
      pointer-events: none;
      filter: brightness(0) invert(1);
    }

    @media screen and (max-width: 768px) {
      width: 100%;
      height: 48px;
      padding: 0 12px;
      background: rgba(255, 255, 255, 0.25) !important;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  .location-search-input {
    position: relative;
    height: 44px;
    width: 100%;
    border: none;
    background: transparent !important;
    border-radius: 12px;
    padding: 3px 16px 3px 48px;
    font-size: 18px;
    line-height: 24px;
    color: #FFF !important;
    font-family: PP Neue Montreal Variable, Arial, sans-serif;
    -webkit-appearance: none !important;
    appearance: none !important;
    mix-blend-mode: normal !important;
    isolation: isolate !important;
    
    &::placeholder {
      color: #FFF !important;
      opacity: 1 !important;
      padding-left: 24px;
      mix-blend-mode: normal !important;
      isolation: isolate !important;
    }

    // Force white text in all states
    &, &:focus, &:hover, &:active, &::placeholder {
      color: #FFF !important;
    }
  }

  :global(.pac-container) {
    z-index: 553 !important;
    position: relative;
    margin-top: 8px !important;
    background: rgba(255, 255, 255, 0.15) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: none;
    padding: 8px 4px;
  }

  :global(.pac-item) {
    z-index: 554 !important;
    position: relative;
    background: transparent !important;
    padding: 8px 16px;
    border: none;
    color: #FFF !important;
    font-family: PP Neue Montreal Variable, Arial, sans-serif;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25) !important;
    }
  }

  :global(.pac-item-query) {
    color: #FFF !important;
    font-family: PP Neue Montreal Variable, Arial, sans-serif;
  }

  :global(.pac-matched),
  :global(.pac-item span) {
    color: #FFF !important;
    opacity: 1;
  }

  .submitAddressButton {
    height: 48px;
    min-width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background: #D0F585;
    color: #084D41;
    font-size: 16px;
    font-weight: 500;
    padding: 0 24px;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
    margin-left: 8px;

    @media screen and (max-width: 768px) {
      width: 100%;
      margin-left: 0;
    }

    &:hover {
      opacity: 0.9;
    }

    &.hide {
      display: none;
    }
  }

  .preorder-address-error-message {
    color: #c95151;
    font-size: 14px;
    margin-top: 6px;
    font-family: PP Neue Montreal Variable, Arial, sans-serif;
  }

  .focus_overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(40, 51, 52, 0.5);
    z-index: 50;
    display: none;
    
    &.show {
      display: block;
    }
  }

  :global(input.location-search-input) {
    padding-left: 24px !important;
    text-indent: 4px !important;
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
    color: #FFF !important;
    mix-blend-mode: normal !important;
    isolation: isolate !important;
    
    &::placeholder {
      color: #FFF !important;
      opacity: 1 !important;
      mix-blend-mode: normal !important;
      isolation: isolate !important;
    }

    &:focus {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
      color: #FFF !important;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px transparent inset !important;
      box-shadow: 0 0 0 30px transparent inset !important;
      border: none !important;
      -webkit-text-fill-color: #FFF !important;
      caret-color: #FFF !important;
    }
  }

  :global(.pac-item),
  :global(.pac-item-query) {
    color: #FFF !important;
  }
</style>
