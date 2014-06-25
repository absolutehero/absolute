/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 6:26 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi', 'absolute/coords', 'absolute/tweenutils'], function(PIXI, Coords, TweenUtils) {

    var ProgressBar = function(frameImage, fillImage, start, end, doTween) {
        this._initProgressBar(frameImage, fillImage, start, end, doTween);
    };

    ProgressBar.constructor = ProgressBar;
    ProgressBar.prototype = Object.create(PIXI.Sprite.prototype);

    ProgressBar.prototype._initProgressBar = function(frameImage, fillImage, start, end) {

        PIXI.Sprite.call(this, frameImage);

        this.fillSprite = new PIXI.Sprite(fillImage);
        this.previousWidth = 0;

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

        this.fillMask = new PIXI.Graphics();
        this.fillMask.beginFill(0x0, 0);
        this.fillMask.drawRect(this.start, 0, 0, this.height);
        this.fillMask.endFill();
        this.addChild(this.fillMask);

        this.fillSprite.mask = this.fillMask;
        this.addChild(this.fillSprite);

    };

    ProgressBar.prototype.setProgress = function (percent, tween, tweenCallback, duration) {

        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }

        duration = duration || 500;

        var targetWidth =(this.end - this.start) * percent;

        if(tween) {

            var self = this,
                maskTween = new TWEEN.Tween({ width: this.previousWidth })
                .to({ width: targetWidth }, duration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(function () {

                    self.fillMask.clear();
                    self.fillMask.beginFill(0x0, 0);
                    self.fillMask.drawRect(self.start, 0, this.width, self.height);
                    self.fillMask.endFill();

                    self.previousWidth = this.width;
                    })
                .onComplete(function () {
                    if(typeof tweenCallback === 'function') {
                        tweenCallback();
                    }
                })
                .start();

        } else  {
            this.fillMask.clear();
            this.fillMask.beginFill(0x0, 0);
            this.fillMask.drawRect(this.start, 0, targetWidth, this.height);
            this.fillMask.endFill();
        }

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