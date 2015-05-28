/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/26/13
 * Time: 3:58 PM
 * To change this template use File | Settings | File Templates.
 */
define(function() {
    var TextUtils = {

        _thousandsSep: ",",

        formatInt: function(n) {
            if (n > 999) {
                return this.formatInt(Math.floor(n / 1000)) + this._thousandsSep + this.zeroPad(n % 1000);
            }
            return n + '';
        },

        zeroPad: function(n) {
            var s = '';
            if (n < 100)
                s += '0';
            if (n < 10)
                s += '0';
            s += n;
            return s;
        },

        wrapText: function  (bitmapText, width) {
            var inText = bitmapText.text,
                l = 0,
                out = [],
                lastSpaceIndex = 0;

            for (var i = 0; i < bitmapText.children.length; i++) {
                if (inText[i] == " ") {
                    lastSpaceIndex = i;
                }
                out.push(inText[i]);
                if (bitmapText.children[i].x - l >= width) {
                    l = bitmapText.children[lastSpaceIndex].x;
                    out[lastSpaceIndex] = "\n";
                }
            }

            return out.join("");
        }
    };
    return TextUtils;
});