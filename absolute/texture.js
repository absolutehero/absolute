/**
 * Created by craig on 2/3/14.
 */
define (['pixi', 'absolute/platform', 'absolute/debug'], function (PIXI, Platform, Debug) {

    return {
        fromFrame: function (asset) {
            var texture;

            try {
                texture = PIXI.Texture.fromFrame(asset);
            }
            catch (e) {
                if (Debug.enabled) {
                    texture = PIXI.Texture.fromFrame('missing.png');
                }
                else {
                    throw (e);
                }
            }

            return texture;
        }
    };

});