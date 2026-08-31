import { Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toPath } from "../../utils/intelligentSearch.ts";
import {
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearchV1/params.ts";
import { asIntelligentSearchProduct } from "../../utils/intelligentSearchV1/transform.ts";
import {
  getSegmentCacheKeyWithoutUTM,
  getSegmentFromBag,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toProduct } from "../../utils/transform.ts";
import type {
  AdvancedLoaderConfig,
  SimulationBehavior,
} from "../../utils/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;

  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @title Advanced Configuration
   * @description Further change loader behaviour
   */
  advancedConfigs?: AdvancedLoaderConfig;
  /**
   * @title Simulation Behavior
   * @description Defines the simulation behavior.
   */
  simulationBehavior?: SimulationBehavior;
}

/**
 * @title Suggestions - Intelligent Search v1
 * @description List a product suggestion, with products and SEO data. commonly used for search suggestions and autocomplete.
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { vcsDeprecated } = ctx;
  const { url } = req;
  const { count, query } = props;
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const suggestions = () =>
    vcsDeprecated["GET /api/intelligent-search/v1/search-suggestions"]({
      locale,
      query: query ?? "",
    }).then((res) => res.json());

  const topSearches = () =>
    vcsDeprecated["GET /api/intelligent-search/v1/top-searches"]({
      locale,
    }).then((res) => res.json());

  const productSearch = () => {
    const facets = withDefaultFacets([], ctx);
    const params = withDefaultParams({
      query,
      count: count ?? 4,
      locale,
      simulationBehavior: props.simulationBehavior ??
        ctx.advancedConfigs?.simulationBehavior ?? "default",
    }, ctx);

    return vcsDeprecated
      ["GET /api/intelligent-search/v1/product-search/*facets"]({
        ...params,
        facets: toPath(facets),
      })
      .then((res) => res.json());
  };

  const [{ searches }, { products, recordsFiltered }] = await Promise.all([
    query ? suggestions() : topSearches(),
    productSearch(),
  ]);

  if (!searches || !productSearch) return null;

  const options = {
    baseUrl: url,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    includeOriginalAttributes: props.advancedConfigs?.includeOriginalAttributes,
  };

  return {
    searches: count ? searches.slice(0, count) : searches,
    products: await Promise.all(
      products
        .map(asIntelligentSearchProduct)
        .map((p) => toProduct(p, p.items[0], 0, options)).map((p) =>
          withIsSimilarTo(req, ctx, p)
        ),
    ),
    hits: recordsFiltered,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, ctx: AppContext) => {
  const segment = ctx.advancedConfigs?.removeUTMFromCacheKey
    ? getSegmentCacheKeyWithoutUTM(ctx)
    : getSegmentFromBag(ctx)?.token;

  const query = props.query ?? "";
  const count = props.count ?? 4;
  const simulationBehavior = props.simulationBehavior ??
    ctx.advancedConfigs?.simulationBehavior ?? "default";

  return `suggestions-v1-${query}-${count}-${simulationBehavior}-${segment}`;
};

export default loaders;
