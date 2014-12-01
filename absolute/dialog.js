define(['pixi', 'absolute/uibuilder', 'absolute/assetmap', 'absolute/coords', 'absolute/screen', 'absolute/debug', 'lodash', 'absolute/button', 'absolute/audiomanager', 'absolute/nineslice'],

    function(PIXI, UIBuilder, _a, Coords, Screen, Debug, _, Button, AudioManager, NineSlice) {

        var Dialog = function(ui, options) {

            var defaultOptions = {
                'width': '80%',
                'height':'70%',
                'x': null,
                'y':null,
                'landscapeX': null,
                'landscapeY': null,
                'portraitX' : null,
                'portraitY' : null,
                'name': 'default',
                'images': {
                    'topLeft': _a("dialogNineSlice.topLeft"),
                    'topCenter':_a("dialogNineSlice.topCenter"),
                    'topRight':_a("dialogNineSlice.topRight"),
                    'topRight_closeBackground': _a("dialogNineSlice.topRight_closeBackground"),
                    'middleLeft':_a("dialogNineSlice.middleLeft"),
                    'middleCenter':_a("dialogNineSlice.middleCenter"),
                    'middleRight':_a("dialogNineSlice.middleRight"),
                    'bottomLeft':_a("dialogNineSlice.bottomLeft"),
                    'bottomCenter':_a("dialogNineSlice.bottomCenter"),
                    'bottomRight':_a("dialogNineSlice.bottomRight"),
                    'close': _a("dialogNineSlice.close")
                },
                closeButtonPosition: null, // set to {x: 0, y:0} to customize
                'fillOpacity': 0.95,
                'content': '',
                'displayCloseButton': true,
                'callbacks': {
                    'onClose': null
                },
                'audio' : {
                    'close': '',
                    'open': 'show_details_window'
                },
                'tween': {
                    'type': 'none',
                    'onClose': false
                },
                'buttons': [],
                'buttonSpacing': Coords.x(20),
                'layout': '',
                'backgroundAlpha': 0.5
            };

            this._initDialog(ui, _.extend(defaultOptions, options));
        };

        Dialog.prototype = Object.create(Screen.prototype);

        Dialog.prototype._initDialog = function(ui, options) {

            Screen.call(this);

            this.ui = ui;
            this.options = options;
            this.cachedContent = this.options.content;

            this.isOpen = false;

            this.container = new PIXI.DisplayObjectContainer();

            this._setSize();
            this._setPosition();
            this._createBackground();
            if (this.options.displayCloseButton) {
                this._createCloseButton();
            }
            if (this.options.buttons.length > 0) {
                this.addButtons(this.options.buttons, this.options.buttonSpacing);
            }
            this._setContent(this.options.content);

            this.addChild(this.container);

        };

        Dialog.prototype.open = function(closeCallback, openCompleteCallback) {

            if(!this.nineSlice || this.nineSlice === null) {
                this._createBackground();
            }


            if(typeof closeCallback === 'function') {
                this.options.callbacks.onClose = closeCallback;
            }

            if(this.options.audio.open && this.options.audio.open !== '') {
                AudioManager.playSound(this.options.audio.open);
            }

            if (this.options.tween.type !== 'none') {
                this.tweenIn();
            } else {
                this.onOpenComplete();
            }

            this.ui.showModal(this, this.options.backgroundAlpha);

            this.isOpen = true;

        };

        Dialog.prototype.tweenIn = function() {
            var self = this,
                endX = this.position.x;

            this.position.x = this.ui.width;
            new TWEEN.Tween({ x: this.position.x })
                .to({x: endX }, 500)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    self.position.x = this.x;
                })
                .onComplete(function () {
                    self.onOpenComplete();
                })
                .start();
        };

        // Override this
        Dialog.prototype.onOpenComplete = function() {};

        Dialog.prototype.close = function(onCloseComplete) {

            if(this.options.audio.close && this.options.audio.close !== '') {
                AudioManager.playSound(this.options.audio.close);
            }

            if (this.options.tween.onClose) {
                var self = this,
                    endX = this.ui.width;

                new TWEEN.Tween({ x: this.position.x })
                    .to({x: endX }, 500)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .onUpdate(function () {
                        self.position.x = this.x;
                    })
                    .onComplete(function () {
                        self.ui.hideModal(this);
                        self.destroy();
                        if(onCloseComplete) {
                            onCloseComplete();
                        }
                    })
                    .start();

            } else {
                this.destroy();
                this.ui.hideModal(this);
            }



            this.isOpen = false;

        };

        Dialog.prototype._setSize = function() {

            function getPercentageSize(canvasWidth, percentage) {
                var convertedPercentage = parseInt(percentage.slice( 0, percentage.length - 1)) / 100;
                return Math.round(canvasWidth * convertedPercentage);
            }

            // override width and height if a layout config exists
            if (this.options.layout) {
                var layoutConfig = UIBuilder.getConfigData(this.options.layout);
                if (layoutConfig) {
                    if (layoutConfig.width) {
                        this.options.width = Coords.x(layoutConfig.width);
                    }
                    if (layoutConfig.height) {
                        this.options.height = Coords.y(layoutConfig.height);
                    }
                }
            } else {
                if(typeof this.options.width === 'string' && this.options.width.indexOf('%') > -1) {
                    this.options.width = getPercentageSize(this.ui.width, this.options.width);
                }
                if(typeof this.options.height === 'string' && this.options.height.indexOf('%') > -1) {
                    this.options.height = getPercentageSize(this.ui.height, this.options.height);
                }
            }
        };

        Dialog.prototype.setLandscapePositions = function(options) {
            if (typeof options.x === 'number') {
                this.options.landscapeX = Math.round(options.x);
            }
            if (typeof options.y === 'number') {
                this.options.landscapeY = Math.round(options.y);
            }
        };

        Dialog.prototype.setPortraitPositions = function(options) {
            if (typeof options.x === 'number') {
                this.options.portraitX = Math.round(options.x);
            }
            if (typeof options.y === 'number') {
                this.options.portraitY = Math.round(options.y);
            }
        };

        Dialog.prototype._setPosition = function(isPortrait) {

            if (typeof isPortrait !== 'undefined') {
                if (isPortrait) {
                    if(typeof this.options.portraitX === 'undefined' || this.options.portraitX === null) {
                        this._setStandardX();
                    } else {
                        this.position.x = Math.round(this.options.portraitX);
                    }

                    if(typeof this.options.portraitY === 'undefined' || this.options.portraitY === null) {
                        this._setStandardY();
                    } else {
                        this.position.y = Math.round(this.options.portraitY);
                    }
                } else {
                    if(typeof this.options.landscapeX == 'undefined' || this.options.landscapeX === null) {
                        this._setStandardX();
                    } else {
                        this.position.x = Math.round(this.options.landscapeX);
                    }

                    if(typeof this.options.landscapeY == 'undefined' || this.options.landscapeY === null) {
                        this._setStandardY();
                    } else {
                        this.position.y = Math.round(this.options.landscapeY);
                    }
                }
            } else {
                this._setStandardX();
                this._setStandardY();
            }
        };

        Dialog.prototype._setStandardX = function() {
            if(this.options.x === null) {
                this.position.x = Math.round((this.ui.width - this.options.width ) / 2);
            } else {
                this.position.x = Math.round(this.options.x);
            }
        };

        Dialog.prototype._setStandardY = function() {
            if(this.options.y === null) {
                this.position.y = Math.round((this.ui.height - this.options.height ) / 2);
            } else {
                this.position.y = Math.round(this.options.y);
            }
        };

        Dialog.prototype._onClose = function() {
            if(typeof this.options.callbacks.onClose === 'function') {
                this.options.callbacks.onClose(this);
            }

            this.close();

        };

        Dialog.prototype._createCloseButton = function () {

            this.closeButton = new Button(PIXI.Texture.fromFrame(this.options.images.close),
                PIXI.Texture.fromFrame(this.options.images.close), _.bind(this._onClose,this),true);

            this.closeButton.hitArea = new PIXI.Rectangle( -this.closeButton.width/3, -this.closeButton.height/3, this.closeButton.width * 1.6,
                this.closeButton.height * 1.6);

            // if we have a background for the close button, assume the button itself is positioned
            // relative to the top-right corner of the dialog
            if (this.options.images.topRight_closeBackground && !this.options.closeButtonPosition) {
                this.closeButton.position.x = this.options.width - this.closeButton.width;
                this.closeButton.position.y = 0;
            }
            else if(this.options.closeButtonPosition) {
                this.closeButton.position.x = this.options.closeButtonPosition.x;
                this.closeButton.position.y = this.options.closeButtonPosition.y;
            }
            else {
                this.closeButton.position.x = this.options.width - ( this.closeButton.width / 1.5 );
                this.closeButton.position.y = - ( this.closeButton.height / 3 );
            }
            this.container.addChild(this.closeButton);
        };

        Dialog.prototype.addButtons = function (buttons, buttonSpacing) {
            var xOffset = 0,
                maxHeight = 0;

            buttonSpacing = buttonSpacing || 0;

            if (buttons.length > 0) {
                if (this.buttonContainer) {
                    this.removeChild(this.buttonContainer);
                }
                this.buttonContainer = new PIXI.DisplayObjectContainer();

                for (var i = 0; i < buttons.length; i += 1) {
                    var button = buttons[i];
                    button.x = xOffset;
                    this.buttonContainer.addChild(button);
                    xOffset += button.width + buttonSpacing;
                    if (button.height > maxHeight) {
                        maxHeight = button.height;
                    }
                }

                this.buttonContainer.position.x = (this.options.width - (xOffset - buttonSpacing)) / 2;
                this.buttonContainer.position.y = this.options.height - maxHeight;

                this.container.addChild(this.buttonContainer);
            }
        };

        Dialog.prototype._createBackground = function() {

            var images = this.options.images;

            if (this.options.displayCloseButton && images.topRight_closeBackground) {
                images.topRight = images.topRight_closeBackground;
                this.options.images = images;
            }

            if(this.nineSlice) {
                this.nineSlice.destroy(true);
                try {
                    this.container.removeChild(this.nineSlice);
                } catch(e) {}

            }

            this.nineSlice = new NineSlice(this.options);

            this.container.addChildAt(this.nineSlice, 0);

        };

        Dialog.prototype._setContent = function(content) {

            if(typeof content !== 'undefined') {
                try{
                    this.removeChild(this.cachedContent);
                } catch(e) {}

                this.cachedContent = content;
            }

            if(typeof this.cachedContent === 'undefined' || _.isEmpty(this.cachedContent)) {
                return;
            }

            this.container.addChild(this.cachedContent);
            this.container.getChildAt(0).cacheAsBitmap = true; // cache dialog background as bitmap

        };

        Dialog.prototype.resize = function(options, isPortrait) {

            this.updateDialog(options, isPortrait);

        };

        Dialog.prototype.updateDialog = function(options, isPortrait) {

            _.extend(this.options, options);


            try{
                this.removeChild(this.container);
            } catch(e) {

            }

            this.container = new PIXI.DisplayObjectContainer();

            this._setSize();
            this._setPosition(isPortrait);
            this._createBackground();
            if (this.options.displayCloseButton) {
                this._createCloseButton();
            }
            this._setContent(this.options.content);

            this.addChild(this.container);

        };

        Dialog.prototype.resetContent = function(content) {

            this.options.content = content;

            try{
                this.container.removeChild(this.cachedContent);
            } catch(e) {}

            this.cachedContent = content;

            this.container.addChild(this.cachedContent);

        };

        Dialog.prototype.handleOrientationChange = function(isPortrait) {

            //this.ui.hideModal();
            this.updateDialog(this.options, isPortrait);
            //this.ui.showModal(this);

        };

        Object.defineProperty(Dialog.prototype, 'isOpen', {
            get: function() {
                return this.openState;
            },
            set: function(state) {
                this.openState = state;

            }

        });

        Dialog.prototype.destroy = function() {

            if(this.nineSlice) {
                this.container.removeChild(this.nineSlice);
                this.nineSlice.destroy();
                this.nineSlice = null;
            }


        };

        return Dialog;
    }
);