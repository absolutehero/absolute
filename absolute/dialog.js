define(['pixi', 'absolute/screen', 'absolute/debug', 'lodash', 'absolute/coords'],

    function(PIXI, Screen, Debug, _, Coords) {

        var Dialog = function(ui, options) {

            var defaultOptions = {
                width: '80%',
                height:'70%',
                name: 'default',
                images: {
                    'topLeft':'MDS_9slice_modal_01.png',
                    'topCenter':'MDS_9slice_modal_02.png',
                    'topRight':'MDS_9slice_modal_03.png',
                    'middleLeft':'MDS_9slice_modal_04.png',
                    'middleRight':'MDS_9slice_modal_06.png',
                    'bottomLeft':'MDS_9slice_modal_07.png',
                    'bottomCenter':'MDS_9slice_modal_08.png',
                    'bottomRight':'MDS_9slice_modal_09.png'
                },
                fillColor: 0x012040,
                fillOpacity: 0.95,
                content: '',
                buttons: []
            };

            this._initDialog(ui, _.extend(defaultOptions, options));
        };

        Dialog.prototype = Object.create(Screen.prototype);

        Dialog.prototype._initDialog = function(ui, options) {

            Screen.call(this);

            this.ui = ui;
            this.options = options;

            this._setSize();
            this._setPosition();
            this._createBackground();
            this._setContent();

            console.log('dialog options = ', this.options);

        };

        Dialog.prototype.open = function() {
            this.ui.showModal(this);
        }

        Dialog.prototype.close = function() {
            while(this.children[0]) { this.removeChild(this.children[0]); }
            this.ui.hideModal(this);
        }

        Dialog.prototype._setSize = function() {

            function getPercentageSize(canvasWidth, percentage) {
                var convertedPercentage = parseInt(percentage.slice( 0, percentage.length - 1)) / 100;
                return canvasWidth * convertedPercentage;
            }

            if(this.options.width.indexOf('%') > -1) {
                this.width = getPercentageSize(this.ui.width, this.options.width);
            } else {
                this.width = Coords.x(this.options.width)
            }

            if(this.options.height.indexOf('%') > -1) {
                this.height = getPercentageSize(this.ui.height, this.options.height);
            } else {
                this.height = Coords.y(this.options.height);
            }

        }

        Dialog.prototype._setPosition = function() {

            this.position = {
                'x': (this.ui.width - this.width ) / 2,
                'y': (this.ui.height - this.height ) / 2
            }
        }

        Dialog.prototype._createBackground = function() {

            var topLeft = PIXI.Sprite.fromFrame(this.options.images.topLeft);
            topLeft.position.x = 0;
            topLeft.position.y = 0;

            var topRight = PIXI.Sprite.fromFrame(this.options.images.topRight);
            topRight.position.x = this.width - topRight.texture.width;
            topRight.position.y = 0;

            var bottomLeft = PIXI.Sprite.fromFrame(this.options.images.bottomLeft);
            bottomLeft.position.x = 0;
            bottomLeft.position.y = this.height - bottomLeft.texture.height;

            var bottomRight = PIXI.Sprite.fromFrame(this.options.images.bottomRight);
            bottomRight.position.x = this.width - bottomRight.texture.width;
            bottomRight.position.y = this.height - bottomLeft.texture.height;

            // fill in the middle left and right side
            var middleLeftTile = PIXI.Sprite.fromFrame(this.options.images.middleLeft),
                middleRightTile = PIXI.Sprite.fromFrame(this.options.images.middleRight),
                middleLeftRightMask = this._drawRect(0, topLeft.texture.height,
                    this.width,
                    this.height - topLeft.texture.height - bottomLeft.texture.height,
                    0xFFFFFF, 1.0);
            middleLeftTile.scale.y = middleRightTile.scale.y = this.height / middleLeftTile.height;
            middleRightTile.position.x = this.width - middleRightTile.texture.width;
            this.addChild(middleLeftRightMask);
            middleLeftTile.mask = middleRightTile.mask = middleLeftRightMask;

            // fill in the top center and bottom center
            var topCenterTile = PIXI.Sprite.fromFrame(this.options.images.topCenter),
                bottomCenterTile = PIXI.Sprite.fromFrame(this.options.images.bottomCenter),
                topBottomMask = this._drawRect(topLeft.texture.width, 0,
                    this.width - topLeft.texture.width - topRight.texture.width,
                    this.height,
                    0xFFFFFF, 1.0);
            topCenterTile.scale.x = bottomCenterTile.scale.x = this.width / topCenterTile.texture.width;
            bottomCenterTile.position.y = this.height - bottomCenterTile.texture.height;
            this.addChild(topBottomMask);
            topCenterTile.mask = bottomCenterTile.mask = topBottomMask;

            // fill in the middle center background area
            var middleCenterRect = this._drawRect(topLeft.texture.width, topLeft.texture.height,
                this.width - topLeft.texture.width - topRight.texture.width,
                this.height - bottomRight.texture.height - topRight.texture.height,
                this.options.fillColor, this.options.fillOpacity);


            this.addChild(topLeft);
            this.addChild(topCenterTile);
            this.addChild(topRight);

            this.addChild(middleLeftTile);
            this.addChild(middleCenterRect);
            this.addChild(middleRightTile);

            this.addChild(bottomLeft);
            this.addChild(bottomCenterTile);
            this.addChild(bottomRight);

            var bgRenderer = new PIXI.RenderTexture(this.ui.width, this.ui.height);
            bgRenderer.render(this);

            return new PIXI.Sprite(bgRenderer);

        }

        Dialog.prototype._setContent = function() {

            if(!_.isEmpty(this.options.content)) {
                this.addChild(this.options.content);
            }
        }

        Dialog.prototype._drawRect = function (x, y, width, height, color, opacity) {

            var graphics = new PIXI.Graphics();
            graphics.beginFill(color, opacity);
            graphics.drawRect(x, y, width, height);
            graphics.endFill();
            return graphics;

        }

        Dialog.prototype._addButtons = function() {

        }




        return Dialog;
    }
);