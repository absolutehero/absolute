/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/30/13
 * Time: 1:35 PM
 * To change this template use File | Settings | File Templates.
 */
define(['tween'], function(TWEEN) {

    var TweenUtils = {

        fadeIn: function (sprites, params, onComplete) {
            this._doTween(sprites, params,  onComplete, TweenUtils._fadeIn);
        },

        _fadeIn: function (sprite, params, onComplete) {

            if(typeof params.delay === 'undefined') {
                params.delay  = 0;
            }

            new TWEEN.Tween({ alpha: sprite.alpha })
                .delay(params.delay)
                .to({ alpha: 1 }, params.duration)
                .easing(TWEEN.Easing.Cubic.In)
                .onUpdate(function () {
                    sprite.alpha = this.alpha;
                })
                .onComplete(function () {
                    onComplete();
                })
                .start();
        },

        fadeOut: function (sprites, params, onComplete) {
            this._doTween(sprites, params,  onComplete, TweenUtils._fadeOut);
        },

        _fadeOut: function (sprite, params, onComplete) {

            if(typeof params.delay === 'undefined') {
                params.delay  = 0;
            }

            new TWEEN.Tween({ alpha: sprite.alpha })
                .delay(params.delay)
                .to({ alpha: 0 }, params.duration)
                .easing(TWEEN.Easing.Cubic.In)
                .onUpdate(function () {
                    sprite.alpha = this.alpha;
                })
                .onComplete(function () {
                    onComplete();
                })
                .start();
        },

        bounceIn: function (sprites, params, onComplete) {
            this._doTween(sprites, params, onComplete, TweenUtils._bounceIn);
        },

        _bounceIn: function (sprite, params, onComplete) {
            new TWEEN.Tween({ scale: sprite.scale.x })
                .to({ scale: 1 }, params.duration)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function () {
                    sprite.scale.x = sprite.scale.y = this.scale;
                })
                .onComplete(function () {
                    onComplete();
                })
                .start();
        },


        _doTween: function (sprites, params, onComplete, tweenFunc) {
            var i,
                l,
                completed = 0,
                multiComplete = function () {
                    completed += 1;
                    if (completed === l) {
                        if (onComplete && typeof onComplete === "function") {
                            onComplete();
                        }
                    }
                };

            if (sprites instanceof Array) {
                l = sprites.length;
                for (i = 0; i < l; i += 1) {
                    tweenFunc(sprites[i], params, multiComplete);
                }
            } else {
                tweenFunc(sprites, params, function () {
                    if (onComplete && typeof onComplete === "function") {
                        onComplete();
                    }
                });
            }
        }

    };

    return TweenUtils;
});