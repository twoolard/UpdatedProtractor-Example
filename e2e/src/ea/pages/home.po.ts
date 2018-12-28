// @ts-ignore
import { browser, by, element, protractor} from 'protractor';
import Base from '../../common-pages/base.po';

export class Home extends Base {

  heading;
  headings;
  url;

  constructor() {
    super();
    this.routes = browser.params;
    this.heading = '';
    this.headings = '';
    this.url = this.routes.executeAutomation;

  }

}
