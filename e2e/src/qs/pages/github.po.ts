import {$, browser, by, element} from 'protractor';
import Base from '../../common-pages/base.po';

export class Github extends Base {

  username;
  url;

  constructor() {
    super();
    this.routes = browser.params;
    this.username = $('.vcard-names');
    this.pageLoaded = this.isVisible(this.username);
    this.url = this.routes.qualityGit;
  }

}
