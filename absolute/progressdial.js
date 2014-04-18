/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 6:26 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi'], function(PIXI) {

    var ProgressDial = function(frameImage, fillImage) {
        this._initProgressDial(frameImage, fillImage);
    };

    ProgressDial.constructor = ProgressDial;
    ProgressDial.prototype = Object.create(PIXI.Sprite.prototype);

    ProgressDial.prototype._initProgressDial = function(frameImage, fillImage) {

        PIXI.Sprite.call(this, frameImage);

        this.fillSprite = new PIXI.Sprite(fillImage);
        this.previousRotation = (-180) * Math.PI / 180;

        this.fillMask = new PIXI.Graphics();
        this.fillMask.beginFill();
        this.fillMask.drawRect(-this.fillSprite.width * 1.1 / 2, -this.fillSprite.height * 1.1, this.fillSprite.width * 1.1, this.fillSprite.height * 1.1);
        this.fillMask.position.x = this.fillSprite.width / 2;
        this.fillMask.position.y = this.fillSprite.height;
        this.fillMask.endFill();
        this.addChild(this.fillMask);

        this.fillSprite.mask = this.fillMask;
        this.addChild(this.fillSprite);

    };

    ProgressDial.prototype.setProgress = function (percent, tween, tweenCallback) {

        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            percent = 1;
        }

        var targetRotation = (-180 + (percent * 180)) * Math.PI / 180;

        if(tween) {

            var self = this,
                maskTween = new TWEEN.Tween({ rotation: this.previousRotation })
                    .to({ rotation: targetRotation }, 500)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(function () {

                        self.fillMask.rotation = this.rotation;
                        self.previousRotation = this.rotation;

                    })
                    .onComplete(function () {
                        if(typeof tweenCallback === 'function') {
                            tweenCallback();
                        }
                    })
                    .start();

        } else  {
            this.fillMask.rotation = targetRotation;
        }
    };

    return ProgressDial;
});
