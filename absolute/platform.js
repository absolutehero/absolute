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

        _isIOS: function() {
            return /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
        },

        _isFirefox: function () {
            return navigator.userAgent.indexOf("Firefox") >= 0;
        },

        _isWindows: function () {
            return navigator.userAgent.indexOf("Windows NT") >= 0;
        },
        _isOpera: function () {
            var ua = navigator.userAgent.toLowerCase();
            return ua.indexOf("opera") >= 0 || ua.indexOf('opr') >= 0;
        },
        _isMac: function () {
            return navigator.platform.toUpperCase().indexOf('MAC')>=0;
        },
        _isNodeWebkit: function() {
            try {
                return (typeof require('nw.gui') !== "undefined");
            } catch(e) {
                return false;
            }
        },

        supportsWebGL: function () {
            return !(this._isStockAndroid() || this._isIE() || (this._isWindows() && this._isFirefox()));
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

        isCocoonJS: function () {
            return (typeof CocoonJS !== "undefined") && CocoonJS.nativeExtensionObjectAvailable;
        },

        isNativeMobile: function () {
            return Platform.isCordova() || Platform.isCocoonJS();
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

        hasPutImageDataBug: function() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var imageData;
            var pixelArray;

            canvas.width = canvas.height = 1;
            imageData = ctx.createImageData(1, 1);
            pixelArray = imageData.data;

            pixelArray[0] = pixelArray[3] = 128;

            ctx.putImageData(imageData, 0, 0);
            imageData = ctx.getImageData(0, 0, 1, 1);
            pixelArray = imageData.data;

            return (pixelArray[0] === 255);

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

        isSilk: function() {

            if (/\bSilk\b/.test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }

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

        _isStockAndroid: function() {
            return this._isAndroid() && navigator.userAgent.indexOf('Chrome') == -1;
        },

        getResStepsDown: function(resClassIndex, stepDownResClassAggressively, stepDownStockAndroidOnly) {

            var steps = 0;

            /**
             * Only step down if this is the default/stock android browser and return
             */
            if(stepDownStockAndroidOnly) {
                if(this._isStockAndroid()) {
                    steps = 2;
                }
                return steps;
            }

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
                Debug.log('Lowering resClass because this is an ipad device that can\'t handle big textures.');
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

            /**
             * Galaxy Tab 3 10.1 has limited memory it seems, crashes in chrome unless stepped down more
             */
            if(stepDownResClassAggressively && resClassIndex >= 3 && this._isAndroid()) {
                Debug.log('Lowering resClass because this is a hires android device and probably lacks memory.');
                steps = 2;
            }

            if(stepDownResClassAggressively && steps == 0) {
                steps = 1;
            }

            return steps;
        }

    };

    return Platform;

});
