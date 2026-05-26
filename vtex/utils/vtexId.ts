import { getCookies } from "std/http/mod.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { stringify } from "./cookies.ts";

export const VTEX_ID_CLIENT_COOKIE = "VtexIdclientAutCookie";
export const CHECKOUT_DATA_ACCESS_COOKIE = "CheckoutDataAccess";
export const VTEX_CHKO_AUTH = "Vtex_CHKO_Auth";

interface CookiePayload {
  sub: string; // user email
  account: string; // account name
  audience: string; // "webstore";
  sess: string;
  exp: number; // 1684937945;
  userId: string;
}

export const parseAuthCookie = (headers: Headers) => {
  const cookies = getCookies(headers);
  const token = cookies[VTEX_ID_CLIENT_COOKIE] ||
    Object.entries(cookies).find(([k]) =>
      k.startsWith(`${VTEX_ID_CLIENT_COOKIE}_`)
    )?.[1];

  if (!token) return null;

  const decoded = decode(token);
  return decoded?.[1] as CookiePayload | undefined ?? null;
};

export const parseCookie = (headers: Headers, account: string) => {
  const cookies = Object.fromEntries(
    Object.entries(getCookies(headers)).filter(([key]) =>
      key.startsWith(VTEX_ID_CLIENT_COOKIE) ||
      key.startsWith(CHECKOUT_DATA_ACCESS_COOKIE) ||
      key.startsWith(VTEX_CHKO_AUTH)
    ),
  );
  const cookie = cookies[VTEX_ID_CLIENT_COOKIE] ||
    cookies[`${VTEX_ID_CLIENT_COOKIE}_${account}`];
  const decoded = cookie ? decode(cookie) : null;

  const payload = decoded?.[1] as CookiePayload | undefined;

  return {
    cookie: stringify(cookies),
    cookies,
    payload,
  };
};
