import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  /**
   * @description Token to validate. If empty it will try to get it from the cookie.
   */
  token?: string;
}

export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ valid: true; id: string; email: string } | { valid: false }> {
  const { cookies } = parseCookie(req.headers, ctx.account);
  const autCookie = cookies[`VtexIdclientAutCookie_${ctx.account}`];
  const token = props.token || autCookie;

  try {
    const response = await ctx.vcs["POST /api/vtexid/credential/validate"]({}, {
      body: { token },
    })
      .then((res) => res.json());

    return {
      valid: response.authStatus === "Success",
      id: response.id!,
      email: response.user!,
    };
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) {
      return {
        valid: false,
      };
    }

    throw new HttpError(
      500,
      error instanceof Error ? error.message : "Internal Server Error",
    );
  }
}
