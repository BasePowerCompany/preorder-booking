<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { OnAddressSubmitSuccess } from "../types";
  import { displayBlock, displayNone, fadeIn } from "../visibilityUtils";
  import { addressState } from "../windowVars";

  export let addressCtaText: string = "See if I qualify";
  export let onAddressSubmitSuccess: OnAddressSubmitSuccess = () => {};

  let inputContainer: HTMLElement;
  let focusOverlay: HTMLElement;
  let input: HTMLInputElement;

  const handleContainerClick = () => {
    if (zipCode.length !== 5) {  // Only show overlay if not complete
      focusOverlay.style.display = "block";
      inputContainer.classList.add("focused");
    }
    input?.focus();
  };

  const handleOverlayClick = () => {
    focusOverlay.style.display = "none";
    inputContainer.classList.remove("focused");
  };

  onMount(() => {
    if (inputContainer && focusOverlay) {
      inputContainer.addEventListener("click", handleContainerClick);
      focusOverlay.addEventListener("click", handleOverlayClick);
    }
  });

  onDestroy(() => {
    if (inputContainer && focusOverlay) {
      inputContainer.removeEventListener("click", handleContainerClick);
      focusOverlay.removeEventListener("click", handleOverlayClick);
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
      stateShort: "",
      stateLong: "",
      countryCode: "US",
      countryLong: "United States",
      postalCode: zipCode
    };

    // Always update state and call success handler
    addressState.update({
      selectedAddress: minimalAddress
    });

    onAddressSubmitSuccess?.(minimalAddress);
  };
</script>

<div class="input-zip-wrap">
  <div class="input-zip-container" bind:this={inputContainer}>
    <div class="zip-input-layout">
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        class="zip-search-input"
        maxlength="5"
        bind:this={input}
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
      {isComplete ? addressCtaText : "Enter your zip code"}
    </button>
  </div>
</div>
<div class="focus_overlay" bind:this={focusOverlay}></div>

<style lang="scss" global>
  .input-zip-wrap {
    max-width: 460px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;

    @media screen and (max-width: 768px) {
      max-width: 100%;
      padding: 0 16px;
    }
  }

  .input-zip-container {
    background: #fff;
    border-radius: var(--Radius-radius-l, 8px);
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
      margin: 0;
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
    border-radius: var(--Radius-radius-m, 8px);
    font-size: 16px;
    font-weight: 600;
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
      width: calc(100% - 32px);
      left: 16px;
      top: calc(100% + 12px);
      margin: 0;
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
    border-radius: var(--Radius-radius-s, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 500;
    color: #090D0F;
    transition: all 0.2s ease;
  }

  .zip-box.filled {
    background: #ECFFC7;
  }

  .zip-search-input {
    position: relative;
    height: 44px;
    width: 100%;
    border: none;
    background: transparent;
    font-size: 20px;
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
    font-size: 16px;
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