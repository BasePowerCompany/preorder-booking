import type { PreorderAppConfig } from "./Config.types";
import LocationInput from "./location-input/LocationInput.svelte";
import ZipCodeInput from "./location-input/ZipCodeInput.svelte";

export const PreorderApp = {
  initialize: (props: PreorderAppConfig) => {
    const {
      targetElAddressInput = document.getElementById("hero-address-entry"),
      googlePublicApiKey,
      onAddressSelect,
      onAddressSubmitSuccess,
      addressCtaText,
      querySelectorClickToOpenForm,
    } = props;

    const locationInput = new LocationInput({
      target: targetElAddressInput,
      props: {
        googlePublicApiKey,
        onAddressSelect,
        onAddressSubmitSuccess,
        addressCtaText: "See if my home qualifies",
        targetDisplayAddress: "#hero-address-entry",
      },
    });

    // Add click-to-open logic if selector is provided
    if (querySelectorClickToOpenForm && targetElAddressInput) {
      const triggerEls = document.querySelectorAll(
        querySelectorClickToOpenForm,
      );
      triggerEls.forEach((el) => {
        el.addEventListener("click", () => {
          // Scroll to the form
          targetElAddressInput.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Simulate a click on the input-address-container to trigger overlay/focus
          const container = targetElAddressInput.querySelector(
            ".input-address-container",
          );
          if (container) {
            container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }
          // Optionally, focus the input as well
          const input = targetElAddressInput.querySelector("input");
          if (input) {
            input.focus();
          }
        });
      });
    }

    return locationInput;
  },

  initializeZipCode: (props: PreorderAppConfig) => {
    const {
      targetElAddressInput = document.getElementById("zip-code-entry"),
      onAddressSubmitSuccess,
      addressCtaText,
      querySelectorClickToOpenForm,
    } = props;

    const zipCodeInput = new ZipCodeInput({
      target: targetElAddressInput,
      props: {
        onAddressSubmitSuccess,
        addressCtaText,
      },
    });

    // Add click-to-open logic if selector is provided
    if (querySelectorClickToOpenForm && targetElAddressInput) {
      const triggerEls = document.querySelectorAll(
        querySelectorClickToOpenForm,
      );
      triggerEls.forEach((el) => {
        el.addEventListener("click", () => {
          // Find the input inside the target element and focus it
          const input = targetElAddressInput.querySelector("input");
          if (input) {
            input.focus();
            // Optionally, add a 'focused' class to the container
            const container = targetElAddressInput.querySelector(
              ".input-zip-container",
            );
            if (container) {
              container.classList.add("focused");
            }
          }
        });
      });
    }

    return zipCodeInput;
  },
};
