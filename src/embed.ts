import { PreorderApp } from "./PreorderApp";

(window as any).BasePreorderApp = PreorderApp;

// Initialize ZIP code input when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize ZIP code input if it exists
  if (document.getElementById("zip-code-entry")) {
    PreorderApp.initializeZipCode({
      targetElAddressInput: document.getElementById("zip-code-entry"),
      querySelectorClickToOpenForm: '[data-preorder="open"]',
      addressCtaText: "Check availability",
      googleSheetConfig: {
        zipsCsvUrl:
          "https://bpc-web-static-files.s3.us-east-2.amazonaws.com/deregulated-zips.csv",
      },
      onAddressSubmitSuccess: async (addressData, leadType, zipConfig) => {
        const marketStatus = zipConfig?.servingNow || "no";
        const redirectPath =
          marketStatus === "yes"
            ? "/available-now"
            : marketStatus === "preorder"
              ? "/available-soon"
              : "/not-available";

        const url = new URL(redirectPath, window.location.origin);
        const currentParams = new URLSearchParams(window.location.search);

        const selectedParams = {
          zip: addressData?.postalCode || "",
          gclid: currentParams.get("gclid"),
          utm_source: currentParams.get("utm_source"),
          utm_medium: currentParams.get("utm_medium"),
          utm_campaign: currentParams.get("utm_campaign"),
          utm_term: currentParams.get("utm_term"),
          utm_content: currentParams.get("utm_content"),
          referrer_name: currentParams.get("referrer_name"),
        };

        const filteredParams = {};
        Object.entries(selectedParams).forEach(([k, v]) => {
          if (v) {
            filteredParams[k] = v;
          }
        });

        url.search = new URLSearchParams(filteredParams).toString();
        window.location.href = url.toString();
      },
    });
  }
});
