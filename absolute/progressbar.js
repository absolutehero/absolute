/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 6:26 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi', 'absolute/coords'], function(PIXI, Coords) {

    var ProgressBar = function(frameImage, fillImage, start, end) {
        this._initProgressBar(frameImage, fillImage, start, end);
    };

    ProgressBar.constructor = ProgressBar;
    ProgressBar.prototype = Object.create(PIXI.Sprite.prototype);

    ProgressBar.prototype._initProgressBar = function(frameImage, fillImage, start, end) {

        PIXI.Sprite.call(this, frameImage);

        this.fillSprite = new PIXI.Sprite(fillImage);

        if (start) {
            this.start = start;
        }
        else {
            this.start = 0;
        }
        if (end) {
            this.end = end;
        }
        else {
            this.end = this.fillSprite.texture.frame.width;
        }

        var frame = this.fillSprite.texture.frame;
        frame.width = 1;
        this.fillSprite.texture.setFrame(frame);
        this.addChild(this.fillSprite);
    };

    ProgressBar.prototype.setProgress = function (percent) {
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }

        var frame = this.fillSprite.texture.frame;
        var width = this.end - this.start;
        frame.width = this.start + width * percent;
        if (frame.width <= 1) {
            frame.width = 1;
        }
        this.fillSprite.texture.setFrame(frame);
        if (this.waitContainer) {
            this.waitContainer.mask = null;
            this.removeChild(this.waitContainer);
            this.waitContainer = null;
        }
    };

    ProgressBar.prototype.showWaiting = function (waitImage) {
        this.waitImage = waitImage;
        if (this.waitImage) {
            this.setProgress(100);
            this.waitContainer = new PIXI.DisplayObjectContainer();

            this.waitSprites = [];
            for (var i = 0; i < 11; i += 1) {
                this.waitSprites.push(new PIXI.Sprite(this.waitImage));
                this.waitSprites[i].position.x = i * this.waitSprites[i].width;
                this.waitContainer.addChild(this.waitSprites[i]);
            }
            this.addChild(this.waitContainer);


            var mask = new PIXI.Graphics();
            mask.beginFill();
            mask.drawRect(Coords.x(50), 0, this.width - Coords.x(100), this.height);
            mask.endFill();
            this.waitContainer.addChild(mask);
            this.waitContainer.mask = mask;
        }
    };

    ProgressBar.prototype.updateWaiting = function () {
        for (var i = 0; i < 11; i += 1) {
            this.waitSprites[i].position.x += Coords.x(4);
        }
        if (this.waitSprites[10].position.x > this.width) {
            this.waitSprites[10].position.x = this.waitSprites[0].position.x - this.waitSprites[10].width;
            this.waitSprites.unshift(this.waitSprites.pop());
        }
    };

    return ProgressBar;
});