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

            var tween = new TWEEN.Tween({ alpha: sprite.alpha })
                .delay(params.delay)
                .to({ alpha: 1 }, params.duration)
                .easing(TWEEN.Easing.Cubic.In)
                .onUpdate(function () {
                    sprite.alpha = this.alpha;
                })
                .onComplete(function () {
                    setTimeout(function () {
                        onComplete();
                        TWEEN.remove(tween);
                    }.bind(this), 0);
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

            var tween = new TWEEN.Tween({ alpha: sprite.alpha })
                .delay(params.delay)
                .to({ alpha: 0 }, params.duration)
                .easing(TWEEN.Easing.Cubic.In)
                .onUpdate(function () {
                    sprite.alpha = this.alpha;
                })
                .onComplete(function () {
                    setTimeout(function () {
                        onComplete();
                        TWEEN.remove(tween);
                    }.bind(this), 0);
                })
                .start();
        },

        bounceIn: function (sprites, params, onComplete) {
            this._doTween(sprites, params, onComplete, TweenUtils._bounceIn);
        },

        _bounceIn: function (sprite, params, onComplete) {
            if (params.endScale === undefined) {
                params.endScale = 1;
            }
            var tween = new TWEEN.Tween({ scale: sprite.scale.x })
                .to({ scale: params.endScale }, params.duration)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function () {
                    sprite.scale.x = sprite.scale.y = this.scale;
                })
                .onComplete(function () {
                    setTimeout(function () {
                        onComplete();
                        TWEEN.remove(tween);
                    }.bind(this), 0);
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
                if (l > 0) {
                    for (i = 0; i < l; i += 1) {
                        tweenFunc(sprites[i], params, multiComplete);
                    }
                }
                else {
                    onComplete();
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