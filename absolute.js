/**
 * The main module that defines the public interface for absolute.
 */
define(function (require) {
    'use strict';

    //Return the module value.
    return {
        version: '1.0',
        AsyncQueue: require('absolute/asyncqueue'),
        AudioManager: require('absolute/audiomanager'),
        Button: require('absolute/button'),
        Snapshot: require('absolute/snapshot'),
        Coords: require('absolute/coords'),
        Platform: require('absolute/platform'),
        ScreenMetrics: require('absolute/screenmetrics'),
        DigitLabel: require('absolute/digitlabel'),
        Debug: require('absolute/debug'),
        DigitSprite: require('absolute/digitsprite'),
        EventBus: require('absolute/eventbus'),
        GameConfig: require('absolute/gameconfig'),
        StorageManager: require('absolute/storagemanager'),
        SpriteUtils: require('absolute/spriteutils'),
        Game: require('absolute/game'),
        GameUI: require('absolute/gameui'),
        TextUtils: require('absolute/textutils'),
        ToggleButton: require('absolute/togglebutton'),
        MusicManager: require('absolute/musicmanager'),
        ProgressBar: require('absolute/progressbar'),
        TweenUtils: require('absolute/tweenutils'),
        Screen: require('absolute/screen'),
        SimpleMessageBox: require('absolute/simplemessagebox'),
        SpriteMessageBox: require('absolute/spritemessagebox'),
        Loader: require('absolute/loader'),
        LayoutHelper: require('absolute/layouthelper'),
        Draggable: require('absolute/draggable'),
        Analytics: require('absolute/analytics'),
        Dialog: require('absolute/dialog'),
        Shims: require('absolute/shims'),
        Sprite: require('absolute/sprite'),
        Texture: require('absolute/texture'),
        MathUtils: require('absolute/mathutils'),
        RandomUtils:require('absolute/randomutils'),
        PageIndicator:require('absolute/pageIndicator'),
        MultiPageDialog:require('absolute/multiPageDialog'),
        ParticleEmitter: require('absolute/particleemitter'),
        UserData: require('absolute/userdata'),
        GraphSerializer: require('absolute/graphserializer'),
        ScrollArea: require('absolute/scrollarea'),
        NineSlice: require('absolute/nineslice')
    };
});
