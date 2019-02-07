var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "should pass without any issue|Going to write first Test",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e400eb-007f-0095-0081-00000031002d.png",
        "timestamp": 1549547470163,
        "duration": 25
    },
    {
        "description": "should not pass as the values are undefined|Going to write first Test",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002200ce-0025-001f-00cf-007d002400a2.png",
        "timestamp": 1549547470542,
        "duration": 3
    },
    {
        "description": "should add a new friend|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007e002b-00ec-0006-0060-0007005d004b.png",
        "timestamp": 1549547470862,
        "duration": 1341
    },
    {
        "description": "should delete an existing friend|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00390039-00d8-00b1-008e-005b00fb004b.png",
        "timestamp": 1549547472554,
        "duration": 796
    },
    {
        "description": "should not display non-found search terms|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005d005e-000c-00c9-006a-009a00320045.png",
        "timestamp": 1549547473683,
        "duration": 618
    },
    {
        "description": "should display found search terms|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0003000e-0012-00e9-005d-003200a600d8.png",
        "timestamp": 1549547474646,
        "duration": 605
    },
    {
        "description": "should display no rows when all friends deleted|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004e006b-000c-004a-009c-003a00c50023.png",
        "timestamp": 1549547475583,
        "duration": 913
    },
    {
        "description": "should display actual count before saving new friend|angular app #Smoke",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ee00f9-00e6-00e5-00fc-009800c900a9.png",
        "timestamp": 1549547476816,
        "duration": 705
    },
    {
        "description": "should display 5 posts per page|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006e0040-0011-002b-004f-002b00c900bc.png",
        "timestamp": 1549547477849,
        "duration": 2770
    },
    {
        "description": "should return search results|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ab004d-0068-00a2-0028-002f00cb00d4.png",
        "timestamp": 1549547481005,
        "duration": 2927
    },
    {
        "description": "unfound search term should return no results|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009f00c7-006c-00d4-00cd-00bd006600b1.png",
        "timestamp": 1549547484291,
        "duration": 2031
    },
    {
        "description": "should open social media link in new window|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e700d0-00a9-0054-00d6-001500dc006d.png",
        "timestamp": 1549547486667,
        "duration": 3324
    },
    {
        "description": "sidebar should have a set width|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00eb006c-00de-0096-00e0-002300820073.png",
        "timestamp": 1549547490388,
        "duration": 997
    },
    {
        "description": "should find an older post by paging|Quality Shepherd blog",
        "passed": true,
        "pending": false,
        "os": "Mac OS X",
        "instanceId": 69157,
        "browser": {
            "name": "chrome",
            "version": "71.0.3578.98"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0061003f-00a7-007e-0071-00c600d70035.png",
        "timestamp": 1549547491779,
        "duration": 5091
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

