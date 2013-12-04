/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/27/13
 * Time: 3:25 PM
 * To change this template use File | Settings | File Templates.
 */

define (['absolute/platform'], function(Platform) {
    var Coords = {

        x: function (c) {
            return Math.round(c * Platform.getResScale());
        },

        y: function (c) {
            return Math.round(c * Platform.getResScale());
        },

        offsetX: function (x, p) {
            return p.position.x + x;
        },

        offsetY: function (y, p) {
            return p.position.y + y;
        },

        centerX: function (c, p) {
            return (p.width - c.width) / 2;
        },

        centerY: function (c, p) {
            return (p.height - c.height) / 2;
        }
    };
    return Coords;
});