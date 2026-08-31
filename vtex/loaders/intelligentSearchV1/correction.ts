import type { AppContext } from "../../mod.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import type { CorrectionSearchResult } from "../../utils/types.ts";

interface Props {
  query: string;
}

/**
 * @title Correction - Intelligent Search v1
 * @description Correct a misspelled search term.
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CorrectionSearchResult> {
  const { vcsDeprecated } = ctx;
  const segment = getSegmentFromBag(ctx);
  const locale = segment?.payload?.cultureInfo ??
    ctx.defaultSegment?.cultureInfo ?? "pt-BR";

  const correction = await vcsDeprecated
    ["GET /api/intelligent-search/v1/correction-search"]({
      query: props.query,
      locale,
    });

  const data = await correction.json();

  return data;
}
