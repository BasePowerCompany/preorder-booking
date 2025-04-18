<script lang="ts">
  import { onMount } from "svelte";
  import { getZipStore } from "./zipData/zipStore";
  import type { SheetDataConfig, StoredZipDataItem } from "./zipData/types";
  import type { OnAddressSubmitSuccess } from "../types";

  export let googleSheetConfig: SheetDataConfig;
  export let addressCtaText: string = "Get started";
  export let onAddressSubmitSuccess: OnAddressSubmitSuccess = () => {};
  const { store: zipStore, load: loadZips } = getZipStore(googleSheetConfig);

  onMount(async () => {
    loadZips();
    const inputContainer = document.querySelector(".input-zip-container") as HTMLElement;
    const focusOverlay = document.querySelector(".focus_overlay") as HTMLElement;
    const input = document.querySelector(".zip-search-input") as HTMLInputElement;

    if (inputContainer && focusOverlay) {
      inputContainer.addEventListener("click", () => {
        if (zipCode.length !== 5) {  // Only show overlay if not complete
          focusOverlay.style.display = "block";
          inputContainer.classList.add("focused");
        }
        input?.focus();
      });

      focusOverlay.addEventListener("click", () => {
        focusOverlay.style.display = "none";
        inputContainer.classList.remove("focused");
      });
    }
  });

  $: inputErrorMessage = "";
  let zipCode: string = "";
  $: isComplete = zipCode.length === 5;

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

    console.log('Submitting zip code:', zipCode);

    const foundZipItem: StoredZipDataItem | null =
      $zipStore.find((zipItem) => {
        return zipItem.zip === zipCode;
      }) || null;

    console.log('Found zip config:', foundZipItem);

    // Create a minimal address object for consistency with LocationInput
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

    console.log('Calling onAddressSubmitSuccess with:', {
      address: minimalAddress,
      type: foundZipItem ? "lead-preorder-form" : "lead-newsletter-form",
      zipConfig: foundZipItem
    });

    // Let the parent handle routing based on availability
    onAddressSubmitSuccess?.(
      minimalAddress,
      foundZipItem ? "lead-preorder-form" : "lead-newsletter-form",
      foundZipItem
    );
  };
</script>

<div class="input-zip-wrap">
  <div class="zip-badge">Enter your zip code</div>
  <div class="input-zip-container">
    <div class="zip-input-layout">
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="zip-search-input"
        maxlength="5"
        on:input={handleInput}
        on:keydown={(e) => e.key === 'Enter' && isComplete && handleSubmit()}
      />
      <div class="zip-boxes">
        <div class="zip-box" class:filled={zipCode.length >= 1}>{zipCode[0] || ''}</div>
        <div class="zip-box" class:filled={zipCode.length >= 2}>{zipCode[1] || ''}</div>
        <div class="zip-box" class:filled={zipCode.length >= 3}>{zipCode[2] || ''}</div>
        <div class="zip-box" class:filled={zipCode.length >= 4}>{zipCode[3] || ''}</div>
        <div class="zip-box" class:filled={zipCode.length >= 5}>{zipCode[4] || ''}</div>
      </div>
    </div>
    <button 
      class="submitZipButton button secondary w-button" 
      on:click={handleSubmit}
      disabled={!isComplete}
    >
      {addressCtaText}
    </button>
  </div>
</div>
<div class="focus_overlay"></div>

<style lang="scss" global>
  .input-zip-wrap {
    max-width: 460px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
  }

  .zip-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 4px 12px;
    background: rgba(28, 40, 41, 0.5);
    border-radius: 4px;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }

  .input-zip-container {
    background: #fff;
    border-radius: 8px;
    position: relative;
    z-index: 551;
    padding: 8px;
    display: flex;
    align-items: center;
    height: 66px;
    gap: 12px;

    @media screen and (max-width: 768px) {
      padding: 8px;
      height: 64px;
    }
  }

  .zip-input-layout {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    flex: 1;

    @media screen and (max-width: 768px) {
      width: 100%;
      height: 48px;
      margin: 4px 0;
    }
  }

  .submitZipButton {
    height: 48px;
    padding: 0 20px;
    background: #D0F585;
    color: #084D41;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    min-width: 160px;
    
    &:hover:not(:disabled) {
      background: #ECFAD0;
    }

    &:disabled {
      background: #E6E6E6;
      color: #A3A3A3;
      cursor: not-allowed;
    }
    
    @media screen and (max-width: 768px) {
      position: absolute;
      width: 100%;
      left: 0;
      top: calc(100% + 12px);
      max-width: 400px;
      margin: 0 auto;
    }
  }

  .zip-boxes {
    position: absolute;
    display: flex;
    gap: 8px;
    pointer-events: none;
    width: 100%;
    justify-content: flex-start;
    padding-left: 12px;

    @media screen and (max-width: 768px) {
      justify-content: center;
      padding-left: 0;
    }
  }

  .zip-box {
    width: 48px;
    height: 40px;
    background: #EFF1F2;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 500;
    color: #090D0F;
    transition: all 0.2s ease;
  }

  .zip-box.filled {
    background: #D0F585;
  }

  .zip-search-input {
    position: relative;
    height: 44px;
    width: 100%;
    border: none;
    background: transparent;
    font-size: 18px;
    font-weight: 500;
    padding: 0;
    text-align: left;
    letter-spacing: 2.85em;
    padding-left: 0.75em;
    color: transparent;
    caret-color: #090D0F;

    @media screen and (max-width: 768px) {
      text-align: center;
      padding-left: 1.5em;
    }

    &:focus {
      outline: none;
    }
  }

  .preorder-zip-error-message {
    color: #c95151;
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
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

  .input-zip-container.focused {
    outline: 2px solid var(--Greyscale-20, #D8D7D5);
  }

  .input-zip-container.focused:before {
    content: " ";
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    border: 1px solid var(--Greyscale-90, #54524F);
  }
</style> 