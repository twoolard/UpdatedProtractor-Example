import {$, browser, by, element, protractor} from 'protractor';
import {now} from 'moment';

export default class Base {
  timeout;
  header;
  loader;
  routes;
  errorText;
  pageLoaded;
  url;
  box;
  resultsPage;
  noResultsMsg;

  public constructor() {
    this.timeout = {
      'XS': 420,
      'S': 1000,
      'M': 2000,
      'L': 5000,
      'XL': 9000,
      'XXL': 15000
    };

    this.loader = this.css('.preloader');
    this.header = this.css('.display-4');
    this.errorText = this.css('.text-danger');
    this.box = $('input#s');
    this.resultsPage = $('body.search');
    this.noResultsMsg = element(by.cssContainingText('h2', 'No posts found. Please try a different search.'));
    this.routes = browser.params;

    protractor.ElementFinder.prototype.getWidth = function () {
      return this.getSize().then(size => {
        return size.width;
      });
    };
  }

 /* /!**
   * wait and verify that a page is loaded
   * @returns {promise}
   * @requires a page to include `pageLoaded` method
   *!/*/

  loaded() {
    return browser.wait(() => {
      return this.pageLoaded();
    }, this.timeout.xl, 'timeout: waiting for page to load. The url is: ' + this.url);
  }

  forText(text) {
    this.box.sendKeys(text);
    this.hitEnter();
    return browser.wait(this.isVisible(this.resultsPage), this.timeout.l);
  }

  gotoNonAngular(url) {
    browser.waitForAngularEnabled(false);
    return browser.get(url, this.timeout.XL);
  }


  goto(url) {
    browser.waitForAngularEnabled(true);
    return browser.get(url, this.timeout.XL);
  }

  isVisible(locator) {
    return protractor.ExpectedConditions.visibilityOf(locator);
  }

  forLoader() {
    return protractor.ExpectedConditions.invisibilityOf(this.loader);
  }

  getHeadingText() {
    browser.wait(this.isVisible(this.header), this.timeout.L);
    return this.header.getText();
  }

  getElementText(webElement) {
    browser.wait(this.isVisible(webElement), this.timeout.L);
    return webElement.getText();
  }


  isNotVisible(locator) {
    return protractor.ExpectedConditions.invisibilityOf(locator);
  }

  inDom(locator) {
    return protractor.ExpectedConditions.presenceOf(locator);
  }

  notInDom(locator) {
    return protractor.ExpectedConditions.stalenessOf(locator);
  }

  isClickable(locator) {
    return protractor.ExpectedConditions.elementToBeClickable(locator);
  }

  hasText(locator, text) {
    return protractor.ExpectedConditions.textToBePresentInElement(locator, text);
  }

  /**
   * Webdriver equivalent to hitting Enter/Return key.
   */
  hitEnter() {
    return browser.actions().sendKeys(protractor.Key.ENTER).perform();
  }

  hitTab() {
    return browser.actions().sendKeys(protractor.Key.TAB).perform();
  }

  /**
   * switches focus to a new window
   * @param  windowHandleIndex - the nth window to switch to
   */

  switchToWindow(windowHandleIndex) {
    browser.getAllWindowHandles().then(function (handles) {
      browser.switchTo().window(handles[windowHandleIndex]);
    });
  }

/*  /!**
   * close the current window and switch to its parent window
   * @param {obj} parentPage - the parent page object we want to load
   *!/*/

  closeCurrentWindowAndLoadParent() {
    // window management is a bit flakey so force it onto the controlFlow()
    return browser.controlFlow().execute(() => {
      return browser.getAllWindowHandles().then(handles => {
        // don't close if last window
        if (handles.length > 1) {
          browser.close();
          // the parent should be 2 less than the length of all found window handlers
          return this.switchToWindow(handles.length - 2);
        } else {
          console.log('Cannot close parent window ' + (handles.length - 2));
        }
      });
    });
  }

  css(item) {
    return element(by.css(item));
  }

  xpath(item) {
    return element(by.xpath(item));
  }

  buttonText(item) {
    return element(by.buttonText(item));
  }

  linkText(item) {
    return element(by.linkText(item));
  }

  now() {
    return now();
  }
}
