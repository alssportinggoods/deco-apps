import { DEFAULT_EXPECTED_SECTIONS } from "../actions/cart/removeItemAttachment.ts";
import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import {
  getCheckoutVtexCookie,
  hasDifferentMarketingData,
  parseCookie,
} from "../utils/orderForm.ts";
import {
  getSegmentFromBag,
  setOrderFormIdInBag as setCheckoutVtexCookieInBag,
} from "../utils/segment.ts";
import { forceHttpsOnAssets } from "../utils/transform.ts";
import type { MarketingData, OrderForm } from "../utils/types.ts";

interface Props {
  orderformId?: string;
  ignoreSetCookie?: boolean;
  forceNewCart?: boolean;
}

export const cache = "no-store";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 * @title Get Cart
 * @description Get the cart from the user logged in
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers, {
    overwrite: { orderformId: props.orderformId },
  });
  const segment = getSegmentFromBag(ctx);

  const responsePromise = vcsDeprecated["POST /api/checkout/pub/orderForm"](
    {
      sc: segment?.payload?.channel,
      forceNewCart: props.forceNewCart || false,
    },
    { headers: { cookie } },
  );

  setCheckoutVtexCookieInBag(
    ctx,
    responsePromise.then((response) => getCheckoutVtexCookie(response.headers)),
  );

  const response = await responsePromise;

  const cart = await response.json() as OrderForm;

  if (!props.ignoreSetCookie) {
    proxySetCookie(response.headers, ctx.response.headers, req.url);
  } else {
    response.headers.delete("set-cookie");
  }

  if (!segment?.payload) {
    return forceHttpsOnAssets(cart);
  }

  const {
    payload: {
      utm_campaign,
      utm_source,
      utm_medium,
      utmi_campaign,
      utmi_part,
      utmi_page,
    },
  } = segment;

  const hasUtm = utm_campaign || utm_source || utm_medium || utmi_campaign ||
    utmi_page || utmi_part;

  if (hasUtm) {
    const marketingData: MarketingData = {
      utmCampaign: utm_campaign || cart.marketingData?.utmCampaign,
      utmSource: utm_source || cart.marketingData?.utmSource,
      utmMedium: utm_medium || cart.marketingData?.utmMedium,
      utmiCampaign: utmi_campaign || cart.marketingData?.utmiCampaign,
      utmiPage: utmi_page || cart.marketingData?.utmiPage,
      utmiPart: utmi_part || cart.marketingData?.utmiPart,
      marketingTags: cart.marketingData?.marketingTags,
      coupon: cart.marketingData?.coupon,
    };

    if (
      !cart.marketingData ||
      hasDifferentMarketingData(cart.marketingData, marketingData)
    ) {
      const expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS;
      const result = await vcsDeprecated
        ["POST /api/checkout/pub/orderForm/:orderFormId/attachments/:attachment"](
          {
            orderFormId: cart.orderFormId,
            attachment: "marketingData",
            sc: segment?.payload.channel,
          },
          {
            body: { expectedOrderFormSections, ...marketingData },
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              cookie,
            },
          },
        );
      return forceHttpsOnAssets((await result.json()) as OrderForm);
    }
  }

  return forceHttpsOnAssets(cart);
};

export default loader;
