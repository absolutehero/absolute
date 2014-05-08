/**
 * Created by lisawick on 4/24/14.
 */
define(['pixi','absolute/textbutton', 'lodash', 'absolute/platform'],
    function (PIXI, TextButton, _, Platform) {

        var AnimatedTextButton = function(action, textStyleOptions, threeSliceOptions) {
            this._initAnimatedTextButton(action, textStyleOptions, threeSliceOptions)
        };

        AnimatedTextButton.constructor = AnimatedTextButton;
        AnimatedTextButton.prototype = Object.create(TextButton.prototype);

        AnimatedTextButton.prototype._initAnimatedTextButton = function(action, textStyleOptions, threeSliceOptions) {
            TextButton.call(this, null, null, action, null, null, textStyleOptions, threeSliceOptions);

            if (!Platform.supportsTouch()) {
                this.mouseover = function (evt) {
                    this.setTexture(this.hoverImage);
                    this.defaultY = this.position.y;
                    this.position.y = this.defaultY + 2;
                };

                this.mouseout = function (evt) {
                    this.setTexture(this.defaultImage);
                    this.position.y = this.defaultY;
                }
            }

        };

        return AnimatedTextButton;
    });