import type { PreorderAppConfig } from "./Config.types";
import { initializeHubspotForms } from "./initializeForms";
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
      googleSheetConfig,
      hsFormSuccess,
      hsFormNewsletter,
      querySelectorClickToOpenForm,
      onAddressSelect,
      onAddressSubmitSuccess,
      hidePanelEl,
      addressCtaText,
    } = props;

    initializeHubspotForms({
      hsFormSuccess,
      hsFormNewsletter,
    });

    const panelEl = document.querySelector(targetPanel) as HTMLDivElement;
    const stateContainerEl = document.querySelector(
      targetStateContainer,
    ) as HTMLDivElement;

    const addressPanelEl = document.querySelector(
      targetAddressPanel,
    ) as HTMLDivElement;
    const targetAvailableStateEl = document.querySelector(
      targetAvailableState,
    ) as HTMLDivElement;
    const targetNotAvailableStateEl = document.querySelector(
      targetNotAvailableState,
    ) as HTMLDivElement;

    // open form button actions
    document.querySelectorAll(querySelectorClickToOpenForm).forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        targetElAddressInput.scrollIntoView({
          behavior: "smooth",
        });

        const y =
          targetElAddressInput.getBoundingClientRect().top +
          window.scrollY -
          300;

        window.scrollTo({ top: y, behavior: "smooth" });

        setTimeout(() => {
          targetElAddressInput.querySelector("input").focus();
        }, 1000);
      });
    });

    /**
     * close button
     */
    document.querySelectorAll(".close-button").forEach((el) => {
      el.addEventListener("click", () => {
        fadeOut(panelEl);
      });
    });

    const locationInput = new LocationInput({
      target: targetElAddressInput,
      props: {
        googlePublicApiKey,
        googleSheetConfig,
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
        addressCtaText: "See if my home qualifies",
      },
    });

    return locationInput;
  },

  initializeZipCode: (props: PreorderAppConfig) => {
    const {
      targetElAddressInput = document.getElementById("zip-code-entry"),
      googlePublicApiKey,
      targetPanel,
      targetAddressPanel,
      targetAvailableState,
      targetNotAvailableState,
      targetStateContainer,
      targetAvailableText,
      targetDisplayAddress,
      googleSheetConfig,
      hsFormSuccess,
      hsFormNewsletter,
      querySelectorClickToOpenForm,
      onAddressSubmitSuccess,
      hidePanelEl,
      addressCtaText,
    } = props;

    // Initialize Hubspot forms independently
    if (hsFormSuccess || hsFormNewsletter) {
      initializeHubspotForms({
        hsFormSuccess,
        hsFormNewsletter,
      });
    }

    // Only initialize panel elements if they are provided
    const panelEl = targetPanel ? document.querySelector(targetPanel) as HTMLDivElement : null;
    const stateContainerEl = targetStateContainer ? document.querySelector(targetStateContainer) as HTMLDivElement : null;
    const addressPanelEl = targetAddressPanel ? document.querySelector(targetAddressPanel) as HTMLDivElement : null;
    const targetAvailableStateEl = targetAvailableState ? document.querySelector(targetAvailableState) as HTMLDivElement : null;
    const targetNotAvailableStateEl = targetNotAvailableState ? document.querySelector(targetNotAvailableState) as HTMLDivElement : null;

    // Only set up click handlers if querySelectorClickToOpenForm is provided
    if (querySelectorClickToOpenForm) {
      document.querySelectorAll(querySelectorClickToOpenForm).forEach((el) => {
        el.addEventListener("click", (e) => {
          e.preventDefault();
          targetElAddressInput.scrollIntoView({
            behavior: "smooth",
          });

          const y =
            targetElAddressInput.getBoundingClientRect().top +
            window.scrollY -
            300;

          window.scrollTo({ top: y, behavior: "smooth" });

          setTimeout(() => {
            targetElAddressInput.querySelector("input").focus();
          }, 1000);
        });
      });
    }

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
        googleSheetConfig,
        onAddressSubmitSuccess,
        addressCtaText,
        panelEl,
        stateContainerEl,
        addressPanelEl,
        targetAvailableStateEl,
        targetNotAvailableStateEl,
        targetAvailableText,
        targetDisplayAddress,
        hidePanelEl,
      },
    });

    return zipCodeInput;
  },
};
