define(['pixi', 'absolute/assetmap', 'absolute/coords', 'absolute/screen', 'absolute/debug', 'lodash', 'absolute/button', 'absolute/audiomanager', 'absolute/nineslice'],

    function(PIXI, _a, Coords, Screen, Debug, _, Button, AudioManager, NineSlice) {

        var Dialog = function(ui, options) {

            var defaultOptions = {
                'width': '80%',
                'height':'70%',
                'x': null,
                'y': null,
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
                    'type': 'none'
                },
                'buttons': [],
                'buttonSpacing': Coords.x(20)
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

        Dialog.prototype.open = function(closeCallback) {
            //this.visible = true;
            if(typeof closeCallback === 'function') {
                this.options.callbacks.onClose = closeCallback;
            }
            if(this.options.audio.open && this.options.audio.open !== '') {
                AudioManager.playSound(this.options.audio.open);
            }

            if (this.options.tween.type !== 'none') {
                var self = this,
                    endY = this.position.y;

                this.position.y = this.ui.height;
                new TWEEN.Tween({ y: this.position.y })
                    .to({y: endY }, 500)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .onUpdate(function () {
                        self.position.y = this.y;
                    })
                    .start();
            }

            this.ui.showModal(this);

            this.isOpen = true;

        };

        Dialog.prototype.close = function() {
            //this.visible = false;
            if(this.options.audio.close && this.options.audio.close !== '') {
                AudioManager.playSound(this.options.audio.close);
            }
            this.ui.hideModal(this);

            this.isOpen = false;
        };

        Dialog.prototype._setSize = function() {

            function getPercentageSize(canvasWidth, percentage) {
                var convertedPercentage = parseInt(percentage.slice( 0, percentage.length - 1)) / 100;
                return Math.round(canvasWidth * convertedPercentage);
            }

            if(typeof this.options.width === 'string' && this.options.width.indexOf('%') > -1) {
                this.width = getPercentageSize(this.ui.width, this.options.width);
                this.options.width = this.width;
            } else {
                this.width = this.options.width;
            }

            if(typeof this.options.height === 'string' && this.options.height.indexOf('%') > -1) {
                this.height = getPercentageSize(this.ui.height, this.options.height);
                this.options.height = this.height;
            } else {
                this.height = this.options.height;
            }

        };

        Dialog.prototype._setPosition = function() {

            if(this.options.x === null) {
                this.position.x = Math.round((this.ui.width - this.width ) / 2);
            } else {
                this.position.x = Math.round(this.options.x);
            }

            if(this.options.y === null) {
                this.position.y = Math.round((this.ui.height - this.height ) / 2);
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
            if (this.options.images.topRight_closeBackground) {
                this.closeButton.position.x = this.width - this.closeButton.width;
                this.closeButton.position.y = 0;
            }
            else {
                this.closeButton.position.x = this.width - ( this.closeButton.width / 1.5 );
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

                this.buttonContainer.position.x = (this.width - (xOffset - buttonSpacing)) / 2;
                this.buttonContainer.position.y = this.height - maxHeight;

                this.container.addChild(this.buttonContainer);
            }
        };

        Dialog.prototype._createBackground = function() {

            var images = this.options.images;

            if (this.options.displayCloseButton && images.topRight_closeBackground) {
                images.topRight = images.topRight_closeBackground;
                this.options.images = images;
            }

            var background = new NineSlice(this.options);

            this.container.addChild(background);

        };

        Dialog.prototype.getTextureFromSpriteSheet = function(tempSprite) {

            var canvasRenderer = new PIXI.CanvasRenderer(tempSprite.width, tempSprite.height, null, true);

            this.container.addChild(tempSprite);
            canvasRenderer.render(tempSprite);
            this.container.removeChild(tempSprite);

            return PIXI.Texture.fromCanvas(canvasRenderer.view);

        };

        Dialog.prototype._setContent = function(content) {

            //var content = content || this.cachedContent;

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

        };

        Dialog.prototype.resize = function(options) {

            this.updateDialog(options);

        };

        Dialog.prototype.updateDialog = function(options) {

            _.extend(this.options, options);


            try{
                this.removeChild(this.container);
            } catch(e) {

            }

            this.container = new PIXI.DisplayObjectContainer();

            this._setSize();
            this._setPosition();
            this._createBackground();
            if (this.options.displayCloseButton) {
                this._createCloseButton();
            }
            this._setContent(this.options.content);

            this.addChild(this.container);

        };

        Dialog.prototype.handleOrientationChange = function(isPortrait) {

            //this.ui.hideModal();
            this.updateDialog(this.options);
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

        return Dialog;
    }
);