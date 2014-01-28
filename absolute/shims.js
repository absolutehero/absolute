/**
 * This is a dumping ground for browser fixes and shims.
 */
define(function() {

    // Some versions of V8 on ARM (like the one in the stock Android 4 browser) are affected by
    // this nasty bug: https://code.google.com/p/v8/issues/detail?id=2234
    //
    // So, hack around it. This doesn't affect Android 2. Hopefully 5 will use an updated V8
    // with the real fix.

    if (window.navigator.userAgent.indexOf("Linux; U; Android 4") >= 0) {

        var sin = Math.sin, cos = Math.cos;
        Math.sin = function (x) {
            return (x == 0) ? 0 : sin(x);
        };
        Math.cos = function (x) {
            return (x == 0) ? 1 : cos(x);
        }
    }


});