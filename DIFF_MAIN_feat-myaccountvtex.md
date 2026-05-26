# Diff da branch vs main

## Escopo

- Branch atual: `feat/myaccountvtex`
- Base comparada: `main`
- Merge-base: `dd694199d49625184876bf6b422a8e886c9d1387`
- Data da coleta: 2026-03-05

## Resumo rapido

- Commits a frente da `main`: **96**
- Arquivos alterados: **70**
- Status: **45 modificados** e **25 novos**
- Delta total: **109137 insercoes** e **30651 remocoes**

## Onde mudou mais

- `vtex`: 49 arquivos
- `power-reviews`: 5 arquivos
- `website`: 5 arquivos
- `blog`: 2 arquivos
- `htmx`: 2 arquivos
- Outros (`commerce`, `linx`, `shopify`, `vnda`, `wake`, `wap`): 1 arquivo cada
- Raiz do repo: 1 arquivo (`DIFF_MAIN_feat-myaccountvtex.md`)

## Pontos de maior impacto (linhas alteradas)

> Observacao: grande parte do volume esta em arquivos OpenAPI gerados.

| Arquivo                                                |           Delta |
| ------------------------------------------------------ | --------------: |
| `vtex/utils/openapi/checkout.openapi.json`             |     +43725 / -0 |
| `vtex/utils/openapi/vcs.openapi.json`                  | +14251 / -22819 |
| `vtex/utils/openapi/checkout.openapi.gen.ts`           |     +27614 / -0 |
| `vtex/utils/openapi/logistics.openapi.json`            |     +12352 / -0 |
| `vtex/utils/openapi/vcs.openapi.gen.ts`                |    +243 / -7310 |
| `vtex/utils/openapi/logistics.openapi.gen.ts`          |      +6088 / -0 |
| `vtex/utils/openapi/vtexid.openapi.json`               |      +2088 / -0 |
| `vtex/utils/openapi/vtexid.openapi.gen.ts`             |       +594 / -0 |
| `vtex/loaders/intelligentSearch/productListingPage.ts` |     +250 / -151 |
| `vtex/manifest.gen.ts`                                 |     +216 / -182 |
| `vtex/utils/types.ts`                                  |       +205 / -5 |

## Mudancas relevantes fora de OpenAPI

- `vtex/loaders/intelligentSearch/productListingPage.ts`: ajustes grandes na
  logica de PLP e parametros (pickup point, zip-code, filtros, etc.).
- `vtex/actions/*` e `vtex/loaders/*`: adicao/expansao de endpoints para
  address, sessions, payments, orders, profile e credentials.
- `vtex/utils/types.ts`: expansao de contratos e tipos.
- `website/components/Image.tsx` e `website/components/Picture.tsx`: ajustes no
  pipeline de imagem/render.
- `website/components/Seo.tsx` e `website/utils/html.ts`: alteracoes em SEO e
  tratamento de HTML.
- `power-reviews/*`: novo loader `productReviews` e adaptacoes em
  listagem/detalhe.
- `blog/*`: ajustes em `handlePosts` e `Template`.

## Arquivos alterados (name-status)

```text
A	DIFF_MAIN_feat-myaccountvtex.md
M	blog/core/handlePosts.ts
M	blog/sections/Template.tsx
M	commerce/types.ts
M	htmx/mod.ts
M	htmx/sections/htmx.tsx
M	linx/loaders/product/listingPage.ts
M	power-reviews/loaders/productDetailsPage.ts
M	power-reviews/loaders/productListingPage.ts
A	power-reviews/loaders/productReviews.ts
M	power-reviews/manifest.gen.ts
M	power-reviews/mod.ts
M	shopify/loaders/ProductListingPage.ts
M	vnda/loaders/productListingPage.ts
M	vtex/actions/address/create.ts
A	vtex/actions/address/createAddress.ts
A	vtex/actions/address/deleteAddress.ts
M	vtex/actions/address/update.ts
A	vtex/actions/address/updateAddress.ts
M	vtex/actions/cart/updateAttachment.ts
A	vtex/actions/credentials/validate.ts
A	vtex/actions/masterdata/updatePartialDocument.ts
M	vtex/actions/newsletter/updateNewsletterOptIn.ts
A	vtex/actions/payments/delete.ts
A	vtex/actions/profile/newsletterProfile.ts
A	vtex/actions/sessions/delete.ts
A	vtex/loaders/address/getAddressByZIP.ts
A	vtex/loaders/address/list.ts
M	vtex/loaders/cart.ts
M	vtex/loaders/categories/tree.ts
M	vtex/loaders/config.ts
M	vtex/loaders/intelligentSearch/productListingPage.ts
A	vtex/loaders/intelligentSearch/searches.ts
M	vtex/loaders/legacy/productList.ts
M	vtex/loaders/legacy/productListingPage.ts
A	vtex/loaders/logistics/listHolidays.ts
M	vtex/loaders/logistics/listPickupPointsByLocation.ts
M	vtex/loaders/orders/getById.ts
M	vtex/loaders/orders/list.ts
A	vtex/loaders/orders/order.ts
A	vtex/loaders/payments/info.ts
A	vtex/loaders/payments/userPayments.ts
A	vtex/loaders/profile/passwordLastUpdate.ts
A	vtex/loaders/sessions/info.ts
M	vtex/loaders/user.ts
M	vtex/manifest.gen.ts
M	vtex/middleware.ts
M	vtex/mod.ts
M	vtex/utils/client.ts
M	vtex/utils/intelligentSearch.ts
M	vtex/utils/legacy.ts
A	vtex/utils/openapi/checkout.openapi.gen.ts
A	vtex/utils/openapi/checkout.openapi.json
A	vtex/utils/openapi/logistics.openapi.gen.ts
A	vtex/utils/openapi/logistics.openapi.json
M	vtex/utils/openapi/vcs.openapi.gen.ts
M	vtex/utils/openapi/vcs.openapi.json
A	vtex/utils/openapi/vtexid.openapi.gen.ts
A	vtex/utils/openapi/vtexid.openapi.json
M	vtex/utils/orderForm.ts
M	vtex/utils/segment.ts
M	vtex/utils/types.ts
M	vtex/utils/vtexId.ts
M	wake/loaders/productListingPage.ts
M	wap/loaders/productListingPage.ts
M	website/components/Events.tsx
M	website/components/Image.tsx
M	website/components/Picture.tsx
M	website/components/Seo.tsx
M	website/utils/html.ts
```

## Comandos usados para gerar este documento

```bash
git rev-list --count main..HEAD
git merge-base main HEAD
git diff --shortstat main...HEAD
git diff --name-status main...HEAD
git diff --numstat main...HEAD
```
