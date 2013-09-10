/**
 * Created by craig on 8/27/13.
 */
define(['pixi', 'absolute/button', 'absolute/coords'], function(PIXI, Button, Coords) {

    var SpriteMessageBox = function(bgImageName, btnImageName, textStyle) {
        this._initSpriteMessageBox(bgImageName, btnImageName, textStyle);
    };

    SpriteMessageBox.constructor = SpriteMessageBox;
    SpriteMessageBox.prototype = Object.create(PIXI.Sprite.prototype);

    SpriteMessageBox.prototype._initSpriteMessageBox = function(bgImageName, btnImageName, textStyle, action) {
        PIXI.Sprite.call(this, PIXI.Texture.fromFrame(bgImageName));

        this.action = null;
        this.buttonText = null;

        this.button = new Button(
            PIXI.Texture.fromFrame(btnImageName),
            PIXI.Texture.fromFrame(btnImageName),
            function () {
                if (this.action && typeof this.action === 'function') {
                    this.action();
                }
            }.bind(this)
        );
        this.button.position.x = (this.width - this.button.width) / 2;
        this.button.position.y = this.height - this.button.height / 2;
        this.addChild(this.button);

        this.textStyle = textStyle;
        this.textStyle.wordWrapWidth = this.width - 40;
        this.textStyle.wordWrap = true;

        this.text = null;
    };

    SpriteMessageBox.prototype.setText = function(text) {
        if (this.text) {
            this.removeChild(this.text);
        }

        this.text = new PIXI.Text(text, this.textStyle);
        this.text.position.x = (this.width - this.text.width) / 2;
        this.text.position.y = Coords.y(30);
        this.addChild(this.text);
    };

    SpriteMessageBox.prototype.setButtonTextAndAction = function(text, action) {
        if (this.button) {
            if (this.buttonText) {
                this.button.removeChild(this.buttonText);
            }

            this.buttonText = new PIXI.Text(text, this.textStyle);
            this.buttonText.position.x = (this.button.width - this.buttonText.width) / 2;
            this.buttonText.position.y = (this.button.height) / 4;

            this.button.addChild(this.buttonText);

            this.action = action;
        }
    };

    return SpriteMessageBox;
});
