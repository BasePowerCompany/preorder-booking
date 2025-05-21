import { PreorderApp } from "./PreorderApp";

(window as any).BasePreorderApp = PreorderApp;

// Initialize ZIP code input when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hero address input
  if (document.getElementById("hero-address-entry")) {
    PreorderApp.initialize({
      targetElAddressInput: document.getElementById("hero-address-entry"),
      googlePublicApiKey: "AIzaSyB0o_nPI-xjHYKg7KB0bl87Yhnf2ng9Nsg",
      querySelectorClickToOpenForm: '[data-preorder="open"]',
      addressCtaText: "Check availability",
      onAddressSelect: () => {
        if ((window as any).posthog) {
          (window as any).posthog.capture("user-submit-address-form");
        }
      },
      onAddressSubmitSuccess: async (addressData) => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "address-submit", { addressData });
        }
        (window as any).hubspotAddressData = addressData;

        let marketStatus = "unavailable";
        try {
          const response = await fetch(
            "https://bpc-web-static-files.s3.us-east-2.amazonaws.com/deregulated-zips.csv"
          );
          const csvText = await response.text();
          const lines = csvText.split("\n");

          lines.slice(1).some((line) => {
            const columns = line.split(",");
            if (columns[1]?.trim() === addressData?.postalCode?.trim()?.substring(0, 5)) {
              if (columns[4]?.trim() === "yes") {
                marketStatus = "yes";
                return true;
              } else if (columns[4]?.trim() === "preorder") {
                marketStatus = "preorder";
                return true;
              } else if (columns[4]?.trim() === "houston") {
                marketStatus = "houston";
                return true;
              }
            }
            return false;
          });
        } catch (error) {
          console.error("Error checking zip code:", error);
        }

        const useNewOnboarding = (window as any).posthog?.isFeatureEnabled?.("use-new-onboarding");
        let originURL = window.location.origin;
        let redirectPath = "/join-waitlist";

        if (useNewOnboarding) {
          originURL = "https://account.basepowercompany.com";
          redirectPath = "/register/LKhM3Irh"; // Default path, waitlist
        }

        // Handle different market statuses
        if (marketStatus === "yes" || marketStatus === "houston") {
          if (useNewOnboarding) {
            redirectPath = "/register/S1XeGMjm"; // live markets
          } else {
            redirectPath = "/join-now";
          }
        } else if (marketStatus === "preorder") {
          if (useNewOnboarding) {
            redirectPath = "/register/SCiqS9XF"; // preorder markets
          } else {
            redirectPath = "/join-soon";
          }
        }

        const url = new URL(redirectPath, originURL);
        const currentParams = new URLSearchParams(window.location.search);
        
        const selectedParams = {
          gclid: currentParams.get("gclid"),
          utm_source: currentParams.get("utm_source"),
          utm_medium: currentParams.get("utm_medium"),
          utm_campaign: currentParams.get("utm_campaign"),
          utm_term: currentParams.get("utm_term"),
          utm_content: currentParams.get("utm_content"),
          referrer_name: currentParams.get("referrer_name"),
          person_id: (window as any).posthog?.get_distinct_id?.(),
          title: addressData?.title || "",
          formatted_address: addressData?.formattedAddress || "",
          external_id: addressData?.externalId || "",
          external_url: addressData?.externalUrl || "",
          house_number: addressData?.houseNumber || "",
          street: addressData?.street || "",
          street_address: `${addressData?.houseNumber || ""} ${addressData?.street || ""}`.trim(),
          street_2: addressData?.street_2 || "",
          city: addressData?.city || "",
          county: addressData?.county || "",
          state_short: addressData?.stateShort || "",
          state_long: addressData?.stateLong || "",
          country_code: addressData?.countryCode || "",
          country_long: addressData?.countryLong || "",
          postal_code: addressData?.postalCode || "",
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

  // Initialize ZIP code input
  if (document.getElementById("zip-code-entry")) {
    PreorderApp.initializeZipCode({
      targetElAddressInput: document.getElementById("zip-code-entry"),
      querySelectorClickToOpenForm: '[data-preorder="open"]',
      addressCtaText: "Check availability",
      onAddressSubmitSuccess: async (addressData) => {
        if ((window as any).gtag) {
          (window as any).gtag("event", "zip-submit", { addressData });
        }
        (window as any).hubspotAddressData = addressData;

        let marketStatus = "unavailable";
        try {
          const response = await fetch(
            "https://bpc-web-static-files.s3.us-east-2.amazonaws.com/deregulated-zips.csv"
          );
          const csvText = await response.text();
          const lines = csvText.split("\n");

          lines.slice(1).some((line) => {
            const columns = line.split(",");
            if (columns[1]?.trim() === addressData?.postalCode?.trim()?.substring(0, 5)) {
              if (columns[4]?.trim() === "yes") {
                marketStatus = "yes";
                return true;
              } else if (columns[4]?.trim() === "preorder") {
                marketStatus = "preorder";
                return true;
              } else if (columns[4]?.trim() === "houston") {
                marketStatus = "houston";
                return true;
              }
            }
            return false;
          });
        } catch (error) {
          console.error("Error checking zip code:", error);
        }

        const useNewOnboarding = (window as any).posthog?.isFeatureEnabled?.("use-new-onboarding");
        let originURL = window.location.origin;
        let redirectPath = "/join-waitlist";

        if (useNewOnboarding) {
          originURL = "https://account.basepowercompany.com";
          redirectPath = "/register/LKhM3Irh"; // Default path, waitlist
        }

        // Handle different market statuses
        if (marketStatus === "yes" || marketStatus === "houston") {
          if (useNewOnboarding) {
            redirectPath = "/register/S1XeGMjm"; // live markets
          } else {
            redirectPath = "/join-now";
          }
        } else if (marketStatus === "preorder") {
          if (useNewOnboarding) {
            redirectPath = "/register/SCiqS9XF"; // preorder markets
          } else {
            redirectPath = "/join-soon";
          }
        }

        const url = new URL(redirectPath, originURL);
        const currentParams = new URLSearchParams(window.location.search);
        
        const selectedParams = {
          gclid: currentParams.get("gclid"),
          utm_source: currentParams.get("utm_source"),
          utm_medium: currentParams.get("utm_medium"),
          utm_campaign: currentParams.get("utm_campaign"),
          utm_term: currentParams.get("utm_term"),
          utm_content: currentParams.get("utm_content"),
          referrer_name: currentParams.get("referrer_name"),
          person_id: (window as any).posthog?.get_distinct_id?.(),
          title: addressData?.title || "",
          formatted_address: addressData?.formattedAddress || "",
          external_id: addressData?.externalId || "",
          external_url: addressData?.externalUrl || "",
          house_number: addressData?.houseNumber || "",
          street: addressData?.street || "",
          street_address: `${addressData?.houseNumber || ""} ${addressData?.street || ""}`.trim(),
          street_2: addressData?.street_2 || "",
          city: addressData?.city || "",
          county: addressData?.county || "",
          state_short: addressData?.stateShort || "",
          state_long: addressData?.stateLong || "",
          country_code: addressData?.countryCode || "",
          country_long: addressData?.countryLong || "",
          postal_code: addressData?.postalCode || "",
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
