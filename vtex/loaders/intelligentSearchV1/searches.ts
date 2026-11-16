import { Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";

export interface Props {
  query?: string;
}

/**
 * @title Search Suggestions - Intelligent Search v1
 * @description List the suggested terms for a search term.
 */
export default async function loader(
  { query }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion> {
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  return await ctx.vcsDeprecated[
    "GET /api/intelligent-search/v1/search-suggestions"
  ]({
    locale,
    query: query ?? "",
  }).then((res) => res.json());
}
