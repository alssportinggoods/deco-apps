import type { Section } from "@deco/deco/blocks";

const HEADER_COMPONENT = /\/sections\/Header\/Header\.tsx$/;
const FOOTER_COMPONENT = /\/sections\/Footer\/Footer\.tsx$/;

// Rendering/Lazy hides the wrapped section's metadata one level down, in its
// loader output; both the eager and the fallback branch keep it there.
const componentOf = (section: Section | null | undefined) => {
  const inner = (section?.props as { section?: Section } | undefined)?.section;
  return inner?.metadata?.component ?? section?.metadata?.component;
};

export interface PageLandmarks {
  beforeMain: Section[];
  main: Section[];
  afterMain: Section[];
}

/**
 * Splits a page's sections around its Header and Footer so the content in
 * between can render inside `<main>`. Returns `null` when the page has no
 * Header: without it there is no way to tell globals from page content.
 */
export const splitLandmarks = (sections: Section[]): PageLandmarks | null => {
  const header = sections.findLastIndex((s) =>
    HEADER_COMPONENT.test(componentOf(s) ?? "")
  );
  if (header === -1) {
    return null;
  }
  const footerOffset = sections.slice(header + 1).findIndex((s) =>
    FOOTER_COMPONENT.test(componentOf(s) ?? "")
  );
  const footer = footerOffset === -1
    ? sections.length
    : header + 1 + footerOffset;

  return {
    beforeMain: sections.slice(0, header + 1),
    main: sections.slice(header + 1, footer),
    afterMain: sections.slice(footer),
  };
};
