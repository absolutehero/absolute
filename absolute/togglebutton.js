/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/14/13
 * Time: 7:09 PM
 * To change this template use File | Settings | File Templates.
 */
define(['pixi', 'absolute/button'], function(PIXI, Button) {

    var ToggleButton = function(baseName, action, enabled, useOverlay) {
        this.initToggleButton(baseName, action, enabled, useOverlay);
    };

    ToggleButton.constructor = ToggleButton;
    ToggleButton.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    ToggleButton.prototype.initToggleButton = function (baseName, action, enabled, useOverlay) {

        this.enabled = !!enabled;
        this.action = action;
        useOverlay = typeof useOverlay !== 'undefined' ? useOverlay : true;

        var enabledOverlayImage = useOverlay ? 'button_overlay.png' : baseName + '_1.png',
            disabledOverlayImage = useOverlay ? 'button_overlay.png' : baseName + 'OFF_1.png';;

        PIXI.DisplayObjectContainer.call(this);

        this.enabledButton = new Button(
            PIXI.Texture.fromFrame(baseName + '_1.png'),
            PIXI.Texture.fromFrame(enabledOverlayImage),
            this.onAction.bind(this)
        );

        this.disabledButton = new Button(
            PIXI.Texture.fromFrame(baseName + 'OFF_1.png'),
            PIXI.Texture.fromFrame(disabledOverlayImage),
            this.onAction.bind(this)
        );

        if (this.enabled) {
            this.addChild(this.enabledButton);
        }
        else {
            this.addChild(this.disabledButton);
        }

    };

    ToggleButton.prototype.onAction = function () {
        this.setEnabled(!this.enabled);

        if (this.action) {
            this.action();
        }
    };

    ToggleButton.prototype.setEnabled = function (enabled) {
        if (enabled !== this.enabled) {
            this.enabled = enabled;

            if (this.enabled) {
                this.removeChild(this.disabledButton);
                this.addChild(this.enabledButton);
            } else {
                this.removeChild(this.enabledButton);
                this.addChild(this.disabledButton);
            }
        }
    };

    return ToggleButton;
});