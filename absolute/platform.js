/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 4/23/13
 * Time: 5:10 PM
 * To change this template use File | Settings | File Templates.
 */
define (['absolute/screenmetrics'], function (ScreenMetrics) {

    var Platform = {

        artPathPrefix: 'art',

        soundPathPrefix: 'sound',

        maxWidth: window.innerWidth,

        maxHeight: window.innerHeight,

        devicePixelRatio: window.devicePixelRatio || 1,

        resClass: "",

        resScale: 0,

        documentRoot: null,

        getDocumentRoot: function () {
            if (this.documentRoot === null) {
                var i = window.location.href.indexOf('/index.html');
                this.documentRoot = window.location.href.substring(0, i);
            }
            return this.documentRoot;
        },

        getResScale: function() {
            return ScreenMetrics.getResScale();
        },

        getResClass: function() {

            if (this.resClass !== '')
                return this.resClass;

            this.resClass = ScreenMetrics.getResClass();

            return this.resClass;
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

        isCrapGraphics: function() {
            if( navigator.userAgent.indexOf("Android") >= 0 || navigator.userAgent.indexOf("Silk") >= 0)
            {
                return true;
            }
            return false;
        },

        // only use these internally
        _isiPhone: navigator.userAgent.match(/iPhone/i),

        _isiPod: navigator.userAgent.match(/iPod/i),

        _isiPad: navigator.userAgent.match(/iPad/i),

        _isAndroid: function () {
            return navigator.userAgent.indexOf("Android") >= 0 || navigator.userAgent.indexOf("Silk") >= 0;
        },

        _isChrome: function () {
            return navigator.userAgent.indexOf("Android") >= 0 && navigator.userAgent.indexOf("CrMo") >= 0;
        },

        supportsTouch: function () {
           return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
        }

    };

    return Platform;

});
