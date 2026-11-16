import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../segment.ts";
import type { SelectedFacet, SimulationBehavior, Sort } from "../types.ts";
import { omitEmpty, type SegmentParams, segmentToV1 } from "./segment.ts";

interface Params {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  fuzzy: string;
  locale: string;
  hideUnavailableItems: boolean;
  simulationBehavior: SimulationBehavior;
}

/**
 * Builds the context parameters every v1 endpoint expects. Values derived from
 * the segment can be overriden by the caller, which is how a storefront forces
 * its own zip code or sales channel.
 */
export const withContextParams = (
  ctx: AppContext,
  locale?: string,
  overrides: Partial<SegmentParams> = {},
) => {
  const { params } = segmentToV1(getSegmentFromBag(ctx)?.payload);

  return {
    ...params,
    locale: locale ?? params.locale ?? ctx.defaultSegment?.cultureInfo ??
      "pt-BR",
    sc: params.sc ?? ctx.salesChannel ?? "1",
    country: params.country ?? ctx.defaultSegment?.countryCode ?? "BRA",
    ...omitEmpty(overrides),
  };
};

/**
 * Builds the query parameters every v1 search endpoint expects.
 */
export const withDefaultParams = (
  {
    query = "",
    page = 0,
    count = 12,
    sort = "",
    fuzzy = "",
    locale,
    hideUnavailableItems,
    simulationBehavior = "default",
  }: Partial<Params>,
  ctx: AppContext,
  overrides: Partial<SegmentParams> = {},
) => ({
  page: page + 1,
  count,
  query,
  sort,
  ...(fuzzy ? { fuzzy } : {}),
  hideUnavailableItems: hideUnavailableItems ?? false,
  simulationBehavior,
  ...withContextParams(ctx, locale, overrides),
});

/**
 * Facets carried by the segment cookie are no longer applied by the API, so
 * they are merged into the facet path.
 */
export const withDefaultFacets = (
  facets: readonly SelectedFacet[],
  ctx: AppContext,
): SelectedFacet[] => {
  const { facets: fromSegment } = segmentToV1(getSegmentFromBag(ctx)?.payload);
  const keys = new Set(facets.map(({ key, value }) => `${key}/${value}`));

  return [
    ...facets,
    ...fromSegment.filter(({ key, value }) => !keys.has(`${key}/${value}`)),
  ];
};
