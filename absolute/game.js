/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:42 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(['absolute/storagemanager', 'absolute/gameconfig'], function (StorageManager, GameConfig) {
    var Game = function(name, defaultConfig) {
        this._initGame(name, defaultConfig);
    };

    Game.prototype._initGame =  function(name, defaultConfig) {
        StorageManager.prefix = name + "_";
        GameConfig.load(defaultConfig);
    };

    Game.prototype.start = function() {

    };

    return Game;
});

