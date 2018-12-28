// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
let HtmlReporter = require('protractor-beautiful-reporter');
const { SpecReporter } = require('jasmine-spec-reporter');
let host = "http://localhost:4200/";

exports.config = {
  allScriptsTimeout: 20000,
  getPageTimeout: 50000,
  specs: [
    './src/*/specs/*.e2e-spec.ts'
  ],
  exclude: [],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: [
        // "--headless",
        "--disable-gpu",
        "--window-size=1600,1000",
        "--no-sandbox",
        "--disable-dev-shm-usage"
      ]
    }
  },
  directConnect: true,
  suites: {
    ea:'./src/ea/specs/*.e2e-spec.ts',
    qs:'./src/qs/specs/*.e2e-spec.ts',
    friends:'./src/friends/specs/*.e2e-spec.ts',
    suiteGroupExample: ['', '', ''],
  },
  params: {
    pageGroupExample : {
      list: host + 'pageA',
      listB: host + 'pageB'

    },

    executeAutomation: 'http://localhost:8808',
    quality: 'http://qualityshepherd.com',
    qualityGit: 'https://github.com/qualityshepherd',
    qualityFriends: 'https://qualityshepherd.com/angular/friends/',

    loginCred: {
      userAdmin: '',
      password: '',
    },

  },
  framework: 'jasmine',
  jasmineNodeOpts: {
    grep: '#Smoke',
    includeStackTrace: true,
    showColors: true,
    isVerbose: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    }
  },
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true,
        displayFailedSpec: true,
        displaySuiteNumber: true,
        displaySpecDuration: true } }));

    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: 'Reports/screenshots'
      , preserveDirectory: false
    }).getJasmine2Reporter());

    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
  }
};
