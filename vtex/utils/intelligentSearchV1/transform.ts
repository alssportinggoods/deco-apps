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

const leafOf = (categoryIds: string) =>
  categoryIds.split("/").filter(Boolean).at(-1);

/**
 * v1 orders `categories` independently of the `categoryId` it reports, so a
 * product listed under more than one category can lead with a path it does not
 * belong to. The transforms read the first entry to name the category and to
 * build the breadcrumb, so the path the product actually belongs to leads here.
 */
const withOwnCategoryFirst = (product: Product): Product => {
  const index = product.categoriesIds?.findIndex(
    (ids) => leafOf(ids) === product.categoryId,
  ) ?? -1;

  if (index <= 0) {
    return product;
  }

  const first = <T>(items: T[]) => [
    items[index],
    ...items.filter((_, i) => i !== index),
  ];

  return {
    ...product,
    categories: first(product.categories),
    categoriesIds: first(product.categoriesIds),
  };
};

/**
 * Intelligent Search v1 identifies itself as `intsch`, while the transforms
 * discriminate Intelligent Search products from catalog ones by the legacy
 * `intelligent-search` value.
 */
export const asIntelligentSearchProduct = (product: Product): Product => ({
  ...withOwnCategoryFirst(product),
  origin: "intelligent-search",
  items: product.items?.map((item) => ({
    ...item,
    images: item.images?.map(withImageLabelAsText),
  })),
});
