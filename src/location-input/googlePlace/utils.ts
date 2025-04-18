const initAddressComponentsByType: {
  [k: string]: google.maps.GeocoderAddressComponent;
} = {};

export type ParsedPlaceResult = {
  title: string | null;
  formattedAddress: string | null;
  externalId: string | null;
  externalUrl: string | null;
  houseNumber: string | null;
  street: string | null;
  street_2: string | null;
  city: string | null;
  county: string | null;
  stateShort: string | null;
  stateLong: string | null;
  countryCode: string | null;
  countryLong: string | null;
  postalCode: string | null;
};

export const parsePlaceResult = (place: google.maps.places.PlaceResult): ParsedPlaceResult => {
  console.log(place)
  const addressComponentsByType = (place.address_components || []).reduce(
    function (acc, data) {
      data.types.forEach(function (type) {
        acc[type] = data;
      });
      return acc;
    }, {}
  );

  const placeGet = (key: string, short = false) => {
    if (!(key in addressComponentsByType)) return null;

    return short
      ? addressComponentsByType[key].short_name
      : addressComponentsByType[key].long_name;
  };

  const result = {
    title: place.name,
    formattedAddress: place.formatted_address,
    externalId: place.place_id,
    externalUrl: place.url,
    houseNumber: placeGet("street_number"),
    street: placeGet("route"),
    street_2:
      [placeGet("floor"), placeGet("subpremise")]
        .filter((item) => !!item)
        .join(",") || null,
    city:
      placeGet("locality") ||
      placeGet("sublocality") ||
      placeGet("sublocality_level_1") ||
      placeGet("neighborhood") ||
      placeGet("administrative_area_level_3") ||
      placeGet("administrative_area_level_2"),
    county: placeGet("administrative_area_level_2"),
    stateShort: placeGet("administrative_area_level_1", true),
    stateLong: placeGet("administrative_area_level_1"),
    countryCode: placeGet("country", true),
    countryLong: placeGet("country"),
    postalCode: placeGet("postal_code"),
  };

  return result;
};
