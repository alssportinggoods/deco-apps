import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const mutation =
  `mutation SubscribeNewsletter($email: String!, $isNewsletterOptIn: Boolean!) {
  subscribeNewsletter(email: $email, isNewsletterOptIn: $isNewsletterOptIn) @context(provider: "vtex.store-graphql@2.x")
}`;

interface Props {
  /**
   * The email of the user to update the newsletter opt in.
   */
  email: string;
  /**
   * If true, the user will be subscribed to the newsletter.
   */
  subscribe: boolean;
  /**
   * Name of the user to update the newsletter opt in.
   */
  name?: string;
  /**
   * Phone of the user to update the newsletter opt in.
   */
  phone?: string;
}

/**
 * @title Update Newsletter Opt In
 * @description Update the newsletter opt in
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ subscribed: boolean }> {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  await io.query<
    unknown,
    {
      email: string;
      isNewsletterOptIn: boolean;
      fields?: {
        name?: string;
        phone?: string;
      };
    }
  >(
    {
      query: mutation,
      operationName: "SubscribeNewsletter",
      variables: {
        email: props.email,
        isNewsletterOptIn: props.subscribe,
        fields: {
          name: props.name,
          phone: props.phone,
        },
      },
    },
    { headers: { cookie } },
  );

  return { subscribed: props.subscribe };
}

export default loader;
