import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { HttpError } from "../../../utils/http.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { toPath } from "../../utils/intelligentSearch.ts";
import {
  withContextParams,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearchV1/params.ts";
import { asIntelligentSearchProduct } from "../../utils/intelligentSearchV1/transform.ts";
import { pageTypesToSeo } from "../../utils/legacy.ts";
import type { OpenAPI as ISV1 } from "../../utils/openapi/isv1.openapi.gen.ts";
import {
  getSegmentCacheKeyWithoutUTM,
  getSegmentFromBag,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type {
  AdvancedLoaderConfig,
  Product as VTEXProduct,
  SimulationBehavior,
} from "../../utils/types.ts";
import PDPDefaultPath from "../paths/PDPDefaultPath.ts";

type ProductsV1Params = ISV1["GET /products"]["searchParams"];

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
  /**
   * @title Indexing Skus
   * @description Index of product pages with the `skuId` parameter
   */
  indexingSkus?: boolean;
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
  /**
   * @title Product Cluster ID
   * @description Restrict the lookup to a product cluster
   */
  productClusterId?: string;
  /**
   * @title Show invisible items
   * @description Return SKUs that are not visible in the storefront
   */
  showInvisibleItems?: boolean;
}

/**
 * @title Product Details Page - Intelligent Search v1
 * @description List a product details page, with product and SEO data. commonly used for product pages.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const haveToUseSlug = slug && !slug.startsWith(":");
  let defaultPaths;

  if (!haveToUseSlug) {
    defaultPaths = await PDPDefaultPath({ count: 1 }, req, ctx);
  }

  const lowercaseSlug = haveToUseSlug
    ? slug?.toLowerCase()
    : defaultPaths?.possiblePaths[0];
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const pageTypePromise = vcsDeprecated
    ["GET /api/catalog_system/pub/portal/pagetype/:term"](
      { term: `${lowercaseSlug}/p` },
      STALE,
    ).then((res) => res.json());

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId");

  /**
   * Fetch the exact skuId. If no one was provided, look the product up by its
   * slug, which v1 resolves without going through the search pipeline.
   */
  const identifier: Pick<ProductsV1Params, "field" | "value"> | null = skuId
    ? { field: "sku", value: skuId }
    : lowercaseSlug
    ? { field: "slug", value: lowercaseSlug }
    : null;

  // In case we dont have the skuId or the slug, 404
  if (!identifier) {
    return null;
  }

  const simulationBehavior = props.simulationBehavior ??
    ctx.advancedConfigs?.simulationBehavior ?? "default";
  const rawProduct = await vcsDeprecated
    ["GET /api/intelligent-search/v1/products"]({
      ...withContextParams(ctx, locale),
      simulationBehavior,
      ...identifier,
      productClusterId: props.productClusterId,
      "show-invisible-items": props.showInvisibleItems,
    })
    .then((res) => res.json())
    .catch((error) => {
      // Product not found, return the 404 status code
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }

      throw error;
    });

  if (!rawProduct) {
    return null;
  }

  const product = asIntelligentSearchProduct(rawProduct);
  const sku = pickSku(product, skuId?.toString());

  let kitItems: VTEXProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const kitParams = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
      locale,
      simulationBehavior,
    }, ctx);

    const result = await vcsDeprecated
      ["GET /api/intelligent-search/v1/product-search/*facets"]({
        ...kitParams,
        facets: toPath(withDefaultFacets([], ctx)),
      })
      .then((res) => res.json());

    kitItems = result.products.map(asIntelligentSearchProduct);
  }

  const pageType = await pageTypePromise;

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: segment?.payload?.currencyCode ?? "BRL",
    includeOriginalAttributes: props.advancedConfigs?.includeOriginalAttributes,
  });

  const isPageProduct = pageType.pageType === "Product";

  const seo = isPageProduct ? pageTypesToSeo([pageType], baseUrl) : null;

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: isPageProduct && seo
      ? {
        ...seo,
        noIndexing: props.indexingSkus ? false : seo.noIndexing,
      }
      : null,
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const segment = ctx.advancedConfigs?.removeUTMFromCacheKey
    ? getSegmentCacheKeyWithoutUTM(ctx)
    : getSegmentFromBag(ctx)?.token;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId") ?? "";

  const params = new URLSearchParams([
    ["slug", props.slug],
    ["segment", segment ?? ""],
    ["skuId", skuId],
  ]);

  url.search = params.toString();

  return url.href;
};

export default loader;
