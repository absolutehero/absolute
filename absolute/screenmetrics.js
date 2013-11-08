/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 6/8/13
 * Time: 2:00 PM
 * To change this template use File | Settings | File Templates.
 */
define(['absolute/debug', 'absolute/platform'], function (Debug, Platform) {

    var ScreenMetrics = {

        kDefaultWidth: 1536,
        kDefaultHeight: 2008,

        refresh: function() {
            this.devicePixelRatio = window.devicePixelRatio || 1;
            this.screenWidth = screen.width;
            this.screenHeight = screen.height;
            this.innerWidth = window.innerWidth;
            this.innerHeight = window.innerHeight;
            this.outerWidth = window.outerWidth;
            this.outerHeight = window.outerHeight;
        },

        isPortrait: function() {
            if (this.innerWidth < this.innerHeight) {
                return true;
            }

            return false;
        },

        getWidth: function() {
            //
            var w = document.documentElement.clientWidth,
                h = document.documentElement.clientHeight;

            if (this.isPortrait()) {
                return w;
            }
            else {
                if (w < h) {
                    return w;
                }
                else {
                    if (w === 1280) {
                        return 800; // this is a hack to fix Chrome on Galaxy Tab 2, returns 752!?!
                    }
                    if (this._isAndroid()) {
                        return Math.max(screen.height, h);
                    }
                    else {
                        return Math.max(screen.width, h);
                    }
                }
            }
        },

        getHeight: function() {
            var h;
            if (this.isPortrait()) {
                h = this.innerHeight;
            }
            else {
                if (this.screenWidth < this.screenHeight)
                    h = (this.screenHeight) - (this.screenWidth - this.innerHeight);
                else
                    h = (this.screenWidth) - (this.screenHeight - this.innerHeight);
            }

            if (navigator.userAgent.match(/iPhone/i)) {
                h -= 16;
            }

            return h;
        },

        getScaledViewportWidth: function() {
            return this.getWidth() / this.getViewportScale();
        },

        getScaledViewportHeight: function() {
            return this.getHeight() / this.getViewportScale();
        },

        getScaledContentWidth: function() {
            return this.getContentWidth() * this.getViewportScale();
        },

        getScaledContentHeight: function() {
            return this.getContentHeight() * this.getViewportScale();
        },

        getContentWidth: function() {
            return this.kDefaultWidth * this.getResScale() / this.devicePixelRatio;
        },

        getContentHeight: function() {
            return this.kDefaultHeight * this.getResScale() / this.devicePixelRatio;
        },

        getViewportScale: function() {
            var sx = this.getWidth() / this.getContentWidth();
            var sy = this.getHeight() / this.getContentHeight();
            return Math.min(sx, sy);
        },

        getResClass: function() {
            var width = this.getWidth() * this.devicePixelRatio;
            var twidth = this.kDefaultWidth - 10;

            if (!this.isPortrait()) {
                width = this.getHeight() * this.devicePixelRatio;
                twidth = this.kDefaultHeight - 10;
            }

            var resClass = "";

            if (width === 1080) {
                resClass = "r1080";
            }
            if (width === 640) {
                resClass = "r640";
            }
            if (width >= (twidth * 0.75)) {
                resClass = "r4_5";
            }
            else if (width >= (twidth * 0.5)) {
                resClass = "r4";
            }
            else if (width >= (twidth * 0.4)) {
                resClass = "r3";
            }
            else if (width >= (twidth * 0.3)) {
                resClass = "r2_5";
            }
            else {
                resClass = "r2";
            }

            // force lower res class on Android 4.0.4 to get around canvas rendering
            // bug described here:
            // http://www.photonstorm.com/html5/solving-black-screens-and-corrupted-graphics-in-samsung-s3-html5-games
            if (navigator.userAgent.indexOf("Android 4.0.4") >= 0) {
                if (resClass != "r1" && resClass != "r2") {
                    resClass = "r2_5";
                }
            }

            return resClass;
        },

        getResScale: function() {
            switch (this.getResClass()) {
                case 'r1': return 0.2;
                case 'r2': return 0.3;
                case 'r2_5': return 0.4;
                case 'r3': return 0.5;
                case 'r4': return 0.75;
                case 'r4_5': return 1;
                case 'r1080': return 0.703125;
                case 'r640': return 0.416667;
                default: return 1;
            }
        },

        getScaleX: function() {
            return this.getWidth() * this.devicePixelRatio / (this.kDefaultWidth * this.getResScale());
        },

        getScaleY: function() {
            return this.getHeight() * this.devicePixelRatio / (this.kDefaultHeight * this.getResScale());
        },

        log: function() {
            Debug.log('devicePixelRatio ' + this.devicePixelRatio);
            Debug.log('screenWidth ' + this.screenWidth);
            Debug.log('screenHeight ' + this.screenHeight);
            Debug.log('innerWidth ' + this.innerWidth);
            Debug.log('innerHeight ' + this.innerHeight);
            Debug.log('outerWidth ' + this.outerWidth);
            Debug.log('outerHeight ' + this.outerHeight);
            Debug.log('isPortrait() ' + this.isPortrait());
            Debug.log('getWidth() ' + this.getWidth());
            Debug.log('getHeight() ' + this.getHeight());
            Debug.log('getResClass() ' + this.getResClass());
            Debug.log('getResScale() ' + this.getResScale());
            Debug.log('getContentWidth() ' + this.getContentWidth());
            Debug.log('getContentHeight() ' + this.getContentHeight());
            Debug.log('getViewportScale() ' + this.getViewportScale());
            Debug.log('getScaledContentWidth ' + this.getScaledContentWidth());
            Debug.log('getScaledContentHeight ' + this.getScaledContentHeight());
            Debug.log('getScaledViewportWidth ' + this.getScaledViewportWidth());
            Debug.log('getScaledViewportHeight ' + this.getScaledViewportHeight());
        },

        getScreenParams: function() {
            return 'devicePixelRatio=' + this.devicePixelRatio + '&' +
                'screen.width=' + screen.width + '&' +
                'screen.height=' + screen.height + '&' +
                'window.innerWidth=' + window.innerWidth + '&' +
                'window.innerHeight=' + window.innerHeight + '&' +
                'window.outerWidth=' + window.outerWidth + '&' +
                'window.outerHeight=' + window.outerHeight + '&' +
                'document.documentElement.clientWidth=' + document.documentElement.clientWidth + '&' +
                'document.documentElement.clientHeight=' + document.documentElement.clientHeight + '&' +
                'resClass=' + this.getResClass() + '&' +
                'resScale=' + this.getResScale();
        },

        _isAndroid: function () {
            return navigator.userAgent.indexOf("Android") >= 0 || navigator.userAgent.indexOf("Silk") >= 0;
        }
    };

    return ScreenMetrics;
});
