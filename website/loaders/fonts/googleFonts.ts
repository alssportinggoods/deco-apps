import { hashStringSync } from "../../../utils/shortHash.ts";
import { Font } from "../../components/Theme.tsx";

interface Props {
  fonts: GoogleFont[];
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: unknown) => {
  const url = new URL(req.url);

  const params = new URLSearchParams([
    [
      "googlefontsloader",
      encodeURIComponent(hashStringSync(JSON.stringify(props.fonts))),
    ],
  ]);
  url.pathname = "";
  url.search = params.toString();
  return url.href;
};

/**
 * @title {{weight}} {{#italic}}Italic{{/italic}}{{^italic}}{{/italic}}
 */
interface FontVariation {
  weight: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  italic?: boolean;
}

/** @titleBy family */
interface GoogleFont {
  family: string;
  variations: FontVariation[];
}

const getFontVariations = (variations: FontVariation[]) => {
  if (variations.length === 0) {
    return "";
  }

  let hasItalic = false;
  // We check if any of the variations are italic and set the hasItalic flag
  // while we are sorting the variations by weight.
  const sortedVariations = variations
    .sort((a, b) => {
      a.italic ??= false;
      b.italic ??= false;

      if (a.italic !== b.italic) {
        hasItalic = true;

        if (a.italic) return 1;
        if (!a.italic) return -1;
      }

      return parseInt(a.weight) - parseInt(b.weight);
    })
    .filter((item, index, self) =>
      // The user can add both italic and non-italic variations for the same weight
      // So we need to make sure we only add the weight once.
      index === self.findIndex((t) => (
        t.weight === item.weight && t.italic === item.italic
      ))
    );

  const variants = [];

  for (const { weight, italic } of sortedVariations) {
    if (!hasItalic) {
      variants.push(weight);
      continue;
    }

    variants.push(`${italic ? "1," : "0,"}${weight}`);
  }

  return `:${hasItalic ? "ital," : ""}wght@${variants.join(";")}`;
};

const loader = (props: Props, _req: Request): Font => {
  const { fonts = [] } = props;
  // If no fonts requested, avoid making a request that will 400 on Google Fonts
  if (fonts.length === 0) {
    return { family: "", link: "", type: "google" };
  }
  const url = new URL("https://fonts.googleapis.com/css2?display=swap");

  const reduced = fonts.reduce((acc, font) => {
    const { family, variations } = font;

    acc[family] = acc[family] ?? { family, variations: [] };

    acc[family].variations = [
      ...acc[family].variations,
      ...variations,
    ];

    return acc;
  }, {} as Record<string, GoogleFont>);

  for (const font of Object.values(reduced)) {
    url.searchParams.append(
      "family",
      `${font.family}${getFontVariations(font.variations)}`,
    );
  }

  return {
    type: "google",
    family: fonts.map((font) => font.family).join(", "),
    link: url.toString(),
  };
};

export default loader;
