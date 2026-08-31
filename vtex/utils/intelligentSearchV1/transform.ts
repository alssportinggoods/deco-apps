import type { Product } from "../types.ts";

/**
 * Intelligent Search v1 identifies itself as `intsch`, while the transforms
 * discriminate Intelligent Search products from catalog ones by the legacy
 * `intelligent-search` value.
 */
export const asIntelligentSearchProduct = (product: Product): Product => ({
  ...product,
  origin: "intelligent-search",
});
