import { browser, by, element } from 'protractor';
import Base from './common-pages/base.po';



export class AppPage extends Base {

  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

}
