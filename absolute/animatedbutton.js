/** 
 * Created by lisawick on 4/24/14.
 */
define(['pixi','absolute/button', 'lodash', 'absolute/screenmetrics', 'absolute/platform'],
    function (PIXI, Button, _, ScreenMetrics, Platform) {

        var AnimatedButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions, muteSound) {
            this._initAnimatedButton(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions, muteSound);
        };

        AnimatedButton.constructor = AnimatedButton;
        AnimatedButton.prototype = Object.create(Button.prototype);

        AnimatedButton.prototype._initAnimatedButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions, muteSound) {

            Button.call(this, defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions, muteSound);

            if (!Platform.supportsTouch()) {
                this.mouseover = function(evt) {
                    this.setTexture(this.hoverImage);
                    this.defaultY = this.position.y;
                    this.position.y = this.defaultY + 2;
                };
                this.mouseout = function(evt) {
                    this.setTexture(this.defaultImage);
                    this.position.y = this.defaultY;
                };
            }


        };

        return AnimatedButton;

    });