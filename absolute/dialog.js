define(['pixi', 'absolute/screen', 'absolute/debug', 'lodash', 'absolute/button', 'absolute/audiomanager'],

    function(PIXI, Screen, Debug, _, Button, AudioManager) {

        var Dialog = function(ui, options) {

            var defaultOptions = {
                'width': '80%',
                'height':'70%',
                'x': null,
                'y': null,
                'name': 'default',
                'images': {
                    'topLeft':'MDS_9slice_modal_01.png',
                    'topCenter':'MDS_9slice_modal_02.png',
                    'topRight':'MDS_9slice_modal_03.png',
                    'middleLeft':'MDS_9slice_modal_04.png',
                    'middleCenter':'MDS_9slice_modal_05.png',
                    'middleRight':'MDS_9slice_modal_06.png',
                    'bottomLeft':'MDS_9slice_modal_07.png',
                    'bottomCenter':'MDS_9slice_modal_08.png',
                    'bottomRight':'MDS_9slice_modal_09.png',
                    'close': 'btn_level_exit.png'
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
                }
            };

            this._initDialog(ui, _.extend(defaultOptions, options));
        };

        Dialog.prototype = Object.create(Screen.prototype);

        Dialog.prototype._initDialog = function(ui, options) {

            Screen.call(this);

            this.ui = ui;
            this.options = options;
            this.cachedContent = this.options.content;

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

        };

        Dialog.prototype.close = function() {
            //this.visible = false;
            if(this.options.audio.close && this.options.audio.close !== '') {
                AudioManager.playSound(this.options.audio.close);
            }
            this.ui.hideModal(this);
        };

        Dialog.prototype._setSize = function() {

            function getPercentageSize(canvasWidth, percentage) {
                var convertedPercentage = parseInt(percentage.slice( 0, percentage.length - 1)) / 100;
                return Math.round(canvasWidth * convertedPercentage);
            }

            if(typeof this.options.width === 'string' && this.options.width.indexOf('%') > -1) {
                this.width = getPercentageSize(this.ui.width, this.options.width);
            } else {
                this.width = this.options.width;
            }

            if(typeof this.options.height === 'string' && this.options.height.indexOf('%') > -1) {
                this.height = getPercentageSize(this.ui.height, this.options.height);
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

            this.closeButton.position.x = this.width - ( this.closeButton.width / 1.5 );
            this.closeButton.position.y = - ( this.closeButton.height / 3 );
            this.container.addChild(this.closeButton);

        };

        Dialog.prototype._createBackground = function() {

            var topLeft = PIXI.Sprite.fromFrame(this.options.images.topLeft);
            topLeft.position.x = 0;
            topLeft.position.y = 0;

            var topRight = PIXI.Sprite.fromFrame(this.options.images.topRight);
            topRight.position.x = this.width - topRight.width;
            topRight.position.y = 0;

            var bottomLeft = PIXI.Sprite.fromFrame(this.options.images.bottomLeft);
            bottomLeft.position.x = 0;
            bottomLeft.position.y = this.height - bottomLeft.height;

            var bottomRight = PIXI.Sprite.fromFrame(this.options.images.bottomRight);
            bottomRight.position.x = this.width - bottomLeft.width;
            bottomRight.position.y = this.height - bottomLeft.height;

            // Tile middle left
            var middleLeftSprite = new PIXI.Sprite.fromFrame(this.options.images.middleLeft),
                middleLeftTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleLeftSprite),
                    middleLeftSprite.width,
                    this.height - topLeft.height - bottomLeft.height
                );
            middleLeftTile.position.x = 0;
            middleLeftTile.position.y = topLeft.height;

            // Tile middle right
            var middleRightSprite = new PIXI.Sprite.fromFrame(this.options.images.middleRight),
                middleRightTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleRightSprite),
                    middleRightSprite.width,
                    this.height - topLeft.height - bottomLeft.height
                );
            middleRightTile.position.x = this.width - topRight.width;
            middleRightTile.position.y = topRight.height;

            // Tile top center
            var topCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.topCenter),
                topCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(topCenterSprite),
                    this.width - topLeft.width - topRight.width,
                    topCenterSprite.height
                );
            topCenterTile.position.x = topLeft.width;
            topCenterTile.position.y = 0;

            // Tile bottom center
            var bottomCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.bottomCenter),
                bottomCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(bottomCenterSprite),
                    this.width - bottomLeft.width - bottomRight.width,
                    bottomCenterSprite.height
                );
            bottomCenterTile.position.x = bottomLeft.width;
            bottomCenterTile.position.y = this.height - bottomLeft.height;


            // Tile middle center
            var middleCenterSprite = new PIXI.Sprite.fromFrame(this.options.images.middleCenter),
                middleCenterTile = new PIXI.TilingSprite(this.getTextureFromSpriteSheet(middleCenterSprite),
                this.width - topLeft.width - topRight.width,
                Math.ceil(this.height - bottomRight.height - topRight.height)
            );
            middleCenterTile.position.x = topLeft.width;
            middleCenterTile.position.y = topLeft.height;

            this.container.addChild(topLeft);
            this.container.addChild(topCenterTile);
            this.container.addChild(topRight);

            this.container.addChild(middleLeftTile);
            this.container.addChild(middleCenterTile);
            this.container.addChild(middleRightTile);

            this.container.addChild(bottomLeft);
            this.container.addChild(bottomCenterTile);
            this.container.addChild(bottomRight);

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

        return Dialog;
    }
);