/**
 * Created by craig on 2/3/14.
 */
define (['pixi', 'absolute/platform', 'absolute/debug'], function (PIXI, Platform, Debug) {

    return {
        fromFrame: function (asset) {
            var sprite;

            try {
                sprite = PIXI.Sprite.fromFrame(asset);

                if (Debug.enabled) {
                    var atlasName = sprite.texture.baseTexture.imageUrl.substr(sprite.texture.baseTexture.imageUrl.lastIndexOf('/') + 1);
                    var atlasText = new PIXI.Text(atlasName, {font: Math.floor(30 * Platform.getResScale()) + "px Arial, Helvetica, sans-serif", fill: "white", align: "center"});
                    atlasText.position.y = 0;
                    atlasText.position.x = 0;
                    sprite.addChild(atlasText);
                }
            }
            catch (e) {
                if (Debug.enabled) {
                    sprite = PIXI.Sprite.fromFrame('missing.png');

                    var text = new PIXI.Text(asset, {font: Math.floor(40 * Platform.getResScale()) + "px Arial, Helvetica, sans-serif", fill: "black", align: "center"});
                    text.position.y = sprite.height;
                    text.position.x = (sprite.width - text.width) / 2;
                    sprite.addChild(text);
                }
                else {
                    throw (e);
                }
            }

            return sprite;
        }
    };

});
