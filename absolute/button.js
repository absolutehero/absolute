/**
 * User: craig
 * Date: 3/18/13
 * Time: 9:17 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'absolute/snapshot', 'absolute/audiomanager', 'absolute/platform', 'absolute/spriteutils'], function (PIXI, Snapshot, AudioManager, Platform, SpriteUtils) {

    var Button = function(defaultImage, hoverImage, action, replaceOnHover) {
        this._initButton(defaultImage, hoverImage, action, replaceOnHover);
    };

    Button.constructor = Button;
    Button.prototype = Object.create(PIXI.Sprite.prototype);

    Button.prototype._initButton = function(defaultImage, hoverImage, action, replaceOnHover) {
        this.replaceOnHover = !!replaceOnHover;

        if (!this.replaceOnHover) {
            var s = new PIXI.Sprite(defaultImage);
            s.addChild(new PIXI.Sprite(hoverImage));
            var ss = new Snapshot(s);
            hoverImage = ss.getSnapshot();
            this.replaceOnHover = true;
        }

        PIXI.Sprite.call(this, defaultImage);

        this.active = true;
        this.action = action;

        this.images = {};
        this.defaultImage = defaultImage;
        this.hoverImage = hoverImage;
        this.disabledImage = SpriteUtils.overlay(this, 'rgb(0, 0, 0, 0.5)');

        this.buttonMode = true;

        this.setInteractive(true);

        var self = this;

        if (!Platform.supportsTouch()) {
            this.mouseover = function(evt) {
                self.setTexture(self.hoverImage);
            };
        }

        this.mouseout = function(evt) {
            self.setTexture(self.defaultImage);
        };

        var triggerAction = function() {
            console.log(self.parent);
            self.setTexture(self.defaultImage);
            self.doAction();
        };

        if (Platform.supportsTouch()) {

            this.touchstart = function(evt) {

            };

            this.tap = function(evt) {
                triggerAction();
            };

        }
        else {

            this.click = function(evt) {
                triggerAction();
            };

        }
    };

    Button.prototype.doAction = function() {
        if (AudioManager.simulSoundSupport()) {
            AudioManager.playSound('button_click');
        }
        if (this.action) {
            this.action();
        }
    };

    Button.prototype.isActive = function() {
        return this.active;
    };

    Button.prototype.setActive = function(active) {
        this.active = active;
        if (!active) {
            this.setTexture(this.disabledImage);
        }
        else {
            this.setTexture(this.defaultImage);
        }
        this.setInteractive(active);
    };

    Button.prototype.getWidth = function() {
        return this.defaultImage.width;
    };

    Button.prototype.getHeight = function() {
        return this.defaultImage.height;
    };

    return Button;

});