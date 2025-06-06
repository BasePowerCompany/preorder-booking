<script context="module" lang="ts">
  declare const jQuery: any; // Tell TypeScript that jQuery exists globally
</script>

<script lang="ts">
  import GooglePlaceAutocomplete from "./googlePlace/GooglePlaceAutocomplete.svelte";
  import type { ParsedPlaceResult } from "./googlePlace/utils";
  import { parsePlaceResult } from "./googlePlace/utils";
  import { displayBlock, displayNone, fadeIn } from "../visibilityUtils";
  import { onMount } from "svelte";
  import type { OnAddressSubmitSuccess } from "../types";
  import { addressState } from "../windowVars";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { fadeOut } from "../visibilityUtils";
  import { windowVars } from "../windowVars";

  export let targetDisplayAddress: string;
  export let googlePublicApiKey: string;
  export let addressCtaText: string = "See if my home qualifies";
  export let onAddressSelect: (data: ParsedPlaceResult) => void;
  export let onAddressSubmitSuccess: (data: ParsedPlaceResult) => void;

  const dispatch = createEventDispatcher();
  let addressInput: HTMLInputElement;
  let autocomplete: google.maps.places.Autocomplete;
  let isFocused = false;
  let isOverlayVisible = false;
  let isInputFocused = false;
  let isInputValid = false;
  let isSubmitting = false;
  let errorMessage = "";
  let selectedAddress: ParsedPlaceResult | null = null;

  function handleInputFocus() {
    isInputFocused = true;
    isOverlayVisible = true;
  }

  function handleInputBlur() {
    isInputFocused = false;
    setTimeout(() => {
      isOverlayVisible = false;
    }, 200);
  }

  function handleInputChange() {
    const value = addressInput.value.trim();
    isInputValid = value.length > 0;
    errorMessage = "";
  }

  function handleSubmit() {
    if (!selectedAddress) {
      errorMessage = "Please enter a full address.";
      return;
    }

    if (!selectedAddress.postalCode || !selectedAddress.houseNumber || !selectedAddress.street) {
      errorMessage = "Please enter a full address.";
      return;
    }

    const targetDisplayAddressEl = document.querySelector(targetDisplayAddress);
    if (targetDisplayAddressEl) {
      targetDisplayAddressEl.innerHTML = selectedAddress.formattedAddress;
    }

    addressState.update({ selectedAddress });
    onAddressSubmitSuccess?.(selectedAddress);
  }

  function handlePlaceSelect() {
    const place = autocomplete.getPlace();
    if (place) {
      selectedAddress = parsePlaceResult(place);
      onAddressSelect(selectedAddress);
      isInputValid = true;
      errorMessage = "";
    }
  }

  onMount(() => {
    jQuery(".input-address-container").on("click", function () {
      jQuery(".focus_overlay").show();
      jQuery(".input-address-container").addClass("focused");
      jQuery("input.location-search-input").attr(
        "placeholder",
        "Enter home address",
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

  $: inputErrorMessage = "";
  $: selectedAddress = null;
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
      placeholder="Enter home address"
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
        types: ["address"],
        fields: ["address_components", "formatted_address", "name", "place_id", "url"]
      }}
    />
  </div>
  <button class="submitAddressButton button secondary w-button" on:click={handleSubmit}>
    {addressCtaText}
  </button>
  {#if inputErrorMessage}
    <p class="preorder-address-error-message">
      {inputErrorMessage}
    </p>
  {/if}
</div>
<div class="focus_overlay"></div>

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
    border-radius: var(--Radius-radius-m, 8px);
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
    border-radius: var(--Radius-radius-m, 8px);
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
    font-size: 16px;
    font-weight: 600;
    
    @media screen and (max-width: 768px) {
      position: relative;
      width: 100%;
      margin-top: 10px;
      margin-left: 10px;
    }
  }

  .preorder-address-error-message {
    color: #c95151;
    font-size: 16px;
    margin-top: 6px;
  }
  .location-search-input {
    position: absolute;
    height: 44px;
    width: 100%;
    border: none;
    background: none;
    border-radius: var(--Radius-radius-m, 8px);
    border: none !important;
    outline: none !important;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    padding: 3px 16px 0 48px;
    &.focused {
      border-radius: 0 0 var(--Radius-radius-m, 8px) var(--Radius-radius-m, 8px);
    }
  }
  .location-search-input::placeholder {
    color: #7F7D7A;
    font-size: 16px;
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