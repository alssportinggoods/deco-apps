import { assertEquals } from "@std/assert";
import type { Section } from "@deco/deco/blocks";
import { type Landmarks, splitLandmarks } from "./landmarks.ts";

const HEADER = "site/sections/Header/Header.tsx";
const FOOTER = "site/sections/Footer/Footer.tsx";
const config: Landmarks = { beforeMain: [HEADER], afterMain: [FOOTER] };

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

Deno.test("puts everything between the configured sections in main", () => {
  const theme = section("site/sections/Theme/Theme.tsx");
  const header = section(HEADER);
  const hero = section("site/sections/Banners/Hero.tsx");
  const shelf = section("site/sections/Product/Shelf.tsx");
  const footer = section(FOOTER);

  const result = splitLandmarks([theme, header, hero, shelf, footer], config);

  assertEquals(result?.beforeMain, [theme, header]);
  assertEquals(result?.main, [hero, shelf]);
  assertEquals(result?.afterMain, [footer]);
});

Deno.test("sees the configured sections through Rendering/Lazy", () => {
  const header = lazy(section(HEADER));
  const hero = section("site/sections/Banners/Hero.tsx");
  const footer = lazy(section(FOOTER));

  const result = splitLandmarks([header, hero, footer], config);

  assertEquals(result?.main, [hero]);
  assertEquals(result?.afterMain, [footer]);
});

Deno.test("matches any of several configured components", () => {
  const checkoutHeader = section("site/sections/Checkout/Header.tsx");
  const hero = section("site/sections/Banners/Hero.tsx");
  const slimFooter = section("site/sections/Footer/Slim.tsx");

  const result = splitLandmarks([checkoutHeader, hero, slimFooter], {
    beforeMain: [HEADER, "site/sections/Checkout/Header.tsx"],
    afterMain: [FOOTER, "site/sections/Footer/Slim.tsx"],
  });

  assertEquals(result?.main, [hero]);
  assertEquals(result?.afterMain, [slimFooter]);
});

Deno.test("runs main to the end when no after-main section is found", () => {
  const header = section(HEADER);
  const order = section("site/sections/Checkout/OrderPlaced.tsx");
  const contact = section("site/sections/Checkout/ContactUs.tsx");

  const result = splitLandmarks([header, order, contact], config);

  assertEquals(result?.main, [order, contact]);
  assertEquals(result?.afterMain, []);
});

Deno.test("gives up when no before-main section is on the page", () => {
  const hero = section("site/sections/Banners/Hero.tsx");
  const footer = section(FOOTER);

  assertEquals(splitLandmarks([hero, footer], config), null);
});

Deno.test("gives up when nothing is configured", () => {
  const header = section(HEADER);
  const hero = section("site/sections/Banners/Hero.tsx");

  assertEquals(splitLandmarks([header, hero], undefined), null);
  assertEquals(splitLandmarks([header, hero], {}), null);
});

Deno.test("ignores an after-main section that comes before main", () => {
  const footer = section(FOOTER);
  const header = section(HEADER);
  const hero = section("site/sections/Banners/Hero.tsx");

  const result = splitLandmarks([footer, header, hero], config);

  assertEquals(result?.beforeMain, [footer, header]);
  assertEquals(result?.main, [hero]);
});

Deno.test("tolerates null entries from failed resolution", () => {
  const header = section(HEADER);
  const hero = section("site/sections/Banners/Hero.tsx");

  const result = splitLandmarks(
    [null as unknown as Section, header, hero],
    config,
  );

  assertEquals(result?.main, [hero]);
});
