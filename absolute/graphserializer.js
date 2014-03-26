/**
 * User: craig
 * Date: 3/25/14
 * Time: 8:42 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'absolute/button'], function (PIXI, Button) {

    var GraphSerializer = {

        serialize: function (dob) {

            var i,
                l,
                output = {
                "position": {
                    "x": dob.position.x,
                    "y": dob.position.y
                }
            };

            if (dob instanceof Button) {
                output.type = "button";
                output.asset = this.lookupTexture(dob);
                output.id = output.asset.substring(0, output.asset.indexOf(".png"));
            }
            else if (dob instanceof PIXI.Sprite) {
                l = dob.children.length;

                output.type = "sprite";
                output.asset = this.lookupTexture(dob);
                output.id = output.asset.substring(0, output.asset.indexOf(".png"));

                output.children = [];
                for (i = 0; i < l; i += 1) {
                    output.children.push(this.serialize(dob.getChildAt(i)));
                }
            }
            else if (dob instanceof PIXI.DisplayObjectContainer) {
                l = dob.children.length;

                output.type = "container";
                output.children = [];

                for (i = 0; i < l; i += 1) {
                    output.children.push(this.serialize(dob.getChildAt(i)));
                }
            }

            return output;
        },

        lookupTexture: function (sprite) {
            var t;

            for (t in PIXI.TextureCache) {
                if (PIXI.TextureCache.hasOwnProperty(t)) {
                    if (PIXI.TextureCache[t] === sprite.texture) {
                        return t;
                    }
                }
            }

            return "";
        }

    };

    return GraphSerializer;
});