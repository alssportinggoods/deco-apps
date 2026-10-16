import type { TypedResponse } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";

export type Holiday = {
  id: string;
  account: string;
  startDate: string;
  endDate: string;
  name: string;
};

export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<Holiday[]> {
  const { vcs } = ctx;

  const response = await vcs["GET /api/logistics/pvt/configuration/holidays"](
    {},
  )
    .then((r) => (r as TypedResponse<Holiday[]>).json());

  return response;
}

export const cache = {
  maxAge: 60 * 60 * 24, // 1 day
};
export const cacheKey = (_props: unknown, _req: Request, _ctx: AppContext) => {
  return "logistics-holidays";
};
export const defaultVisibility = "private";
