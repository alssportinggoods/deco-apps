import { Head } from "$fresh/runtime.ts";
import { useId } from "preact/hooks";

export interface Variable {
  name: string;
  value: string;
}

export type Font = {
  type: "google";
  family: string;
  link: string;
} | {
  type: "css";
  family: string;
  styleSheet: string;
};

export interface Props {
  variables?: Variable[];
  fonts?: Font[];
  colorScheme?: "light" | "dark";
}

const withPrefersColorScheme = (scheme: "light" | "dark", css: string) =>
  `@media (prefers-color-scheme: ${scheme}) { ${css} }`;

function Theme({ fonts = [], variables = [], colorScheme }: Props) {
  const id = useId();

  const family = fonts.reduce(
    (acc, { family }) => acc ? `${acc}, ${family}` : family,
    "",
  );

  const vars = [
    { name: "--font-family", value: family },
    ...variables,
  ]
    .map(({ name, value }) => `${name}: ${value}`)
    .join(";");

  const css = `* {${vars}}`;
  const html = colorScheme ? withPrefersColorScheme(colorScheme, css) : css;
  const hasGoogleFont = fonts?.some((font) =>
    font.type === "google" && font.link
  );

  return (
    <Head>
      {hasGoogleFont
        ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
          </>
        )
        : null}
      {fonts?.map((font) => {
        if (font.type === "google" && font.link) {
          return <link href={font.link} rel="stylesheet" />;
        }

        if (font.type === "css" && font.styleSheet) {
          return (
            <style
              type="text/css"
              dangerouslySetInnerHTML={{ __html: font.styleSheet }}
            />
          );
        }

        return null;
      })}
      {html && (
        <style
          type="text/css"
          id={`__DESIGN_SYSTEM_VARS-${id}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </Head>
  );
}

export default Theme;
