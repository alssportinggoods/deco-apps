import { getSetCookies, setCookie } from "std/http/cookie.ts";
import { AppContext } from "../../mod.ts";
import { proxySetCookie, REFRESH_TOKEN_COOKIE } from "../../utils/cookies.ts";
import { AuthResponse } from "../../utils/types.ts";
import { getCookies } from "@std/http/cookie";

export interface Props {
  email: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * @title Redefine Password
 * @description Redefine password
 */
export default async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AuthResponse> {
  const { vcsDeprecated, account } = ctx;

  if (!props.email || !props.currentPassword || !props.newPassword) {
    throw new Error("Email and/or password is missing");
  }

  // setpassword needs the session from `startlogin` (sent via the _vss cookie);
  // the plain `/start` token is no longer accepted.
  const startLoginBody = new FormData();
  startLoginBody.append("user", props.email);
  startLoginBody.append("scope", account);
  startLoginBody.append("accountName", account);
  startLoginBody.append("returnUrl", "/");
  startLoginBody.append("callbackUrl", "/");
  startLoginBody.append("fingerprint", "");

  const requestCookies = req.headers.get("cookie") || "";

  const startLoginResponse = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/startlogin"](
      {},
      {
        body: startLoginBody,
        headers: { cookie: requestCookies },
      },
    );

  if (!startLoginResponse.ok) {
    throw new Error(
      `Failed to start login. ${startLoginResponse.status} ${startLoginResponse.statusText}`,
    );
  }

  proxySetCookie(startLoginResponse.headers, ctx.response.headers, req.url);
  const cookie = [
    getSetCookies(startLoginResponse.headers)
      .map(({ name, value }) => `${name}=${value}`)
      .join("; "),
    requestCookies,
  ]
    .filter((c) => Boolean(c.trim()))
    .join("; ");

  const setPasswordBody = new FormData();
  setPasswordBody.append("login", props.email);
  setPasswordBody.append("currentPassword", props.currentPassword);
  setPasswordBody.append("newPassword", props.newPassword);
  setPasswordBody.append("accesskey", "");
  setPasswordBody.append("recaptcha", "");

  const response = await vcsDeprecated
    ["POST /api/vtexid/pub/authentication/classic/setpassword"](
      { expireSessions: true },
      {
        body: setPasswordBody,
        headers: { "Accept": "application/json", cookie },
      },
    );

  if (!response.ok) {
    throw new Error(
      `Authentication request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: AuthResponse = await response.json();

  proxySetCookie(response.headers, ctx.response.headers, req.url);
  await ctx.invoke.vtex.actions.session.validateSession();

  const setCookies = getSetCookies(ctx.response.headers);
  if (setCookies.length > 0) {
    ctx.response.headers.delete("set-cookie");
    for (const responseCookie of setCookies) {
      if (responseCookie.name === REFRESH_TOKEN_COOKIE) {
        // default path is /api/vtexid/refreshtoken/webstore; rewrite to / so the
        // browser sends it back to the backend.
        setCookie(ctx.response.headers, {
          ...responseCookie,
          path: "/",
        });
      } else {
        setCookie(ctx.response.headers, responseCookie);
      }
    }
  }

  return data;
}
