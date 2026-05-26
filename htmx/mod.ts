import { type App, type FnContext } from "@deco/deco";
import { Markdown } from "../decohub/components/Markdown.tsx";
import { PreviewContainer } from "../utils/preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

/**
 * @title {{{name}}}
 */
export interface Extension {
  name: string;
  url: string;
}

export interface Props {
  /** @default 1.9.12 */
  version?: string;
  /** @default https://cdn.jsdelivr.net/npm  */
  cdn?: string;
  /** @title HTMX extensions to include */
  extensions?: Extension[];
}
/**
 * @title HTMX
 * @description high power tools for HTML.
 * @category Frameworks
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png
 */
export default function Site(state: Props): App<Manifest, Required<Props>> {
  return {
    state: {
      version: state.version ?? "1.9.12",
      cdn: state.cdn ?? "https://cdn.jsdelivr.net/npm",
      extensions: state.extensions ?? [],
    },
    manifest,
  };
}

export const preview = async () => {
  const markdownContent = await Markdown(
    new URL("./README.md", import.meta.url).href,
  );
  return {
    Component: PreviewContainer,
    props: {
      name: "HTMX",
      owner: "deco.cx",
      description: "High power tools for HTML",
      logo: "https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png",
      images: [],
      tabs: [
        {
          title: "About",
          content: markdownContent(),
        },
      ],
    },
  };
};
export type AppContext = FnContext<Props, Manifest>;
