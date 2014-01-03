/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:38 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'absolute/button', 'absolute/togglebutton', 'absolute/debug'], function(PIXI, Button, ToggleButton, Debug) {

    var Screen = function() {
        this._initScreen();
    };

    Screen.constructor = Screen;
    Screen.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    Screen.prototype._initScreen = function() {
        PIXI.DisplayObjectContainer.call(this);

        this.background = new PIXI.DisplayObjectContainer();

        /*
         if (Absolute.Platform._isiPad || Absolute.Platform._isiPod || Absolute.Platform._isiPhone) {
         if (Absolute.ScreenMetrics.isPortrait()) {
         if (Absolute.ScreenMetrics.getScaleY() < 1) {
         this.scale.y = Absolute.ScreenMetrics.getScaleY();
         }
         }
         window.addEventListener("orientationchange", function() {
         Absolute.ScreenMetrics.refresh();
         if (Absolute.ScreenMetrics.isPortrait()) {
         if (Absolute.ScreenMetrics.getScaleY() < 1) {
         this.scale.y = Absolute.ScreenMetrics.getScaleY();
         }
         }
         }.bind(this), false);
         }
         */

    };


    Screen.prototype.addButton = function(baseName, x, y, onClick, small) {
        var isSmall = !!small;
        var buttonImage = PIXI.Texture.fromFrame(baseName + '_1.png');

        var overlayImage;
        if (isSmall) {
            overlayImage = PIXI.Texture.fromFrame('button_small_overlay.png');
        } else {
            overlayImage = PIXI.Texture.fromFrame('button_overlay.png');
        }


        var button = new Button(buttonImage, overlayImage,
            function () {
                Debug.log(baseName + ' pressed!');
                onClick();
            }
        );
        button.position.x = x;
        button.position.y = y;
        this.addChild(button);

        return button;
    };

    Screen.prototype.addToggleButton = function (baseName, x, y, onClick, enabled) {
        var button = new ToggleButton(baseName,
            function () {
                Debug.log(baseName + ' pressed!');
                onClick();
            },
            enabled
        );
        button.position.x = x;
        button.position.y = y;
        this.addChild(button);

        return button;
    };

    Screen.prototype.onShow = function () {

    };

    Screen.prototype.onHide = function () {

    };

    Screen.prototype.beforeRender = function() {

    };

    Screen.prototype.afterRender = function() {

    };


    return Screen;
});