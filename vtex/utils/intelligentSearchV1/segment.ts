import type { Segment, SelectedFacet } from "../types.ts";

/**
 * Keys that the VTEX segment cookie carries inside its `facets` string but that
 * Intelligent Search v1 expects as query parameters instead of path facets.
 *
 * @see https://developers.vtex.com/docs/guides/migrating-to-intelligent-search-api-v1
 */
const SHIPPING_KEYS = new Set([
  "zip-code",
  "coordinates",
  "country",
  "pickupPoint",
  "deliveryZonesHash",
  "pickupPointsHash",
]);

/**
 * Context parameters that Intelligent Search API (Legacy) read from the segment
 * cookie. v1 ignores the cookie, so every one of them travels as a query param.
 */
export interface SegmentParams {
  sc?: string;
  locale?: string;
  regionId?: string;
  country?: string;
  "zip-code"?: string;
  coordinates?: string;
  pickupPoint?: string;
  deliveryZonesHash?: string;
  pickupPointsHash?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmiCampaign?: string;
  campaigns?: string;
  priceTables?: string;
}

const split = (facets: string | null | undefined) => {
  const shipping: Record<string, string> = {};
  const pathFacets: SelectedFacet[] = [];

  for (const pair of (facets ?? "").split(";")) {
    const eq = pair.indexOf("=");

    if (eq < 0) continue;

    const key = pair.slice(0, eq);
    const value = pair.slice(eq + 1);

    if (!key || !value) continue;

    if (SHIPPING_KEYS.has(key)) {
      shipping[key] = value;
    } else {
      pathFacets.push({ key, value });
    }
  }

  return { shipping, pathFacets };
};

export const omitEmpty = <T>(entries: Record<string, T | null | undefined>) =>
  Object.fromEntries(
    Object.entries(entries).filter(([_, value]) =>
      value !== undefined && value !== null && value !== ""
    ).map(([key, value]) => [key, String(value)]),
  );

/**
 * Converts a segment payload into the explicit v1 query parameters and the path
 * facets it used to carry implicitly.
 */
export const segmentToV1 = (
  segment?: Partial<Segment>,
): { params: SegmentParams; facets: SelectedFacet[] } => {
  const { shipping, pathFacets } = split(segment?.facets);

  return {
    params: omitEmpty({
      sc: segment?.channel,
      locale: segment?.cultureInfo,
      regionId: segment?.regionId,
      country: segment?.countryCode ?? shipping.country,
      "zip-code": shipping["zip-code"],
      coordinates: shipping.coordinates,
      pickupPoint: shipping.pickupPoint,
      deliveryZonesHash: shipping.deliveryZonesHash,
      pickupPointsHash: shipping.pickupPointsHash,
      utmSource: segment?.utm_source,
      utmCampaign: segment?.utm_campaign,
      utmiCampaign: segment?.utmi_campaign,
      campaigns: segment?.campaigns as string | null | undefined,
      priceTables: segment?.priceTables,
    }),
    facets: pathFacets,
  };
};
