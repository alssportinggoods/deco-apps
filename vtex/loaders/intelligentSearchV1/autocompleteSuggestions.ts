import { AppContext } from "../../mod.ts";
import type { AutocompleteSearchSuggestions } from "../../utils/openapi/isv1.openapi.gen.ts";
import {
  getSegmentCacheKeyWithoutUTM,
  getSegmentFromBag,
} from "../../utils/segment.ts";

export interface Props {
  query?: string;
}

/**
 * @title Autocomplete Suggestions - Intelligent Search v1
 * @description List the suggested terms and the facets they can be searched in.
 */
export default async function loader(
  { query }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AutocompleteSearchSuggestions> {
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  return await ctx.vcsDeprecated[
    "GET /api/intelligent-search/v1/autocomplete-suggestions"
  ]({
    locale,
    query: query ?? "",
  }).then((res) => res.json());
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, ctx: AppContext) => {
  const segment = ctx.advancedConfigs?.removeUTMFromCacheKey
    ? getSegmentCacheKeyWithoutUTM(ctx)
    : getSegmentFromBag(ctx)?.token;

  return `autocomplete-suggestions-v1-${props.query ?? ""}-${segment}`;
};
