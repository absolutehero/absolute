/**
 * User: craig
 * Date: 4/1/14
 * Time: 11:35 AM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'absolute/dialog', 'lodash', 'absolute/button', 'absolute/coords', 'absolute/screenmetrics'],
    function (PIXI, Dialog, _, Button, Coords, ScreenMetrics) {
        var MessageDialog = function (ui, message, options) {
            var defaultOptions = {
                okFunc: function () {},
                displayOkButton: true,
                okButtonText: "OK",
                okButtonImage: "dlg_btn_blank.png",
                okButtonTextStyle:  {
                    font: Math.floor(90 * ScreenMetrics.getResScale()) + "px Ganache",
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: this.width - Coords.x(200)
                },
                okButtonLabelPosition: {
                    x:"center", y:Coords.y(-20)
                },
                textStyle: {
                    font: Math.floor(80 * ScreenMetrics.getResScale()) + "px Ganache",
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: this.width - Coords.x(200)
                },
                textImage: null
            };

            this.initMessageDialog(ui, message, _.extend(defaultOptions, options));
        };

        MessageDialog.prototype = Object.create(Dialog.prototype);

        MessageDialog.prototype.initMessageDialog = function (ui, message, options) {
            Dialog.call(this, ui, options);

            this.ui = ui;
            this.message = message;

            this.content = this.initContent();
            this._setContent(this.content);

            if (this.options.displayOkButton) {
                this.okButton = new Button(
                    PIXI.Texture.fromFrame(this.options.okButtonImage),
                    PIXI.Texture.fromFrame(this.options.okButtonImage),
                    function () {
                        if (typeof this.options.okFunc === "function") {
                            this.options.okFunc();
                        }
                    }.bind(this)
                );

                this.okButton.position.x = (this.width - this.okButton.width) / 2;
                this.okButton.position.y = (this.height - this.okButton.height);
                this.addChild(this.okButton);

                var okLabel = new PIXI.BitmapText(this.options.okButtonText, this.options.okButtonTextStyle);
                if (this.options.okButtonLabelPosition.x === "center") {
                    okLabel.position.x = (this.okButton.width - okLabel.textWidth) / 2;
                } else {
                    okLabel.position.x = this.options.okButtonLabelPosition.x;
                }
                okLabel.position.y = this.options.okButtonLabelPosition.y;
                this.okButton.addChild(okLabel);
            }

        };

        MessageDialog.prototype.initContent = function () {
            var contentContainer = new PIXI.DisplayObjectContainer();
            contentContainer.width = this.width;
            contentContainer.height = this.height;

            if (this.options.textImage == null) {
                this.text = new PIXI.BitmapText(this.message, this.options.textStyle);
                this.text.position.y = Coords.y(120);
            } else {
                this.text = this.options.textImage;
                this.text.setText(this.message);
            }

            this.text.position.x = (contentContainer.width - this.text.textWidth) / 2;
            contentContainer.addChild(this.text);

            return contentContainer;
        };


        MessageDialog.prototype.setPosition = function (sprite, x, y) {
            sprite.position.x = Coords.x(x);
            sprite.position.y = Coords.y(y);
        };

        MessageDialog.prototype.setMessage = function (message) {
            this.text.setText(message);
            // XXXCBR - the textWidth is not computed synchronously!?!
            setTimeout(function () {
                this.text.position.x = (this.width - this.text.textWidth) / 2;
            }.bind(this), 10);
        };

        MessageDialog.prototype.setMessageY = function (y) {
            this.text.position.y = y;
        };

        return MessageDialog;
    });