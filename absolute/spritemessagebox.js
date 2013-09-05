/**
 * Created by craig on 8/27/13.
 */
define(['pixi', 'absolute/button', 'absolute/coords'], function(PIXI, Button, Coords) {

    var SpriteMessageBox = function(bgImageName, btnImageName, textStyle, action) {
        this._initSpriteMessageBox(bgImageName, btnImageName, textStyle, action);
    };

    SpriteMessageBox.constructor = SpriteMessageBox;
    SpriteMessageBox.prototype = Object.create(PIXI.Sprite.prototype);

    SpriteMessageBox.prototype._initSpriteMessageBox = function(bgImageName, btnImageName, textStyle, action) {
        PIXI.Sprite.call(this, PIXI.Texture.fromFrame(bgImageName));

        this.button = new Button(
            PIXI.Texture.fromFrame(btnImageName),
            PIXI.Texture.fromFrame(btnImageName),
            function () {
                Absolute.Debug.log('Dialog button pressed');
                if (action && typeof action === 'function') {
                    action();
                }
            }
        );
        this.button.position.x = (this.width - this.button.width) / 2;
        this.button.position.y = this.height - this.button.height / 2;
        this.addChild(this.button);

        this.textStyle = textStyle;
        this.textStyle.wordWrapWidth = this.width - 60;
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

    return SpriteMessageBox;
});
