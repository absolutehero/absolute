/**
 * Created by craig on 10/3/13.
 */
define(['absolute/coords'], function (Coords) {

    var layoutMap = null;

    return {

        setLayoutMap: function (map) {
            layoutMap = map;
        },

        layout: function (sprite, parent, id) {
            if (typeof layoutMap[parent] !== "undefined" && typeof layoutMap[parent][id] !== "undefined") {
                var x = layoutMap[parent][id].x || 0,
                    y = layoutMap[parent][id].y || 0;

                sprite.position.x = Coords.x(x);
                sprite.position.y = Coords.y(y);
            }
        }

    }
});