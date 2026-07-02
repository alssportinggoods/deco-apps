import { ReviewPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toAggregateRating, toReview } from "../utils/tranform.ts";

export interface Props {
  /**
   * @title Power Reviews ID
   * @description The ID, SKU, or Model of the product in Power Reviews
   */
  id: string;
  /**
   * @title Image Only
   * @description Filter only reviews with media
   */
  image_only?: boolean;
}

/**
 * @title Power Reviews - Product Details Page
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReviewPage | null> {
  const { api, merchantId } = ctx;
  const pageFrom = 0, pageSize = 10;
  const { image_only = false, id } = props;

  const fullReviewResponse = await api
    ["GET /m/:merchantId/l/:locale/product/:pageId/reviews"]({
      merchantId: merchantId,
      locale: "en_US",
      pageId: id,
      _noconfig: "true",
      image_only: image_only,
      "paging.from": pageFrom,
      "paging.size": pageSize,
    });

  const fullReview = await fullReviewResponse.json();
  const rollup = fullReview.results[0].rollup;
  const reviews = fullReview.results[0].reviews;

  const aggregateRating = toAggregateRating(rollup);

  const review = reviews.length >= 1
    ? reviews?.map((item) => toReview(item))
    : undefined;

  return {
    id,
    page: {
      currentPageNumber: fullReview.paging.current_page_number,
      nextPageUrl: fullReview.paging.next_page_url,
      pageSize: fullReview.paging.page_size,
      pagesTotal: fullReview.paging.pages_total,
      totalResults: fullReview.paging.total_results,
    },
    review,
    aggregateRating,
  };
}

export const cache = {
  maxAge: 60 * 60 * 24, // 1 hour
};
export const cacheKey = (props: Props) =>
  `power-reviews:product-reviews:${props.id}:${props.image_only || false}`;
