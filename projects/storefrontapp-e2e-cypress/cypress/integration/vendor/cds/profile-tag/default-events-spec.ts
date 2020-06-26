import * as anonymousConsents from '../../../../helpers/anonymous-consents';
import * as checkoutFlow from '../../../../helpers/checkout-as-persistent-user';
import { waitForPage } from '../../../../helpers/checkout-flow';
import * as loginHelper from '../../../../helpers/login';
import { navigation } from '../../../../helpers/navigation';
import {
  createProductQuery,
  QUERY_ALIAS,
} from '../../../../helpers/product-search';
import {
  cdsHelper,
  strategyRequestAlias,
} from '../../../../helpers/vendor/cds/cds';
import { profileTagHelper } from '../../../../helpers/vendor/cds/profile-tag';

describe('Profile-tag events', () => {
  beforeEach(() => {
    cy.server();
    cdsHelper.setUpMocks(strategyRequestAlias);
    navigation.visitHomePage({
      options: {
        onBeforeLoad: profileTagHelper.interceptProfileTagJs,
      },
    });
    profileTagHelper.waitForCMSComponents();
  });

  it('should send a CartChanged event on adding an item to cart', () => {
    goToProductPage();
    cy.get('cx-add-to-cart button.btn-primary').click();
    cy.get('cx-added-to-cart-dialog .btn-primary');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CART_SNAPSHOT
        )
      ).to.equal(1);

      const cartSnapshotEvent = (<any>win).Y_TRACKING.eventLayer.filter(
        (event) => event.name === profileTagHelper.EventNames.CART_SNAPSHOT
      )[0];
      const cartPayload = JSON.stringify(cartSnapshotEvent.data);

      expect(cartPayload).to.include('cart');
      expect(cartPayload).to.include('code');
    });
  });

  it('should send an additional CartChanged event on modifying the cart', () => {
    goToProductPage();
    cy.get('cx-add-to-cart button.btn-primary').click();
    cy.get('cx-added-to-cart-dialog .btn-primary').click();
    cy.get('cx-cart-item cx-item-counter').getByText('+').click();
    cy.route(
      'GET',
      `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
        'BASE_SITE'
      )}/users/anonymous/carts/*`
    ).as('getRefreshedCart');
    cy.wait('@getRefreshedCart');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CART_SNAPSHOT
        )
      ).to.equal(2);
    });
  });

  it('should send an additional CartChanged event on emptying the cart', () => {
    goToProductPage();
    cy.get('cx-add-to-cart button.btn-primary').click();
    cy.get('cx-added-to-cart-dialog .btn-primary').click();
    cy.get('cx-cart-item-list').get('.cx-remove-btn > .link').click();
    cy.route(
      'GET',
      `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
        'BASE_SITE'
      )}/users/anonymous/carts/*`
    ).as('getRefreshedCart');
    cy.wait('@getRefreshedCart');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CART_SNAPSHOT
        )
      ).to.equal(2);
    });
  });

  it('should send a product detail page view event when viewing a product', () => {
    cy.route('GET', `/rest/v2/electronics-spa/products/280916/reviews*`).as(
      'lastRequest'
    );
    const productSku = 280916;
    const productName = 'Web Camera (100KpixelM CMOS, 640X480, USB 1.1) Black';
    const productPrice = 8.2;
    const productCategory = 'brand_745';
    const productCategoryName = 'Canyon';
    goToProductPage();
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )
      ).to.equal(1);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )[0].data.productSku
      ).to.equal(`${productSku}`);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )[0].data.productName
      ).to.equal(productName);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )[0].data.productPrice
      ).to.equal(productPrice);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )[0].data.productCategory
      ).to.equal(productCategory);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )[0].data.productCategoryName
      ).to.equal(productCategoryName);
    });
  });

  it('should send a search page view event when viewing a search page', () => {
    cy.get('cx-searchbox input').type('camera{enter}');
    createProductQuery(QUERY_ALIAS.CAMERA, 'camera', 10);
    cy.wait(`@${QUERY_ALIAS.CAMERA}`);
    profileTagHelper.waitForCMSComponents();
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.KEYWORD_SEARCH
        )
      ).to.equal(1);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.KEYWORD_SEARCH
        )[0].data.numResults
      ).to.equal(140);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.KEYWORD_SEARCH
        )[0].data.searchTerm
      ).to.equal('camera');
    });
  });

  it('should send a HomePageViewed event when viewing the homepage', () => {
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.HOME_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send a CartPageViewed event when viewing the cart page', () => {
    goToProductPage();
    cy.get('cx-add-to-cart button.btn-primary').click();
    cy.get('cx-added-to-cart-dialog .btn-primary').click();
    cy.location('pathname', { timeout: 10000 }).should(
      'include',
      `/electronics-spa/en/USD/cart`
    );
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CART_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send an OrderConfirmation event when viewing the order confirmation page', () => {
    loginHelper.loginAsDefaultUser();
    checkoutFlow.goToProductPageFromCategory();
    checkoutFlow.addProductToCart();
    checkoutFlow.addPaymentMethod();
    checkoutFlow.selectShippingAddress();
    checkoutFlow.selectDeliveryMethod();
    checkoutFlow.selectPaymentMethod();
    cy.location('pathname', { timeout: 10000 }).should(
      'include',
      `checkout/review-order`
    );
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.ORDER_CONFIRMATION_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send a Category View event when a Category View occurs', () => {
    cy.route('GET', `/rest/v2/electronics-spa/products/search*`).as(
      'lastRequest'
    );
    const productCategory = '575';
    const productCategoryName = 'Digital Cameras';
    cy.get('cx-category-navigation cx-generic-link a')
      .contains('Cameras')
      .click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', `c/575`);
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(1);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )[0].data.productCategory
      ).to.equal(productCategory);
      expect(
        profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )[0].data.productCategoryName
      ).to.equal(productCategoryName);
    });
  });

  it('should send a Navigated event when a navigation occurs', () => {
    const categoryPage = waitForPage('CategoryPage', 'getCategory');
    cy.get(
      'cx-page-slot cx-banner img[alt="Save Big On Select SLR & DSLR Cameras"]'
    ).click();
    cy.wait(`@${categoryPage}`).its('status').should('eq', 200);
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(win, profileTagHelper.EventNames.NAVIGATED)
      ).to.equal(1);
    });
  });

  it('should wait for a user to accept consent and then send a ConsentChanged event', () => {
    anonymousConsents.clickAllowAllFromBanner();
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CONSENT_CHANGED
        )
      ).to.equal(1);
    });
  });
});

function goToProductPage(): Cypress.Chainable<number> {
  const productPagePath = 'ProductPage';
  const productPage = waitForPage(productPagePath, 'getProductPage');
  cy.get('.Section4 cx-banner').first().find('img').click({ force: true });
  return cy.wait(`@${productPage}`).its('status').should('eq', 200);
}