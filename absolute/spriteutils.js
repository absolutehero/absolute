/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 6/27/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

define(['absolute/snapshot'], function (Snapshot) {

    var SpriteUtils = {

        overlay: function (sprite, color) {
            var i,
                ss = new Snapshot(sprite),
                texture = ss.getSnapshot(),
                context = texture.baseTexture.source.getContext('2d'),
                imgData = context.getImageData(texture.frame.x, texture.frame.y, texture.frame.width, texture.frame.height),
                imgCopy = context.createImageData(texture.frame.width, texture.frame.height);


            var d = imgData.data;
            for (i = 0; i < d.length; i += 4) {
                var r = d[i];
                var g = d[i+1];
                var b = d[i+2];
                // CIE luminance for the RGB
                // The human eye is bad at seeing red and blue, so we de-emphasize them.
                var v = 0.2126*r + 0.7152*g + 0.0722*b;
                d[i] = d[i+1] = d[i+2] = v;
            }


            return PIXI.Texture.fromCanvas(context.canvas);
        }

    };

    return SpriteUtils;
});