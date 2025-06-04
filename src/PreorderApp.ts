import type { PreorderAppConfig } from "./Config.types";
import LocationInput from "./location-input/LocationInput.svelte";
import ZipCodeInput from "./location-input/ZipCodeInput.svelte";

// Track initialization state
let isZipCodeInitialized = false;
let currentZipCodeInstance: any = null;

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
    // Clean up previous instance if it exists
    if (currentZipCodeInstance) {
      currentZipCodeInstance.$destroy();
      currentZipCodeInstance = null;
    }

    const {
      targetElAddressInput = document.getElementById("zip-code-entry"),
      onAddressSubmitSuccess,
      addressCtaText,
      querySelectorClickToOpenForm,
    } = props;

    const zipCodeInput = new ZipCodeInput({
      target: targetElAddressInput,
      props: {
        onAddressSubmitSuccess: async (addressData) => {
          try {
            const isLocal = window.location.hostname === "localhost";
            const csvUrl = isLocal
              ? "/deregulated-zips.csv"
              : "https://bpc-web-static-files.s3.us-east-2.amazonaws.com/deregulated-zips.csv";
            
            console.log("Fetching CSV from:", csvUrl);
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error("Failed to fetch CSV");
            
            const csvText = await response.text();
            const lines = csvText.split("\n");
            const zipCode = addressData?.postalCode?.trim()?.substring(0, 5);
            console.log("Submitted zip code:", zipCode);

            let marketStatus = "no";
            let found = false;
            
            // Skip header row and process each line
            lines.slice(1).some((line) => {
              const columns = line.split(",");
              const csvZip = columns[1]?.trim();
              const servingNow = columns[4]?.trim();
              
              console.log(`Checking zip ${csvZip} against ${zipCode}, serving_now: ${servingNow}`);
              
              if (csvZip === zipCode) {
                found = true;
                console.log("Found zip in CSV:", columns);
                if (servingNow === "yes" || servingNow === "houston") {
                  marketStatus = "yes";
                  return true;
                } else if (servingNow === "preorder") {
                  marketStatus = "preorder";
                  return true;
                }
              }
              return false;
            });

            console.log("Market status:", marketStatus, "Found:", found);

            // Call the original success handler with the market status
            if (typeof onAddressSubmitSuccess === 'function') {
              onAddressSubmitSuccess(addressData, undefined, { servingNow: marketStatus });
            }
          } catch (error) {
            console.error("Error checking zip code:", error);
            if (typeof onAddressSubmitSuccess === 'function') {
              onAddressSubmitSuccess(addressData, undefined, { servingNow: "no" });
            }
          }
        },
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

    // Store the instance for cleanup
    currentZipCodeInstance = zipCodeInput;
    isZipCodeInitialized = true;

    return zipCodeInput;
  },
};
