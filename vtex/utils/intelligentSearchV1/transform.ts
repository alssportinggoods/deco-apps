import type { Image, Product } from "../types.ts";

/**
 * v1 fills `imageText` with the slugified asset name, and with the raw file
 * name when the asset carries no label. Intelligent Search API (Legacy) filled
 * it with the human readable label, or left it empty. The transforms name an
 * image after `imageText` before `imageLabel`, so the label answers for both.
 */
const withImageLabelAsText = (image: Image): Image => ({
  ...image,
  imageText: image.imageLabel || "",
});

/**
 * Intelligent Search v1 identifies itself as `intsch`, while the transforms
 * discriminate Intelligent Search products from catalog ones by the legacy
 * `intelligent-search` value.
 */
export const asIntelligentSearchProduct = (product: Product): Product => ({
  ...product,
  origin: "intelligent-search",
  items: product.items?.map((item) => ({
    ...item,
    images: item.images?.map(withImageLabelAsText),
  })),
});
