<script lang="ts">
  import { loadGooglePlacesLibrary } from "./googlePlaceLibraryLoader.js";
  import { createEventDispatcher, onMount } from "svelte";

  export let apiKey: string;
  export let options = undefined;
  export let placeholder = undefined;
  export let value = "";
  export let required = false;
  export let pattern = "";

  export let onSelect: (data: google.maps.places.PlaceResult) => void;

  const dispatch = createEventDispatcher();

  let inputField;
  $: selectedLocationName = value || "";

  onMount(() => {
    loadGooglePlacesLibrary(apiKey, () => {
      options["types"] = ["street_address", "premise", "subpremise", "point_of_interest"];
      const autocomplete = new google.maps.places.Autocomplete(inputField, {
        ...options,
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        // There are circumstances where the place_changed event fires, but we
        // were NOT given location data. I only want to propagate the event if we
        // truly received location data from Google.
        // See the `Type something, no suggestions, hit Enter` test case.
        if (hasLocationData(place)) {
          onSelect(place);
          setSelectedLocation({
            place: place,
            text: inputField.value,
          });
        }
      });

      dispatch("ready");
      setTimeout(() => {
        inputField.setAttribute("autocomplete", "one-time-code");
      }, 2000);
    });
  });

  function emptyLocationField() {
    inputField.value = "";
    onChange();
  }

  function hasLocationData(place) {
    const fieldsToLookFor = (options && options.fields) || ["geometry"];
    return place.hasOwnProperty(fieldsToLookFor[0]);
  }

  function onChange() {
    if (inputField.value === "") {
      setSelectedLocation(null);
    }
  }

  function onKeyDown(event) {
    const suggestionsAreVisible =
      document.getElementsByClassName("pac-item").length;

    if (event.key === "Enter" || event.key === "Tab") {
      if (suggestionsAreVisible) {
        const isSuggestionSelected =
          document.getElementsByClassName("pac-item-selected").length;
        if (!isSuggestionSelected) {
          selectFirstSuggestion();
        }
      } else if (doesNotMatchSelectedLocation(inputField.value)) {
        setTimeout(emptyLocationField, 10);
      }
    } else if (event.key === "Escape") {
      setTimeout(emptyLocationField, 10);
    }

    if (suggestionsAreVisible) {
      if (event.key === "Enter") {
        /* When suggestions are visible, don't let an 'Enter' submit a form (since
         * the user is interacting with the list of suggestions at the time, not
         * expecting their actions to affect the form as a whole). */
        event.preventDefault();
      }
    }
  }

  function selectFirstSuggestion() {
    // Simulate the 'down arrow' key in order to select the first suggestion:
    // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
    const simulatedEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
    });
    inputField.dispatchEvent(simulatedEvent);
  }

  function setSelectedLocation(data) {
    selectedLocationName = (data && data.text) || "";
    dispatch("place_changed", data);
  }

  function doesNotMatchSelectedLocation(value) {
    return selectedLocationName !== value;
  }
</script>

<input
  bind:this={inputField}
  class={$$props.class}
  class:input={true}
  on:change={onChange}
  on:keydown={onKeyDown}
  {placeholder}
  {value}
  {required}
  {pattern}
/>

<style lang="scss" global>
  .autocomplete-container {
    position: relative;
    font-family: PP Neue Montreal Variable,Arial,sans-serif;
  }
  .result-list {
    background: white;
    position: absolute;
    bottom: 44px;
    padding: 0;
    margin: 0;
    width: 100%;
    left: 0;
  }
  .pac-container {
    border-radius: 12px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border: 1px solid var(--Greyscale-90, #333E3F);
    border-top: none;
    box-shadow: 0 2px 0 2px var(--Greyscale-20, #D2D4D4);
    padding-top: 16px;
    @media screen and (max-width: 768px) {
      margin-top: -6px;
    }

    .pac-container .pac-item:first-of-type {
      border-top: red 1px;
    }

    .pac-item, .pac-item .pac-item-query {
      color: var(--Greyscale-95, #283334);
      border: none;

      /* body/body1 */
      font-family: PP Neue Montreal Variable,Arial,sans-serif;
      font-size: 12px;
      font-style: normal;
      font-style: normal;
      font-style: normal;
      font-weight: 400;
      font-style: normal;
      line-height: 24px; /* 133.333% */
      
      padding: 0 16px;
      line-height: 44px;
    }
    .pac-item .pac-item-query {
      font-weight: 600;
      font-size: 130%;
    }
    &:after {
      display: none !important;
    }
    .pac-item:hover,
    .pac-item:hover .pac-item-query {
      color: var(--Semantics-secondary, #084D41);
      background: rgba(236, 250, 208, 0.25);
    }
  }

  .pac-icon.pac-icon-marker {
    display: none;
  }
</style>
