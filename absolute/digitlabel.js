/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/5/13
 * Time: 1:24 PM
 * To change this template use File | Settings | File Templates.
 */
define (['pixi', 'absolute/digitsprite'], function (PIXI, DigitSprite) {

    var DigitLabel = function(maxDigits, large, spriteBase) {
        this.initDigitLabel(maxDigits, large, spriteBase);
    };

    DigitLabel.constructor = DigitLabel;
    DigitLabel.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);


    DigitLabel.prototype.initDigitLabel = function(maxDigits, scale, spriteBase) {

        PIXI.DisplayObjectContainer.call(this);

        spriteBase = spriteBase || "number_large";

        scale = scale || 1.0;

        this.text = '';

        this.numDigits = maxDigits || 8;
        this.numCommas = Math.ceil((this.numDigits / 3) - 1);
        this.numSprites = this.numDigits + this.numCommas;

        this.sprites = [];

        for (var i = 0; i < this.numSprites; ++i) {
            var s =  new DigitSprite(spriteBase);
            s.scale.x = s.scale.y = scale;
            this.sprites.push(s);
            this.addChild(s);
        }

        this.layout();
    };

    DigitLabel.prototype.getText = function() {
        return this.text;
    };

    DigitLabel.prototype.setText = function(t) {
        this.text = t;
        this.layout();
    };

    DigitLabel.prototype.layout = function() {
        var xOffset = 0;

        for (var j = 0; j < this.sprites.length; j++) {
            this.sprites[j].visible = false;
        }

        if (this.text.length > 0) {


            for (var i = 0, l = this.text.length; i < l; ++i) {
                this.sprites[i].visible = true;
                this.sprites[i].setDigit(this.text[i]);
                this.sprites[i].position.x = xOffset;
                xOffset += this.sprites[i].getDigitWidth();
            }
        }
        this.width = xOffset;
        this.height = this.sprites[0].height;
    };

    return DigitLabel;
});