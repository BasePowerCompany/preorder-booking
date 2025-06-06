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
  let isInputFocused = false;

  const handleContainerClick = () => {
    inputContainer.classList.add("focused");
    input?.focus();
    if (input) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  };

  onMount(() => {
    if (inputContainer && focusOverlay && input) {
      inputContainer.addEventListener("click", handleContainerClick);
      input.addEventListener("focus", () => {
        focusOverlay.style.display = "block";
        inputContainer.classList.add("focused");
        isInputFocused = true;
      });
      input.addEventListener("blur", () => {
        focusOverlay.style.display = "none";
        inputContainer.classList.remove("focused");
        isInputFocused = false;
      });
    }
  });

  onDestroy(() => {
    if (inputContainer && focusOverlay && input) {
      inputContainer.removeEventListener("click", handleContainerClick);
      input.removeEventListener("focus", () => {});
      input.removeEventListener("blur", () => {});
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
      formattedAddress: "",
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
    
    if (typeof onAddressSubmitSuccess === 'function') {
      onAddressSubmitSuccess(minimalAddress);
    } else {
      console.error("onAddressSubmitSuccess is not a function:", onAddressSubmitSuccess);
    }
  };
</script>

<div class="input-zip-wrap">
  <div class="input-zip-container" bind:this={inputContainer}>
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      class="zip-search-input"
      maxlength="5"
      bind:this={input}
      on:input={handleInput}
      on:keydown={(e) => {
        if (e.key === 'Enter' && isComplete) {
          handleSubmit();
        }
      }}
    />
    <div class="zip-boxes">
      <div class="zip-box" class:filled={zipCode.length >= 1} class:blinking-cursor={isInputFocused && zipCode.length === 0}>{zipCode[0] || ''}</div>
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
<div class="focus_overlay" bind:this={focusOverlay}></div>

<style lang="scss" global>
  .input-zip-wrap {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0;
    position: relative;
    @media screen and (max-width: 768px) {
      width: 100%;
      max-width: 100%;
      padding: 0;
      margin-left: 0;
      flex-direction: column;
      align-items: stretch;
    }
  }
  .input-zip-container {
    width: 100%;
    background: #fff;
    border-radius: var(--Radius-radius-l, 8px);
    position: relative;
    z-index: 551;
    padding: 8px 8px 8px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    height: 66px;
    @media screen and (max-width: 768px) {
      width: 100%;
      flex-direction: column;
      align-items: center;
      margin-bottom: 0;
      border-radius: var(--Radius-radius-l, 8px);
      padding: 8px;
      height: unset;
    }
  }
  .zip-search-input {
    height: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
  }
  .zip-boxes {
    display: flex;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 0;
    position: static;
    pointer-events: none;
    padding-left: 0;
    padding-right: 0;
    @media screen and (max-width: 768px) {
      justify-content: center;
    }
  }
  .zip-box {
    width: 48px;
    height: 40px;
    background: #F0EEEB;
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
  .submitZipButton {
    height: 48px;
    padding: 0 24px;
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
    text-align: center;
    width: auto;
    position: absolute;
    right: 8px;
    margin-top: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 552;
    @media screen and (max-width: 768px) {
      position: static;
      width: 100%;
      margin-top: 10px;
      align-self: stretch;
      border-radius: var(--Radius-radius-m, 8px);
      z-index: 551;
      right: unset;
      top: unset;
      transform: none;
    }
    &:hover:not(:disabled) {
      background: #ECFAD0;
    }
    &:disabled {
      background: #E6E6E6;
      color: #A3A3A3;
      cursor: not-allowed;
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
    pointer-events: none;
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
  .blinking-cursor {
    position: relative;
  }
  .blinking-cursor:after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 25%;
    width: 2px;
    height: 50%;
    background: #292826;
    transform: translateX(-50%);
    animation: blink-caret 1s steps(1) infinite;
  }
  @keyframes blink-caret {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style> 