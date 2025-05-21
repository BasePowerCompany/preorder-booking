import type { PreorderAppConfig } from "./Config.types";
import LocationInput from "./location-input/LocationInput.svelte";
import ZipCodeInput from "./location-input/ZipCodeInput.svelte";
import { fadeOut } from "./visibilityUtils";

export const PreorderApp = {
  initialize: (props: PreorderAppConfig) => {
    const {
      targetElAddressInput = document.getElementById("hero-address-entry"),
      googlePublicApiKey,
      targetPanel,
      targetAddressPanel,
      targetAvailableState,
      targetNotAvailableState,
      targetStateContainer,
      targetAvailableText,
      targetDisplayAddress,
      onAddressSelect,
      onAddressSubmitSuccess,
      hidePanelEl,
      addressCtaText,
    } = props;

    const panelEl = document.querySelector(targetPanel) as HTMLDivElement;
    const stateContainerEl = document.querySelector(targetStateContainer) as HTMLDivElement;
    const addressPanelEl = document.querySelector(targetAddressPanel) as HTMLDivElement;
    const targetAvailableStateEl = document.querySelector(targetAvailableState) as HTMLDivElement;
    const targetNotAvailableStateEl = document.querySelector(targetNotAvailableState) as HTMLDivElement;

    // Set up close button
    document.querySelectorAll(".close-button").forEach((el) => {
      el.addEventListener("click", () => {
        fadeOut(panelEl);
      });
    });

    const locationInput = new LocationInput({
      target: targetElAddressInput,
      props: {
        googlePublicApiKey,
        targetAvailableText,
        targetDisplayAddress,
        addressPanelEl,
        targetAvailableStateEl,
        stateContainerEl,
        panelEl,
        targetNotAvailableStateEl,
        onAddressSelect,
        onAddressSubmitSuccess,
        hidePanelEl,
        addressCtaText: addressCtaText || "See if my home qualifies",
      },
    });

    return locationInput;
  },

  initializeZipCode: (props: PreorderAppConfig) => {
    const {
      targetElAddressInput = document.getElementById("zip-code-entry"),
      targetPanel,
      targetAddressPanel,
      targetStateContainer,
      onAddressSubmitSuccess,
      hidePanelEl,
      addressCtaText,
    } = props;

    // Only initialize panel elements if they are provided
    const panelEl = targetPanel ? document.querySelector(targetPanel) as HTMLDivElement : null;
    const stateContainerEl = targetStateContainer ? document.querySelector(targetStateContainer) as HTMLDivElement : null;
    const addressPanelEl = targetAddressPanel ? document.querySelector(targetAddressPanel) as HTMLDivElement : null;

    // Only set up close button if panelEl exists
    if (panelEl) {
      document.querySelectorAll(".close-button").forEach((el) => {
        el.addEventListener("click", () => {
          fadeOut(panelEl);
        });
      });
    }

    const zipCodeInput = new ZipCodeInput({
      target: targetElAddressInput,
      props: {
        onAddressSubmitSuccess,
        addressCtaText: addressCtaText || "Check availability",
        panelEl,
        stateContainerEl,
        addressPanelEl,
        hidePanelEl,
      },
    });

    return zipCodeInput;
  },
};
