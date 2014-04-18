/**
 * User: craig
 * Date: 3/18/13
 * Time: 9:17 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'absolute/snapshot', 'absolute/audiomanager', 'absolute/platform', 'absolute/spriteutils'], function (PIXI, Snapshot, AudioManager, Platform, SpriteUtils) {

    var Button = function(defaultImage, hoverImage, action, replaceOnHover, useTap) {
        this._initButton(defaultImage, hoverImage, action, replaceOnHover, useTap);
    };

    Button.constructor = Button;
    Button.prototype = Object.create(PIXI.Sprite.prototype);

    Button.prototype._initButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap) {

        this.replaceOnHover = !!replaceOnHover;
        useTap = typeof useTap !== 'undefined' ? useTap : false;

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

        var container = new PIXI.DisplayObjectContainer(),
            tmpDisabled = new PIXI.Sprite(this.defaultImage),
            tmpBase = new PIXI.Sprite(this.defaultImage);

        if(PIXI.canUseNewCanvasBlendModes) {
            tmpDisabled.tint = 0x000000;
            tmpDisabled.blendMode = PIXI.blendModes.SATURATION;
        } else {
            tmpDisabled.tint =  0x7c7c7c;
        }
        container.addChild(tmpBase);
        container.addChild(tmpDisabled);
        this.disabledTexture = container.generateTexture();



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
            self.setTexture(self.defaultImage);
            self.doAction();
        };

        if (Platform.supportsTouch()) {

            if(useTap) {
                this.tap = function(evt) {
                    triggerAction();
                };
            } else {
                this.touchstart = function(evt) {
                    triggerAction();
                };
            }

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

        if(this.active === active) {
            return;
        }

        this.active = active;

        if (!active) {
            this.setTexture(this.disabledTexture);
            this.alpha = 0.5;
        }
        else {
            this.setTexture(this.defaultImage);
            this.alpha = 1;
        }
        this.interactive = active;
    };

    Button.prototype.getWidth = function() {
        return this.defaultImage.width;
    };

    Button.prototype.getHeight = function() {
        return this.defaultImage.height;
    };

    return Button;

});