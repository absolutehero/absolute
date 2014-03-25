/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/21/13
 * Time: 12:42 PM
 * To change this template use File | Settings | File Templates.
 */

define (['pixi'], function(PIXI) {

    var Snapshot = function (displayObject) {
        this.initSnapshot(displayObject);
    };

    Snapshot.constructor = Snapshot;

    Snapshot.prototype.initSnapshot = function (displayObject) {
        var stage = new PIXI.Stage();
        this.renderer = new PIXI.CanvasRenderer(displayObject.width, displayObject.height, null, true);

        stage.addChild(displayObject);
        this.renderer.render(stage);
    };

    Snapshot.prototype.getSnapshot = function () {
        return PIXI.Texture.fromCanvas(this.renderer.view);
    };

    return Snapshot;

});