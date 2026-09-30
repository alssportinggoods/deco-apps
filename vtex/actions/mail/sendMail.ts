import type { AppContext } from "../../mod.ts";

export interface Props {
  /** Message Center template name, e.g. `oms-return-request`. */
  templateName: string;
  /**
   * Data the template renders. The template's own To/CC/BCC fields read the
   * recipients from it, so whoever builds this object decides who gets the mail.
   */
  jsonData: Record<string, unknown>;
  /**
   * Keeps the rendered message in VTEX's message log. Off by default: payloads
   * usually carry customer PII.
   */
  logEvidence?: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/message-center-api#post-/api/mail-service/pvt/sendmail
 * @title Send Transactional Email
 * @description Renders a Message Center template with jsonData and sends it
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { templateName, jsonData, logEvidence = false } = props;

  await ctx.vcsDeprecated["POST /api/mail-service/pvt/sendmail"]({}, {
    body: { templateName, jsonData, logEvidence },
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
};

export const defaultVisibility = "private";
export default action;
