// page is non-angular
import {$, $$, browser, by, element} from 'protractor';
import Base from '../../common-pages/base.po';

export class QsHomePagePo extends Base {
  posts;
  postTitleLinks;
  siteTitle;
  sidebar;
  githubLink;
  url;
  prevPageLink;

  constructor() {
    super();
    this.routes = browser.params;
    this.posts = $$('div.post');
    this.postTitleLinks = $$('h2 a');
    this.siteTitle = $('h1 a');
    this.sidebar = $('div#sidebar');
    this.githubLink = $('a#githubLink');
    this.url = this.routes.quality;
    this.prevPageLink = element(by.cssContainingText('a', '← Older Entries'));

  }

  isPageLoaded() {
    this.hasText(this.siteTitle, 'Quality Shepherd');
    this.isClickable(this.postTitleLinks.first());
  }

  goToGit() {
    this.githubLink.click();
    browser.sleep(5000);
  }

/*  /!**
   * check if a post title exists
   * @param  {string} postTitle
   * @return {bool}
   *!/*/

  postTitleExists(postTitle) {
    return element(by.cssContainingText('a', postTitle)).isPresent();
  }
/*  /!**
   * Page back till we find the post title
   * or run out of previous posts
   * @param  {string} postTitle
   * @return {bool}
   *!/*/

  findPostByPaging(postTitle) {
    return this.postTitleExists(postTitle).then(found => {
      if (found) {
        // found it!
        return true;
      } else {
        // prevPageLink not displayed on first page
        this.prevPageLink.isPresent().then(yup => {
          if (yup) {
            this.prevPageLink.click();
            this.findPostByPaging(postTitle); // call recursively till found...
            // wait for page to load...
            this.isPageLoaded();
          } else {
            // post not found
            return false;
          }
        });
      }
    });
  }
}
