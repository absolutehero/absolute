/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 4/23/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */
define (['pixi','absolute/debug'], function (PIXI, Debug) {

    var Platform = {

        artPathPrefix: 'art',

        soundPathPrefix: 'sound',

        maxWidth: window.innerWidth,

        maxHeight: window.innerHeight,

        devicePixelRatio: window.devicePixelRatio || 1,

        documentRoot: null,

        getDocumentRoot: function () {
            if (this.documentRoot === null) {
                if (this.isCordova()) {
                    var i = window.location.href.indexOf('/index.html');
                    this.documentRoot = window.location.href.substring(0, i) + "/";
                }
                else {
                    this.documentRoot = ""
                }
            }
            return this.documentRoot;
        },

        getClickAction: function() {
            if (this.supportsTouch()){
                return 'touchstart';
            }
            else {
                return 'click';
            }
        },

        isCrapAudio: function() {
            if( navigator.userAgent.indexOf("Android") >= 0) {
                return true;
            }
            else if (navigator.userAgent.indexOf("Silk") >= 0) {
                return true;
            }
            else if (navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i)) {
                return true;
            }
            else if (navigator.userAgent.match(/OS 4(_\d)+ like Mac OS X/i)) {
                return true;
            }
            return false;

        },


        // only use these internally
        _isiPhone: navigator.userAgent.match(/iPhone/i),

        _isiPod: navigator.userAgent.match(/iPod/i),

        _isiPad: navigator.userAgent.match(/iPad/i),

        _isAndroid: function () {
            return  this.getMobileUserAgentData().os.toLowerCase() === 'android';
        },

        _isChrome: function () {
            return navigator.userAgent.indexOf("Android") >= 0 && navigator.userAgent.indexOf("CrMo") >= 0;
        },

        _isIE: function () {
            return navigator.userAgent.indexOf("Trident") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
        },

        supportsWebGL: function () {
            return !(this._isIE());
        },

        supportsTouch: function () {

            try {
                return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            } catch(e) {
                return false;
            }

        },

        isCordova: function () {
            return typeof cordova !== "undefined";
        },


        isPhone: function() {
            var uaString = navigator.userAgent;
            var mobilePhoneDetect = /iPhone|BlackBerry|IEMobile|Opera Mini/i ;
            var matches = uaString.match(mobilePhoneDetect);
            if (typeof matches !== 'undefined' && matches !== null) {
                return matches.length > 0;
            } else {
                return false;
            }
        },

        supportsLayeredDivs: function() {
            //
            // Older android browsers have a problem with input controls and layered divs
            //
            var uaObject = this.getMobileUserAgentData();
            return !(uaObject.os === 'Android' && !/^[3-9](\.[0-9])*$/.test(uaObject.osVersion));
        },

        supportsFixedPosition: function() {
            // according to modernizer and other sources fixedPositioning
            // is not a feature that can be detected. see:
            // https://github.com/Modernizr/Modernizr/wiki/Undetectables
            // Using browser detection for now. If browser is android and
            // >=3 or ios version is >= 5 we are assuming fixedPosition is
            // supported.
            var uaObject = this.getMobileUserAgentData();
            return ((uaObject.os === 'Android' && /^[3-9](\.[0-9])*$/.test(uaObject.osVersion)) ||
                (uaObject.os === 'iPhone' && /^[5-9]/.test(uaObject.osVersion)) ||
                (uaObject.os !== 'iPhone' && uaObject.os !== 'Android')
                );
        },

        supportsDeviceOrientation: function() {
            return typeof window.DeviceOrientationEvent !== "undefined";
        },

        getMobileUserAgentData: function() {
            //
            // only supporting ios and android at the moment. and only sniffing default browser version
            //
            var uaString = navigator.userAgent;
            var uaObject = {
                os: '',
                osVersion: '',
                browser: '',
                browserVersion: ''
            };
            var agents = [{
                    os: 'iPhone',
                    osVersionRegex: /(?:iPhone OS )([0-9,_]*)(?: like)/,
                    browser: 'WebKit',
                    browserVersionRegex: /(?:AppleWebKit\/)([0-9,.]*)/
                },
                {
                    os: 'Android',
                    osVersionRegex: /(?:Android )([0-9,.]*)/,
                    browser: 'WebKit',
                    browserVersionRegex: /(?:AppleWebKit\/)([0-9,.]*)/
                },
                {
                    os: 'Linux',
                    osVersionRegex: /(?:Android )([0-9,.]*)/,
                    browser: 'Silk',
                    browserVersionRegex: /(?:Silk\/)([0-9._-]+)/
                }
            ];

            for (var i = 0, length = agents.length; i < length; i++) {
                var browser = agents[i];
                if (uaString.indexOf(browser.os) !== -1) {
                    uaObject.os = browser.os;
                    if (typeof browser.osVersionRegex !== 'undefined') {
                        uaObject.osVersion = uaString.match(browser.osVersionRegex) || '0.0';
                        uaObject.osVersion = uaObject.osVersion[1].replace('_', '.');
                    }
                    if (uaString.indexOf(browser.browser) !== -1) {
                        uaObject.browser = browser.browser;
                        if (typeof browser.browserVersionRegex !== 'undefined') {
                            uaObject.browserVersion = uaString.match(browser.browserVersionRegex)[1].replace('_', '.');
                        }
                    }
                    break;
                }
            }

            return uaObject;
        },

        _isOldAndroid: function() {

            var minMajorVersion = 4,
                minMinorVersion = 2,
                uaObject = this.getMobileUserAgentData(),
                version = uaObject.osVersion.split('.'),
                majorVersion = 0,
                minorVersion = 0,
                isOld = false;
            if ((uaObject.os.toLowerCase() === 'android' || uaObject.os.toLowerCase() === 'linux') &&
                version.length > 1) {

                majorVersion = version[0];
                minorVersion = version[1];
                if((majorVersion < minMajorVersion) ||
                    (majorVersion == minMajorVersion && minorVersion <= minMinorVersion)) {
                    isOld = true;
                }
            }

            return isOld;

        },

        getResStepsDown: function(resClassIndex, stepDownResClassAggressively) {


            var steps = 0;

            /**
             * Detect devices which may have some problems with large textures.
             */
            if(!PIXI.canUseNewCanvasBlendModes()) {
                Debug.log('Lowering resClass because this device does not support canvas blends.');
                steps ++;
            } else if(stepDownResClassAggressively && this.isPhone()) {
                Debug.log('Lowering resClass because this is a phone.');
                steps ++;
            } else if(stepDownResClassAggressively && this._isiPad && resClassIndex >= 3) {
                Debug.log('Lowering resClass because this is an ipad that can\'t handle big textures.');
                steps ++;
            }

            /**
             * Detect devices that really need help and lower res class again.
             */
            if(this._isOldAndroid()) {
                Debug.log('Lowering resClass because this is an older android device.');
                steps ++;
            }

            /**
             * Detect devices that really need tons and tons of help and lower res class again.
             */
            if(this._isOldAndroid() && resClassIndex >= 3) {
                Debug.log('Lowering resClass because this is an older android device and it is enormous.');
                steps ++;
            }

            if(stepDownResClassAggressively && steps == 0) {
                steps = 1;
            }

            return steps;
        }

    };

    return Platform;

});
