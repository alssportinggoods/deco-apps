import { Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  getSegmentCacheKeyWithoutUTM,
  getSegmentFromBag,
} from "../../utils/segment.ts";

/**
 * @title Top Searches - Intelligent Search v1
 * @description List the top searches.
 */
export default async function (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion> {
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  return await ctx.vcsDeprecated
    ["GET /api/intelligent-search/v1/top-searches"]({
      locale,
    })
    .then((res) => res.json());
}

export const cache = {
  maxAge: 60 * 60, // 1 hour
};

export const cacheKey = (_props: unknown, _req: Request, ctx: AppContext) => {
  const segment = ctx.advancedConfigs?.removeUTMFromCacheKey
    ? getSegmentCacheKeyWithoutUTM(ctx)
    : getSegmentFromBag(ctx)?.token;
  return `topsearches-v1-${segment}`;
};
