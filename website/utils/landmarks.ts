import type { Section } from "@deco/deco/blocks";

/** @title Page landmarks */
export interface Landmarks {
  /**
   * @title Before main
   * @description Section components that close the part of the page rendered before <main>, e.g. site/sections/Header/Header.tsx. The last one found on the page wins.
   */
  beforeMain?: string[];
  /**
   * @title After main
   * @description Section components that open the part of the page rendered after <main>, e.g. site/sections/Footer/Footer.tsx. The first one found after the "before main" section wins.
   */
  afterMain?: string[];
}

export interface PageLandmarks {
  beforeMain: Section[];
  main: Section[];
  afterMain: Section[];
}

// Rendering/Lazy hides the wrapped section's metadata one level down, in its
// loader output; both the eager and the fallback branch keep it there.
const componentOf = (section: Section | null | undefined) => {
  const inner = (section?.props as { section?: Section } | undefined)?.section;
  return inner?.metadata?.component ?? section?.metadata?.component;
};

const matches = (components: string[] | undefined) => (section: Section) => {
  const component = componentOf(section);
  return component !== undefined && (components?.includes(component) ?? false);
};

/**
 * Splits a page's sections so the content between the configured "before
 * main" and "after main" sections can render inside `<main>`. Returns `null`
 * when no "before main" section is on the page: without it there is no way to
 * tell globals from page content.
 */
export const splitLandmarks = (
  sections: Section[],
  landmarks: Landmarks | undefined,
): PageLandmarks | null => {
  const start = sections.findLastIndex(matches(landmarks?.beforeMain));
  if (start === -1) {
    return null;
  }
  const endOffset = sections.slice(start + 1).findIndex(
    matches(landmarks?.afterMain),
  );
  const end = endOffset === -1 ? sections.length : start + 1 + endOffset;

  return {
    beforeMain: sections.slice(0, start + 1),
    main: sections.slice(start + 1, end),
    afterMain: sections.slice(end),
  };
};
