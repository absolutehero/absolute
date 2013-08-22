/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/5/13
 * Time: 12:58 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi'], function (PIXI) {
    "use strict";

    var DigitSprite = function (baseName) {
        this.initDigitSprite(baseName);
    };

    DigitSprite.constructor = DigitSprite;
    DigitSprite.prototype = Object.create(PIXI.Sprite.prototype);

    DigitSprite.prototype.initDigitSprite = function (baseName) {
        var i;

        this.textures = [];

        for (i = 0; i < 10; i += 1) {
            this.textures.push(PIXI.Texture.fromFrame(baseName + '_0' + i + '.png'));
        }

        this.textures.push(PIXI.Texture.fromFrame(baseName + '_colon.png'));

        this.textures.push(PIXI.Texture.fromFrame(baseName + '_comma.png'));

        this.index = 0;
        PIXI.Sprite.call(this, this.textures[0]);
    };

    DigitSprite.prototype.setDigit = function(i) {

        var d = parseInt(i);
        if (d >= 0 && d < 10) {
            this.index = d;
        } else if (i === ':') {
            this.index = 10;
        } else if (i === ',') {
            this.index = 11;
        } else {
            this.index = 0;
        }
        this.setTexture(this.textures[this.index]);
    };

    DigitSprite.prototype.getDigitWidth = function() {
        return this.width;
    };

    return DigitSprite;
});