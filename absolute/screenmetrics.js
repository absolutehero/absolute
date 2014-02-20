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
        resClass: "",

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
                    if (Platform._isAndroid()) {
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

        // presorted resolution classes
        resClasses: [
            { id:'r320', resfloor: 0 },
            { id:'r640', resfloor: 320 },
            { id:'r768', resfloor: 640 },
            { id:'r1280', resfloor: 768 },
            { id:'r1536', resfloor: 1280 }
        ],

        getResClass: function() {

            if (this.resClass !== "") {
                return this.resClass;
            }

            var width = this.getWidth() * this.devicePixelRatio,
                resClassIndex = "";

            if (!this.isPortrait()) {
                width = this.getHeight() * this.devicePixelRatio;
            }

            for( var i = this.resClasses.length - 1 ; i > 0 ; i-- ) {
                if(width > this.resClasses[i].resfloor) {
                    resClassIndex = i;
                    break;
                }
            }

            // lower the res for older/low performing devices
            resClassIndex = resClassIndex - Platform.getResStepsDown(resClassIndex);
            if(resClassIndex < 0) {
                resClassIndex = 0;
            }

            this.resClass = this.resClasses[resClassIndex].id;

            return this.resClass;
        },

        getResScale: function() {
            switch (this.getResClass()) {
                case 'r320': return 0.21;
                case 'r640': return 0.42;
                case 'r768': return 0.5;
                case 'r1280': return 0.83;
                case 'r1536': return 1;
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
        }


    };

    return ScreenMetrics;
});
