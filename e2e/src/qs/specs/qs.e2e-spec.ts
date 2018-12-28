import {QsHomePagePo} from '../pages/qsHomePage.po';
import {Github} from '../pages/github.po';

describe('Quality Shepherd blog', function () {
  let qsHomePage = new QsHomePagePo();

  beforeEach(function () {
    qsHomePage = new QsHomePagePo();
    qsHomePage.gotoNonAngular(qsHomePage.url);
  });

  it('should display 5 posts per page', () => {
    expect(qsHomePage.posts.count()).toBe(5);
  });

  it('should return search results', () =>  {
    qsHomePage.forText('protractor');

    expect(qsHomePage.resultsPage.isPresent()).toBe(true);
    expect(qsHomePage.posts.count()).toBeGreaterThan(0);
  });

  it('unfound search term should return no results', () =>  {
    qsHomePage.forText('sfdslkjsfkjslkdf');

    expect(qsHomePage.noResultsMsg.isDisplayed()).toBe(true);
  });

  it('should open social media link in new window', () =>  {
    const NEW_WIN_INDEX = 1;
    const githubPage = new Github();

    qsHomePage.goToGit();
    // switch to the new winwow/tab...
    qsHomePage.switchToWindow(NEW_WIN_INDEX);

    expect(githubPage.loaded()).toBe(true);

    // cleanup: close new window and switch back to original window...
    qsHomePage.closeCurrentWindowAndLoadParent();
  });

  it('sidebar should have a set width', () =>  {
    expect(qsHomePage.sidebar.getWidth()).toBe(280);
  });

  it('should find an older post by paging', () =>  {
    const POSTTITLE = 'When To Automate';
    qsHomePage.findPostByPaging(POSTTITLE);

    expect(qsHomePage.postTitleExists(POSTTITLE)).toBe(true);
  });
});
