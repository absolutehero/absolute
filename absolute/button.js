/**
 * User: craig
 * Date: 3/18/13
 * Time: 9:17 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['pixi', 'absolute/coords', 'absolute/audiomanager', 'absolute/platform', 'absolute/spriteutils', 'absolute/threeslice', 'lodash'], function (PIXI, Coords, AudioManager, Platform, SpriteUtils, ThreeSlice, _) {

    var Button = function(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions) {
        this._initButton(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions);
    };

    Button.constructor = Button;
    Button.prototype = Object.create(PIXI.Sprite.prototype);

    Button.prototype._initButton = function(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions) {

        this.replaceOnHover = !!replaceOnHover;
        useTap = typeof useTap !== 'undefined' ? useTap : false;

        if (!this.replaceOnHover) {
            this.replaceOnHover = true;
        }

        if (threeSliceOptions && typeof threeSliceOptions === 'object' ) {
            this.container = new PIXI.DisplayObjectContainer();
            this.texture = this._createThreeSliceImage(threeSliceOptions);
            defaultImage = this.texture;
        }

        PIXI.Sprite.call(this, defaultImage);

        this.active = true;
        this.action = action;

        this.images = {};
        this.defaultImage = defaultImage;
        if(typeof hoverImage !== 'undefined' && hoverImage !== null && hoverImage !== defaultImage) {
            this.hoverImage = hoverImage;
        } else {
            this.hoverImage = SpriteUtils.brightness(this, 0.2);
        }

        var container = new PIXI.DisplayObjectContainer(),
            tmpDisabled = new PIXI.Sprite(SpriteUtils.greyscale(this, 0.5)),
            tmpBase = new PIXI.Sprite(this.defaultImage);

        tmpDisabled.alpha = 0.8;
        container.addChild(tmpBase);
        container.addChild(tmpDisabled);
        this.disabledTexture = container.generateTexture();

        this.buttonMode = true;
        this.setInteractive(true);

        this.startPos = new PIXI.Point();
        this.moveThreshold = Coords.x(5);
        this.down = false;

        var self = this;

        this.triggerAction = function() {
            self.setTexture(self.defaultImage);
            self.doAction();
        };

        if (Platform.supportsTouch()) {

            if(useTap) {
                this.touchstart = function(evt) {
                    this.clickCanceled = false;
                    this.startPos = evt.global.clone();
                    this.down = true;
                    this.setTexture(this.hoverImage);
                }.bind(this);

                this.touchmove = function(evt) {
                    if (this.down) {
                        if (Math.abs(this.startPos.x - evt.global.x) > this.moveThreshold || Math.abs(this.startPos.y - evt.global.y) > this.moveThreshold) {
                            this.clickCanceled = true;
                            this.setTexture(this.defaultImage);
                        }
                    }
                }.bind(this);

                this.touchend = function(evt) {
                    // don't trigger if the cursor moved (we are dragging)
                    if (!this.clickCanceled) {
                        this.triggerAction();
                    }
                    this.clickCancelled = false;
                    this.down = false;
                    this.setTexture(this.defaultImage);
                }.bind(this);

            } else {
                this.touchstart = function(evt) {
                    this.triggerAction();
                };
            }

            // Support mouse on laptops/desktops that have touch displays
            if(Platform._isWindows() || Platform._isMac()) {
                this.bindMouseEvents();
            }

        }
        else {
            this.bindMouseEvents();
        }
    };

    Button.prototype.setInteractive = function (value) {
        this.interactive = value;
    };

    Button.prototype.bindMouseEvents = function() {

        this.mouseover = function(evt) {
            this.setTexture(this.hoverImage);
        };
        this.mouseout = function(evt) {
            this.setTexture(this.defaultImage);
        };

        this.mousedown = function(evt) {
            this.clickCanceled = false;
            this.startPos = evt.global.clone();
            this.down = true;
        }.bind(this);

        this.mousemove = function(evt) {
            if (this.down) {
                if (Math.abs(this.startPos.x - evt.global.x) > this.moveThreshold || Math.abs(this.startPos.y - evt.global.y) > this.moveThreshold) {
                    this.clickCanceled = true;
                }
            }
        }.bind(this);

        this.mouseup = function(evt) {
            // don't trigger if the cursor moved (we are dragging)
            if (!this.clickCanceled) {
                this.triggerAction();
            }
            this.clickCancelled = false;
            this.down = false;
        }.bind(this);
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

    Button.prototype.disable = function (show) {
        if (show) {
            this.setActive(false);
        }
        else {
            this.active = false;
            this.interactive = false;
        }
    };

    Button.prototype.enable = function () {
        this.setActive(true);
    };

    Button.prototype.updateHover = function(texture) {
        this.defaultImage = texture;
        this.hoverImage = SpriteUtils.brightness(this, 0.2);

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

    Button.prototype._createThreeSliceImage = function(options) {

        this.threeSlice = new ThreeSlice(options);

        return this.threeSlice.generateTexture();
    };

    Button.prototype.destroy = function() {
        if (this.threeSlice) {
           this.threeSlice.destroy();
        }
    };

    return Button;

});