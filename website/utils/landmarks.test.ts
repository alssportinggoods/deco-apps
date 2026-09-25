import { assertEquals } from "@std/assert";
import type { Section } from "@deco/deco/blocks";
import { splitLandmarks } from "./landmarks.ts";

const section = (component: string) =>
  ({
    Component: () => null,
    props: {},
    metadata: { component },
  }) as unknown as Section;

const lazy = (inner: Section) =>
  ({
    Component: () => null,
    props: { loading: "lazy", section: inner },
    metadata: { component: "website/sections/Rendering/Lazy.tsx" },
  }) as unknown as Section;

const names = (sections: Section[]) =>
  sections.map((s) => s.metadata?.component);

Deno.test("puts everything between Header and Footer in main", () => {
  const theme = section("site/sections/Theme/Theme.tsx");
  const header = section("site/sections/Header/Header.tsx");
  const hero = section("site/sections/Banners/Hero.tsx");
  const shelf = section("site/sections/Product/Shelf.tsx");
  const footer = section("site/sections/Footer/Footer.tsx");

  const result = splitLandmarks([theme, header, hero, shelf, footer]);

  assertEquals(result?.beforeMain, [theme, header]);
  assertEquals(result?.main, [hero, shelf]);
  assertEquals(result?.afterMain, [footer]);
});

Deno.test("sees Header and Footer through Rendering/Lazy", () => {
  const header = lazy(section("site/sections/Header/Header.tsx"));
  const hero = section("site/sections/Banners/Hero.tsx");
  const footer = lazy(section("site/sections/Footer/Footer.tsx"));

  const result = splitLandmarks([header, hero, footer]);

  assertEquals(result?.main, [hero]);
  assertEquals(result?.afterMain, [footer]);
});

Deno.test("runs main to the end when there is no Footer", () => {
  const header = section("site/sections/Header/Header.tsx");
  const order = section("site/sections/Checkout/OrderPlaced.tsx");
  const contact = section("site/sections/Checkout/ContactUs.tsx");

  const result = splitLandmarks([header, order, contact]);

  assertEquals(names(result?.main ?? []), [
    "site/sections/Checkout/OrderPlaced.tsx",
    "site/sections/Checkout/ContactUs.tsx",
  ]);
  assertEquals(result?.afterMain, []);
});

Deno.test("gives up when the page has no Header", () => {
  const hero = section("site/sections/Banners/Hero.tsx");
  const footer = section("site/sections/Footer/Footer.tsx");

  assertEquals(splitLandmarks([hero, footer]), null);
});

Deno.test("ignores a Footer that comes before the Header", () => {
  const footer = section("site/sections/Footer/Footer.tsx");
  const header = section("site/sections/Header/Header.tsx");
  const hero = section("site/sections/Banners/Hero.tsx");

  const result = splitLandmarks([footer, header, hero]);

  assertEquals(result?.beforeMain, [footer, header]);
  assertEquals(result?.main, [hero]);
});

Deno.test("tolerates null entries from failed resolution", () => {
  const header = section("site/sections/Header/Header.tsx");
  const hero = section("site/sections/Banners/Hero.tsx");

  const result = splitLandmarks([
    null as unknown as Section,
    header,
    hero,
  ]);

  assertEquals(result?.main, [hero]);
});
