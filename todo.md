# TODO

1. "Generic" components that are in `core` and/or `storefrontlib` - having the "Edit Configuration" button on the cart page - customers would have to specifically add a configurable product in their catalog, and only then they would see it on the page.

   - it's not just the mentioned button, there's more to it - i.e. more elements present on the cart page
   - order history page as well
   - checkout page as well

2. Revert:

   - `projects/storefrontapp/src/environments/environment.ts`
   - `projects/storefrontapp/src/environments/environment.prod.ts`
   - `projects/storefrontapp-e2e-cypress/cypress.json`
   - `projects/storefrontapp-e2e-cypress/cypress.ci.2005.json`

3. Move scss and assets to the `product` lib?

4. Add spinner/👻 design to http://localhost:4200/electronics-spa/en/USD/configureTEXTFIELD/cartEntry/entityKey/0?forceReload=true

5. fix focus lose when selection with keyboard (e.g. single selection image, multi selection image)

6. Get rid of import { makeErrorSerializable } from '@spartacus/product/configurators/common', instead expose it from core lib. Temporarily duplicated and exposed from /feature-libs/product/configurators/common/src/index.ts

7. Update the following *.spec.ts files once ConfigurationTestData has been moved to lib:
    - config-message.component.spec.ts
    - config-group-title.component.spec.ts
    - config-previous-next-buttons.component.spec.ts
