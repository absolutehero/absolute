/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 6/27/13
 * Time: 2:18 PM
 * To change this template use File | Settings | File Templates.
 */

define(['absolute/snapshot','pixi'], function (Snapshot, PIXI) {

    var SpriteUtils = {

        offScreenRenderer: new PIXI.CanvasRenderer(512, 512, null, true),

        brightness: function (sprite, brightness) {
            var i,
                texture = sprite.generateTexture(this.offScreenRenderer),
                imgData =  null;


            if (texture.textureBuffer.context) {
                imgData = texture.textureBuffer.context.getImageData(texture.frame.x, texture.frame.y, texture.frame.width, texture.frame.height);

                var b = brightness * 255 || 255;
                var d = imgData.data;
                for (i = 0; i < d.length; i += 4) {
                    d[i] += b;
                    d[i+1] += b;
                    d[i+2] += b;
                }

                texture.textureBuffer.context.putImageData(imgData, 0, 0);
            }

            return texture;
        },

        greyscale: function (sprite, contrast) {
            var i,
                texture = sprite.generateTexture(this.offScreenRenderer),
                imgData = null;

            if (texture.textureBuffer.context) {
                imgData = texture.textureBuffer.context.getImageData(texture.frame.x, texture.frame.y, texture.frame.width, texture.frame.height);

                var c = contrast || 1;
                var ca = -128 * c + 128;
                var d = imgData.data;
                for (i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var g = d[i+1];
                    var b = d[i+2];
                    // CIE luminance for the RGB
                    // The human eye is bad at seeing red and blue, so we de-emphasize them.
                    var v = (0.2126*r + 0.7152*g + 0.0722*b);
                    v = v * c + ca;
                    d[i] = d[i+1] = d[i+2] = v;
                }

                texture.textureBuffer.context.putImageData(imgData, 0, 0);
            }

            return texture;
        },

        blur: function (sprite) {
            var texture = sprite.generateTexture(),
                imgData =  texture.textureBuffer.context.getImageData(texture.frame.x, texture.frame.y, texture.frame.width, texture.frame.height);

            texture.textureBuffer.context.putImageData(
                this.convolute(
                    imgData,
                    texture.textureBuffer.context,
                    [
                        1/16, 1/16, 1/16, 1/16,
                        1/16, 1/16, 1/16, 1/16,
                        1/16, 1/16, 1/16, 1/16,
                        1/16, 1/16, 1/16, 1/16
                    ]), 0, 0);

            return texture;
        },

        convolute: function(pixels, context, weights, opaque) {
            var side = Math.round(Math.sqrt(weights.length));
            var halfSide = Math.floor(side/2);
            var src = pixels.data;
            var sw = pixels.width;
            var sh = pixels.height;
            // pad output by the convolution matrix
            var w = sw;
            var h = sh;
            var output = context.createImageData(w, h);
            var dst = output.data;
            // go through the destination image pixels
            var alphaFac = opaque ? 1 : 0;
            for (var y=0; y<h; y++) {
                for (var x=0; x<w; x++) {
                    var sy = y;
                    var sx = x;
                    var dstOff = (y*w+x)*4;
                    // calculate the weighed sum of the source image pixels that
                    // fall under the convolution matrix
                    var r=0, g=0, b=0, a=0;
                    for (var cy=0; cy<side; cy++) {
                        for (var cx=0; cx<side; cx++) {
                            var scy = sy + cy - halfSide;
                            var scx = sx + cx - halfSide;
                            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                var srcOff = (scy*sw+scx)*4;
                                var wt = weights[cy*side+cx];
                                r += src[srcOff] * wt;
                                g += src[srcOff+1] * wt;
                                b += src[srcOff+2] * wt;
                                a += src[srcOff+3] * wt;
                            }
                        }
                    }
                    dst[dstOff] = r;
                    dst[dstOff+1] = g;
                    dst[dstOff+2] = b;
                    dst[dstOff+3] = a + alphaFac*(255-a);
                }
            }
            return output;
        }


    };

    return SpriteUtils;
});