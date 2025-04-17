<script lang="ts">
  import { setHiddenHubspotInputs } from "./hubspot/hsFormUtils";
  import { displayBlock, displayNone, fadeIn } from "../visibilityUtils";
  import { onMount } from "svelte";
  import { getZipStore } from "./zipData/zipStore";
  import type { SheetDataConfig, StoredZipDataItem } from "./zipData/types";
  import type { OnAddressSubmitSuccess } from "../types";
  import { hsFormStateBooking } from "../windowVars";

  export let targetAvailableText: string;
  export let targetDisplayAddress: string;
  export let googleSheetConfig: SheetDataConfig;
  export let addressCtaText: string = "Get started";

  const { store: zipStore, load: loadZips } = getZipStore(googleSheetConfig);

  onMount(async () => {
    loadZips();
    // Add focus overlay functionality
    const inputContainer = document.querySelector(".input-zip-container") as HTMLElement;
    const focusOverlay = document.querySelector(".focus_overlay") as HTMLElement;

    if (inputContainer && focusOverlay) {
      inputContainer.addEventListener("click", () => {
        focusOverlay.style.display = "block";
        inputContainer.classList.add("focused");
      });

      focusOverlay.addEventListener("click", () => {
        focusOverlay.style.display = "none";
        inputContainer.classList.remove("focused");
      });
    }
  });

  export let panelEl: HTMLDivElement;
  export let stateContainerEl: HTMLDivElement;
  export let addressPanelEl: HTMLDivElement;
  export let targetAvailableStateEl: HTMLDivElement;
  export let targetNotAvailableStateEl: HTMLDivElement;
  export let onAddressSubmitSuccess: OnAddressSubmitSuccess = () => {};
  export let hidePanelEl: boolean = false;

  $: inputErrorMessage = "";
  let zipCode: string = "";

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    // Only allow numbers
    const value = input.value.replace(/\D/g, '');
    // Limit to 5 digits
    if (value.length > 5) {
      input.value = value.slice(0, 5);
    } else {
      input.value = value;
    }
    zipCode = input.value;
  };

  const handleSubmit = () => {
    if (!zipCode) {
      inputErrorMessage = "Please enter a zip code.";
      return;
    }

    if (zipCode.length !== 5) {
      inputErrorMessage = "Please enter a valid 5-digit zip code.";
      return;
    }

    if (!hidePanelEl) {
      fadeIn(panelEl);
    }
    displayBlock(stateContainerEl);
    displayNone(addressPanelEl);

    const foundZipItem: StoredZipDataItem | null =
      $zipStore.find((zipItem) => {
        return zipItem.zip === zipCode;
      }) || null;

    // Create a minimal address object for Hubspot
    const minimalAddress = {
      title: "",
      formattedAddress: zipCode,
      externalId: "",
      externalUrl: "",
      houseNumber: "",
      street: "",
      street_2: "",
      city: "",
      county: "",
      stateShort: foundZipItem?.stateShort || "",
      stateLong: "",
      countryCode: "US",
      countryLong: "United States",
      postalCode: zipCode
    };

    if (foundZipItem) {
      document.querySelector(targetAvailableText).innerHTML =
        foundZipItem.availability;

      displayBlock(targetAvailableStateEl);
      displayNone(targetNotAvailableStateEl);
      setHiddenHubspotInputs(
        window.hsFormPreorder,
        minimalAddress,
        foundZipItem,
      );
      hsFormStateBooking.update({
        selectedAddress: minimalAddress,
        zipConfig: foundZipItem,
      });
      onAddressSubmitSuccess?.(
        minimalAddress,
        "lead-preorder-form",
        foundZipItem,
      );
    } else {
      displayBlock(targetNotAvailableStateEl);
      displayNone(targetAvailableStateEl);
      setHiddenHubspotInputs(window.hsFormNewsletter, minimalAddress);
      hsFormStateBooking.update({
        selectedAddress: minimalAddress,
        zipConfig: null,
      });
      onAddressSubmitSuccess?.(
        minimalAddress,
        "lead-newsletter-form",
        null,
      );
    }
  };
</script>

<div class="input-zip-wrap">
  <div class="input-zip-container">
    <img
      src="https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg"
      alt="Map pin icon"
    />
    <input
      type="text"
      class="zip-search-input"
      placeholder="Enter your zip code"
      maxlength="5"
      on:input={handleInput}
      on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
    />
  </div>
  <button class="submitZipButton button secondary w-button" on:click={handleSubmit}>
    {addressCtaText}
  </button>
  {#if inputErrorMessage}
    <p class="preorder-zip-error-message">
      {inputErrorMessage}
    </p>
  {/if}
</div>
<div class="focus_overlay"></div>

<style lang="scss" global>
  .input-zip-container {
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
  .input-zip-container.focused {
    outline: 2px solid var(--Greyscale-20, #D8D7D5);
  }
  .input-zip-container.focused:before {
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
  .input-zip-container img {
    margin: 13px 0 9px 10px;
    position: absolute;
    left: 8px;
  }
  .submitZipButton {
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
    z-index: 552; /* Increased z-index to stay above overlay */
    background: #D0F585;
    color: #084D41;
    font-size: 16px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background: #ECFAD0;
    }
    
    @media screen and (max-width: 768px) {
      position: relative;
      width: 100%;
      margin-top: 10px;
      margin-left: 10px;
    }
  }

  .preorder-zip-error-message {
    color: #c95151;
    font-size: 14px;
    margin-top: 6px;
  }
  .zip-search-input {
    position: absolute;
    height: 44px;
    width: 100%;
    border: none;
    background: none;
    border-radius: 12px;
    border: none !important;
    outline: none !important;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    padding: 3px 16px 0 48px;
    &.focused {
      border-radius: 0 0 12px 12px;
    }
  }
  .zip-search-input::placeholder {
    color: #7F7D7A;
    font-size: 16px;
    font-weight: 500;
  }
  .zip-search-input.input:focus {
    box-shadow: none;
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