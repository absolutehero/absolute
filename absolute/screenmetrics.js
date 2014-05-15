/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 6/8/13
 * Time: 2:00 PM
 * To change this template use File | Settings | File Templates.
 */
define(['absolute/debug', 'absolute/platform', 'lodash'], function (Debug, Platform, _) {

    var ScreenMetrics = {

        kDefaultWidth: 1536,
        kDefaultHeight: 2008,
        resClass: "",
        stepDownResClass: false,
        stepDownResClassAggressively: true,

        realWindow:
            (function() {

                var windowRef,
                    isInIframe = (parent !== window);

                if(isInIframe) {
                    try {

                        windowRef= parent.window;

                        var crossOriginTest = windowRef.devicePixelRatio;

                    } catch (e) {
                        // crossOriginTest failure
                        windowRef = window;
                    }
                } else {
                    windowRef = window;
                }


                return windowRef;

            })(),
        realScreen: (function() {

            var screenRef,
                isInIframe = (parent !== window);

            if(isInIframe) {
                try {
                    screenRef = parent.screen;
                } catch (e) {
                    // crossOriginTest failure
                    screenRef = screen;
                }
            } else {
                screenRef = screen;
            }


            return screenRef;

        })(),
        refresh: function() {

            this.devicePixelRatio = this.realWindow.devicePixelRatio || 1;
            this.screenWidth = this.realScreen.width;
            this.screenHeight = this.realScreen.height;
            this.innerWidth = this.realWindow.innerWidth;
            this.innerHeight = this.realWindow.innerHeight;
            this.outerWidth = this.realWindow.outerWidth;
            this.outerHeight = this.realWindow.outerHeight;
            this.clientWidth = document.documentElement.clientWidth;
            this.clientHeight = document.documentElement.clientHeight;

        },

        getMinNonZero: function minNonZero (numbers) {

            return Math.min.apply(null, _.filter(numbers, function(num) {
                return num > 0;
            }));

        },

        isPortrait: function() {

            this.refresh();

            var width = this.getMinNonZero([this.innerWidth, this.screenWidth, this.clientWidth]),
                height = this.getMinNonZero([this.innerHeight, this.screenHeight, this.clientHeight]);

            return width < height;

        },

        getWidth: function(applyPixelRatio) {

            applyPixelRatio = typeof applyPixelRatio !== 'undefined' ? applyPixelRatio : false;

            var w = this.clientWidth,
                h = this.clientHeight;

            if(applyPixelRatio) {
                w = w * this.devicePixelRatio;
                h = h * this.devicePixelRatio;
            }

            if (this.isPortrait() && w > 0) {
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
                        return Math.max(this.realScreen.height, h);
                    }
                    else {
                        var screenWidth = this.realScreen.width;
                        if(applyPixelRatio) {
                            screenWidth = screenWidth * this.devicePixelRatio;
                        }
                        return Math.max(screenWidth, h);
                    }
                }
            }
        },

        getHeight: function(applyPixelRatio) {

            applyPixelRatio = typeof applyPixelRatio !== 'undefined' ? applyPixelRatio : false;

            var h;

            if (this.isPortrait() && this.clientHeight > 0) {
                h = this.clientHeight;
            } else {
                if (this.screenWidth < this.screenHeight)
                    h = (this.screenHeight) - (this.screenWidth - this.innerHeight);
                else
                    h = (this.screenWidth) - (this.screenHeight - this.innerHeight);
            }

            if(applyPixelRatio) {
                h = h * this.devicePixelRatio;
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
            { id:'r1280', resfloor: 768 }

            // Suppressing highest res class -- saves memory, improves perf, fixes scaling issues, no noticeable quality loss
            //,
            // { id:'r1536', resfloor: 1280 }
        ],

        getResClass: function() {

            if (this.resClass !== "") {
                return this.resClass;
            }

            var size = Math.min(this.getHeight(true) , this.getWidth(true)),
                resClassIndex = "";

            for( var i = this.resClasses.length - 1 ; i > 0 ; i-- ) {
                if(size > this.resClasses[i].resfloor) {
                    resClassIndex = i;
                    break;
                }
            }

            // lower the res for older/low performing devices
            if(this.stepDownResClass) {
                resClassIndex = resClassIndex - Platform.getResStepsDown(resClassIndex, this.stepDownResClassAggressively);
                if(resClassIndex < 0) {
                    resClassIndex = 0;
                }
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
                'screen.width=' + this.realScreen.width + '&' +
                'screen.height=' + this.realScreen.height + '&' +
                'window.innerWidth=' + this.realWindow.innerWidth + '&' +
                'window.innerHeight=' + this.realWindow.innerHeight + '&' +
                'window.outerWidth=' + this.realWindow.outerWidth + '&' +
                'window.outerHeight=' + this.realWindow.outerHeight + '&' +
                'document.documentElement.clientWidth=' + document.documentElement.clientWidth + '&' +
                'document.documentElement.clientHeight=' + document.documentElement.clientHeight + '&' +
                'resClass=' + this.getResClass() + '&' +
                'resScale=' + this.getResScale();
        },

        detectOrientationChange: function(callback) {

            this.lastOrienation = this.getOrientation();

            function handleOrientationChange () {

                var currentOrientation = this.getOrientation();

                if(this.lastOrienation !== currentOrientation) {

                    callback(currentOrientation);
                    this.lastOrienation = currentOrientation;

                }

            }

            if(Platform.supportsDeviceOrientation) {

                this.realWindow.addEventListener('deviceorientation', handleOrientationChange.bind(this));

            } else {

                this.realWindow.addEventListener('resize', handleOrientationChange.bind(this));

            }

        },

        getOrientation:  function() {
            this.refresh();
            return this.isPortrait() ? 'portrait' : 'landscape';
        }


    };

    return ScreenMetrics;
});
