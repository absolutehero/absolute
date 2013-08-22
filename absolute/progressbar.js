/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 6:26 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi'], function(PIXI) {

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
    };

    return ProgressBar;
});