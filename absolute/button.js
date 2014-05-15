/**
 * User: craig
 * Date: 3/18/13
 * Time: 9:17 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'absolute/coords', 'absolute/audiomanager', 'absolute/platform', 'absolute/spriteutils'], function (PIXI, Coords, AudioManager, Platform, SpriteUtils) {

    var Button = function(defaultImage, hoverImage, action, replaceOnHover, useTap) {
        this._initButton(defaultImage, hoverImage, action, replaceOnHover, useTap);
    };

    Button.constructor = Button;
    Button.prototype = Object.create(PIXI.Sprite.prototype);

    Button.prototype._initButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap) {

        this.replaceOnHover = !!replaceOnHover;
        useTap = typeof useTap !== 'undefined' ? useTap : false;

        if (!this.replaceOnHover) {
            this.replaceOnHover = true;
        }

        PIXI.Sprite.call(this, defaultImage);

        this.active = true;
        this.action = action;

        this.images = {};
        this.defaultImage = defaultImage;
        this.hoverImage = SpriteUtils.brightness(this, 0.2);

        var container = new PIXI.DisplayObjectContainer(),
            tmpDisabled = new PIXI.Sprite(SpriteUtils.greyscale(this, 0.5)),
            tmpBase = new PIXI.Sprite(this.defaultImage);

        tmpDisabled.alpha = 0.8;
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
            this.mouseout = function(evt) {
                self.setTexture(self.defaultImage);
            };
        }

        var triggerAction = function() {
            self.setTexture(self.defaultImage);
            self.doAction();
        };

        if (Platform.supportsTouch()) {

            if(useTap) {
                this.touchstart = function(evt) {
                    this.clickCanceled = false;
                }.bind(this);

                this.touchmove = function(evt) {
                    this.clickCanceled = true;
                }.bind(this);

                this.touchend = function(evt) {
                    // don't trigger if the cursor moved (we are dragging)
                    if (!this.clickCanceled) {
                        triggerAction();
                    }
                    this.clickCancelled = false;
                }.bind(this);

            } else {
                // remove the mousedown if causes double input on older android
                this.mousedown = this.touchstart = function(evt) {
                    triggerAction();
                };
            }

        }
        else {

            this.mousedown = function(evt) {
                this.clickCanceled = false;
            }.bind(this);

            this.mousemove = function(evt) {
                this.clickCanceled = true;
            }.bind(this);

            this.mouseup = function(evt) {
                // don't trigger if the cursor moved (we are dragging)
                if (!this.clickCanceled) {
                    triggerAction();
                }
                this.clickCancelled = false;
            }.bind(this);

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
        }
        else {
            this.setTexture(this.defaultImage);
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